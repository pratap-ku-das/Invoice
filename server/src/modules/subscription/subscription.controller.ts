import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/roles.decorator';

@ApiTags('subscription')
@Controller()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  // Top-level standard endpoint POST /api/create-order
  @Public()
  @Post('create-order')
  createOrderStandard(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: { amount?: number; plan?: string; billingCycle?: string },
  ) {
    return this.subscriptionService.createOrder(companyId, userId, dto.plan || 'basic', dto.billingCycle, dto.amount);
  }

  // Sub-path endpoint POST /api/subscription/create-order
  @Public()
  @Post('subscription/create-order')
  createOrderSubscription(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: { amount?: number; plan?: string; billingCycle?: string },
  ) {
    return this.subscriptionService.createOrder(companyId, userId, dto.plan || 'basic', dto.billingCycle, dto.amount);
  }

  // Top-level standard endpoint POST /api/verify-payment
  @Public()
  @Post('verify-payment')
  verifyPaymentStandard(
    @CurrentUser('companyId') companyId: string,
    @Body()
    dto: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      plan?: string;
    },
  ) {
    return this.subscriptionService.verifyPayment(companyId, dto);
  }

  // Sub-path endpoint POST /api/subscription/verify-payment
  @Public()
  @Post('subscription/verify-payment')
  verifyPaymentSubscription(
    @CurrentUser('companyId') companyId: string,
    @Body()
    dto: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      plan?: string;
    },
  ) {
    return this.subscriptionService.verifyPayment(companyId, dto);
  }

  @ApiBearerAuth()
  @Get('subscription/my-subscription')
  getMySubscription(@CurrentUser('companyId') companyId: string) {
    return this.subscriptionService.getMySubscription(companyId);
  }
}
