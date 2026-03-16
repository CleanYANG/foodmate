# CityTalk

CityTalk is a lightweight travel discovery app for browsing places one card at a time.

The core idea is simple:
- swipe through places quickly
- save the ones that look promising
- open the detail page for more context
- jump to maps when you are ready to go

It is designed for a solo founder workflow: small surface area, fast iteration, clean UI, and a simple admin panel for managing places without enterprise overhead.

---

## Project overview

CityTalk currently includes:

- **Expo / React Native mobile app**
- **Supabase-backed place feed**
- **saved places** for signed-in users
- **place detail pages** with reviews
- **tag-based filtering** on the Home screen
- **lightweight onboarding flow** shown once per device
- **admin web panel** for creating and managing places

The product direction is a modern travel discovery experience: premium-feeling, simple, and fast.

---

## Tech stack

### Mobile app
- **Expo**
- **React Native**
- **TypeScript**
- **React Navigation**

### Backend / data
- **Supabase**
  - database for places, reviews, saved places, users
  - auth for email magic links

### Admin panel
- **React**
- **Vite**
- **TypeScript**
- **Supabase JS**

### Tooling
- **ESLint**
- **Prettier**
- **TypeScript typecheck**

---

## Main features

### Mobile app
- swipe-based place discovery
- save / unsave places
- tag chips and tag filtering
- onboarding flow for first launch
- place detail screen with:
  - description
  - address
  - open in maps
  - reviews
- better UX states:
  - loading skeletons
  - empty states
  - error states
  - retry buttons
  - inline feedback

### Admin web panel
- list all places
- create a new place
- edit a place
- delete a place
- manage tags
- manage image URL
- simple admin allowlist via email

---

## Requirements

Before you start, make sure you have:

- **Node.js 20+** recommended
- **npm**
- **Expo Go** on your phone, or an emulator/simulator
- a **Supabase project**

---

## Setup steps

### 1. Clone the project

```bash
git clone <your-repo-url>
cd CityTalk
```

### 2. Install mobile app dependencies

```bash
npm install
```

### 3. Create the mobile app environment file

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Then set:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Install admin panel dependencies

```bash
npm run admin:install
```

### 5. Create the admin panel environment file

```bash
cd admin-web
cp .env.example .env
```

Then set:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_EMAILS=founder@example.com
```

You can use multiple admin emails by separating them with commas:

```bash
VITE_ADMIN_EMAILS=you@example.com,cofounder@example.com
```

---

## Environment variables

### Mobile app (`.env`)

```bash
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

These are used by the Expo app at runtime.

