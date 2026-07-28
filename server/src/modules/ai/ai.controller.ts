import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AiService } from './ai.service';

@ApiTags('AI Engine')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('suggest-hsn')
  @ApiOperation({ summary: 'Predict HSN Code & GST Rate for Product Title' })
  async suggestHsn(@Body('title') title: string) {
    if (!title || typeof title !== 'string') {
      return { hsnCode: '9983', gstRate: 18, category: 'General Goods', description: 'Standard 18% GST', source: 'fallback' };
    }
    return this.aiService.suggestHsn(title);
  }

  @Post('scan-receipt')
  @ApiOperation({ summary: 'Extract structured GST Invoice JSON from uploaded receipt image or PDF' })
  async scanReceipt(@Body('base64Data') base64Data: string, @Body('mimeType') mimeType: string) {
    return this.aiService.scanReceipt(base64Data, mimeType);
  }

  @Post('parse-voice')
  @ApiOperation({ summary: 'Parse spoken invoice prompt into structured items' })
  async parseVoice(@Body('transcript') transcript: string) {
    return this.aiService.parseVoiceBilling(transcript || '');
  }

  @Post('copilot')
  @ApiOperation({ summary: 'Ask BalajiOne AI Business Copilot' })
  async copilot(@Request() req: any, @Body('query') query: string) {
    const companyId = req.user?.companyId;
    return this.aiService.askBusinessCopilot(companyId, query || 'How can you help me?');
  }
}
