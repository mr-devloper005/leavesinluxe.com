# Slot 4 Site Base Theme

This base theme was derived from `mysterycoder.com` and reshaped for the Slot 4 workflow.

## Intent
- Keep the working publishing, SEO, routing, and contact functionality intact.
- Move page UI into `src/editable/pages` so redesign work stays page-heavy and easier to hand to UI contributors or AI tools.
- Keep logic in the existing locked layers (`src/lib`, `src/config`, `src/design`, `src/components`) until the next hardening pass.

## Current Slot 4 Pattern
- `src/app/*` route files are thin bridges.
- `src/editable/pages/*` holds the primary page UI files.
- `src/editable/content/*` is the editable content layer.
- `src/editable/theme/*` is the editable brand/theme layer.

## Page Files Moved
- `HomePage.tsx`
- `AboutPage.tsx`
- `ContactPage.tsx`
- `ArticleDetailPage.tsx`
- `ListingDetailPage.tsx`
- `ImageDetailPage.tsx`
- `ProfileDetailPage.tsx`

## Next Hardening Pass
- Move shared page copy out of route logic and into `src/editable/content/*` per page.
- Keep CI rules so UI PRs can only modify `src/editable/**` and selected public assets.
- Auto-merge to `dev` now needs a trusted GitHub association:
  - `OWNER`
  - `MEMBER`
  - `COLLABORATOR`
- Public repos are safe only if branch protection is also enabled on `dev` and `main`.
- `CODEOWNERS` should stay active so locked paths cannot move without owner review.
