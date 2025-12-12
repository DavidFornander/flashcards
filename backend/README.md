# Backend Data Providers

This backend supports pluggable storage providers behind a common data access layer (DAL) used by the Express routes.

## Current providers
- `firestore` (default) via Firebase Admin SDK
- `postgres` via Prisma + `DATABASE_URL`

## Configuration
Set a `.env` file in `backend/` (or root) with:
- `DATA_PROVIDER=firestore` (default if omitted) or `postgres`
- Firestore (required when `DATA_PROVIDER=firestore`):
  
  **Option 1: JSON file path (RECOMMENDED)**
  - Download your service account JSON key from [Google Cloud Console](https://console.cloud.google.com/iam-admin/serviceaccounts)
  - Set `GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account-key.json`
  - This is the simplest setup method
  
  **Option 2: Inline credentials (alternative)**
  - `FIRESTORE_PROJECT_ID=your-project`
  - `FIRESTORE_CLIENT_EMAIL=...@...gserviceaccount.com`
  - `FIRESTORE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"`
  
- Postgres (only if using `DATA_PROVIDER=postgres`):
  - `DATABASE_URL=postgresql://user:pass@host:5432/db`

## How switching works
- The `DATA_PROVIDER` env selects a provider; default is Firestore.
- `src/data/providerFactory.ts` constructs the provider with the needed clients (Prisma or Firebase Admin).
- Express routes in `src/index.ts` call the DAL interface, not the raw SDKs.
- Firebase Admin SDK automatically reads `GOOGLE_APPLICATION_CREDENTIALS` if set, otherwise uses inline credentials.

## Adding a new provider (cookbook)
1. Implement the `DataProvider` interface in `src/data/DataProvider.ts`.
2. Normalize models to the shared shapes in `src/data/models.ts` (Dates for `nextReviewDate`, etc.).
3. Add a provider file under `src/data/providers/` with mapping helpers.
4. Wire it into `createDataProvider` in `src/data/providerFactory.ts`, keyed off a new `DATA_PROVIDER` value and any config needed.
5. Add tests in `src/tests/` that cover mapping and basic CRUD behavior (can use dependency injection + mocks).
6. Document the required environment variables here.

## Running tests
- `npm test` (uses `tsx` to run `node:test` on the TypeScript sources)

## API notes
- API responses serialize dates to ISO strings for the frontend.
- SRS fields (`easinessFactor`, `interval`, `repetitions`, `nextReviewDate`, `lastRating`) are kept consistent across providers.

