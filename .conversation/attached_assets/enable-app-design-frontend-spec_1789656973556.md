# Enable Scotland App: Design and Frontend Specification

Expo (React Native) implementation guide for the Enable Scotland journey-support app, covering visual design, components, screens and accessibility.

Last updated: 17 September 2026

Companion document: `enable-app-flows-backend-spec.md` covers user flows, data, services, permissions and testing. Flow IDs in this document (for example **F3**) refer to that file.

## 1. Product UI Intent

The app helps people who may need extra confidence while travelling. It should feel calm, direct and supportive. The interface puts clear choices, large touch targets, plain language, predictable navigation and accessibility first.

The app has five main areas, reached from a bottom tab bar:

- Home
- Journeys
- SOS
- Help
- Settings

This specification is self-contained. Build from what is written here, not from any earlier prototype.

## 2. Design Principles

- Keep core actions visible on the main screens.
- Use simple words and short labels.
- Avoid hidden functionality. Swipe-to-delete is the only gesture-based action, and it always has an accessible alternative (see section 6).
- Support one-handed use with large controls and generous spacing.
- Make emergency actions visually distinct and instantly recognisable.
- Design every state to work offline.
- Meet WCAG 2.2 AA contrast in every theme (see section 3.6).
- Rely on the phone's own screen reader (VoiceOver on iOS, TalkBack on Android) for reading content aloud. The app has no built-in text-to-speech.

## 3. Theme Tokens

The app supports four colour themes. **Enable Standard** is the default. Every component must read colours from the active theme and never hard-code hex values.

### 3.1 Shared Neutral and Status Tokens (all themes except High Contrast)

| Token | Value | Usage |
| --- | --- | --- |
| `background` | `#FFFFFF` | Screen background |
| `surface` | `#FFFFFF` | Cards, rows, modals |
| `text` | `#1A1A1A` | Primary text |
| `textMuted` | `#5C5C66` | Helper text, step counts, hints |
| `border` | `#8A8A96` | Input borders, dividers that carry meaning (3:1 minimum) |
| `divider` | `#E4E4EA` | Decorative separators only |
| `onPrimary` | `#FFFFFF` | Text and icons on `primary` |
| `danger` | `#B3261E` | SOS button, SOS tab, destructive actions (Delete) |
| `onDanger` | `#FFFFFF` | Text and icons on `danger` |
| `success` | `#1E7A3C` | Completed-step tick |

### 3.2 Enable Standard (default)

| Token | Value | Usage |
| --- | --- | --- |
| `primary` | `#4C16B3` | Primary buttons, selected states, active journey surfaces |
| `primaryLight` | `#F1EEFF` | Soft backgrounds and secondary surfaces |
| `primaryDark` | `#28066A` | Strong headings |
| `accent` | `#CC007A` | Status badges, progress fill, highlights |
| `onAccent` | `#FFFFFF` | Text on `accent` |
| `accentLight` | `#FCE7F4` | Soft accent backgrounds, progress track |
| `support` | `#1B6B7B` | Supporting information (darkened from `#227E91` to pass AA on `supportLight`) |
| `supportLight` | `#E7F6F8` | Supporting surface background |
| `nav` | `#28066A` | Bottom tab bar background |
| `navText` | `#FFFFFF` | Tab bar text and icons |

### 3.3 Ocean Blue

| Token | Value | Notes |
| --- | --- | --- |
| `primary` | `#1565C0` | |
| `primaryLight` | `#E3F0FF` | |
| `primaryDark` | `#0D47A1` | |
| `accent` | `#B45309` | Changed from `#FF8F00`, which scored 2.3:1 with white text and 2.3:1 as a progress fill on white |
| `onAccent` | `#FFFFFF` | |
| `accentLight` | `#FFF8E1` | |
| `support` | `#005F8A` | |
| `supportLight` | `#E8F5FB` | |
| `nav` | `#1565C0` | |
| `navText` | `#FFFFFF` | |

### 3.4 Highland Teal

