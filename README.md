# SignalStory

SignalStory turns structured signals and evidence into portable, renderable
stories for products, reports, CLIs, pull requests, and agent workflows.

The library is intentionally domain-neutral. Host applications provide rule
packs, icon registries, render themes, and optional AI rewrite hooks.

## Architecture

Before extraction, applications often duplicate prose, severity, ranking, and
formatting logic per surface:

```mermaid
flowchart TD
  Signals["Signals and evidence"]
  Signals --> WebRules["Web insight rules"]
  Signals --> PdfRules["PDF report rules"]
  Signals --> CliRules["CLI text rules"]
  Signals --> GithubRules["GitHub Markdown rules"]
  WebRules --> Web["Frontend"]
  PdfRules --> Pdf["PDF"]
  CliRules --> Cli["CLI"]
  GithubRules --> Github["GitHub"]
```

With SignalStory, rule evaluation and story construction are shared. Each
surface only renders a shared story contract:

```mermaid
flowchart TD
  Signals["Signals and evidence"]
  RulePacks["Custom rule packs and plugins"]
  Core["SignalStory core"]
  Signals --> RulePacks --> Core
  Core --> Markdown["@signalstory/markdown"]
  Core --> Ansi["@signalstory/ansi"]
  Core --> React["@signalstory/react"]
  Core --> Python["signalstory Python"]
  Markdown --> Github["GitHub comments"]
  Ansi --> Cli["CLI"]
  React --> Web["Frontend"]
  Python --> Pdf["Backend PDF/report generation"]
```

## Packages

- `@signalstory/core`: rule engine, story contract, ranking, dedupe, plugins.
- `@signalstory/markdown`: Markdown and GitHub rendering.
- `@signalstory/ansi`: plain text and ANSI terminal rendering.
- `@signalstory/react`: React rich text rendering.
- `signalstory`: Python runtime for backend use.

## Current Status

This repository is an implementation scaffold with working JS core, Markdown,
ANSI, and Python runtimes. It is not published yet.

