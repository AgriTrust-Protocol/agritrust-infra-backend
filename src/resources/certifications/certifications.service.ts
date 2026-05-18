import { Injectable, NotFoundException } from '@nestjs/common';
import { StellarService } from '../../stellar/stellar.service';
import { CreateCertificationDto } from './dto/create-certification.dto';

@Injectable()
export class CertificationsService {
  constructor(private readonly stellar: StellarService) {}

  async findAll(): Promise<any[]> {
    try {
      const result = await this.stellar.simulateTransaction('get_all_certifications');
      return Array.isArray(result) ? result : [];
    } catch {
      return [];
    }
  }

  async findOne(batchId: string): Promise<any> {
    try {
      const result = await this.stellar.simulateTransaction('get_certification', batchId);
      return result;
    } catch {
      throw new NotFoundException(`Certification for batch ${batchId} not found`);
    }
  }

  async create(dto: CreateCertificationDto, adminSecret: string): Promise<string> {
    return this.stellar.submitTransaction(
      'certify',
      adminSecret,
      dto.batchId,
      dto.certified,
      dto.expiry,
      dto.notes,
    );
  }
}
