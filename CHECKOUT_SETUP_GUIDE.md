# Checkout, account, and order-status guide

This guide explains how to add the features yourself. Follow the steps in order, test after each section, and make a Git commit or copy backup before starting.

## What you are adding

1. A required phone number at checkout.
2. A clearly required delivery location.
3. An account requirement only when a customer tries to place an order.
4. Saving the guest's checkout details while they create or log into an account.
5. A confirmation page that shows the created order's status.
6. A fix for the server-side user/order relation so placing an order does not fail.

## 1. Add the required checkout fields

File: `sw33tloop-frontend/src/app/pages/cart-page/cart-page.ts`

In the `checkoutForm` group, add a phone control after `location`:

```ts
phone: ['', [Validators.required, Validators.pattern(/^[0-9+()\-\s]{7,20}$/)]],
```

File: `sw33tloop-frontend/src/app/pages/cart-page/cart-page.html`

After the delivery-location textarea and its validation message, add:

```html
<label for="phone">Phone Number <span aria-hidden="true">*</span></label>
<input
  id="phone"
  type="tel"
  formControlName="phone"
  autocomplete="tel"
  placeholder="e.g. +855 12 345 678"
/>
@if (checkoutForm.get('phone')?.invalid && checkoutForm.get('phone')?.touched) {
  <p class="field-error">Please enter a valid phone number.</p>
}
```

Also change the delivery label to make its required status visible:

```html
<label for="location">Delivery Location <span aria-hidden="true">*</span></label>
```

File: `sw33tloop-frontend/src/app/pages/cart-page/cart-page.css`

Make the phone input use the same styling as the textarea. Change the selector from:

```css
.checkout-panel textarea {
```

to:

```css
.checkout-panel textarea,
.checkout-panel input[type='tel'] {
```

Test: leave either field empty, press **Place Order**, and make sure its error message appears.

## 2. Send the phone number with an order

File: `sw33tloop-frontend/src/app/core/strapi.ts`

Add `phone` to `OrderPayload`:

```ts
phone: string;
```

File: `sw33tloop-frontend/src/app/pages/cart-page/cart-page.ts`

When building `payload` inside `placeOrder()`, add:

```ts
phone: this.checkoutForm.value.phone,
```

Test: use your browser Network tab when submitting an order. The request body should contain `data.phone`.

## 3. Make the backend fields required

File: `sw33tloop-backend/src/api/order/content-types/order/schema.json`

Use a lowercase field name named `phone` (not `Phone`) and make it required:

```json
"phone": {
  "type": "string",
  "required": true
}
```

Also add `"required": true` to `items`, `total`, `location`, and `paymentMethod`. Set a default for the order status:

```json
"orderStatus": {
  "type": "enumeration",
  "enum": ["pending", "confirmed", "delivered", "cancelled"],
  "default": "pending",
  "required": true
}
```

Important: a customer must be able to make more than one order. Change the relation from `oneToOne` to `manyToOne`:

```json
"users_permissions_user": {
  "type": "relation",
  "relation": "manyToOne",
  "target": "plugin::users-permissions.user"
}
```

Stop and restart Strapi after changing its schema. Then inspect the Order content type in Strapi Admin to confirm the fields appeared.

## 4. Fix the order-to-user connection

File: `sw33tloop-backend/src/api/order/controllers/order.ts`

Your schema calls the relation `users_permissions_user`. Use that exact name everywhere in this controller. Do not use `user`.

For example, when creating an order:

```ts
ctx.request.body.data = {
  ...ctx.request.body.data,
  users_permissions_user: ctx.state.user.id,
};
```

For `find`, filter on `users_permissions_user`. For `findOne`, populate `users_permissions_user` and compare `order.users_permissions_user?.id` with `ctx.state.user.id`.

This name mismatch is a likely reason that Place Order fails even when a user is logged in.

Test: log in, make one order, then make a second order. Both should be linked to the same customer in Strapi.

