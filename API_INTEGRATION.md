# PMS Car Rental Mobile API Integration

The mobile app must communicate with the PMS database only through a secured HTTPS REST API. It must never connect directly to MySQL. All dates are ISO `YYYY-MM-DD`; timestamps are ISO 8601 UTC; money is represented as integer Philippine pesos unless the backend explicitly adopts centavos.

## Conventions

- Base URL: `{environment.apiBaseUrl}`
- Authentication: future `Authorization: Bearer <access-token>` header. Prefer a short-lived access token and a refresh token held in OS-protected storage.
- Success: `{ "data": T, "message"?: string }`
- Error: `{ "error": { "code": string, "message": string, "fieldErrors"?: Record<string,string> } }`
- Pagination: `{ "data": T[], "meta": { "page": 1, "pageSize": 20, "total": 42, "totalPages": 3 } }`
- Expected failures: `400` malformed, `401` unauthenticated, `403` forbidden, `404` missing, `409` conflict/unavailable, `422` validation, `429` throttled, `500` unexpected.

## Authentication endpoints

### `POST /auth/register` — Public

JSON: `{ "fullName": "Maria Santos", "email": "maria@example.com", "password": "secret1", "privacyConsent": true }`. With a license, send `multipart/form-data` containing `payload` JSON plus a `license` binary part. Accept verified JPEG/PNG up to 3 MB. Return `201 { data: User }`. Hash passwords server-side and never return them.

### `POST /auth/login` — Public

Body: `{ "email": "maria@example.com", "password": "secret1" }`. Return `{ data: { user: User, accessToken: string, expiresIn: number, refreshToken?: string } }`. Rate-limit attempts and do not disclose account existence.

### `POST /auth/logout` — Authenticated

No body. Revoke the refresh/session token and return `204`.

### `GET /auth/me` — Authenticated

Return `{ data: CustomerProfile }` for session bootstrap.

### `POST /auth/password/forgot` — Public

Body: `{ "email": "maria@example.com" }`. Always return the same generic `202`. Generate a secure six-digit code, store only a hash, expire it after 15 minutes, and rate-limit resends.

### `POST /auth/password/reset` — Public

Body: `{ "email": "maria@example.com", "code": "123456", "password": "newSecret" }`. Enforce the six-character website minimum, invalidate the code after success, and return `204`.

### `POST /auth/password/change` — Authenticated

Body: `{ "currentPassword": "secret1", "newPassword": "newSecret" }`. Revoke other sessions after success and return `204`.

## Vehicle endpoints

### `GET /vehicles` — Public

Query: `keyword`, comma-separated `categories`, `minPrice`, `maxPrice`, `seats`, `fuel`, `transmission`, `availableOnly`, `sort`, `page`, and `pageSize`. Sort values: `name_asc`, `name_desc`, `price_asc`, `price_desc`, `newest`. Return `PaginatedResponse<Vehicle>`. Calculate `availableUnits` for requested `pickupDate` and `returnDate` when present.

### `GET /vehicles/:id` — Public

Return `{ data: Vehicle }` or `404`. Return HTTPS/CDN image URLs rather than internal storage paths.

## Booking endpoints

### `GET /bookings` — Authenticated

Return every booking owned by the current user, including pending, confirmed, completed, cancelled, and returned-early states. Support optional `status`, `page`, and `pageSize`.

### `POST /bookings/preview` — Authenticated

Body: `{ "vehicleId": "3", "pickupDate": "2026-09-02", "returnDate": "2026-09-05", "voucherCode"?: "BOOK50" }`. Return `{ data: BookingPricePreview }`. The server is authoritative for the inclusive day count, rate, voucher, discount, and total.

### `POST /bookings` — Authenticated

Body: `{ "vehicleId": "3", "pickupDate": "2026-09-02", "returnDate": "2026-09-05", "contactNumber": "09175550188", "renterAge": 29, "voucherCode"?: "BOOK50" }`. Optional license uses multipart `payload` + `license`. Recheck 18+ age, dates, overlap availability, rate, and voucher inside one database transaction. Return `201 { data: Booking }` with `status: "pending"`. Require an idempotency key.

### `POST /bookings/:id/cancel` — Authenticated owner

Optional body: `{ "reason"?: string }`. Validate the status transition and return `{ data: Booking }`.

### `POST /bookings/:id/return-early` — Authenticated owner

Body: `{ "returnedAt"?: ISO8601 }`. Require a confirmed active booking. Return the updated booking; finalize refund/recalculation policy before production.

### `GET /bookings/:id/receipt` — Authenticated owner

Return `{ data: Receipt }` with customer and vehicle snapshots, period, price/discount, booking status, and payment status. A future `Accept: application/pdf` representation may return a generated PDF.

## Voucher endpoints

### `GET /vouchers` — Authenticated

Return currently usable customer-visible vouchers only, without private campaign or redemption data.

### `POST /vouchers/apply` — Authenticated

Body: `{ "code": "BOOK50", "subtotal": 18000, "vehicleId"?: "3", "pickupDate"?: "2026-09-02", "returnDate"?: "2026-09-05" }`. Return `{ data: { voucher: Voucher, discount: 9000 } }`. Revalidate during booking; client subtotal is never authoritative.

## Support endpoint

### `POST /messages` — Authenticated

Body: `{ "name": "Maria Santos", "email": "maria@example.com", "subject": "Pickup question", "message": "..." }`. Associate it with the authenticated user, sanitize and rate-limit, then return `201 { data: SupportMessage }`.

## Additional profile endpoints required

The supplied list does not cover mobile profile editing. Add `PATCH /profile` for name/email/phone, `PATCH /profile/notifications` for preference booleans, and multipart `POST /profile/photo` for profile images.

## Upload and security strategy

Content-sniff uploads rather than trusting extensions, enforce limits, strip metadata where appropriate, generate random names, scan files, and store them outside the executable web root or in private object storage. Return expiring signed URLs for license images. Enforce resource ownership, CORS allowlists, TLS, request limits, audit logs, rate limits, server validation, prepared statements, and externalized secrets.

The existing interceptor intentionally sends no token. API activation should retrieve an access token from secure native storage, retry once after an authorized refresh, and redirect to login with the intended route when refresh fails.
