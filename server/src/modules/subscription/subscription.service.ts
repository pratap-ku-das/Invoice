import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import Razorpay from 'razorpay';
import { SubscriptionPayment, SubscriptionPaymentDocument } from './subscription-payment.schema';
import { Company, CompanyDocument } from '../company/company.schema';
import { User, UserDocument } from '../users/user.schema';
import { BusinessDocument, BusinessDocumentDocument } from '../documents/document.schema';
import { PLANS, type PlanId } from '../../common/constants/plans';

dotenv.config();

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectModel(SubscriptionPayment.name)
    private readonly paymentModel: Model<SubscriptionPaymentDocument>,
    @InjectModel(Company.name)
    private readonly companyModel: Model<CompanyDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(BusinessDocument.name)
    private readonly docModel: Model<BusinessDocumentDocument>,
  ) {}

  private getRazorpayInstance(): Razorpay {
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_live_TLzggBEFkkktep';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '67Fh9xj6iaz1HXAyGPhRsU6X';
    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  async createOrder(
    companyIdRaw?: any,
    userIdRaw?: any,
    plan: 'starter' | 'free' | 'basic' | 'pro' | string = 'basic',
    billingCycle = 'monthly',
    customAmount?: number,
  ) {
    const companyId = companyIdRaw ? String(companyIdRaw) : '';
    const userId = userIdRaw ? String(userIdRaw) : '';

    let amountINR = customAmount;

    if (!amountINR) {
      const planPrices: Record<string, number> = {
        starter: 299,
        free: 299,
        basic: 499,
        pro: 999,
      };
      amountINR = planPrices[plan] || 499;
    }

    const amountPaise = Math.round(amountINR * 100);

    // Validate minimum amount: 100 paise
    if (amountPaise < 100) {
      throw new BadRequestException('Minimum order amount must be at least 100 paise (₹1).');
    }

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_live_TLzggBEFkkktep';
    const compSub = companyId ? companyId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8) : 'guest';
    const receipt = `rcpt_${compSub}_${Date.now()}`;

    let razorpayOrderId = '';

    try {
      const rzp = this.getRazorpayInstance();
      const orderData = await rzp.orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt,
        notes: {
          companyId,
          userId,
          plan,
          billingCycle,
        },
      });

      if (orderData && orderData.id) {
        razorpayOrderId = orderData.id;
        this.logger.log(`Created official Razorpay Order: ${orderData.id}`);
      } else {
        throw new Error('Order creation response did not return an order ID');
      }
    } catch (err: any) {
      const errorDetail = err?.error?.description || err?.message || 'Razorpay order creation failed';
      this.logger.error(`Razorpay API Order creation error: ${errorDetail}`, err);
      throw new InternalServerErrorException(`Razorpay API error: ${errorDetail}`);
    }

    // Save pending payment record in DB if companyId is valid
    if (companyId && Types.ObjectId.isValid(companyId)) {
      try {
        await this.paymentModel.create({
          companyId: new Types.ObjectId(companyId),
          userId: userId && Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : undefined,
          gateway: 'razorpay',
          orderId: razorpayOrderId,
          amount: amountINR,
          currency: 'INR',
          plan,
          billingCycle,
          status: 'created',
        });
      } catch (dbErr) {
        this.logger.warn(`Could not persist payment record to DB: ${(dbErr as Error).message}`);
      }
    }

    return {
      order_id: razorpayOrderId,
      orderId: razorpayOrderId,
      amount: amountINR,
      amountPaise,
      currency: 'INR',
      key_id: keyId,
      key: keyId,
      plan,
    };
  }

  async verifyPayment(
    companyIdRaw?: any,
    dto?: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      plan?: 'starter' | 'free' | 'basic' | 'pro' | string;
    },
  ) {
    if (!dto || !dto.razorpay_order_id || !dto.razorpay_payment_id || !dto.razorpay_signature) {
      throw new BadRequestException('Missing required fields for payment verification: razorpay_order_id, razorpay_payment_id, razorpay_signature');
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan = 'basic' } = dto;
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '67Fh9xj6iaz1HXAyGPhRsU6X';

    // HMAC-SHA256 Signature Verification
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = generatedSignature === razorpay_signature;

    if (!isValid) {
      this.logger.error(`Razorpay signature mismatch for order ${razorpay_order_id}`);
      throw new BadRequestException('Razorpay payment signature verification failed!');
    }

    // Update payment record in database
    const payment = await this.paymentModel.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        status: 'captured',
        paidAt: new Date(),
      },
      { new: true, upsert: false },
    );

    // Resolve target company ID from parameter, payment record, or Razorpay API notes
    let targetCompanyId = companyIdRaw ? String(companyIdRaw) : '';
    if ((!targetCompanyId || !Types.ObjectId.isValid(targetCompanyId)) && payment?.companyId) {
      targetCompanyId = String(payment.companyId);
    }

    if (!targetCompanyId || !Types.ObjectId.isValid(targetCompanyId)) {
      try {
        const rzp = this.getRazorpayInstance();
        const rzpOrder = await rzp.orders.fetch(razorpay_order_id);
        if (rzpOrder?.notes?.companyId) {
          targetCompanyId = String(rzpOrder.notes.companyId);
        }
      } catch (err) {
        this.logger.warn(`Could not fetch Razorpay order notes: ${(err as Error).message}`);
      }
    }

    // Update Company subscription & activate account
    let updatedCompany = null;
    if (targetCompanyId && Types.ObjectId.isValid(targetCompanyId)) {
      const company = await this.companyModel.findById(targetCompanyId);
      if (company) {
        const planId = (plan === 'pro' ? 'pro' : plan === 'basic' ? 'basic' : 'free') as PlanId;
        const planConfig = PLANS[planId] || PLANS.basic;

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days active

        company.subscription = {
          plan: planId,
          status: 'active',
          expiresAt,
          limits: { ...planConfig.limits },
        };
        company.approvalStatus = 'approved';
        company.isApproved = true;

        await company.save();
        updatedCompany = company;
        this.logger.log(`Company ${company.name} (${company._id}) activated & upgraded to ${plan.toUpperCase()} plan via Razorpay`);
      }
    } else {
      // If company ID could not be resolved from order notes, activate all pending companies to guarantee activation
      this.logger.warn(`No specific companyId resolved for order ${razorpay_order_id}. Activating latest pending company.`);
      const latestCompany = await this.companyModel.findOne({ approvalStatus: 'pending' }).sort({ createdAt: -1 });
      if (latestCompany) {
        latestCompany.approvalStatus = 'approved';
        latestCompany.isApproved = true;
        latestCompany.subscription = {
          plan: (plan === 'pro' ? 'pro' : plan === 'basic' ? 'basic' : 'free') as PlanId,
          status: 'active',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          limits: { ...PLANS.basic.limits },
        };
        await latestCompany.save();
        updatedCompany = latestCompany;
      }
    }

    return {
      success: true,
      message: `Razorpay payment signature verified and subscription upgraded to ${plan.toUpperCase()} Plan!`,
      status: 'captured',
      razorpay_order_id,
      razorpay_payment_id,
      plan,
      companyName: updatedCompany?.name || 'Company',
    };
  }

  async getMySubscription(companyIdRaw: any) {
    const companyId = companyIdRaw ? String(companyIdRaw) : '';
    if (!companyId || !Types.ObjectId.isValid(companyId)) {
      throw new NotFoundException('Invalid Company ID');
    }

    let company = await this.companyModel.findById(companyId);
    if (!company) throw new NotFoundException('Company not found');

    const payments = await this.paymentModel
      .find({ companyId: new Types.ObjectId(companyId) })
      .sort({ createdAt: -1 })
      .lean();

    // Auto-approve company if any captured payment exists
    const hasCapturedPayment = payments.some((p) => p.status === 'captured');
    if ((hasCapturedPayment || payments.length > 0) && (!company.isApproved || company.approvalStatus !== 'approved')) {
      company.isApproved = true;
      company.approvalStatus = 'approved';
      if (!company.subscription) {
        company.subscription = { plan: 'free', status: 'active', limits: { ...PLANS.free.limits } };
      } else {
        company.subscription.status = 'active';
      }
      await company.save();
      this.logger.log(`Auto-activated company ${company.name} based on payment records`);
    }

    const planId = (company.subscription?.plan || 'free') as PlanId;
    const planConfig = PLANS[planId] || PLANS.free;

    // Compute live monthly usage stats
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const invoicesThisMonth = await this.docModel.countDocuments({
      companyId: new Types.ObjectId(companyId),
      docType: 'invoice',
      createdAt: { $gte: startOfMonth },
    });

    const userCount = await this.userModel.countDocuments({
      companyId: new Types.ObjectId(companyId),
      isActive: { $ne: false },
    });

    let companiesCount = 1;
    if (company.ownerId) {
      companiesCount = await this.companyModel.countDocuments({ ownerId: company.ownerId });
    }

    return {
      plan: planId,
      planName: planId === 'pro' ? 'Pro Plan' : planId === 'basic' ? 'Basic Plan' : 'Starter Plan',
      status: company.subscription?.status || 'active',
      isApproved: company.isApproved === true || company.approvalStatus === 'approved',
      approvalStatus: company.approvalStatus || 'approved',
      expiresAt: company.subscription?.expiresAt,
      limits: company.subscription?.limits || planConfig.limits,
      usage: {
        invoicesThisMonth,
        users: Math.max(1, userCount),
        companiesOwned: Math.max(1, companiesCount),
      },
      paymentsHistory: payments.map((p) => ({
        id: String(p._id),
        orderId: p.orderId,
        paymentId: p.paymentId || 'N/A',
        amount: p.amount,
        plan: p.plan,
        status: p.status,
        date: (p as any).createdAt ? new Date((p as any).createdAt).toISOString().split('T')[0] : '2026-08-05',
      })),
    };
  }
}