| Token | Value | Notes |
| --- | --- | --- |
| `primary` | `#00695C` | |
| `primaryLight` | `#E0F2F0` | |
| `primaryDark` | `#004D40` | |
| `accent` | `#BF360C` | |
| `onAccent` | `#FFFFFF` | |
| `accentLight` | `#FBE9E7` | |
| `support` | `#1F5F8B` | Changed so it is distinct from `primary` (previously identical) |
| `supportLight` | `#E3EEF6` | Changed to pair with the new `support` |
| `nav` | `#00695C` | |
| `navText` | `#FFFFFF` | |

### 3.5 High Contrast

This theme overrides the shared tokens too.

| Token | Value | Notes |
| --- | --- | --- |
| `background` | `#FFFFFF` | |
| `surface` | `#FFFFFF` | Cards use a 2 pt `#000000` border instead of shadows |
| `text` | `#000000` | |
| `textMuted` | `#000000` | No muted text in this theme |
| `border` | `#000000` | |
| `primary` | `#000000` | |
| `onPrimary` | `#FFD600` | |
| `primaryLight` | `#F5F5F5` | |
| `primaryDark` | `#000000` | |
| `accent` | `#000000` | Yellow fails on white, so accents use black |
| `onAccent` | `#FFD600` | |
| `accentLight` | `#FFD600` | Progress track. Black fill on yellow is 14.9:1 |
| `support` | `#000000` | |
| `supportLight` | `#F5F5F5` | |
| `nav` | `#000000` | |
| `navText` | `#FFD600` | |
| `danger` | `#B3261E` | Unchanged so SOS stays recognisable |

### 3.6 Contrast Checks

All values below were measured against the tokens above. Re-run the checks whenever a token changes.

| Pair | Ratio | Requirement |
| --- | ---: | --- |
| `onPrimary` on `primary` (Enable / Ocean / Teal / HC) | 10.1 / 5.8 / 6.6 / 14.9 | 4.5 text |
| `onAccent` on `accent` (Enable / Ocean / Teal) | 5.5 / 5.0 / 5.6 | 4.5 text |
| `accent` fill on `accentLight` track (Enable / Ocean / Teal) | 4.6 / 4.7 / 4.8 | 3.0 non-text |
| `support` on `supportLight` (Enable / Ocean / Teal) | 5.5 / 6.3 / 5.8 | 4.5 text |
| `textMuted` on `background` | 6.6 | 4.5 text |
| `border` on `background` | 3.4 | 3.0 non-text |
| `onDanger` on `danger` | 6.5 | 4.5 text |

Status must never rely on colour alone. Always pair a colour with a text label or icon, for example the “In progress” badge and the tick on a completed step.

## 4. Layout Tokens

### 4.1 Spacing (4-point base)

| Token | Value | Usage |
| --- | --- | --- |
| `space-1` | 4 | Small icon gaps |
| `space-2` | 8 | Compact row gaps |
| `space-3` | 12 | Card internal spacing |
| `space-4` | 16 | Screen padding |
| `space-5` | 20 | Section spacing |
| `space-6` | 24 | Large screen groups |
| `space-8` | 32 | Major section breaks |

### 4.2 Radius

Corners should be friendly but controlled. Cards should not look like pills.

| Token | Value | Usage |
| --- | --- | --- |
| `radius-xs` | 4 | Small badges |
| `radius-sm` | 6 | Inputs, small controls |
| `radius-md` | 8 | Default buttons and cards |
| `radius-lg` | 12 | Feature cards, media thumbnails |
| `radius-xl` | 16 | Large panels, modals |
| `radius-pill` | 999 | Circular buttons, avatars |

### 4.3 Elevation

Keep shadows subtle. The High Contrast theme uses borders instead of shadows.

| Token | iOS (`shadowOpacity` / `shadowRadius` / `shadowOffset.y`) | Android `elevation` | Usage |
| --- | --- | --- | --- |
| `shadow-sm` | 0.08 / 4 / 1 | 1 | Journey rows, small cards |
| `shadow-md` | 0.12 / 8 / 3 | 3 | Active journey card |
| `shadow-lg` | 0.18 / 16 / 6 | 8 | Modals |

Shadow colour is `#000000` in every theme.

