import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateCertificationDto {
  @ApiProperty({ description: 'Product batch identifier' })
  @IsString()
  batchId: string;

  @ApiProperty({ description: 'Certification status' })
  @IsBoolean()
  certified: boolean;

  @ApiProperty({ description: 'Expiry timestamp' })
  @IsNumber()
  expiry: number;

  @ApiProperty({ description: 'Additional notes' })
  @IsString()
  notes: string;
}