## 5. Save checkout details for a guest

File: `sw33tloop-frontend/src/app/pages/cart-page/cart-page.ts`

At the top of the file (before `@Component`), add:

```ts
const CHECKOUT_DRAFT_KEY = 'sw33tloop_checkout_draft';
```

Make the class implement `OnInit`, and import `OnInit` from `@angular/core`.

Add these methods:

```ts
ngOnInit(): void {
  const savedDraft = localStorage.getItem(CHECKOUT_DRAFT_KEY);
  if (!savedDraft) return;

  try {
    this.checkoutForm.patchValue(JSON.parse(savedDraft));
  } catch {
    localStorage.removeItem(CHECKOUT_DRAFT_KEY);
  }
}

private saveCheckoutDraft(): void {
  localStorage.setItem(
    CHECKOUT_DRAFT_KEY,
    JSON.stringify(this.checkoutForm.getRawValue())
  );
}
```

Before the order request, check whether the customer is logged in. If not:

```ts
this.saveCheckoutDraft();
this.errorMessage = 'Create an account or log in to place your order. Your checkout details have been saved.';
return;
```

The cart is already stored by `CartService`, so this saves the missing checkout form values too.

## 6. Send the guest to account creation, then back to cart

File: `sw33tloop-frontend/src/app/pages/cart-page/cart-page.ts`

Use two methods for the buttons:

```ts
goToRegister(): void {
  this.saveCheckoutDraft();
  this.router.navigate(['/register'], { queryParams: { returnUrl: '/cart' } });
}

goToLogin(): void {
  this.saveCheckoutDraft();
  this.router.navigate(['/login'], { queryParams: { returnUrl: '/cart' } });
}
```

File: `sw33tloop-frontend/src/app/pages/cart-page/cart-page.html`

In the guest error area, add separate **Create Account** and **Log In** buttons that call these methods.

Files: `sw33tloop-frontend/src/app/pages/login/login.ts` and `sw33tloop-frontend/src/app/pages/register/register.ts`

Import `ActivatedRoute`, inject it in each constructor, and replace the normal redirect after successful login/register with:

```ts
this.router.navigateByUrl(this.returnUrl());
```

Add this helper to both components:

```ts
private returnUrl(): string {
  const value = this.route.snapshot.queryParamMap.get('returnUrl');
  return value?.startsWith('/') ? value : '/';
}
```

Test: as a guest, add an item, enter location/phone, press Place Order, create an account, and confirm that the cart and fields are restored on `/cart`.

## 7. Show the order status after placing the order

File: `sw33tloop-frontend/src/app/pages/cart-page/cart-page.ts`

Add a component property:

```ts
orderStatus = 'pending';
```

In the successful `createOrder` callback, receive the response and save its status:

```ts
next: (response) => {
  this.submitting = false;
  this.orderPlaced = true;
  this.orderStatus = response.data.orderStatus || 'pending';
  this.cart.clearCart();
  localStorage.removeItem(CHECKOUT_DRAFT_KEY);
},
```

File: `sw33tloop-frontend/src/app/pages/cart-page/cart-page.html`

In the order-confirmation section, add:

```html
<p>Your order status: <strong>{{ orderStatus }}</strong></p>
```

Test: place an order while logged in. You should see `pending` immediately after the server returns success.

## Final testing checklist

1. Run the backend: `npm run develop` from `sw33tloop-backend`.
2. Run the frontend: `ng serve` from `sw33tloop-frontend`.
3. Guest: add an item, complete checkout, press Place Order, create an account, return to cart, and confirm data is still there.
4. Logged-in user: place two orders and confirm both are saved in Strapi.
5. Confirm an order shows `pending` after submission.
6. Try missing phone/location to confirm the form prevents submission.

If an order still fails, open the browser Network tab, select the `/api/orders` request, and check its response message. That exact message tells you whether the problem is authentication, schema validation, or the relation field name.
