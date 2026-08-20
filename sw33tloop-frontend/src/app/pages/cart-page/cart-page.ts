import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../core/cart';
import { OrderService } from '../../core/order';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.css'
})
export class CartPage {
  checkoutForm: FormGroup;
  orderPlaced = false;
  submitting = false;
  errorMessage = '';

  // Replace these with your real bank details / QR code image
  bankName = 'ABA Bank';
  bankAccountName = 'SW33T LOOP';
  bankAccountNumber = '000 123 456';

  constructor(
    public cart: CartService,
    private fb: FormBuilder,
    private orderService: OrderService
  ) {
    this.checkoutForm = this.fb.group({
      location: ['', Validators.required],
      paymentMethod: ['cash', Validators.required]
    });
  }

  get selectedPaymentMethod(): string {
    return this.checkoutForm.get('paymentMethod')?.value;
  }

  placeOrder(): void {
    if (this.checkoutForm.invalid || this.cart.items().length === 0) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const payload = {
      items: this.cart.items().map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      total: this.cart.total(),
      location: this.checkoutForm.value.location,
      paymentMethod: this.checkoutForm.value.paymentMethod
    };

    this.orderService.placeOrder(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.orderPlaced = true;
        this.cart.clearCart();
      },
      error: (err: any) => {
        this.submitting = false;
        if (err.status === 401) {
          this.errorMessage = 'Please log in to place an order.';
        } else {
          this.errorMessage =
            err?.error?.error?.message || 'Something went wrong placing your order. Please try again.';
        }
        console.error(err);
      }
    });
  }
}