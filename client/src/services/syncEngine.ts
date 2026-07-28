import { api } from '@/lib/api';

export interface OfflineMutation {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload: any;
  createdAt: number;
}

const STORAGE_KEY = 'balajione_offline_queue_v1';

export class SyncEngine {
  /** Get queued offline mutations */
  static getQueue(): OfflineMutation[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /** Queue a mutation when offline */
  static enqueue(mutation: Omit<OfflineMutation, 'id' | 'createdAt'>): void {
    const queue = this.getQueue();
    const item: OfflineMutation = {
      ...mutation,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: Date.now(),
    };
    queue.push(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    console.log(`[SYNC ENGINE] Enqueued offline mutation (${item.method} ${item.url})`);
  }

  /** Flush and process queue when online */
  static async processQueue(): Promise<{ processed: number; failed: number }> {
    const queue = this.getQueue();
    if (queue.length === 0) return { processed: 0, failed: 0 };

    console.log(`[SYNC ENGINE] Processing ${queue.length} offline queued requests...`);
    const remaining: OfflineMutation[] = [];
    let processed = 0;
    let failed = 0;

    for (const item of queue) {
      try {
        await api.request({
          url: item.url,
          method: item.method,
          data: item.payload,
        });
        processed++;
      } catch (err) {
        console.warn(`[SYNC ENGINE] Failed processing mutation ${item.id}:`, err);
        failed++;
        remaining.push(item);
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
    return { processed, failed };
  }

  /** Register online auto-sync listener */
  static initAutoSync(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      console.log('[SYNC ENGINE] Network restored! Replaying offline queue...');
      this.processQueue();
    });
  }
}

SyncEngine.initAutoSync();