### Admin panel (`admin-web/.env`)

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_ADMIN_EMAILS=founder@example.com
```

These are used by the admin web panel.

---

## How to run locally

## Mobile app

Start Expo:

```bash
npm run start
```

Then choose one of these:
- press `w` for web
- press `a` for Android emulator
- press `i` for iOS simulator (macOS only)
- scan the QR code in Expo Go on your phone

You can also run directly:

```bash
npm run android
npm run ios
npm run web
```

## Admin web panel

From the project root:

```bash
npm run admin:dev
```

Or manually:

```bash
cd admin-web
npm run dev
```

The Vite dev server will start locally and give you a URL, usually:

```txt
http://localhost:4173
```

---

## How to connect Supabase

CityTalk depends on Supabase for both data and auth.

### Minimum setup

In Supabase, you should have:

- a **places** table
- a **reviews** table
- a **saved_places** table
- a **users** table
- **email auth** enabled

### App behavior expectations

The app currently expects these patterns:

#### `places`
Used for the main discovery feed and place detail pages.

Fields expected by the app/admin include:
- `id`
- `name`
- `short_review`
- `full_description`
- `address`
- `latitude`
- `longitude`
- `image_url`
- `city`
- `country`
- `tags` *(recommended as `text[]` for admin panel compatibility)*
- `created_at`

#### `reviews`
Used on the place detail screen.

Expected fields include:
- `id`
- `place_id`
- `body`
- `created_at`
- `user_id`

#### `saved_places`
Used to track saved places per authenticated user.

Expected fields include:
- `user_id`
- `place_id`
- `created_at`

#### `users`
Used to store profile metadata for authenticated users.

Expected fields include things like:
- `id`
- `display_name`
- `username`

### Supabase Auth setup

Enable:
- **Email** sign-in

For the mobile app, make sure your auth flow is configured so magic links can return correctly.

Current app scheme:

```txt
citytalk
```

That means your redirect / callback settings should be aligned with Expo + your app scheme.

### Important note about policies

The app and admin panel will only work properly if your Supabase policies allow the right users to do the right things.

At minimum:
- public/guest users should be able to **read places**
- signed-in users should be able to **save places** and **post reviews**
- admin users should be able to **create/update/delete places**

The admin panel uses a **simple allowlist check in the frontend** via `VITE_ADMIN_EMAILS`, but actual database safety should still be enforced with **Supabase RLS policies**.

Frontend checks are for convenience. Policies are the real protection.

---

## How to build and test the app

### Lint

```bash
npm run lint
```

### Typecheck

```bash
npm run typecheck
```

### Format code

```bash
npm run format
```

### Check formatting without changing files

```bash
npm run format:check
```

### Build the admin panel

```bash
npm run admin:build
```

This creates a production build in:

```txt
admin-web/dist
```

### Mobile app build notes

This repo currently focuses on local development with Expo.

For production mobile builds, you would typically use:
- **EAS Build** for iOS/Android
- or Expo’s standard production workflow

If you go that route later, make sure your:
- app config
- environment variables
- auth redirect settings
- Supabase policies

are all correct for production.

---

## Local founder workflow

A practical solo-founder loop for CityTalk looks like this:

1. Run the mobile app
   ```bash
   npm run start
   ```
2. Run the admin panel
   ```bash
   npm run admin:dev
   ```
3. Add or edit places in the admin panel
4. Refresh the mobile app and test the feed
5. Check:
   - tags
   - save flow
   - detail screen
   - review flow
   - onboarding behavior
   - maps handoff
6. Run:
   ```bash
   npm run lint
   npm run typecheck
   ```

This keeps the workflow fast without needing a heavy CMS or separate backend app.

---

## Folder structure overview

```txt
CityTalk/
  admin-web/                  # lightweight admin panel (React + Vite)
    src/
      App.tsx
      env.ts
      supabase.ts
      styles.css
      types.ts

  assets/                     # app icons / splash / static assets

  src/
    components/               # reusable UI pieces
      Button.tsx
      Card.tsx
      InlineNotice.tsx
      Screen.tsx
      ScreenHeader.tsx
      SkeletonBlock.tsx
      StateCard.tsx
      Tag.tsx

    config/                   # env parsing for mobile app
      env.ts

    data/                     # local mock / seed-like frontend data helpers
      mockPlaces.ts

    lib/                      # low-level helpers / clients
      placeTags.ts
      supabase.ts

    navigation/               # navigation config and route types
      AppNavigator.tsx
      types.ts

    screens/                  # app screens
      HomeScreen.tsx
      OnboardingScreen.tsx
      PlaceDetailScreen.tsx
      ProfileScreen.tsx
      SavedPlacesScreen.tsx
      SignInScreen.tsx

    services/                 # app-side data and utility services
      authService.ts
      mapService.ts
      onboardingService.ts
      placeService.ts

    store/                    # React context state containers
      AuthContext.tsx
      SavedPlacesContext.tsx

    theme/                    # design tokens / visual system
      colors.ts
      navigation.ts
      spacing.ts
      typography.ts

    types/                    # shared TypeScript types
      place.ts
      review.ts

  App.tsx                     # app entry wiring
  app.json                    # Expo config
  package.json
  README.md
```

---

## Key scripts

### Mobile

```bash
npm run start
npm run android
npm run ios
npm run web
```

### Quality

```bash
npm run lint
npm run typecheck
npm run format
npm run format:check
```

### Admin

```bash
npm run admin:install
npm run admin:dev
npm run admin:build
```

---

## Current product shape

CityTalk is not trying to be a giant travel platform yet.

Right now it is best thought of as:
- a curated mobile discovery experience
- backed by Supabase
- with a simple founder admin tool
- optimized for iteration speed and demo quality

That constraint is intentional.

---

## Troubleshooting

### The app says Supabase env vars are missing
Check that your root `.env` exists and contains:

```bash
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

Then restart Expo.

### The admin panel cannot sign in
Check:
- `admin-web/.env` exists
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are valid
- your email is included in `VITE_ADMIN_EMAILS`
- Supabase email auth is enabled

### The app loads but no places appear
Check:
- the `places` table has rows
- the read policy allows access
- required fields exist
- your env vars point to the correct Supabase project

### Saving or posting reviews fails
Usually this means one of these:
- you are not signed in
- RLS policies are blocking writes
- related tables or columns are missing

### Admin CRUD fails
The frontend allowlist is not enough by itself.
You still need the correct Supabase permissions / RLS policies for create, update, and delete.

---

## Suggested next steps

If you keep building CityTalk, the next useful improvements are probably:

- image fallback / placeholder handling
- pull-to-refresh on key screens
- better admin validation
- Supabase migration files / schema docs
- production deployment for the admin panel
- EAS build setup for mobile releases

---

## License

Add your preferred license here.

If this is a private founder project, keeping it private for now is perfectly reasonable.
