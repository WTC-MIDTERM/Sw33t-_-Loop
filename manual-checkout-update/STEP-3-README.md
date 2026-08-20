# Step 3 — Fix `Invalid key users_permissions_user`

Replace this one project file:

| Copy this code file | Replace this project file |
| --- | --- |
| `order-controller-fixed-v2-code.txt` | `sw33tloop-backend/src/api/order/controllers/order.ts` |

Then restart the backend:

```powershell
Ctrl + C
npm run develop
```

Why: Strapi rejects `users_permissions_user` when it is inserted into the public REST request body and sent to `super.create()`. This replacement creates the order using Strapi's internal Document Service, which is allowed to attach the logged-in user.
