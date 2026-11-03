Postman collection for Pirate Store backend
=========================================

How to use
----------

- Import `Pirate Store.postman_collection.json` into Postman (File > Import).
- Import `Pirate Store.postman_environment.json` as an environment and select it.
- Update `{{baseUrl}}` if your server runs on a different host/port (default: `http://localhost:5000`).
- Update `{{adminEmail}}`/`{{adminPassword}}` and `{{userEmail}}`/`{{userPassword}}` if you have different test accounts. If there is no admin account in DB, create one (via register then update role in DB) or seed an admin.

Recommended run order
---------------------
1. Auth -> `Login Admin` (sets `{{adminToken}}`).
2. Products -> `Create Product (admin)` (sets `{{productId}}`).
3. Auth -> `Register User` then `Login User` (sets `{{userToken}}` and `{{userId}}`).
4. Orders -> `Create Order (user)` (uses `{{productId}}`, sets `{{orderId}}`).
5. Orders -> `Mark Order Paid` (user) / `Mark Order Delivered` (admin) / `Cancel Order` to exercise flows.
6. Refunds -> `Initiate Refund (user)` and then `Get Refund by Order ID`.
7. Users -> `Get My Profile`, `Update My Profile`, `Get All Users` (admin), `Delete User by ID` (admin) for cleanup.

Notes
-----
- Several requests modify or delete data (Delete All Products, Delete Product by ID, Delete User). Use them with care.
- If creating users via `Register User` fails because the email already exists, either change the `{{userEmail}}` or delete the test user from DB first.
- The collection contains test scripts that extract `token`, `productId`, `orderId`, and `refundId` into environment variables when possible.

If you want, I can also create a runner script or example Postman Collection Runner configuration to run the entire flow automatically.
