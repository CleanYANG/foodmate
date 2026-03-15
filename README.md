# CityTalk

A clean, beginner-friendly Expo + React Native starter for the CityTalk MVP.

## Stack

- Expo
- React Native
- TypeScript
- React Navigation

## Included

- Simple stack navigation
- Minimal theme tokens
- Placeholder screens
- ESLint + Prettier setup
- Clean starter folder structure

## Screens

- Home
- Place Detail
- Saved Places
- Profile

## Commands

```bash
npm install
npm run start
npm run lint
npm run typecheck
npm run format
```

## Folder structure

```txt
src/
  components/
  config/
  lib/
  navigation/
  screens/
  services/
  store/
  theme/
  types/
```

## Environment variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Required variables:

```bash
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

## Supabase notes

This app:

- reads places with the public anon key so guests can browse
- uses Supabase Auth email magic links for sign-in
- creates a matching row in `public.users` for signed-in users
- stores saved places in `public.saved_places` only for authenticated users

To make auth work cleanly:

- enable **Email** sign-in in Supabase Auth
- set your email template/site URL settings so the magic link can return to the app
- keep the Expo app scheme as `citytalk`

## Notes

This project is intentionally small and easy to extend. The current data flow is organized so screens stay thin and Supabase access lives in the service layer.
