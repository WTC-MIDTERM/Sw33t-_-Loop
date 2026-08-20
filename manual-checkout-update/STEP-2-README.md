# Step 2 — Make Place Order reach the backend

Replace the three project files with the matching plain-text code files in this folder:

| Copy this code file | Replace this project file |
| --- | --- |
| `strapi-code.txt` | `sw33tloop-frontend/src/app/core/strapi.ts` |
| `order-controller-code.txt` | `sw33tloop-backend/src/api/order/controllers/order.ts` |
| `order-schema-code.txt` | `sw33tloop-backend/src/api/order/content-types/order/schema.json` |

After saving all three files:

1. Stop the backend terminal with `Ctrl + C`.
2. In `sw33tloop-backend`, run `npm run develop` again.
3. Log in, add an item to the cart, enter delivery location and phone number, then press **Place Order**.

The important corrections are `phone` (lowercase) and `users_permissions_user` (the real relation name in your schema).
