# Feasibility study

The demo application shows what a front end can do with the responses of the
reporting API. Alongside it, sub-concepts were developed for what goes
beyond the API: can an external service be connected, and does that help
teachers?

![Diagram: the VERA assessment delivers results to the TBA3 reporting API, which delivers them to the report. The materials API (draft /materials) adds material per task and level. From the report, routes lead to the media library MUNDO (LTI, built), to the learning platform and to paper (Common Cartridge and PDF, built) and to the learning system AIS.schule (results package, concept). MEM with the IQB educational standards is connected by dashed lines to the API (identifier missing) and to the media library (not indexed).](/dokumentation/bilder/machbarkeitsstudie-bausteine-en.svg)

> **Prototypes, not products.** What was built in the study answers the
> question *is it possible, and what would it take?*. It is not a
> recommendation for operation and not part of the API.

## The sub-concepts

| Sub-concept | Prototype | Result in one sentence |
|---|---|---|
| [Integrating media libraries](machbarkeitsstudie-mediatheken.md): assigning material from MUNDO directly to a competence level | "Learning materials" tab of the demo application, connected via LTI 1.1 | Technically feasible. Useful only to teachers who already know what they are looking for. A search that starts from the report fails because metadata is missing on both sides. |
| [Handing a material collection to the LMS](machbarkeitsstudie-lms-export.md): materials collected for a report go to the learning platform as a Common Cartridge, or to paper as a PDF | Export in the "Learning materials" tab | Feasible, and with no server involved. Moodle imports the cartridge since the export writes Common Cartridge 1.1. It carries the structure and the links, not the materials themselves. |
| [Handing over result data for further work](machbarkeitsstudie-ergebnisse-weitergeben.md): passing a report's results to a learning system, using AIS.schule as the example | Concept draft, not a prototype | Feasible for group results, with no personal data. It requires resolvable identifiers per competence; individual results first need clarification by the states. |
| [An assistant that can read the results](demo-rezepte.md#ein-assistent-der-die-auswertung-lesen-kann-der-mcp-server): a language model assembles the queries itself | MCP server in the repository (`mcp-server/`) | Described as a pilot in the demo application recipes (in German), with the open questions for real operation. |
