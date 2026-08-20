import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

const STORAGE_KEY = 'sw33tloop_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSignal = signal<CartItem[]>(this.loadFromStorage());

  items = computed(() => this.itemsSignal());

  itemCount = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0)
  );

  total = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  addItem(newItem: Omit<CartItem, 'quantity'>): void {
    const current = this.itemsSignal();
    const existing = current.find((i) => i.id === newItem.id);

    if (existing) {
      this.updateQuantity(newItem.id, existing.quantity + 1);
    } else {
      this.itemsSignal.set([...current, { ...newItem, quantity: 1 }]);
      this.saveToStorage();
    }
  }

  updateQuantity(id: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(id);
      return;
    }
    this.itemsSignal.set(
      this.itemsSignal().map((i) => (i.id === id ? { ...i, quantity } : i))
    );
    this.saveToStorage();
  }

  increment(id: number): void {
    const item = this.itemsSignal().find((i) => i.id === id);
    if (item) this.updateQuantity(id, item.quantity + 1);
  }

  decrement(id: number): void {
    const item = this.itemsSignal().find((i) => i.id === id);
    if (item) this.updateQuantity(id, item.quantity - 1);
  }

  removeItem(id: number): void {
    this.itemsSignal.set(this.itemsSignal().filter((i) => i.id !== id));
    this.saveToStorage();
  }

  clearCart(): void {
    this.itemsSignal.set([]);
    this.saveToStorage();
  }

  private saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.itemsSignal()));
  }

  private loadFromStorage(): CartItem[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }
}