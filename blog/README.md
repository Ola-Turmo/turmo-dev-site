# Journal for turmo.dev

Bloggen er statisk og agentvennlig.

## Agent-skill

Bruk skillen `turmo-blog-publishing` før du legger til eller endrer innlegg.

Den finnes to steder på denne maskinen:

- Codex: `/home/postgres/.codex/skills/turmo-blog-publishing/SKILL.md`
- Hermes: `/home/postgres/projects/hermes-agent/skills/software-development/turmo-blog-publishing/SKILL.md`

Bloggen skal som hovedregel være graf- og grafikkdrevet, ikke teksttung. Nye innlegg bør følge den visuelle stilen i dagens tre rike artikler: mørke datakort, innebygde SVG/canvas-grafer, tydelige metode-/kildeblokker, kompakte nøkkeltall og norske forklaringer.

## Legg til nytt innlegg

1. Kopier en eksisterende fil fra `blog/innlegg/`.
2. Endre `title`, `description`, canonical URL, JSON-LD og artikkelinnhold.
3. Lagre filen med en kort norsk slug, for eksempel `blog/innlegg/nytt-innlegg.html`.
4. Legg en extensionless rute i `_redirects`.
5. Legg en ny oppføring i `blog/posts.json`.
6. Legg en lenke i `blog/index.html` hvis innlegget skal vises i journaloversikten.
7. Oppdater `sitemap.xml`.
8. Legg eventuelt en kort lenke på forsiden dersom det skal være blant de tre fremhevede innleggene.
9. Test både `.html`-URL og extensionless URL i nettleser.

Ingen byggesteg kreves.
