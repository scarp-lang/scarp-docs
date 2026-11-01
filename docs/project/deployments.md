# GitHub Pages deployment history

The Scarp documentation website deploys automatically after changes to `main` are merged and the GitHub Pages workflow completes successfully. It publishes the English pages at `/scarp-docs/` and the Hindi pages at `/scarp-docs/hi/` in **one deployment**.

<PagesDeployments />

The count above is fetched from the public GitHub Actions API and represents **successful runs of the `pages.yml` workflow**, not the number of commits, branches, or distinct website versions. If GitHub rate limits the request, use the linked workflow history instead. Each meaningful merged change triggers a deployment; there is no need to run a workflow merely to increase this number.

## Where to inspect deployments

- [GitHub Pages workflow history](https://github.com/scarp-lang/scarp-docs/actions/workflows/pages.yml) — view the build and deployment jobs and their status.
- [Repository deployments](https://github.com/scarp-lang/scarp-docs/deployments) — GitHub's deployment records, if available.
- [Live documentation](https://scarp-lang.github.io/scarp-docs/) and [Hindi documentation](https://scarp-lang.github.io/scarp-docs/hi/) — verify published content.

Production builds and the independent compiler conformance check are handled by the [Documentation CI workflow](https://github.com/scarp-lang/scarp-docs/actions/workflows/ci.yml). A passing build does not imply that a compiler feature has shipped; the [feature status](/reference/status) remains tied to the compiler release.