## 5. Typography

- Font: **Atkinson Hyperlegible**, loaded with `@expo-google-fonts/atkinson-hyperlegible`. This replaces the Poppins and Open Sans fonts used in the POC.
- Fallback: `System` on iOS and `sans-serif` on Android.
- Never set `allowFontScaling={false}`. Layouts must reflow at the largest OS text sizes without clipping or overlapping.
- `maxFontSizeMultiplier` may be capped at 2.0 on the tab bar labels only.

| Style | Size | Weight | Line height | Usage |
| --- | ---: | --- | ---: | --- |
| Screen title | 26 | 700 | 32 | Main screen headings |
| Section heading | 18 | 700 | 24 | “Frequent journeys”, “Emergency contacts” |
| Card title | 18 | 700 | 24 | Journey and contact names |
| Body | 16 | 400 | 24 | General text, step titles |
| Helper text | 14 | 400 | 20 | Instructions, hints, step counts |
| Button | 16 | 700 | 22 | All buttons |
| Badge | 14 | 700 | 18 | Status badges |

Nothing in the app is smaller than 14 pt. Avoid all-caps labels, which are harder to read.

## 6. Accessibility

The app relies on **VoiceOver (iOS)** and **TalkBack (Android)**. There is no in-app text-to-speech library and no text-to-speech setting.

### 6.1 General Rules

- Minimum touch target is 48 × 48 pt. Use `hitSlop` where the visible control is smaller.
- Every interactive element sets `accessibilityRole`, `accessibilityLabel`, and `accessibilityHint` where the result isn't obvious.
- Use `accessibilityState` for `selected`, `checked`, `disabled` and `expanded`.
- Tabs announce their selected state.
- Reading order follows visual order from top to bottom. Don't use absolute positioning for core content.
- Group related content into a single focusable element with `accessible={true}` on journey rows and contact cards, so each is read as one item.
- Announce important changes with `AccessibilityInfo.announceForAccessibility`, for example “Step 2 complete”, “Contact deleted” and “Journey saved”.
- Respect Reduce Motion with `AccessibilityInfo.isReduceMotionEnabled` by removing swipe and collapse animations.

### 6.2 Alternative Text

| Element | Label pattern |
| --- | --- |
| Journey image (card, row, detail) | “Photo for [journey title]” |
| Journey placeholder image | Hidden from screen readers (`accessibilityElementsHidden` / `importantForAccessibility="no"`) |
| Step photo thumbnail | “Photo for step [n]: [step title]” |
| Step video thumbnail | “Video, [x] seconds, for step [n]: [step title]”. Hint: “Double tap to play” |
| Voice note preview | “Voice note, [x] seconds, for step [n]”. Hint: “Double tap to play” |
| Note preview | “Note for step [n]: [note text]” |
| Progress bar | Role `progressbar`, label “Journey progress”, value “Step [current] of [total]” |
| Decorative icons | Hidden from screen readers |
| Contact avatar initial | Hidden. The card label already includes the name |

### 6.3 Swipe-to-Delete Alternatives

Swipe gestures don't work reliably with screen readers. Every swipeable row must also expose:

- `accessibilityActions={[{ name: 'delete', label: 'Delete' }]}` with an `onAccessibilityAction` handler that runs the same delete flow.
- A hint, for example “Swipe left or use actions menu to delete”.

This applies to emergency contact cards, journey rows on the Journeys screen, and step rows in the Create Journey wizard.

## 7. App Shell

### 7.1 Header

A compact header with the Enable Scotland logo and the screen title. There is no online/offline indicator and no user greeting.

### 7.2 Bottom Tab Bar

Five tabs: Home, Journeys, SOS, Help, Settings.

- The SOS tab is a raised circular `danger` button in the centre, with a white SOS label. It is reachable from every main screen.
- Tab labels are always visible (not icon-only).

### 7.3 Navigation

- Use **expo-router**, matching the POC: a `(tabs)` group, with stack screens for Journey Detail, Pre-Journey Checklist, Create Journey, Edit Checklist and Add Contact.
- Respect safe areas using `react-native-safe-area-context`.

