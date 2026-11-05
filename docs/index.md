---
layout: home

title: Scarp Programming Language
titleTemplate: Official Documentation

hero:
  name: Scarp
  text: Build Beyond Boundaries.
  tagline: Explore an experimental, Rust-implemented programming language. Learn from the behavior of the published compiler—not unshipped proposals.
  image:
    src: https://avatars.githubusercontent.com/u/350973173?v=4
    alt: Official Scarp GitHub organization avatar
  actions:
    - theme: brand
      text: Get started
      link: /guide/installation-alpha5
    - theme: alt
      text: Language reference
      link: /language/overview
    - theme: alt
      text: View source
      link: https://github.com/scarp-lang/scarp

features:
  - title: Start with the published alpha.6 compiler
    details: Download a verified prerelease archive, learn static symbol navigation, and run the tagged RMS examples.
    link: /releases/v0.0.6-alpha.1
  - title: Verified language syntax
    details: Explore bind/var, typed funcra functions, branching, iteration, modules, and explicit output.
    link: /reference/status
  - title: Clear installation paths
    details: Use verified prerelease binaries, or build the interpreter from the official Rust source.
    link: /guide/installation
  - title: Honest compatibility guidance
    details: Understand what shipped in v0.0.5-alpha.1, what changed since earlier prereleases, and what remains planned.
    link: /reference/compatibility
  - title: Functions, verified from the compiler
    details: Follow real typed-function examples with outputs checked against the published Scarp interpreter.
    link: /tutorials/verified-functions
  - title: Verified vectors, tiles and classification
    details: Learn matrix inference, softmax probabilities and one-hot targets using compiler-backed examples.
    link: /tutorials/verified-classification
  - title: Developer-friendly navigation
    details: Local search, code highlighting, accessible mobile navigation, and light/dark appearances.
    link: /guide/first-program
  - title: Previous v0.0.5-alpha.2 release
    details: Explore five pinned, compiler-verified programs for bit operations, typed declarations, Unicode and numerical functions.
    link: /releases/v0.0.5-alpha.2
  - title: Alpha.2 collections and numeric learning
    details: Run verified integer collections, deterministic score-selection, softmax and explicit loss-gradient programs.
    link: /tutorials/alpha2-collections-and-learning
  - title: Alpha.1 to alpha.2 upgrade evidence
    details: Eleven original compiler programs are retested unchanged against the published newer interpreter, with byte-exact outputs.
    link: /reference/upgrade-readiness
  - title: Previous alpha.5 release, project inspection and C11 API
    details: Inspect a project safely, run an exact published scalar-repeat example, and learn why the restricted C11 backend is Rust API-only.
    link: /releases/v0.0.5-alpha.5
  - title: Symbols and references across source files
    details: Explore read-only definition and reference inspection, JSON versioning and index limits in published alpha.6.
    link: /tooling/cli-alpha6
  - title: Numerical RMS and bounded work
    details: Learn robust root-mean-square calculation with exact compiler outputs, quotas and edge cases.
    link: /language/rms-alpha6
  - title: Official Scarp community
    details: Find the project's verified social channels, news, and ways to contribute.
    link: /community/social
---

::: warning Experimental language
The newest published compiler is **[v0.0.6-alpha.1](/releases/v0.0.6-alpha.1)**, while much of the main reference still targets the separately verified **v0.0.5-alpha.1** baseline. Both are experimental prereleases. Before upgrading older code, check [alpha.1 → alpha.2 upgrade readiness](/reference/upgrade-readiness) and the [feature status](/reference/status).
:::
