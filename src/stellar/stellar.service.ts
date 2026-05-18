import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Keypair, TransactionBuilder, Contract, nativeToScVal, scValToNative, xdr, BASE_FEE } from '@stellar/stellar-base';
import { SorobanRpc } from '@stellar/stellar-sdk';

@Injectable()
export class StellarService implements OnModuleInit {
  private rpc: SorobanRpc.Server;
  private contractId: string;
  private networkPassphrase: string;

  constructor(private configService: ConfigService) {
    const stellarConfig = this.configService.get('app.stellar')!;
    this.contractId = stellarConfig.contractId;
    this.networkPassphrase = stellarConfig.networkPassphrase;
    this.rpc = new SorobanRpc.Server(stellarConfig.rpcUrl);
  }

  async onModuleInit() {
    console.log(`StellarService initialised — contract: ${this.contractId}`);
  }

  async getContractData(key: string): Promise<any> {
    const scKey = xdr.ScVal.scvSymbol(key);
    const ledgerEntry = await this.rpc.getContractData(this.contractId, scKey);
    return scValToNative(ledgerEntry.val.contractData().val());
  }

  async simulateTransaction(functionName: string, ...args: any[]): Promise<any> {
    const contract = new Contract(this.contractId);
    const scArgs = args.map((a) => nativeToScVal(a, { type: typeof a === 'number' ? 'u64' : undefined }));
    const account = await this.rpc.getAccount(
      'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
    );
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(contract.call(functionName, ...scArgs))
      .setTimeout(30)
      .build();

    const simulation = await this.rpc.simulateTransaction(tx);
    if (SorobanRpc.Api.isSimulationSuccess(simulation) && simulation.result?.retval) {
      return scValToNative(simulation.result.retval);
    }
    return simulation;
  }

  async submitTransaction(functionName: string, sourceSecret: string, ...args: any[]): Promise<string> {
    const contract = new Contract(this.contractId);
    const scArgs = args.map((a) => nativeToScVal(a, { type: typeof a === 'number' ? 'u64' : undefined }));
    const sourceKeypair = Keypair.fromSecret(sourceSecret);
    const sourceAccount = await this.rpc.getAccount(sourceKeypair.publicKey());

    let tx = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(contract.call(functionName, ...scArgs))
      .setTimeout(30)
      .build();

    tx = await this.rpc.prepareTransaction(tx);
    tx.sign(sourceKeypair);
    const response = await this.rpc.sendTransaction(tx);
    return response.hash;
  }
}
