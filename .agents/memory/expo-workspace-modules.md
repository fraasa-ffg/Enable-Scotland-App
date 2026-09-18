---
name: Expo workspace native modules
description: Monorepo-specific installation and validation constraints for Expo native packages.
---

Native Expo packages must be installed against the target artifact workspace with the Expo SDK-aware installer; a generic workspace-root package install can be rejected or put dependencies in the wrong package.

**Why:** The mobile app is one package inside a pnpm workspace, while the root intentionally has no mobile dependency surface.

**How to apply:** Use the target package filter with `expo install`, then validate with that artifact's typecheck and production bundle. If bundle validation uses Metro's default port, temporarily isolate other workflows using that port.