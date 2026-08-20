import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../core/cart';
import { StrapiService } from '../../core/strapi';
import { AuthService } from '../../core/auth';

const CHECKOUT_DRAFT_KEY = 'sw33tloop_checkout_draft';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.css'
})
export class CartPage implements OnInit {
  checkoutForm: FormGroup;
  orderPlaced = false;
  orderStatus = 'pending';
  submitting = false;
  errorMessage = '';

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
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+()\-\s]{7,20}$/)]],
      paymentMethod: ['cash', Validators.required]
    });
  }

  ngOnInit(): void {
    const savedDraft = localStorage.getItem(CHECKOUT_DRAFT_KEY);
    if (!savedDraft) return;

    try {
      this.checkoutForm.patchValue(JSON.parse(savedDraft));
    } catch {
      localStorage.removeItem(CHECKOUT_DRAFT_KEY);
    }
  }

  get selectedPaymentMethod(): string {
    return this.checkoutForm.get('paymentMethod')?.value;
  }

  placeOrder(): void {
    if (this.checkoutForm.invalid || this.cart.items().length === 0) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    if (!this.auth.isLoggedIn()) {
      this.saveCheckoutDraft();
      this.errorMessage = 'Create an account or log in to place your order. Your checkout details have been saved.';
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
      phone: this.checkoutForm.value.phone,
      paymentMethod: this.checkoutForm.value.paymentMethod as 'cash' | 'bank'
    };

    this.strapi.createOrder(payload).subscribe({
      next: (response) => {
        this.submitting = false;
        this.orderPlaced = true;
        this.orderStatus = response.data.orderStatus || 'pending';
        this.cart.clearCart();
        localStorage.removeItem(CHECKOUT_DRAFT_KEY);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.status === 401
          ? 'Please log in or create an account to place an order.'
          : 'Something went wrong placing your order. Please try again.';
        console.error('Order failed', err);
      }
    });
  }

  goToRegister(): void {
    this.saveCheckoutDraft();
    this.router.navigate(['/register'], { queryParams: { returnUrl: '/cart' } });
  }

  goToLogin(): void {
    this.saveCheckoutDraft();
    this.router.navigate(['/login'], { queryParams: { returnUrl: '/cart' } });
  }

  private saveCheckoutDraft(): void {
    localStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(this.checkoutForm.getRawValue()));
  }
}
