# Slot 4 Operations Runbook

## Required per-site inventory
Keep `ops/sites.inventory.json` outside public repos, or generate it in the private control repo. Use `ops/sites.inventory.example.json` as the schema.

Required fields per site:
- `domain`
- `repo`
- `siteCode`
- `port`
- `url`
- `ghcrImage`
- `vps`

## Deploy model
GitHub Actions builds and pushes the Docker image to GHCR. The VPS only pulls and restarts:

```bash
docker compose -f docker-compose.vps.yml pull
docker compose -f docker-compose.vps.yml up -d --remove-orphans
```

## GHCR token requirement
For private GHCR packages, VPS deploy requires:
- `GHCR_USERNAME`
- `GHCR_TOKEN`

Use a GitHub PAT with package read permission for VPS pulls.

## Rollback
On VPS, from the site directory:

```bash
DEPLOY_IMAGE=ghcr.io/owner/repo:previous-sha ./scripts/rollback-site-vps.sh
```

## Docker cleanup
Run weekly on VPS:

```bash
./scripts/vps-docker-cleanup.sh
```

This removes unused containers/images/cache older than the safe retention window. It does not remove running containers.

## Health dashboard
From local/control machine:

```bash
SITE_INVENTORY=ops/sites.inventory.json pnpm ops:health
```

Optional contact check:

```bash
CHECK_CONTACT=1 SITE_INVENTORY=ops/sites.inventory.json pnpm ops:health
```

## Master panel slow/down protection
The public connector does not show fake/static fallback posts. It only uses:

1. Next.js revalidate cache for normal feed/bootstrap requests.
2. In-memory stale fallback from the last successful real master-panel response during the running container lifetime.

If master panel is unavailable and no real response exists, pages should show empty states instead of fake posts.

Useful env:
- `NEXT_PUBLIC_PUBLIC_API_TIMEOUT_MS=8000`
- `NEXT_PUBLIC_FEED_REVALIDATE_SECONDS=300`
- `NEXT_PUBLIC_STALE_FALLBACK_SECONDS=86400`

## Contact/email scale warning
Gmail SMTP is acceptable for testing and low volume only. For bulk/contact leads across many sites, move the master panel sender to a transactional provider:

Recommended providers:
- Amazon SES
- Mailgun
- Postmark
- SendGrid

Required design:
- Form submit -> DB save -> Email queue -> retry -> sent/failed status
- Visitor acknowledgment email
- Team notification email
- Provider rate-limit handling
- Bounce/complaint tracking where available

## UI uniqueness rule
Designers and AI tools should only edit:
- `src/editable/pages/**`
- `src/editable/content/**`
- `src/editable/theme/**`
- `src/editable/components/**`

Everything else is logic/runtime surface and should be blocked by `pnpm guard:editable:ci`.

## Public repo protection
The editable guard is not enough on its own for public repositories.

Required controls:
- Protect `dev` and `main` branches.
- Disable direct pushes for everyone except the owner/admin path you explicitly allow.
- Require PR checks before merge.
- Require `CODEOWNERS` review for locked paths.
- Keep auto-merge enabled only for PR authors with trusted association:
  - `OWNER`
  - `MEMBER`
  - `COLLABORATOR`

What this means:
- Strangers can view and fork public repos.
- Strangers can open PRs.
- Strangers should not be able to auto-merge into `dev`.
- Locked files should not merge without owner-controlled review.
