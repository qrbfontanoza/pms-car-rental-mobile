# PMS Car Rental Customer Mobile App

A native-style Ionic + Angular customer frontend recreated from the supplied PMS website and assets. It uses standalone components, strict TypeScript, reactive forms, lazy routes, Ionic navigation, signals, and a replaceable service layer. No production backend, database, payment gateway, or WebView is connected.

## Included experience

- Branded splash and persistent, skippable onboarding
- Home search, featured vehicles, how-it-works, statistics, testimonials, FAQ preview, and CTA
- Public catalog with keyword/category/price/seats/fuel/transmission/availability filters, sorting, chips, refresh, pagination, and state feedback
- Vehicle details and protected four-step reservation flow
- Mock login, registration, logout, three-step password reset, and password change
- Persistent mock bookings with all required statuses and actions
- Booking details, cancellation, early return, support, and receipt placeholders
- Profile, image picker abstraction, notifications, and system/light/dark appearance
- Searchable FAQ, About, Privacy Policy, and authenticated support form
- Accessible focus, labels, contrast, 44 px targets, reduced motion, phone/tablet layouts, and safe areas

## Install and run

Angular 22 requires a currently supported Node release. Use Node 24.15+ and pnpm 11+.

```bash
pnpm install
pnpm start
```

Open `http://localhost:4200`. In mock mode, any valid email and password of at least six characters signs in. Try voucher `BOOK50` or `RIDE300`.

```bash
pnpm build
pnpm test
pnpm lint
pnpm format
```

## Architecture

```text
src/app/
  core/           guard, storage, theme, HTTP interceptor
  data/           one source of realistic mock data
  features/       lazy standalone pages by journey
  models/         domain types and abstract service contracts
  services/       Mock* and inactive Api* implementations
  shared/         reusable cards, states, badges, inputs, summaries
  utils/          date, currency, and validation logic
src/assets/        reused PMS logo and vehicle imagery
src/environments/  API mode and base URL
```

Pages depend only on abstract services such as `VehicleService` and `BookingService`; they never import mock data. `app.providers.ts` selects mock or API implementations.

Safe persisted mock keys include onboarding, theme, a password-free fake session, bookings, profile/preferences, and support messages. Raw passwords, reset codes, and license-image contents are not stored.

## Switch to the future API

1. Implement [API_INTEGRATION.md](API_INTEGRATION.md).
2. Set `useMockApi: false` and the HTTPS `apiBaseUrl` in the production environment.
3. Complete secure token storage/refresh in `auth.interceptor.ts`.
4. Complete Capacitor-backed media and receipt services.
5. Add contract tests against a non-production API.

No page component needs to change.

## Capacitor Android and iOS

```bash
pnpm build
pnpm add @capacitor/android @capacitor/ios
pnpm exec cap add android
pnpm exec cap add ios
pnpm exec cap sync
pnpm exec cap open android
pnpm exec cap open ios
```

iOS builds require macOS/Xcode; Android builds require Android Studio and a supported JDK. Configure signing, icons/splash screens, privacy manifests, permissions, and secure storage before release.

## Required backend work

Build the secured versioned API, token refresh/revocation, profile endpoints, multipart image handling, authoritative overlap checks, voucher redemption transactions, idempotency, rate limiting, audit logs, email delivery, finalized contact/retention content, receipt PDF/share/filesystem integrations, and server tests. Never expose MySQL directly to the app.
