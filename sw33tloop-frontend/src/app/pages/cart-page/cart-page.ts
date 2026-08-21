import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../core/cart';
import { StrapiService, OrderPayload } from '../../core/strapi';
import { AuthService } from '../../core/auth';
import { PendingOrderService } from '../../core/pending-order';

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
  needsAccount = false;
  orderStatus: string | null = null;

  // Replace these with your real bank details / QR code image
  bankName = 'ABA Bank';
  bankAccountName = 'SW33T LOOP';
  bankAccountNumber = '000 123 456';

  constructor(
    public cart: CartService,
    public auth: AuthService,
    private strapi: StrapiService,
    private pendingOrder: PendingOrderService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.checkoutForm = this.fb.group({
      location: ['', Validators.required],
      phone: ['', Validators.required],
      paymentMethod: ['cash', Validators.required]
    });

    // If we just came back from a successful login/register that
    // auto-submitted a saved order, show the confirmation screen.
    if (this.route.snapshot.queryParamMap.get('orderConfirmed') === 'true') {
      this.orderPlaced = true;
      this.orderStatus = 'pending';
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

    this.errorMessage = '';
    this.needsAccount = false;

    // Not logged in: save exactly what they typed, then send them to
    // create an account. Nothing gets lost -- once they finish signing
    // up, the order submits automatically with this saved data.
    if (!this.auth.isLoggedIn()) {
      this.pendingOrder.save({
        location: this.checkoutForm.value.location,
        phone: this.checkoutForm.value.phone,
        paymentMethod: this.checkoutForm.value.paymentMethod,
        items: this.cart.items(),
        total: this.cart.total()
      });

      this.needsAccount = true;
      this.errorMessage =
        "You'll need an account to place an order. Your details are saved -- just sign up or log in and we'll finish placing it.";
      this.cdr.detectChanges();
      return;
    }

    this.submit();
  }

  private submit(): void {
    this.submitting = true;
    this.errorMessage = '';

    const payload: OrderPayload = {
      items: this.cart.items().map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity
      })),
      total: this.cart.total(),
      location: this.checkoutForm.value.location,
      phone: this.checkoutForm.value.phone,
      paymentMethod: this.checkoutForm.value.paymentMethod
    };

    this.strapi.createOrder(payload).subscribe({
      next: (res) => {
        this.submitting = false;
        this.orderPlaced = true;
        this.orderStatus = res.data.orderStatus;
        this.cart.clearCart();
        this.cdr.detectChanges();
      },
      error: (err) => {
        // Always reset submitting -- the button should never stay
        // stuck on "PLACING ORDER..." no matter what goes wrong.
        this.submitting = false;

        if (err.status === 401) {
          this.errorMessage = 'Please log in or create an account to place an order.';
        } else if (err.status === 403) {
          this.errorMessage =
            'Your account is not allowed to place orders yet. (Permission issue on the server -- check the Order permissions for the Authenticated role in Strapi.)';
        } else if (err.status === 400) {
          this.errorMessage =
            'Some order details were rejected by the server. Check the browser console for the exact field error.';
        } else if (err.status === 0) {
          this.errorMessage =
            'Could not reach the server. Make sure Strapi is running, then try again.';
        } else {
          this.errorMessage = `Something went wrong (error ${err.status}). Please try again.`;
        }

        console.error('Order failed:', err);
        this.cdr.detectChanges();
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}