## 8. Screen Specifications

### 8.1 Home (F2)

No greeting hero. Content order:

1. **Active journey card**, or an empty state.
2. **Frequent journeys**.
3. **Actions**.

Active journey card:

- Full-width card with `shadow-md`.
- Journey image at the top if one exists, otherwise a themed placeholder.
- “In progress” badge (`accent` / `onAccent`).
- Journey title (card title style).
- “Step 2 of 4” (helper text).
- Progress bar (`accent` fill on `accentLight` track, no percentage).
- Tapping opens **Journey Detail directly** without the checklist (F4).

Empty state when no journey is active: a soft `primaryLight` card saying “No journey in progress. Choose a journey below to get started.”

Frequent journeys:

- Section heading: “Frequent journeys”.
- “View all” link opens the Journeys tab.
- Up to three rows, ranked as described in F2. The active journey is excluded.
- Each row shows the image thumbnail, title, step count (“4 steps”) and a chevron.
- Tapping a row opens the Pre-Journey Checklist (F3).
- Empty state when there are no journeys: “You haven't made any journeys yet.” with a New Journey button.

Actions (two large tiles side by side):

- **New Journey** opens the Create Journey wizard (F7).
- **Checklist** opens Edit Checklist (F9).

### 8.2 Edit Checklist (F9)

- Header: “Edit journey checklist”.
- One text input per item, with a remove button (trash icon, label “Remove [item]”).
- “Add item” button below the list.
- Changes save automatically. Show an inline “Saved” confirmation that is also announced to screen readers.

### 8.3 Pre-Journey Checklist (F3)

Shown only when starting a journey that is **not** already in progress.

- Journey image and title.
- Heading: “Before you go”.
- Checklist items with large checkbox rows (role `checkbox`).
- Primary button: “Start Journey”.
- Secondary text link: “Edit checklist”.

### 8.4 Journeys (F8)

- Screen title: “My journeys”.
- **Search field** at the top. Placeholder: “Search journeys”. Includes a clear button labelled “Clear search”.
- A journey in progress is pinned to the top of the list with an “In progress” badge.
- Each row shows the image thumbnail, title, and step count or progress (“Step 2 of 4” when in progress).
- Empty search result: “No journeys match ‘[query]’.”
- Empty list: “You haven't made any journeys yet.”
- “Create New Journey” button, fixed at the bottom of the screen.
- Tapping a row opens Journey Detail if the journey is in progress (F4), otherwise the Pre-Journey Checklist (F3).
- **Swipe left on a journey row** to reveal a `danger` Delete button, then a confirmation modal (F8a). The row also exposes a “Delete” accessibility action (section 6.3). Hint text: “Swipe left to delete”.
  - Title: “Delete journey?”
  - Body: “Are you sure you want to delete [title]? Its steps, photos, videos, voice notes and notes will be deleted too.” If the journey is in progress, add: “This journey is in progress.”
  - Buttons: “Cancel” and “Delete” (`danger`).

Journey dates, transport type and “upcoming” status are not shown.

### 8.5 Journey Detail (F5, F6)

- Journey image and title.
- “In progress” badge when active.
- “Step 2 of 4” and progress bar.
- Ordered list of step cards.

Step card states:

| State | Appearance |
| --- | --- |
| **Current** (first step not done) | Expanded. `primaryLight` background with 2 pt `primary` left border. Shows step number, title, media previews and the media controls (Photo, Video, Voice, Note). |
| **Upcoming** | Expanded. Shows step number, title and media previews. No media controls. |
| **Completed** | **Collapsed to a single line**: tick icon (`success`), step title with strikethrough, and `textMuted` colour. Media previews are hidden. `accessibilityState={{ checked: true }}`. |

- Each step card has a checkbox control (label “Mark step [n] done” or “Mark step [n] not done”).
- Un-ticking a completed step expands it again.
- The collapse animation is 200 ms, and is skipped when Reduce Motion is on.
- Final primary button: “Complete Journey”.

