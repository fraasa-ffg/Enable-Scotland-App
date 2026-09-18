---
name: Expo audio peer dependency
description: Native build dependency requirement for Expo audio
---

When an Expo app uses `expo-audio`, install the matching `expo-asset` package as a direct dependency of that Expo workspace.

**Why:** Expo Doctor reports the missing peer and standalone native builds may crash even when Expo Go can load the app.

**How to apply:** After adding or upgrading `expo-audio`, run Expo Doctor and align the direct `expo-asset` version with the installed Expo SDK.