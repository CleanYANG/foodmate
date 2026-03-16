# CityTalk MVP QA Checklist

Use this as a manual test checklist before demos, founder updates, or shipping a new build.

Test on at least one real device when possible.

---

## Test setup

Before starting:

- [ ] App installs / opens successfully
- [ ] Environment variables are configured correctly
- [ ] Supabase is reachable
- [ ] There are test places in the database
- [ ] At least one test account is available for sign-in
- [ ] At least one place has tags
- [ ] At least one place has no reviews yet
- [ ] At least one place is already saved for the signed-in test user (optional but useful)

---

## 1. Navigation

### App launch
- [ ] App opens without crashing
- [ ] Initial screen loads correctly
- [ ] Header title matches the current screen
- [ ] Navigation between screens feels responsive

### Screen-to-screen navigation
- [ ] Home → Place Detail works
- [ ] Home → Saved Places works
- [ ] Saved Places → Place Detail works
- [ ] Profile / Sign In navigation works
- [ ] Back navigation works from Place Detail
- [ ] Back navigation works from Sign In
- [ ] Back navigation works from Saved Places

---

## 2. Swipe behavior

### Discovery card interactions
- [ ] Current place card is visible and readable
- [ ] Swipe left skips the current place
- [ ] Swipe right advances the card
- [ ] Swipe gesture feels smooth
- [ ] Card returns to center if swipe is too small
- [ ] Swipe feedback label appears while dragging
- [ ] Deck progress updates as cards are reviewed

### End-of-deck behavior
- [ ] Reaching the end of the deck shows the completion state
- [ ] Restart deck button resets progress correctly
- [ ] Saved places button works from the deck-complete state

---

## 3. Save flow

### Save from Home
- [ ] Swiping right attempts to save the place
- [ ] Save success feedback appears
- [ ] Saved indicator appears when appropriate
- [ ] Save failure shows an error state if something goes wrong

### Save from Place Detail
- [ ] "Save this place" works for a signed-in user
- [ ] Success feedback appears after saving
- [ ] Button changes appropriately after saving
- [ ] "Remove from saved" works for a signed-in user
- [ ] Success feedback appears after removing

### Saved Places screen
- [ ] Saved places list loads correctly for signed-in user
- [ ] Removed place disappears from Saved Places after removal
- [ ] Empty saved state appears correctly when nothing is saved

---

## 4. Login flow

### Sign-in entry
- [ ] User can navigate to Sign In screen
- [ ] Email input accepts a valid email address
- [ ] Invalid / empty email handling works as expected

### Magic link flow
- [ ] Magic link can be requested successfully
- [ ] User can complete sign-in with magic link
- [ ] App returns to authenticated state after sign-in
- [ ] Signed-in state is reflected in the UI

### Auth-dependent behavior
- [ ] Guest user can browse places without signing in
- [ ] Guest user is prompted to sign in when trying to save
- [ ] Guest user is prompted to sign in when trying to submit a review
- [ ] Saved Places screen explains sign-in requirement for guests

---

## 5. Place details

### Basic content
- [ ] Opening a place detail screen works from Home
- [ ] Place image loads
- [ ] Place name displays correctly
- [ ] Place short review displays correctly
- [ ] Tags display correctly
- [ ] Full description displays correctly
- [ ] Address displays correctly

### Maps handoff
- [ ] "Open in maps" button is visible
- [ ] Tapping "Open in maps" opens the maps destination correctly
- [ ] If maps opening fails, an error message is shown

### Error / retry behavior
- [ ] Loading skeleton appears before content loads
- [ ] Retry button appears if place details fail to load
- [ ] Retry successfully reloads the place when the issue is resolved

---

## 6. Review submission

### Review composer
- [ ] Review input is visible on Place Detail
- [ ] Placeholder text changes appropriately for guest vs signed-in user
- [ ] Empty review cannot be submitted
- [ ] Review button disables while submitting

### Signed-in review flow
- [ ] Signed-in user can submit a review
- [ ] Review success feedback appears
- [ ] New review appears in the review list
- [ ] Review count updates correctly

### Guest review flow
- [ ] Guest attempting to post a review is redirected or prompted to sign in

### Review loading / error states
- [ ] Review loading state appears while fetching reviews
- [ ] Empty reviews state appears when there are no reviews
- [ ] Error state appears if reviews fail to load
- [ ] Retry reviews button works after a review load failure

---

## 7. Tag filtering

### Tag chip display
- [ ] Tag chips display on Home cards
- [ ] Tag chips display on Place Detail
- [ ] Tag chips display on Saved Places cards
- [ ] Tags appear visually consistent across screens

### Filter behavior
- [ ] Tag chips appear on the Home screen filter row
- [ ] Selecting a tag filters the place feed
- [ ] "All" resets the filter correctly
- [ ] Filtered deck progress updates correctly
- [ ] End-of-deck state works correctly when a tag filter is active
- [ ] Empty filtered state appears when no places match a selected tag

---

## 8. Loading and error handling

### Home screen
- [ ] Home loading skeleton appears before places load
- [ ] Home error state appears if place feed fails to load
- [ ] Home retry button works
- [ ] Home empty state appears if no places exist

### Place Detail
- [ ] Place Detail loading skeleton appears
- [ ] Place Detail error state appears if load fails
- [ ] Place Detail retry button works

### Saved Places
- [ ] Saved Places loading state appears
- [ ] Saved Places empty state appears correctly
- [ ] Saved Places error state appears if load fails
- [ ] Saved Places retry button works

### Inline feedback
- [ ] Success notices are visible and understandable
- [ ] Error notices are visible and understandable
- [ ] Notices disappear appropriately after a short time

---

## 9. Onboarding

### First-run behavior
- [ ] Onboarding appears on first launch on a fresh device / fresh local storage
- [ ] Onboarding shows all expected screens
- [ ] Onboarding content explains:
  - [ ] swipe left
  - [ ] swipe right
  - [ ] save
  - [ ] open maps
- [ ] Next button advances correctly
- [ ] Back button works where expected
- [ ] Skip button exits onboarding
- [ ] Final CTA exits onboarding

### Persistence
- [ ] Onboarding completion is stored locally
- [ ] Onboarding does not show again after completion
- [ ] App lands on Home after onboarding is completed

---

## 10. Visual / demo quality sanity check

- [ ] Spacing feels consistent across screens
- [ ] Typography hierarchy feels clear and polished
- [ ] Card shadows and depth feel consistent
- [ ] Images look clean and correctly cropped
- [ ] Buttons feel responsive
- [ ] Screen transitions feel smooth
- [ ] App feels premium but still simple

---

## 11. Final MVP sign-off

Before demo / release:

- [ ] Core happy path works end-to-end for guest user
- [ ] Core happy path works end-to-end for signed-in user
- [ ] No obvious visual breakage on major screens
- [ ] No blocker bug in save flow
- [ ] No blocker bug in sign-in flow
- [ ] No blocker bug in place detail flow
- [ ] No blocker bug in onboarding flow
- [ ] Ready for demo / founder review
