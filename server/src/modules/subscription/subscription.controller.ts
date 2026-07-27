import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('subscription')
@ApiBearerAuth()
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('create-order')
  createOrder(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: { plan: 'basic' | 'pro'; billingCycle?: string },
  ) {
    return this.subscriptionService.createOrder(companyId, userId, dto.plan, dto.billingCycle);
  }

  @Post('verify-payment')
  verifyPayment(
    @CurrentUser('companyId') companyId: string,
    @Body()
    dto: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      plan: 'basic' | 'pro';
    },
  ) {
    return this.subscriptionService.verifyPayment(companyId, dto);
  }

  @Get('my-subscription')
  getMySubscription(@CurrentUser('companyId') companyId: string) {
    return this.subscriptionService.getMySubscription(companyId);
  }
}
