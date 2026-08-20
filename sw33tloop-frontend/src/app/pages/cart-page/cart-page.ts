import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../core/cart';
import { StrapiService } from '../../core/strapi';
import { AuthService } from '../../core/auth';

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
    public auth: AuthService,
    private strapi: StrapiService,
    private router: Router,
    private fb: FormBuilder
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

    // Frontend also checks this so the person gets a clear message
    // right away, instead of a confusing error after submitting --
    // the backend enforces this too either way.
    if (!this.auth.isLoggedIn()) {
      this.errorMessage = 'Please log in or create an account to place an order.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const payload = {
      items: this.cart.items().map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity
      })),
      total: this.cart.total(),
      location: this.checkoutForm.value.location,
      paymentMethod: this.checkoutForm.value.paymentMethod as 'cash' | 'bank'
    };

    this.strapi.createOrder(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.orderPlaced = true;
        this.cart.clearCart();
      },
      error: (err) => {
        this.submitting = false;
        if (err.status === 401) {
          this.errorMessage = 'Please log in or create an account to place an order.';
        } else {
          this.errorMessage = 'Something went wrong placing your order. Please try again.';
        }
        console.error('Order failed', err);
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
