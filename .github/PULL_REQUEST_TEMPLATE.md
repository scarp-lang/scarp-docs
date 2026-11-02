## Summary

Describe the reader-facing documentation change and affected pages. Favor meaningful, coherent changes over commit or deployment counts.

## Compiler compatibility and provenance

- [ ] Tested claims against a **published** Scarp release and identified the exact tag/commit.
- [ ] Distinguished published experimental features from unshipped proposals and unsupported syntax.
- [ ] Linked tagged compiler code, tests or official fixtures for technical behavior.
- [ ] Updated pinned source/output fixtures, Git blob IDs and `conformance/manifest.json` if examples changed.
- [ ] Updated `data/tutorial-evidence.json` and the bilingual full-program examples for new fixture cases.

**Compiler tag, source evidence and release-specific limitations:**

## Bilingual documentation

- [ ] English and Hindi pages have been updated together, or this PR does not change user-facing content.
- [ ] Executable code and stdout are unchanged between language versions.
- [ ] Internal links, home features, sidebars and language cross-links remain valid.

## Verification

- [ ] `npm run check:docs` and `npm run check:i18n`
- [ ] `npm run check:snippets` and `npm run test:snippets`
- [ ] `npm run check:fixtures` and `npm run check:tutorial-evidence`
- [ ] `npm run check:coverage-statistics` and `npm run test:coverage-statistics`
- [ ] `npm run typecheck` and `npm run docs:build`
- [ ] GitHub Actions compiler conformance (if source/output evidence is affected)

**Unavailable verification and reasons:**

## Deployment

After CI passes and the PR merges, verify GitHub Pages. Do not run deployments solely to increase the counter.
