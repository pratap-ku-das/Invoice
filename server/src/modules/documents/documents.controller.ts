import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, DocumentListQueryDto } from './document.dto';
import { DocType } from './document.schema';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { DELETE_ROLES, Role, WRITE_ROLES } from '../../common/constants/roles';

const VALID_TYPES: DocType[] = [
  'invoice',
  'estimate',
  'challan',
  'sales-return',
  'purchase-bill',
  'purchase-order',
  'purchase-return',
  'proforma',
];

function assertDocType(docType: string): DocType {
  if (!VALID_TYPES.includes(docType as DocType)) {
    throw new BadRequestException(`Unknown document type: ${docType}`);
  }
  return docType as DocType;
}

@ApiTags('documents')
@ApiBearerAuth()
@Controller('documents/:docType')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  list(
    @CurrentUser('companyId') companyId: string,
    @Param('docType') docType: string,
    @Query() query: DocumentListQueryDto,
  ) {
    return this.documentsService.list(companyId, assertDocType(docType), query);
  }

  @Get('next-number')
  nextNumber(@CurrentUser('companyId') companyId: string, @Param('docType') docType: string) {
    return this.documentsService.nextNumber(companyId, assertDocType(docType));
  }

  @Get('open/:partyId')
  openDocs(
    @CurrentUser('companyId') companyId: string,
    @Param('docType') docType: string,
    @Param('partyId') partyId: string,
  ) {
    return this.documentsService.openDocuments(companyId, partyId, [assertDocType(docType)]);
  }

  @Get(':id')
  getOne(
    @CurrentUser('companyId') companyId: string,
    @Param('docType') docType: string,
    @Param('id') id: string,
  ) {
    return this.documentsService.findOne(companyId, assertDocType(docType), id);
  }

  @Post()
  @Roles(...(WRITE_ROLES as Role[]))
  create(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('userId') userId: string,
    @Param('docType') docType: string,
    @Body() dto: CreateDocumentDto,
  ) {
    return this.documentsService.create(companyId, userId, assertDocType(docType), dto);
  }

  @Patch(':id')
  @Roles(...(WRITE_ROLES as Role[]))
  update(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('name') userName: string,
    @Param('docType') docType: string,
    @Param('id') id: string,
    @Body() dto: CreateDocumentDto,
  ) {
    return this.documentsService.update(companyId, userId, userName, assertDocType(docType), id, dto);
  }

  @Post(':id/cancel')
  @Roles(...(DELETE_ROLES as Role[]))
  cancel(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('userId') userId: string,
    @Param('docType') docType: string,
    @Param('id') id: string,
  ) {
    return this.documentsService.cancel(companyId, userId, assertDocType(docType), id);
  }

  @Post(':id/payments')
  @Roles(...(WRITE_ROLES as Role[]))
  recordPayment(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('userId') userId: string,
    @Param('docType') docType: string,
    @Param('id') id: string,
    @Body() body: { mode: string; amount?: number; reference?: string },
  ) {
    return this.documentsService.recordPayment(companyId, userId, assertDocType(docType), id, body);
  }

  @Post(':id/status')
  @Roles(...(WRITE_ROLES as Role[]))
  setStatus(
    @CurrentUser('companyId') companyId: string,
    @Param('docType') docType: string,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.documentsService.setStatus(companyId, assertDocType(docType), id, body.status);
  }

  @Post(':id/lock')
  @Roles(...(DELETE_ROLES as Role[]))
  lock(
    @CurrentUser('companyId') companyId: string,
    @Param('docType') docType: string,
    @Param('id') id: string,
    @Body() body: { locked: boolean },
  ) {
    return this.documentsService.toggleLock(companyId, assertDocType(docType), id, body.locked);
  }

  @Post(':id/convert')
  @Roles(...(WRITE_ROLES as Role[]))
  convert(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('userId') userId: string,
    @Param('docType') docType: string,
    @Param('id') id: string,
  ) {
    return this.documentsService.convert(companyId, userId, assertDocType(docType), id);
  }

  @Post(':id/duplicate')
  @Roles(...(WRITE_ROLES as Role[]))
  duplicate(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('userId') userId: string,
    @Param('docType') docType: string,
    @Param('id') id: string,
  ) {
    return this.documentsService.duplicate(companyId, userId, assertDocType(docType), id);
  }

  @Delete(':id')
  @Roles(...(DELETE_ROLES as Role[]))
  remove(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('userId') userId: string,
    @Param('docType') docType: string,
    @Param('id') id: string,
  ) {
    return this.documentsService.softDelete(companyId, userId, assertDocType(docType), id);
  }
}
