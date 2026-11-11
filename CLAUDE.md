# akshaybajpai.com: working context

Read this before changing anything. It is the standing brief for whoever develops the site next, person or agent. The README describes the set as it stands, sheet by sheet; this file holds the rules behind it and the map of where each thing lives.

The longer brief this came from is the Claude Doc "Website brief for the builder agent" (https://claude.ai/artifact/X1yFd2FkZpi9bPDT15nRU7). If the two disagree, this file is newer.

---

## 1. What the site is

A personal site issued as an architectural drawing set. Next.js 15 (App Router), React 19, TypeScript, static export to `out/`, hosted on GitHub Pages at www.akshaybajpai.com. No server, no edge functions and no analytics script.

- Every route is a numbered **sheet** (plate). The homepage is the **key plan** (G-000), a general arrangement of the whole set.
- The chrome never leaves: frame, rulers, rail and title block. A route change reads as a new sheet laid on the same board (View Transitions).
- **Three reading modes, all CSS**, on `html[data-mode]`:
  - `artifact`: warm paper on kraft, plain language.
  - `annotated`: cyanotype, the set's own terms, margin notes.
  - `raw`: unlit black, routes, records and the DOM under the glass.
  The modes differ in what they *say* as well as in colour; `lib/voice.ts` holds the three levels of every label. `?mode=artifact|annotated|raw` opens one directly, and `D` cycles them.
- **Instruments:**
  - Inspection lens (`L`).
  - Sheet index (`/` or `⌘K`).
  - Mode (`D`).
  - Key plan camera.
  - Zone cursor.
  - Issue as PDF (`/set/`).
- **Type:**
  - Instrument Serif for display.
  - IBM Plex Mono for labels and numbers.
  - IBM Plex Sans, one regular weight, for body.
  No new faces.
- **One hot colour per sheet** (`--accent`), used sparingly: leaders, the stamp, the one number that matters.

## 2. Who it is about, and how to say it

These are the user's rules, and they are not negotiable.

**Title.** "Boardroom to bare metal", with the sub-line "Clients · teams · architecture · AI · code". It is deliberately not a job title. Where a field needs a plain role (schema `jobTitle`, page titles, the vCard), use **Technology leader and systems architect**. The old title "AI Architect · Forward-Deployed AI Engineer" must not come back as a title. "AI architect" and "forward-deployed AI engineer" stay only as *keywords*, because people search for them.

**Standfirst** (under the name: key plan title strip, About lead):
> I lead technology from the first client conversation to the release: the architecture, the team, the code, and the runbook after. Built to hold under load and fail loud.

**Entity sentence.** Third person, for metadata. Its facts run in this order: role, the work, the companies (co-founder, CTO), the research, the credentials. It lives in three places that must state the same facts in the same order; change all three together:
1. `lib/identity.ts` `ONE_LINE`, used by the Person node, layout and key plan descriptions.
2. `scripts/generate-rss.mjs` `ENTITY`, the first line of `/llms.txt`.
3. `app/about/page.tsx`, the first paragraph, in first person.

A-103's "Who is Akshay Bajpai?" answer (`data/engagements.json`) follows it too, minus the co-founder and CTO sentence.

**Co-founder and CTO.** He co-founded three companies and ran engineering as CTO at two others. Do not call him a CEO or founder-CEO anywhere. No names and no further detail: not the companies, the years, the sizes or the outcomes.
- In visible text, say it **once** on the whole site, softly, inside a sentence about the work. Today that is the About sheet's first paragraph ("In both seats the architecture, the people and the delivery were one job").
- In the machine layer, state it plainly: the entity sentence, the Person node's `hasOccupation`, the About meta description and `/llms.txt` Facts. Answer engines repeat what is stated, not what is implied.
- Keep it out of A-103's visible answers, titles, headlines, taglines and badges ("twice a CTO", "3× founder" are out).

**Research.** He researches world models and reinforcement learning and writes essays on systems, cost and trust. Present him as a researcher and a careful thinker without making a point of it: never say whether the research is independent, personal, funded or affiliated. The evidence is the writing (`content/blog/world-models-as-issued-2026.md`, `reinforcement-learning-after-the-reward-model.md`, `content/essays/the-model-that-refuses-to-draw.md`) and R-301, which leads with what he is working through now. When a new research note is published, add it to R-301's "Now" row if it supersedes the current one.

**No domain lock.** His training is in AI as a whole (MSc in Artificial Intelligence & Intelligent Systems). Medical AI was the thesis and early research topic, not his field: never describe him, his training or his research as medical, healthcare or any one domain. Client work in a domain (health, finance, defence) is described as that piece of work, never as who he is.

**No city.** Location is the country only (India): in the address, `occupationLocation`, the vCard, `llms.txt` and the contact sheet. The entity sentence names no place.

**No names, no dates in the record.**
- No employer, client, agency or product-brand names, and no years or date ranges beside the work. Describe what the work was and what it changed, with numbers.
- Defence work is "government defence deployments". Never name the agency.
- Never present any company as his, including aiximius.com. It may appear only as a neutral project.
- Private repositories are described, never linked: ReBo (`rebo`), FlowState and shelf. ReBo's first test schema is "a production-shaped schema", never the client system's name.
- `lib/stack.ts` `REPO_NAMES` maps repository names that would otherwise print a brand (e.g. `DADM-Aiximius` prints as "DADM").

**Never invent or inflate.**
- Every number must trace to a case study already on the site, the brief, or a results file in a repository.
- No user counts, revenue, team sizes beyond what is already stated, logos, testimonials, awards or rankings.
- If you want to say something that is not sourced, leave it out and ask.

**Voice.** Write like a person at a desk who meant every word.
- Say the thing, then stop.
- Use concrete nouns and working verbs: "holds a power request", "reruns the saved query".
- Vary the rhythm. Allow one dry line per page.
- First person for the work ("I built", "I measured"); third person only in metadata and schema.
- British spelling (colour, behaviour, optimise).
- **No em dashes**: use a comma, colon, full stop or the set's middle dot `·`.
- Banned words and phrases: passionate, visionary, thought leader, rockstar, ninja, 10x, world-class, cutting-edge, state-of-the-art, innovative, seamless, robust, leverage, harness, unlock, empower, elevate, delve, tapestry, journey, landscape, game-changer, revolutionise, "builder of products", "a cut above", "best in class". Also cut "In today's world", "It's worth noting", "Let's dive in", "At its core", "Not just X, but Y", and rhetorical questions.
- The test: could a stranger's portfolio carry the sentence unchanged? If so, rewrite it.

**Answer engines.** The goal is that an AI summary or answer about him, or about who to contact for the work, lands on specifics: what he takes on, what was built and the numbers it was measured by. The levers are consistent facts (one entity sentence everywhere), plain answers a model can quote whole (A-103's questions, written in the third person on purpose), and offers in the graph that match the page word for word. Do not use hidden text, keyword stuffing or instructions to models in `llms.txt`: engines treat them as spam. The biggest remaining gap is third-party mentions, which only he can create (see `HANDOFF.md`).

**How to show the level without claiming it.**
- Put the lowest layer next to the highest (an IOKit assertion and a C-suite acceptance test in one paragraph).
- Give numbers with their conditions.
- Say what each system refuses to do.
- Mention the paperwork (decision records, specs, runbooks) once per project.
- One strong fact beats three good ones.

## 3. Where things live

| To change | Edit |
|:--|:--|
| Name, title, standfirst, entity sentence, job title | `lib/identity.ts` (re-exported by `lib/metadata.ts`; client components import `identity.ts` directly to stay light) |
| Person / WebSite JSON-LD, `knowsAbout`, keywords | `lib/metadata.ts` (`identityGraph`, `HOME_KEYWORDS`) |
| Site name in titles and OG | `lib/constants.ts` `SITE_NAME` |
| Sheet registry: numbers, titles, revisions, refs, key-plan rects | `lib/plates.ts` `PLATES` |
| Revision block in the key plan's title strip | `lib/plates.ts` `ISSUES`, the last three issues, newest first. `ISSUE_STAMP` reads `ISSUES[0].date` |
| Key plan (G-000) contents per room | `app/page.tsx` `contents` |
| Key plan drawing, title strip | `components/keyplan/KeyPlan.tsx` + `.module.css` |
| About sheet (A-101) copy | `app/about/page.tsx` |
| The record elevation on About | `components/plate/CareerElevation.tsx` `ROLES`: kinds of work, no titles or years |
| Terms of engagement (A-103): what he takes on, method, Q&A, brief composer | `data/engagements.json` (single source: `offers[]` with `subject` = the correspondence subject, `method[]` with `course` and `leaves` for Fig. 1, `constraints[]` with `note` and `proof` for the composer's loads, `questions[]`). It feeds `app/engagements/page.tsx`, `lib/engagements.ts`, the Person node's `makesOffer`/`hasOccupation`, and the "What he takes on" and "Questions" sections of `/llms.txt`. Components: `ConstructionSequence` + `SequenceControl` (Fig. 1), `BriefComposer` + `BriefControl` ("Start a brief"), `AnswerCite` (copyable Q-0n anchors), `Say` (per-mode text without `lib/voice`). Any number in a note must already appear in a case study |
| Schedule of materials (A-102) | `app/schedule/page.tsx`, `components/plate/MaterialSchedule.tsx` (elevation + blocks, server), `components/plate/ScheduleTracer.tsx` (the only script: "trace a project"), `lib/stack.ts` (`traceSources`, `traceId`), data in `data/stack.json`. `/schedule/?trace=<id>` arrives with a project pinned (`r-<repo>` or `e-<engagement>`, slugged) |
| Case studies (W-4xx) | `content/work/*.md`. Numbered by `pubDate`, newest first; the new three use timestamps to fix their order |
| Case-study figures | hand-drafted: `components/figures/{DamFigure,EngineLoop,ThreatGauge}.tsx`, listed in `components/figures/index.ts` and `CaseFigure.tsx`. Node-and-wire: `components/figures/schematics.ts` |
| Software JSON-LD (SoftwareApplication / SourceCode) | `lib/software.ts`. Update `KEEPMEAWAKE_VERSION` from the releases page on each issue |
| Repository cards on Works | `lib/repos.ts` `REPO_CARDS` (`repo` is the raw name in stack.json, which drives each card's "Trace in A-102" link), rendered by `components/plate/RepoCards.tsx`, static, crop marks on hover |
| Works sheet lead and meta | `app/work/page.tsx` |
| Share cards (OG PNGs) | `scripts/generate-og.mjs` (`SECTIONS` for section sheets; articles are automatic) |
| `/llms.txt`, `/rss.xml` | `scripts/generate-rss.mjs` |
| Sitemap | `app/sitemap.ts` |
| Calling card and vCard | `lib/card.ts` (`role` is the plain role, one part per line on the card) |
| Plain / technical / source wording of chrome | `lib/voice.ts`, plate `voice` in `lib/plates.ts` |
| Colour tokens, modes | `app/globals.css` |

**The skills source.** `data/stack.json` is owned by the profile repository (ax5hay/ax5hay, which renders the profile README plates from it). Never edit it here. Change it there, then run `npm run sync:stack`: it reads a sibling checkout at `../ax5hay` if present, otherwise the published file. Items with `n >= 3` are drawn heavy. Leadership items carry `engagements` instead of `repos`.

## 4. Recipes

**Add a case study**
1. Create `content/work/<slug>.md` with frontmatter `title`, `description`, `pubDate`, `client` (an engagement label, never a company name; `Open source · ax5hay/<Repo>` links the repository), `stack`, and `metrics` (the first is the strongest; it shows on the key plan and in llms.txt).
2. Sections are `##` headings; the profile and section ids are read from them.
3. Give it a figure: either an entry in `schematics.ts` keyed by slug, or a hand-drafted component added to both `figures/index.ts` and `CaseFigure.tsx`.
4. If it is software, add its nodes to `lib/software.ts`.
5. Sheet numbers shift for everything older; that is by design.

**Issue a revision**
1. Add a row at the top of `ISSUES` and drop the oldest.
2. Bump `revision` on the plates the issue touched.
3. Update the README's revision note.

**Change the title or entity facts.** Edit `lib/identity.ts`, `ENTITY` in `scripts/generate-rss.mjs`, the About first paragraph and the README together. Then grep for the old wording across `app components lib scripts public README.md`.

## 5. Engineering bar

The current build is the floor. Measure before and after on the production build; nothing may get worse.

| Measure | Floor |
|:--|:--|
| Runtime dependencies | 8, none for animation, state or 3D |
| Shared JS | 103 kB, no legacy polyfill bundle (`scripts/strip-polyfills.mjs`) |
| First-load JS | 133 kB key plan · 111 to 116 kB on a sheet, 120 kB contact (Rev E) |
| CLS | 0 |
| Pan, zoom, scroll, lens drag | 60 fps, median frame about 16.7 ms, CPU throttled 4× |
| Lighthouse a11y · best practices · SEO | 100 · 100 · 100 |
| Navigation after the cover | no page requests |

Rules that keep it there:
- Animate only `transform`, `opacity` and clip, and respect reduced motion everywhere.
- No layout reads in scroll or pointer handlers.
- New figures are hand-drawn inline SVG with a few lines of plain TypeScript. Interactive figures shared by one route must be code-split: `CaseFigure.tsx` uses `React.lazy` so each figure ships only with its own sheet (a static import added 7 kB to every case study).
- Interactive pieces on a single-route sheet render complete on the server; a small client controller only sets attributes and text on what is already drawn (`ScheduleTracer`, `SequenceControl`, `BriefControl`). In those client components use `components/plate/Say.tsx`, not `Voice`/`useVoice`: importing `lib/voice` or the mode provider adds 5 to 7 kB to the route.
- `BriefControl` writes `{ email, subject, message }` into the `plate.transmittal` key that `CorrespondenceForm` reads. Change both sides together; the subject must be one of the form's four subjects.
- Images are AVIF or WebP with explicit dimensions, lazy below the fold, under 120 kB each.
- Every sheet works by keyboard alone, with visible focus and passing contrast in all three modes, at phone and desktop width.
- The README is part of the set: update its sheets (A-1xx, C-702 Measured, C-703 Visibility) when you change what they describe.

## 6. Commands

```bash
npm ci
npm run dev           # local dev server
npm run typecheck     # tsc --noEmit
npm run build         # next build + rss/llms.txt + share cards + polyfill strip → out/
npm run sync:stack    # refresh data/stack.json from the profile repo
```

**Deploy.** A push to `main` runs `.github/workflows/deploy.yml` (build, CNAME, IndexNow key, Pages deploy). Details are in `DEPLOYMENT.md`. Never push without the owner's go-ahead. After a deploy that changes positioning, submit in Google Search Console:
- the key plan
- `/about/`
- `/work/`
- `/schedule/`
- the newest case-study sheets

**Previewing.**
1. Serve `out/` with any static server, e.g. `python3 -m http.server 4173` in `out/`.
2. The cover preloader runs on every fresh tab. A headless screenshot needs `sessionStorage.setItem('plate.booted','1')` first, e.g. a throwaway `out/_boot.html` that sets it and `location.replace`s to the target.
3. Microsoft Edge headless works for screenshots on this machine (`--headless=new --screenshot`). Playwright has no browser installed.

## 7. Open items

- "Team of eight" (restaurant platform) comes from an older résumé. The owner has not reconfirmed it.
- The "prototype to federal SaaS" work has no metric, so it has no sheet. Add one only with a sourced number.
- Safari and Firefox have not been tested. Do it, and say what you found in the README.
- From the brief, not yet built: a detail-callout bubble on the Works sheet ("1/W-401") that opens a case study at a larger scale.
- The figures' illustrative values (FlowState gauge weights) are marked as an example in the caption. Keep it that way unless real weights are published.
