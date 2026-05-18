import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CertificationsService } from './certifications.service';
import { CreateCertificationDto } from './dto/create-certification.dto';

@ApiTags('certifications')
@Controller('certifications')
export class CertificationsController {
  constructor(private readonly service: CertificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all certifications' })
  @ApiResponse({ status: 200, description: 'Returns an array of certifications' })
  async findAll() {
    return this.service.findAll();
  }

  @Get(':batchId')
  @ApiOperation({ summary: 'Get a certification by batch ID' })
  @ApiParam({ name: 'batchId', description: 'Product batch identifier' })
  @ApiResponse({ status: 200, description: 'The certification record' })
  @ApiResponse({ status: 404, description: 'Certification not found' })
  async findOne(@Param('batchId') batchId: string) {
    return this.service.findOne(batchId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new certification' })
  @ApiBody({ type: CreateCertificationDto })
  @ApiResponse({ status: 201, description: 'Transaction hash' })
  async create(@Body() dto: CreateCertificationDto) {
    const adminSecret = process.env.ADMIN_SECRET ?? '';
    return this.service.create(dto, adminSecret);
  }
}
