# PMS Car Rental Customer Mobile App

A native-style Ionic + Angular customer application recreated from the supplied PMS website and assets. It uses standalone components, strict TypeScript, reactive forms, lazy routes, Ionic navigation, signals, and a replaceable service layer. Production builds use the secured Azure HTTPS API; the app never connects directly to MySQL and does not embed the website as application content.

## Included experience

- Branded splash and persistent, skippable onboarding
- Home search, featured vehicles, how-it-works, statistics, testimonials, FAQ preview, and CTA
- Public catalog with keyword/category/price/seats/fuel/transmission/availability filters, sorting, chips, refresh, pagination, and state feedback
- Vehicle details and protected four-step reservation flow
- Login, registration, logout, three-step password reset, and password change
- Production booking, voucher, profile, support, upload, and receipt service implementations
- Native Keychain/Keystore-backed token storage with refresh rotation and safe session-only web fallback
- Capacitor native bridge logging is disabled so secure-storage payloads cannot be written to Android Logcat
- Booking details, cancellation, early return, support, and native PNG receipt save/share actions
- Profile, image picker abstraction, notifications, and system/light/dark appearance
- Searchable FAQ, About, Privacy Policy, and authenticated support form
- Accessible focus, labels, contrast, 44 px targets, reduced motion, phone/tablet layouts, and safe areas

## Install and run

Angular 22 requires a currently supported Node release. Use Node 24.15+ and pnpm 11+.

```bash
pnpm install
pnpm start
```

Open `http://localhost:4200`. The development environment intentionally uses mock services for safe UI work. The production configuration always selects API services and the Azure `/api/v1` base URL.

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
  main/           lazy standalone pages by journey
  models/         domain types and abstract service contracts
  services/       Mock* development services and active Api* production services
  shared/         reusable cards, states, badges, inputs, summaries
  utils/          date, currency, and validation logic
src/assets/        reused PMS logo and vehicle imagery
src/environments/  API mode and base URL
```

Pages depend only on abstract services such as `VehicleService` and `BookingService`; they never import vehicle/booking mock data. `app.providers.ts` selects development implementations, while the production build replaces it with `app.providers.prod.ts`, which imports API implementations only.

Safe persisted mock keys include onboarding, theme, a password-free fake session, bookings, profile/preferences, and support messages. Raw passwords, reset codes, and license-image contents are not stored.

## Environment selection

`src/environments/environment.ts` is the local mock configuration. `environment.staging.ts` points to the isolated Azure staging API and is built with `pnpm build:staging`. `environment.prod.ts` has `useMockApi: false` and points to the production Azure API. Never silently fall back to mocks after an API failure.

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

For an Android emulator or connected phone:

```bash
pnpm build
pnpm exec cap sync android
pnpm exec cap open android
```

Select the emulator or connected USB-debugging device in Android Studio and run the `app` configuration. A physical phone and development computer must be able to reach the chosen staging API.

## Production backend

The production mobile build uses the versioned Azure API shared with the PMS website. Backend source, database migrations, secrets, and Azure deployment tooling remain in the separate website/backend repository and are intentionally not duplicated here. See that repository’s `API_INTEGRATION.md`, `INTEGRATION_GAP_REPORT.md`, and `AZURE_DEPLOYMENT.md` for the server contract and operational procedures.
