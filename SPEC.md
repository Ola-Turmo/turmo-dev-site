# turmo.dev — Public Profile Hub Specification

## 1. Concept & Vision

turmo.dev is Ola Turmo's public-facing profile hub — a credible Norway AI authority engine that doubles as a working laboratory for autonomous AI company operations. The site projects intellectual rigor through real tools (SSB labor market analysis, AI model benchmarks) while establishing thought leadership in autonomous agents, Paperclip orchestration, Hermes Agent, and Cloudflare edge computing. It is calm, dark, precise — the digital equivalent of a well-organized technical desk.

## 2. Design Language

- **Aesthetic**: Dark editorial minimalism — clinical precision meets Norwegian restraint
- **Palette**: `#0a0a0f` bg, `#f0f0f0` primary text, `#6ee7b7` accent (mint green), `#818cf8` secondary accent (soft indigo)
- **Typography**: Manrope (Google Fonts) — geometric, technical, warm
- **Motion**: Subtle fade-ins on scroll, no gratuitous animation
- **Icon library**: Inline SVG only (no external icon font dependency)

## 3. Layout & Structure

```
Hero + Identity Section
├── About / Bio
├── Core Work Areas
│   ├── Autonomous AI Companies (Paperclip, Hermes Agent)
│   ├── Norway AI Operations
│   ├── Cloudflare Edge/Orchestration
│   └── Open Source Contributions
├── SSB Labor Market Dashboard (preserved, refined)
├── AI Model Benchmarks (preserved, refined)
└── Contact / Connect
```

Single scrolling page with anchored sections. Responsive (mobile-first). No frameworks — pure HTML/CSS/JS for maximum portability and Cloudflare Pages compatibility.

## 4. Features & Interactions

- **Profile section**: Ola Turmo bio, role (AI operator, Norway), links to GitHub, LinkedIn
- **Work area cards**: 4 cards for each core area with description + links
- **OSS contribution log**: Auto-updated from GitHub API (public repos, recent commits/PRs)
- **SSB dashboard**: Interactive treemap (preserve existing data.js logic)
- **AI benchmarks**: Preserve existing benchmark-dashboard-core.global.js
- **Contact**: Email link + social handles (X, GitHub, LinkedIn)

## 5. Component Inventory

### Hero Section
- Name (Ola Turmo), tagline, dark background, subtle grid pattern
- CTA: "View my work" → scrolls to work areas

### Work Area Card
- Icon + title + 2-sentence description + link
- States: default (subtle border), hover (accent glow)

### OSS Log Table
- Columns: Project, Type (PR/Commit/Issue), Description, Date
- Auto-fetches public repos from Ola-Turmo GitHub

### Data Dashboard (preserved)
- Existing SSB treemap JS, cleaned up and embedded
- No changes to data logic — only wrapping/presentation

### Benchmark Panel (preserved)
- Existing benchmark-dashboard-core.global.js
- Same treatment as SSB dashboard

## 6. Technical Approach

- **Framework**: None — vanilla HTML/CSS/JS (maximum portability for Cloudflare Pages)
- **Deployment**: GitHub Pages (free, operator-approved path)
- **Data**: Static JS files (data.js, benchmark-dashboard-core.global.js) preserved as-is
- **OSS feed**: GitHub public API (unauthenticated, no token needed for public repos)
- **Build**: None required — pure static files
- **CI/CD**: GitHub Actions for linting and deployment to GitHub Pages

## 7. Deployment Plan

1. Push source to GitHub repo
2. GitHub Actions deploys to GitHub Pages at `https://ola-turmo.github.io/turmo-dev-site`
3. Operator approves migration of `turmo.dev` CNAME from Cloudflare Pages to GitHub Pages
4. Zero-downtime switch via CNAME record update in Cloudflare DNS

## 8. Open Questions (for operator)

- [ ] Should SSB/benchmark content be kept or replaced with profile-focused content?
- [ ] Does GitHub Pages domain (`ola-turmo.github.io`) work for the CNAME, or is there a different Cloudflare Pages project to point?
- [ ] Who approves the DNS change for `turmo.dev`?
