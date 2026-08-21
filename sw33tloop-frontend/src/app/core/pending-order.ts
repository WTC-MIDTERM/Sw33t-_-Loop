import { Injectable } from '@angular/core';
import { CartItem } from './cart';
import { StrapiService, OrderPayload } from './strapi';
import { Observable, of, switchMap } from 'rxjs';

const PENDING_ORDER_KEY = 'sw33tloop_pending_order';

export interface PendingOrder {
  location: string;
  phone: string;
  paymentMethod: 'cash' | 'bank';
  items: CartItem[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class PendingOrderService {
  constructor(private strapi: StrapiService) {}

  save(order: PendingOrder): void {
    localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(order));
  }

  get(): PendingOrder | null {
    const raw = localStorage.getItem(PENDING_ORDER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  clear(): void {
    localStorage.removeItem(PENDING_ORDER_KEY);
  }

  hasPendingOrder(): boolean {
    return this.get() !== null;
  }

  // Called right after a successful login/register. If a saved order
  // exists, submit it now using the exact details the person already
  // typed in -- they never have to fill the form out again.
  submitIfPending(): Observable<boolean> {
    const pending = this.get();
    if (!pending) {
      return of(false);
    }

    const payload: OrderPayload = {
      items: pending.items.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity
      })),
      total: pending.total,
      location: pending.location,
      phone: pending.phone,
      paymentMethod: pending.paymentMethod
    };

    return this.strapi.createOrder(payload).pipe(
      switchMap(() => {
        this.clear();
        return of(true);
      })
    );
  }
}