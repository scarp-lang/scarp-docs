# Scarp Docs v0.2.0-alpha.1 — prerelease notes

**Documentation prerelease, November 4, 2026. This is not a stable release and does not publish a new Scarp compiler.**

This website source snapshot documents the separately published **Scarp compiler v0.0.5-alpha.4** prerelease.

## Highlights

- Full **English and Hindi** quickstarts for the experimental alpha.4 `create`, `verify DIRECTORY`, and `launch` workflow.
- New bilingual **alpha.3 to alpha.4 migration checklist**, with a clear command availability matrix and file-preservation guidance.
- Interpreter-based execution, manifest restrictions and runtime-versus-static checks documented against published compiler evidence.
- TypeScript-only documentation automation for release identity, example parity, migration drift, and versioned feature gates.
- Responsive VitePress navigation, on-site search, translation, release evidence, community links and GitHub Pages deployment reporting.

## Compatibility and limitations

- Compiler reference: [Scarp v0.0.5-alpha.4](https://github.com/scarp-lang/scarp/releases/tag/v0.0.5-alpha.4).
- The docs' historical alpha.1, alpha.2 and alpha.3 feature examples retain their **own release boundaries**.
- The language is experimental. Documentation examples do not imply native builds, package management, or feature stability.
- This release distributes **documentation source only**; the published VitePress website remains [scarp-lang.github.io/scarp-docs](https://scarp-lang.github.io/scarp-docs/).

## Validation

The release pipeline requires a **successful Documentation CI run on main**, including the VitePress build, TypeScript checks, bilingual documentation validation and tagged compiler-conformance jobs. It creates a GitHub **prerelease**, never a stable release.

For project development, see [the docs repository](https://github.com/scarp-lang/scarp-docs) and [the compiler repository](https://github.com/scarp-lang/scarp).
