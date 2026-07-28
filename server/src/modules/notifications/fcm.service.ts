import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getMessaging, MulticastMessage } from 'firebase-admin/messaging';

export interface SendPushPayload {
  tokens: string[];
  title: string;
  body: string;
  category?: string;
  actionUrl?: string;
  data?: Record<string, string>;
}

@Injectable()
export class FcmService implements OnModuleInit {
  private readonly logger = new Logger(FcmService.name);
  private isFirebaseInitialized = false;

  onModuleInit() {
    try {
      if (getApps().length === 0) {
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        if (serviceAccount) {
          initializeApp({
            credential: cert(JSON.parse(serviceAccount)),
          });
          this.isFirebaseInitialized = true;
          this.logger.log('Firebase Admin SDK initialized via service account JSON.');
        } else if (process.env.FIREBASE_PROJECT_ID) {
          initializeApp({
            credential: cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
            }),
          });
          this.isFirebaseInitialized = true;
          this.logger.log('Firebase Admin SDK initialized via environment keys.');
        } else {
          this.logger.warn('Firebase Admin credentials not found. Running in Push Notification simulation mode.');
        }
      } else {
        this.isFirebaseInitialized = true;
      }
    } catch (err: any) {
      this.logger.error(`Failed to initialize Firebase Admin: ${err?.message || err}`);
    }
  }

  async sendMulticastPush(payload: SendPushPayload): Promise<{
    sentCount: number;
    deliveredCount: number;
    failedCount: number;
  }> {
    const { tokens, title, body, category = 'transaction', actionUrl = '', data = {} } = payload;

    if (!tokens || tokens.length === 0) {
      return { sentCount: 0, deliveredCount: 0, failedCount: 0 };
    }

    if (!this.isFirebaseInitialized) {
      this.logger.log(`[SIMULATION PUSH] Title: "${title}" | Target Tokens: ${tokens.length}`);
      return {
        sentCount: tokens.length,
        deliveredCount: tokens.length,
        failedCount: 0,
      };
    }

    try {
      const message: MulticastMessage = {
        tokens,
        notification: {
          title,
          body,
        },
        data: {
          category,
          actionUrl,
          click_action: actionUrl || '/app/dashboard',
          ...data,
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'balajione_notifications',
          },
        },
      };

      const response = await getMessaging().sendEachForMulticast(message);
      this.logger.log(`FCM Multicast result: Success=${response.successCount}, Failure=${response.failureCount}`);

      return {
        sentCount: tokens.length,
        deliveredCount: response.successCount,
        failedCount: response.failureCount,
      };
    } catch (err: any) {
      this.logger.error(`Failed sending FCM multicast: ${err?.message || err}`);
      return {
        sentCount: tokens.length,
        deliveredCount: 0,
        failedCount: tokens.length,
      };
    }
  }
}
