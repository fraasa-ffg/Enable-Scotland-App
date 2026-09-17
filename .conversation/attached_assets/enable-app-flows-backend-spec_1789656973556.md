# Enable Scotland App: User Flows and Backend Specification

Offline-first Expo (React Native) implementation guide for the Enable Scotland journey-support app, covering user flows, local data, services, permissions and testing.

Last updated: 17 September 2026

Companion document: `enable-app-design-frontend-spec.md` covers visual design, components, screens and accessibility.

## 1. Scope

This document defines how the app behaves: the user flows, the local data model, the service layer, permissions, storage, error handling and tests for the iOS and Android app.

The app is offline-first. Journeys, steps, step media, the checklist, emergency contacts and settings all work with no internet connection. There is no server, no user account and no registration.

This specification is self-contained. Build from what is written here, not from any earlier prototype.

## 2. Technical Stack

| Area | Choice |
| --- | --- |
| Framework | Expo SDK 54, React Native, TypeScript |
| Routing | `expo-router` |
| Relational data | `expo-sqlite` (optionally with Drizzle ORM for typed queries and migrations) |
| Secure data | `expo-secure-store` for emergency contacts |
| Media files | `expo-file-system`, stored under the app's document directory |
| Photo and video capture and picking | `expo-image-picker` |
| Image resizing and thumbnails | `expo-image-manipulator` |
| Video poster frames | `expo-video-thumbnails` |
| Voice recording and playback | `expo-audio` (replaces `expo-av`, which is deprecated) |
| Video playback | `expo-video` |
| Location for SOS | `expo-location` |
| SOS text message | `expo-sms` |
| Device contacts | `expo-contacts` |
| Calls and website | `expo-linking` / `Linking` |
| Unit and integration tests | Jest (`jest-expo`) and React Native Testing Library |
| E2E tests (optional, outside Replit) | Maestro |

Every library above runs in Expo Go, so the app can be tested on a real phone from Replit by scanning the QR code.

