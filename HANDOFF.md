# Handoff · Rev E

Status as of 2026-11-12. Read `CLAUDE.md` first: it holds the standing rules (voice, no names, no dates, CTO once) and the map of where everything lives. This file is the state of the work: what is done, what is waiting, and what to do next.

## Where things stand

- **Branch:** `rev-e/boardroom-to-bare-metal`, committed locally.
  - **Not pushed and not merged.** A push to `main` deploys to www.akshaybajpai.com.
  - Merge and push only when the owner says so.
- **Build:** `npm run typecheck` and `npm run build` both pass. `out/` holds the last build.
- **Checked by eye** with headless Edge screenshots:
  - key plan, About, Works, A-102 and A-103
  - the three new case studies, across the three modes

## What Rev E changed

- **Title.** "Boardroom to bare metal" replaces "AI Architect · Forward-Deployed AI Engineer" everywhere. The plain role is "Technology leader and systems architect". Source: `lib/identity.ts`.
- **One entity.** The Person node, the About sheet's first paragraph and `/llms.txt` state the same facts in the same order.
- **About.** The record elevation is relabelled by kind of work, with no titles or years. Defence is "Government defence deployments".
- **W-401 ReBo, W-402 KeepMeAwake, W-403 FlowState.** Full case studies, each with a hand-drafted operable figure:
  - `components/figures/DamFigure.tsx`
  - `EngineLoop.tsx`
  - `ThreatGauge.tsx`

  They are code-split per sheet through `CaseFigure.tsx` (`React.lazy`).
- **Repository cards.** Eight cards on W-400 for the repositories without a sheet (`lib/repos.ts`).
- **A-102 Schedule of materials.** Reads `data/stack.json`, which is owned by the profile repo and refreshed with `npm run sync:stack`.
- **A-103 Terms of engagement** (`/engagements/`):
  - what he takes on, how the work runs, and eight questions answered plainly
  - one source, `data/engagements.json`, which also feeds the `FAQPage`, Person `makesOffer` and `hasOccupation`, and `/llms.txt`
  - linked from the key plan's Contact room, About and Contact
- **Revisions block** in the key plan's title strip (`lib/plates.ts` `ISSUES`).
- **Software JSON-LD** in `lib/software.ts`.
- **Contact sheet.** Copy and form subjects updated.
- **Share images.** New home share image (`public/og.jpg`, 116 kB), and 39 share cards drawn at build.

## Measured (production build, `next build` route table)

| Route | Rev D | Rev E |
|:--|:--|:--|
| Shared JS | 103 kB | 103 kB |
| Key plan | 132 kB | 132 kB |
| A case study (`/work/[slug]`) | 115 kB | 116 kB |
| About | 112 kB | 113 kB |
| Works | 111 kB | 112 kB |
| A-102 / A-103 (new) | n/a | 111 kB / 111 kB |

The case study is 1 kB over the brief's floor: a slightly larger plate registry on every page, plus the lazy wrapper. A static import of the three figures had made it 123 kB.

**Not re-measured:** Lighthouse, frame rates, CLS, and real phone widths. Headless Edge here will not go below about 500 px, so its phone captures crop. Safari and Firefox have not been tested.

## Waiting on the owner

- **Push.** Merge the branch to `main` and push. Then submit these in Google Search Console:
  - `/`
  - `/about/`
  - `/engagements/`
  - `/work/`
  - `/schedule/`
  - the three new `/work/…/` sheets
- **Pin on GitHub.** On github.com/ax5hay, under "Customize your pins": KeepMeAwake, AURIXA, Vigilix, akshaybajpai.com, AIDA, MirrorState. There is no API for profile pins. DADM is left out because its repository name carries the company name.
- **Profiles, set aside for now.** Paste matching text into the LinkedIn headline and About, the GitHub bio and the X bio. Use the bios in the brief doc, or ask for drafts.
- **Third-party mentions, set aside for now.** These are what answer engines trust most, and only he can publish them. Drafts can be written on request:
  - a Show HN post for KeepMeAwake
  - a ReBo write-up ("five walls against a write")
  - the FlowState air-gap story
  - talks
- **Facts to confirm:**
  - "team of eight" (restaurant platform), from an older résumé
  - whether he offers fractional or interim CTO work. If yes, add it to `data/engagements.json` and the contact subjects.
- **Dates on the Works schedule.** The schedule and article heads show each case study's date (e.g. "Jun 1, 2022"), which reads as a timeline next to client work. It was kept because the brief said to leave existing case studies as they are. Decide whether to hide dates for client work.

## Next steps, in order

1. On the owner's go-ahead: merge and push. Check the deploy at www.akshaybajpai.com: `/engagements/`, `/llms.txt`, and the JSON-LD on `/about/`.
2. Run Lighthouse on the production build and fill in C-702 in the README if anything moved.
3. Test Safari and Firefox and record what was found in the README.
4. Brief items not built yet: the detail-callout bubble on the Works sheet, and a FlowState gauge with real weights if they are ever published.

## Gotchas

- **Preloader.** It runs on every fresh tab. For headless screenshots, set `sessionStorage['plate.booted']='1'` and `localStorage['plate.notes.off']='1'` first. A throwaway `out/_boot.html` that sets them and redirects works well.
- **Scroll reveal.** Schedule rows use a scroll reveal and look blank in headless captures. Add `--force-prefers-reduced-motion`.
- **Case study order.** Case studies are numbered by `pubDate`, newest first, and the three new ones use timestamps to fix their order. Adding one renumbers everything older.
- **Two entity sentences.** `ENTITY` in `scripts/generate-rss.mjs` duplicates `ONE_LINE` in `lib/identity.ts`, because the `.mjs` script cannot import TypeScript. Change both.