Journey Detail does not include an SOS button, a journey-level notes section, a separate media section outside steps, a progress percentage, or an edit option (saved journeys can't be edited).

### 8.6 Create Journey Wizard (F7)

Three steps, with a step indicator (“Step 1 of 3”), Back and Next buttons.

**Step 1: Journey name**

- Text input labelled “Journey name”. Placeholder: “e.g. Trip to Edinburgh”.
- Next is disabled until the name has at least one non-space character.

**Step 2: Journey photo**

- Two buttons: “Take photo” and “Choose from library”.
- A large preview of the selected photo, with “Change photo” and “Remove photo”.
- No suggested or sample thumbnails and no horizontal image carousel.
- “Skip for now” link. The journey then uses the themed placeholder.

**Step 3: Journey steps**

- List of step rows. Each row has a step number, a title input, and media buttons (Add Photo, Add Video, Add Voice, Add Note), with previews of any added media.
- **Swipe left on a step row** to reveal a `danger` Delete button (see F7 for confirmation rules and section 6.3 for the accessible alternative).
- “Add another step” button.
- Primary button: “Save journey”. It is **disabled until at least one step has a title**. Helper text below it reads “Add at least one step to save your journey.” and is announced when the user tries to save early.

### 8.7 Media Previews and Controls

| Type | Control label | Preview |
| --- | --- | --- |
| Photo | Add Photo | 72 × 72 thumbnail, `radius-lg` |
| Video | Add Video | 72 × 72 poster frame with play icon and duration (“0:08”) |
| Voice | Add Voice | Play/pause button, duration, simple level bar |
| Note | Add Note | First two lines of the note text |

- Recording screens for voice and video show a large countdown of the time left (“0:07 left”).
- Each preview has a remove button labelled “Remove [type] from step [n]”.
- **Each step holds at most one photo or video, one voice note and one note** (up to three items). Photo and video share one slot.
- Once a slot is used, its controls are hidden and the preview takes their place. A photo or video hides both Add Photo and Add Video. To change it, the user removes the item and adds a new one.
- When all three slots are used, the controls row is hidden (limits are defined in the backend spec, F7a).

### 8.8 SOS Screen (F10)

- Large circular SOS button (at least 160 pt, `danger` colour), labelled “Send SOS to your emergency contacts”.
- Supporting text: “Tap SOS to send a text message with your location to your emergency contacts.”
- **Emergency contacts** section showing “[n] of 3” and the contact cards.
- “Add contact” button. At 3 contacts it is disabled and the helper text reads “You can have up to 3 emergency contacts. Delete one to add another.”
- Empty state: “Add at least one emergency contact so SOS can reach someone.” The SOS button stays visible; tapping it opens Add Contact (see F10).
- Guidance card (`supportLight`): “If you need help, ask a trusted adult, driver, conductor, or staff member.”

**SOS confirmation modal:**

- Title: “Send SOS?”
- Body: “This will open your messages app with a help message and your location for [names].”
- Buttons: “Cancel” and “Send SOS” (`danger`).

### 8.9 Emergency Contact Card

- Initial avatar.
- Name (card title style).
- Phone number.
- Relationship, only if one was entered (helper text).
- Hint text: “Swipe left to delete”.
- “Call” and “Message” buttons, each at least 48 pt tall.
- Swipe left reveals Delete, then a confirmation modal:
  - Title: “Delete emergency contact?”
  - Body: “Are you sure you want to delete [Name] as an emergency contact?”
  - Buttons: “Cancel” and “Delete” (`danger`).

### 8.10 Add Contact (F11)

- Header: “Add contact”.
- Button: “Choose from phone contacts”.
- Fields: Name (required), Phone number (required, `keyboardType="phone-pad"`), Relationship (optional, labelled “Relationship (optional)”).
- Choosing a phone contact fills in Name and Phone number and leaves Relationship empty. The user can edit all fields before saving.
- A preview row shows the card as it will appear.
- “Save contact” button, disabled until Name and Phone number are filled in.
- Validation messages appear inline under each field and are announced.

### 8.11 Help (F14)

Only two items:

- **FAQ** (expandable list).
- **Visit Enable Scotland website** (role `link`).

FAQ topics:

- What to do if transport is delayed.
- How to add an emergency contact.
- How SOS works.
- Using the app offline.
- Adding photos, videos and voice notes to steps.
- Changing the colour theme.
- Having text read aloud with VoiceOver or TalkBack.

### 8.12 Settings (F15)

- **Colour theme**: a selector showing four swatch cards (Enable Standard, Ocean Blue, Highland Teal, High Contrast). Each card shows its name as text, and the selected card has a tick plus `accessibilityState={{ selected: true }}`.
- Info card: “To have text read aloud, turn on VoiceOver (iPhone) or TalkBack (Android) in your phone's accessibility settings.”
- App version (helper text).

Settings has no text-to-speech toggle, offline mode toggle, language selector or text size selector.

## 9. Component Inventory

All components are reusable and read their colours, spacing and type from theme tokens.

| Component | Purpose |
| --- | --- |
| `AppHeader` | Logo and screen title |
| `BottomTabBar` | Tabs with raised SOS button |
| `ActiveJourneyCard` | In-progress journey on Home |
| `JourneyRow` | Rows on Home and Journeys (swipeable on Journeys) |
| `JourneySearchBar` | Search field with clear button |
| `ActionTile` | Home action tiles |
| `ChecklistEditor` | Edit checklist |
| `ChecklistCheckItem` | Pre-journey checkbox row |
| `JourneyStepCard` | Step in current, upcoming or completed (collapsed) state |
| `StepMediaControls` | Photo, video, voice and note buttons |
| `MediaPreview` | Photo, video, voice and note previews |
| `MediaRecorderSheet` | Voice and video recording with countdown |
| `CreateJourneyWizard` | Name, photo and steps |
| `SwipeableRow` | Swipe-to-delete wrapper with accessibility action |
| `EmergencyContactCard` | Contact with call and message buttons |
| `ConfirmDialog` | Shared modal for delete and SOS confirmations |
| `SosButton` | Large SOS action |
| `ThemeSelector` | Colour theme swatches |
| `ProgressBar` | Themed, accessible progress bar |
| `EmptyState` | Shared empty-state card |

## 10. Frontend Libraries (Expo SDK 54)

| Need | Library |
| --- | --- |
| Routing | `expo-router` |
| Gestures and swipe | `react-native-gesture-handler` (`ReanimatedSwipeable`) and `react-native-reanimated` |
| Safe areas | `react-native-safe-area-context` |
| Icons | `@expo/vector-icons` |
| Font | `@expo-google-fonts/atkinson-hyperlegible` |
| Video playback | `expo-video` |
| Audio playback | `expo-audio` |
| Images | `expo-image` |

Don't add `expo-speech`, `react-native-tts` or any other text-to-speech library.

## 11. UI Acceptance Criteria

- Home shows the active journey (or its empty state), then up to three frequent journeys, then the New Journey and Checklist tiles. There is no greeting, reminder, Get Help tile or SOS tile.
- Tapping an in-progress journey opens Journey Detail without the checklist.
- Tapping any other journey shows the Pre-Journey Checklist first.
- Completed steps collapse to a single struck-through title with a tick.
- The Journeys screen has a working search field.
- Create Journey asks for the name first, then the photo, then the steps. It shows no suggested thumbnails and asks for no dates or transport type.
- Save journey is disabled until at least one step has a title.
- Wizard step rows can be deleted by swiping, and through the accessibility actions menu.
- Journeys can be deleted from the Journeys screen by swiping plus confirmation, and through the accessibility actions menu.
- Photo, video, voice and note media attach to individual steps and show previews. Each step holds at most one photo or video, one voice note and one note.
- The SOS screen shows a confirmation before opening Messages, allows at most 3 contacts, and each contact has Call and Message buttons.
- Contact deletion uses swipe reveal plus confirmation, and has an accessibility action alternative.
- Help contains only FAQ and the website link.
- Settings contains only the colour theme (plus the read-aloud info card and app version).
- All four themes pass the contrast checks in section 3.6.
- Every image and media preview has a meaningful label, and decorative images are hidden.
- All key flows can be completed with VoiceOver and TalkBack, and at the largest OS text size.