Out of scope, so do not add: text-to-speech libraries (`expo-speech`, `react-native-tts`), analytics, crash reporting that sends data off the device, user accounts, cloud sync, and **editing a saved journey** (its name, photo and steps can't be changed after saving; users delete it and create a new one instead).

## 3. Data Entities

All IDs are local UUIDs. All timestamps are ISO 8601 strings in local storage.

There is **no** `UserProfile` entity. The app does not store a user name.

### 3.1 Journey

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | |
| `title` | string | yes | 1–60 characters, trimmed |
| `imageUri` | string | no | App-storage file URI. Empty means use the themed placeholder |
| `status` | enum | yes | `saved`, `active` or `completed` |
| `startCount` | number | yes | Defaults to 0. Increased each time the journey is started (F3) |
| `lastStartedAt` | ISO datetime | no | Set on each start |
| `startedAt` | ISO datetime | no | Start time of the current or most recent run |
| `completedAt` | ISO datetime | no | Set by Complete Journey |
| `createdAt` | ISO datetime | yes | |
| `updatedAt` | ISO datetime | yes | |

Journeys have no transport type and no dates.

At most one journey can have `status = active`. Enforce this in `JourneyRepository` inside a transaction.

### 3.2 JourneyStep

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | |
| `journeyId` | string | yes | Foreign key, cascade delete |
| `order` | number | yes | 0-based display order |
| `title` | string | yes | 1–200 characters, trimmed |
| `isDone` | boolean | yes | Defaults to false |
| `doneAt` | ISO datetime | no | |
| `createdAt` | ISO datetime | yes | |
| `updatedAt` | ISO datetime | yes | |

The **current step** is derived, not stored: it is the step with the lowest `order` where `isDone = false`. If every step is done, there is no current step.

### 3.3 StepMedia

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | |
| `stepId` | string | yes | Foreign key, cascade delete (and delete the files) |
| `type` | enum | yes | `photo`, `video`, `voice` or `note` |
| `slot` | enum | yes | `visual` (photo or video), `voice` or `note`. Derived from `type` |
| `uri` | string | photo, video, voice | App-storage file URI |
| `thumbnailUri` | string | photo, video | Generated thumbnail or poster frame |
| `noteText` | string | note | 1–500 characters |
| `durationMs` | number | video, voice | |
| `widthPx` / `heightPx` | number | photo, video | After resizing |
| `fileSizeBytes` | number | photo, video, voice | |
| `createdAt` | ISO datetime | yes | |

Media always belongs to one step, never to the journey as a whole.

**One item per slot per step.** A step holds at most one photo or video, one voice note and one note. Enforce this with a unique index on (`stepId`, `slot`) and a check in `StepMediaRepository.add`, which rejects a second item in a used slot.

### 3.4 ChecklistItem

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | |
| `label` | string | yes | 1–60 characters |
| `order` | number | yes | |
| `createdAt` | ISO datetime | yes | |
| `updatedAt` | ISO datetime | yes | |

Removing an item hard-deletes it. Old journey starts keep their own copy of the label (see 3.5).

Items added on first launch:

- Keys
- Ticket or travel card
- Phone charged
- Umbrella or coat
- Support contact card

### 3.5 JourneyChecklistState

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | |
| `journeyId` | string | yes | |
| `runStartedAt` | ISO datetime | yes | Groups the rows for one journey start |
| `checklistItemId` | string | no | Source item. Can become null if the item is later deleted |
| `labelSnapshot` | string | yes | Copy of the label at start time |
| `isChecked` | boolean | yes | |
| `checkedAt` | ISO datetime | no | |

### 3.6 EmergencyContact

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | |
| `name` | string | yes | 1–60 characters |
| `phone` | string | yes | Stored as entered, with spaces removed. Must contain 7–15 digits, optionally starting with `+` |
| `relationship` | string | no | Optional. Left empty when imported from phone contacts |
| `source` | enum | yes | `manual` or `deviceContacts` |
| `createdAt` | ISO datetime | yes | |
| `updatedAt` | ISO datetime | yes | |

- **Maximum of 3 contacts.** `EmergencyContactRepository.add` rejects a fourth.
- Store the contact list as one JSON value in `expo-secure-store` under the key `emergencyContacts`. Three contacts sit well under the store's size limit.

### 3.7 AppSettings

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `themeKey` | enum | yes | `enable`, `blue`, `teal` or `contrast`. Defaults to `enable` |
| `updatedAt` | ISO datetime | yes | |

There are no settings for text-to-speech, onboarding, offline mode, language or text size.

### 3.8 Types

```ts
type ThemeKey = "enable" | "blue" | "teal" | "contrast";
type JourneyStatus = "saved" | "active" | "completed";
type StepMediaType = "photo" | "video" | "voice" | "note";
type ContactSource = "manual" | "deviceContacts";

type AppSettings = {
  themeKey: ThemeKey;
  updatedAt: string;
};
```

## 4. User Flows

### F1. First Launch

1. The app opens straight to Home. There is no registration, name prompt or onboarding.
2. On the very first launch, run database migrations, add the default checklist items, and create `AppSettings` with the `enable` theme.
3. Home shows its empty states.

### F2. Home

Home loads:

- `JourneyRepository.getActive()`
- `JourneyRepository.getFrequent({ limit: 3, excludeActive: true })`

**Frequent journeys ranking:**

1. `startCount` from highest to lowest.
2. Then `lastStartedAt`, most recent first (never-started journeys go last).
3. Then `createdAt`, newest first.

This means brand-new journeys still appear before the user has started anything.

Home data refreshes whenever the screen comes into focus.

### F3. Start a Journey (Not in Progress)

Trigger: the user taps a journey whose status is `saved` or `completed`, on Home or Journeys.

1. **If a different journey is already active**, show a dialog:
   - Title: “You have a journey in progress”
   - Body: “[Active journey title] is still in progress.”
   - Buttons:
     - “Continue [active title]”, which opens that journey (F4).
     - “Start new journey”, which sets the old journey to `saved` without resetting its steps, then continues this flow.
     - “Cancel”.
2. Load the checklist items in order.
3. Create `JourneyChecklistState` rows for this run, with `isChecked = false` and `labelSnapshot` copied from each item.
4. Show the Pre-Journey Checklist. Ticking and unticking updates the rows. Ticking every item is **not** required to start.
5. If the checklist has no items, skip the checklist screen and go straight to step 6.
6. On **Start Journey**, in a single transaction:
   - If the journey was `completed`, reset every step to `isDone = false` and clear `doneAt`.
   - Set `status = active`, `startedAt` and `lastStartedAt` to now, and increase `startCount` by 1.
7. Replace the checklist screen with Journey Detail, so Back returns to where the user started.

### F4. Resume an In-Progress Journey

Trigger: the user taps the active journey card on Home, or the in-progress row on Journeys.

1. Open Journey Detail directly. **Don't show the checklist.**
2. Don't change `startCount` or `lastStartedAt`.

### F5. Follow a Journey

On Journey Detail:

1. Show the steps in order. The current step is expanded and shows the media controls.
2. **Mark a step done:** set `isDone = true` and `doneAt`. The step collapses to its title only (see the design spec, section 8.5), and the next not-done step becomes current. Announce “Step [n] complete”.
3. **Mark a step not done:** set `isDone = false` and clear `doneAt`. The step expands again, and the current step is recalculated.
4. **Add media to the current step** using F7a.
5. **Remove media:** show the confirmation “Remove this [type]?” (Cancel / Remove), then delete the record and its files.

Steps can be marked in any order. The current step is always the first one not yet done.

### F6. Complete a Journey

Trigger: “Complete Journey” on Journey Detail. It is always available, even if some steps are not done.

1. If some steps are not done, confirm first: “Some steps aren't ticked yet. Complete this journey anyway?” (Cancel / Complete).
2. Set `status = completed` and set `completedAt`. Step `isDone` values are kept as they are until the next start.
3. Announce “Journey complete”.
4. Return to the screen the journey was opened from (Home or Journeys).

### F7. Create a Journey

The wizard keeps its draft in memory. Media files are written to a `drafts/` folder and moved into place when the journey is saved.

**Step 1: Name**

- Required, 1–60 characters after trimming. Next is disabled until it is valid.

**Step 2: Photo** (optional)

- “Take photo” asks for camera permission. “Choose from library” asks for photo library permission.
- Process the photo as described in F7a.
- There are no suggested or sample images.
- “Skip for now” leaves `imageUri` empty.

**Step 3: Steps**

- The wizard starts with one empty step row.
- “Add another step” adds a row at the end.
- Each row can hold media (F7a).
- **Swipe-to-delete a step row:**
  - If the row has no title and no media, delete it immediately and announce “Step removed”.
  - Otherwise confirm: “Delete this step?” (Cancel / Delete). Deleting also removes that step's draft media files.
  - After a delete, renumber the remaining steps.
  - The last remaining row can be deleted too, but then Save is disabled.
- **Validation:** Save is disabled until **at least one step has a title**. Rows with no title are dropped when saving. Any media on a dropped row is discarded, after a confirmation: “Some steps have no title and will not be saved.” (Go back / Save anyway).

**Save**, in one transaction:

1. Create the Journey (`status = saved`, `startCount = 0`).
2. Create the JourneyStep rows in order.
3. Move draft media files into `media/{journeyId}/{stepId}/` and create the StepMedia rows.
4. On success, open the new journey in Journey Detail (not started) and announce “Journey saved”.
5. On failure, roll back, keep the draft, and show “We couldn't save your journey. Please try again.”

Leaving the wizard with unsaved content shows: “Leave without saving?” (Keep editing / Leave). Leaving deletes the draft files.

### F7a. Add Media to a Step

Limits (defaults; can be adjusted before build):

| Type | Limit | Processing |
| --- | --- | --- |
| Photo | Up to 10 MB input | Resize so the longest edge is 1600 px, save as JPEG at 0.8 quality, make a 300 px thumbnail |
| Video | **Up to 10 seconds** | Record with `videoMaxDuration: 10` and 720p quality. Library videos longer than 10 s are rejected: “Please choose a video that's 10 seconds or shorter.” Make a poster frame thumbnail |
| Voice | **Up to 1 minute** | Record as AAC (`.m4a`). Stop automatically at 1:00 |
| Note | Up to 500 characters | Stored as text in the database |
| Per step | **At most 1 photo or video, 1 voice note and 1 note** | A used slot's controls are hidden. To change an item, remove it first, then add a new one |

Steps for each type:

- **Photo:** choose camera or library, ask for the permission needed, pick, check the size, resize, copy into app storage, make the thumbnail, create StepMedia.
- **Video:** choose camera or library, ask for camera and microphone permission (or photo library permission), pick, check the duration, copy into app storage, make the poster frame, create StepMedia.
- **Voice:** ask for microphone permission, record with a countdown, let the user stop, preview, then save or discard, and create StepMedia with `durationMs`.
- **Note:** open a text input sheet, check the text, create StepMedia.

### F8. Search Journeys

1. The Journeys screen lists every journey. The active journey is pinned first, then the rest by `updatedAt`, newest first.
2. Typing in the search field filters by title: case-insensitive, accent-insensitive, and matching anywhere in the title. Update results 200 ms after the user stops typing.
3. Search runs locally, either in SQLite with `LIKE` on a normalised title column, or in memory.
4. Clearing the search restores the full list.
5. No results shows the empty-result state.

### F8a. Delete a Journey

This follows the same swipe-to-delete pattern as wizard steps (F7). A saved journey always has content, so a confirmation is always shown.

1. On the Journeys screen, swipe left on a journey row, or use the “Delete” accessibility action.
2. Tap Delete to open the confirmation modal (design spec, section 8.4). If the journey is in progress, the modal says so.
3. **Cancel** closes the swipe and changes nothing.
4. **Delete**, in one transaction:
   - Delete the Journey, its JourneyStep rows, their StepMedia rows and its JourneyChecklistState rows.
   - After the transaction commits, delete the `media/{journeyId}/` folder and the journey image file. If file deletion fails, log it locally and retry on next launch. Don't show an error.
5. If the deleted journey was active, there is now no active journey. Home shows its empty state.
6. Remove the row, announce “[title] deleted”, and refresh Home's data on its next focus.
7. If the database delete fails, keep the row and show “We couldn't delete that journey. Please try again.”

### F9. Edit Checklist

- Edit a label: save when the field loses focus or after 500 ms of no typing. An empty label isn't saved; the previous label is restored.
- Add item: append a new item with an empty input and focus it. If it is left empty, remove it.
- Remove item: delete immediately and announce “[label] removed”.
- Reordering items is a future enhancement.
- Changes apply to the next journey start and never change past `JourneyChecklistState` rows.

### F10. Send SOS

Trigger: the user taps the SOS button on the SOS screen.

1. **If there are no emergency contacts**, open Add Contact with the message “Add an emergency contact first so SOS can reach someone.” Stop here.
2. **If SMS isn't available** (`SMS.isAvailableAsync()` is false, for example on a tablet), show the contacts' numbers with Call buttons and the message “This device can't send text messages. Call one of your contacts instead.” Stop here.
3. Show the confirmation modal (design spec, section 8.8). If the user cancels, stop.
4. **Get the location:**
   - Request foreground location permission if it hasn't been decided yet.
   - If granted, call `getCurrentPositionAsync` with balanced accuracy and a 5-second timeout. If that fails, use `getLastKnownPositionAsync`.
   - If permission is denied or no position is found, carry on without a location.
5. **Build the message:**
   - With a location:
     `I need help. This is an SOS from my Enable Scotland app. My location: <maps link>`
   - Without a location:
     `I need help. This is an SOS from my Enable Scotland app. I couldn't share my location.`
   - Maps link:
     - iOS: `https://maps.apple.com/?ll={lat},{lng}&q=My%20location`
     - Android: `https://www.google.com/maps/search/?api=1&query={lat},{lng}`
   - Use 6 decimal places.
6. Call `SMS.sendSMSAsync([phone1, phone2, phone3], message)` with all contacts (up to 3). This opens the phone's default Messages app with the recipients and message filled in. The user presses Send in the Messages app.
7. The app doesn't store or send the location anywhere else.
8. If Messages fails to open, show “We couldn't open your messages app.” with Call buttons for each contact.

The SOS button still works fully offline. Sending the text depends on mobile signal, not internet. A GPS fix doesn't need internet, but can be slower without it.

### F11. Add an Emergency Contact

1. If there are already 3 contacts, the Add button is disabled (design spec, section 8.8). The repository also rejects a fourth.
2. **Choose from phone contacts** (optional):
   - Request Contacts permission only at this moment.
   - Open the native contact picker (`Contacts.presentContactPickerAsync`).
   - Fill in **Name** from the contact's display name and **Phone number** from its phone number. If the contact has several numbers, ask the user to choose one (mobile numbers first). Leave **Relationship empty**. Set `source = deviceContacts`.
   - If the contact has no phone number, show “This contact has no phone number. Please choose another or type one in.”
   - If permission is denied, show “You can still type the contact's details below.” Manual entry keeps working.
3. **Manual entry:** Name (required), Phone number (required, valid format), Relationship (optional). Set `source = manual`.
4. If the phone number already belongs to a saved contact, show “This number is already an emergency contact.”
5. Save to secure storage, return to the SOS screen, and announce “[Name] added”.

### F12. Delete an Emergency Contact

1. Swipe left on the card, or use the “Delete” accessibility action.
2. Tap Delete to open the confirmation modal.
3. Confirming removes the contact from secure storage and announces “[Name] deleted”. Cancelling closes the swipe.

### F13. Call or Message a Contact

- **Call:** `Linking.openURL('tel:' + phone)`.
- **Message:** `SMS.sendSMSAsync([phone], '')`, or `Linking.openURL('sms:' + phone)` as a fallback.
- If neither works, show the number with “Copy number” (using `expo-clipboard`).

### F14. Help

- The FAQ is bundled static content and works offline.
- “Visit Enable Scotland website” opens `https://www.enable.org.uk` in the device browser.
- If it fails to open, show “We couldn't open the website. Please check your internet connection and try again.”

### F15. Change Theme

- Selecting a theme saves `themeKey` straight away and re-themes the app without a restart.

## 5. Permissions

Always request a permission at the moment it is needed, never at launch.

| Permission | Trigger | If denied |
| --- | --- | --- |
| Contacts | “Choose from phone contacts” | Manual entry |
| Camera | Take photo, or record video | Choose from library, or skip |
| Photo library | Choose from library | Use camera, or skip |
| Microphone | Add Voice, or record video | Add a photo or note instead. Videos can't be recorded with the camera |
| **Location (when in use)** | Confirming SOS | Send SOS without a location link |
| SMS / phone links | SOS, Message, Call | Show numbers with Call and Copy options |

Once a permission has been permanently denied, show a short explanation and an “Open settings” button (`Linking.openSettings()`).

Permission text for `app.json`:

| Key | Text |
| --- | --- |
| `NSCameraUsageDescription` | “Take photos and videos to help you remember journey steps.” |
| `NSPhotoLibraryUsageDescription` | “Choose photos and videos for your journeys.” |
| `NSMicrophoneUsageDescription` | “Record voice notes and video sound for journey steps.” |
| `NSContactsUsageDescription` | “Choose an emergency contact from your phone.” |
| `NSLocationWhenInUseUsageDescription` | “Add your location to an SOS message so your contacts can find you.” |

Android permissions: `CAMERA`, `RECORD_AUDIO`, `READ_CONTACTS`, `ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION`, `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`.

Background location isn't used.

## 6. Offline Behaviour

Everything works offline except opening the website. That includes:

- Home, Journeys and search.
- Starting, resuming, following and completing journeys.
- Using and editing the checklist.
- Creating journeys and adding photo, video, voice and note media.
- Playing back stored media.
- Viewing, adding and deleting emergency contacts.
- Calling, messaging and SOS (these need mobile signal but not internet).
- Changing the theme.
- Reading the FAQ.
- Screen reader use (handled by the phone).

## 7. Security and Privacy

- All data stays on the device. Nothing is sent to a server.
- There is no account, no name and no analytics.
- Emergency contacts are stored in `expo-secure-store` (Keychain on iOS, Keystore-backed on Android).
- Media is kept inside the app's document directory and never saved to the phone's gallery.
- The SOS location is used only to build the message and isn't stored.
- Deleting a journey, step, media item or contact also deletes its files.
- The Help FAQ explains that data stays on the phone and is lost if the app is uninstalled.

## 8. Service Layer

Screens never access storage directly. They go through repositories and services.

| Module | Responsibility |
| --- | --- |
| `db` | SQLite connection, migrations, first-launch setup |
| `JourneyRepository` | `getActive`, `getFrequent`, `list`, `search`, `create`, `start`, `complete`, `setSaved`, `delete` (cascades to steps, media and checklist runs) |
| `JourneyStepRepository` | `listByJourney`, `setDone`, `getCurrentStep` |
| `StepMediaRepository` | `listByStep`, `add` (enforces one item per slot), `remove` |
| `ChecklistRepository` | `list`, `add`, `updateLabel`, `remove`, `createRunState`, `setChecked` |
| `EmergencyContactRepository` | `list`, `add` (enforces the maximum of 3), `remove` |
| `SettingsRepository` | `get`, `setTheme` |
| `MediaStorageService` | Copy, move, delete and resize files; thumbnails; draft cleanup |
| `AudioRecordingService` | Record, stop, enforce the 1-minute limit |
| `VideoService` | Duration check, poster frames |
| `PermissionsService` | Request and check permissions, open settings |
| `ContactImportService` | Contact picker and number selection |
| `LocationService` | Get the current or last-known position with a timeout |
| `SosService` | Check availability, build the message and maps link, send the SMS |

When the app starts, `MediaStorageService` deletes any files left in `drafts/` from an interrupted wizard, and retries any journey media folders whose deletion failed.

## 9. Error and Empty States

All messages use plain, supportive language with no technical wording.

| State | Message |
| --- | --- |
| No active journey | “No journey in progress. Choose a journey below to get started.” |
| No journeys | “You haven't made any journeys yet.” |
| No search results | “No journeys match ‘[query]’.” |
| No emergency contacts | “Add at least one emergency contact so SOS can reach someone.” |
| Contact limit reached | “You can have up to 3 emergency contacts. Delete one to add another.” |
| Contacts permission denied | “You can still type the contact's details below.” |
| Camera or photo library denied | “To add photos, allow access in Settings.” and an Open settings button |
| Microphone denied | “To record voice notes, allow microphone access in Settings.” |
| Location denied or unavailable | SOS is still sent, with the no-location message |
| SMS unavailable | “This device can't send text messages. Call one of your contacts instead.” |
| Video too long | “Please choose a video that's 10 seconds or shorter.” |
| Photo too large | “This photo is too large. Please choose another.” |
| Media file missing | Show a placeholder with “This file is no longer available.” and a Remove option |
| Recording failed | “Recording didn't work. Please try again.” |
| Storage write failed | “We couldn't save that. Please try again.” |
| Storage full | “Your phone is running out of space. Free up some space and try again.” |
| Website can't open | “We couldn't open the website. Please check your internet connection and try again.” |

## 10. Testing

### 10.1 Unit Tests (Jest)

- Journey creation fails with no step titles, and succeeds with one.
- Frequent journeys ranking, including ties and never-started journeys.
- Only one journey can be active at a time.
- Starting a journey increases `startCount` and resets the steps of a completed journey.
- Resuming doesn't change `startCount`.
- The current step is the lowest-order step not done.
- Completing a journey sets the status and `completedAt`.
- Checklist add, edit and remove, plus label snapshots at start.
- Search is case- and accent-insensitive.
- Media limit checks: photo size, 10 s video, 1 min voice.
- One item per slot: a second photo or video, voice note or note on the same step is rejected, and adding a video when a photo exists is rejected.
- Deleting a journey removes its steps, media rows, checklist runs and media files, and clears the active journey if it was active.
- Emergency contacts: add, the maximum of 3, duplicate numbers, and delete.
- Phone number validation.
- The SOS message is built correctly with and without a location, and with the iOS and Android maps link formats.
- Theme setting persists.

### 10.2 Integration Tests (React Native Testing Library, with native modules mocked)

- Create a journey with a name, photo, steps and step media. Swipe-delete a step. Save stays disabled with no steps.
- Swipe-delete a journey on the Journeys screen with Cancel, then with Delete. Delete the in-progress journey and check Home shows its empty state.
- Media controls hide once a step has a photo or video, a voice note and a note.
- Start a journey through the checklist, then resume it without the checklist.
- Mark a step done, check it collapses, then unmark it and check it expands.
- Add a photo, video, voice note and note to the current step.
- Complete a journey with and without unticked steps.
- Add a contact from phone contacts with the relationship left empty; add one manually; get blocked at the fourth.
- Delete a contact using the accessibility action.
- SOS with zero contacts, with location denied, and the full happy path (mocked `expo-sms`).

### 10.3 End-to-End Tests (Maestro, run on a local device or simulator)

- Home to journey start to Complete Journey.
- Home to resume an in-progress journey.
- Create journey flow.
- Journeys search.
- Delete a journey.
- Edit checklist.
- SOS confirmation opens Messages.
- Theme change.

## 11. Production Acceptance Criteria

- Installs and runs on the minimum OS versions supported by Expo SDK 54: iOS 15.1+ and Android 7.0+ (API 24+).
- Opens and works with no internet connection.
- No registration, and no user name is stored anywhere.
- Home shows the active journey, up to three frequent journeys ranked by starts, and the two action tiles.
- In-progress journeys open without the checklist; other journeys show the checklist first.
- Journeys can't be saved without at least one titled step. Steps can be swipe-deleted in the wizard.
- The wizard order is name, photo, steps, with no suggested images, dates or transport type.
- Each step holds at most one photo or video (10 s max), one voice note (1 min max) and one note.
- Saved journeys have no edit option.
- Journeys can be deleted from the Journeys screen by swipe plus confirmation, or through the accessibility action, and their media files are removed.
- Completed steps collapse to their title.
- Journeys can be searched by title.
- The checklist is editable, and editing it never changes past runs.
- There are at most 3 emergency contacts. Importing from the phone fills in name and number and leaves relationship empty.
- SOS confirms first, then opens the default Messages app with all contacts and a help message that includes an Apple Maps or Google Maps link when location is available.
- Contacts can be called and messaged, and deleted by swipe plus confirmation or through the accessibility action.
- Help contains only the FAQ and the website link.
- Settings contains only the colour theme.
- There is no in-app text-to-speech; the app works fully with VoiceOver and TalkBack.
- All data persists after a restart and stays on the device.

## 12. Decisions

### 12.1 Confirmed

1. **Starting while another journey is active:** the old journey goes back to `saved` and keeps its step progress (F3).
2. **Journey photo is optional,** with a themed placeholder when skipped (F7).
3. **Media limits:** photos resized to 1600 px, video up to 10 s, voice notes up to 1 minute. Each step holds one photo or video, one voice note and one note (F7a).
4. **Saved journeys can't be edited.** Deleting is covered by F8a.
5. **Website URL:** `https://www.enable.org.uk` (F14).

### 12.2 Still Open

1. **Minimum OS versions.** The spec currently uses Expo SDK 54's own minimums (iOS 15.1, Android 7.0), which cost nothing extra to support. Raise them only if the team wants to limit device testing.
2. **FAQ answers.** The topics are listed in the design spec, section 8.11, but the answer text still needs writing.
3. **Logo asset.** The header needs the Enable Scotland logo file.
