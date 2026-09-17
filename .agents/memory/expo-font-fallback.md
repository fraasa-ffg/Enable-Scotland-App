---
name: Expo font fallback
description: The requested accessible font package was unavailable in the project package registry during the Enable Scotland build.
---

The Expo scaffold's bundled Inter font is the current fallback when a requested Google font package cannot be installed from the workspace registry.

**Why:** A missing font package breaks Metro startup; preserving the working bundled font is safer than leaving an unresolved import.

**How to apply:** Verify package availability before swapping the scaffold font on future Expo builds.