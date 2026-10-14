# Feasibility study

The demo application shows what a front end can do with the responses of the
reporting API. Alongside it, a number of questions were examined that go
beyond the API: can an external service be connected, and does that help
teachers?

Each of these questions gets its own page, and each page follows the same
structure. First the question, then the technical implementation in the
prototype, then an assessment that keeps two things apart: **what is
technically possible** and **what it is worth in the classroom**. The two
answers are not always the same.

> **Prototypes, not products.** What was built in the study answers the
> question *is it possible, and what would it take?*. It is not a
> recommendation for operation and not part of the API.

## The questions

| Question | Prototype | Result in one sentence |
|---|---|---|
| [Integrating media libraries](machbarkeitsstudie-mediatheken.md): assigning material from MUNDO directly to a competence level | "Learning materials" tab of the demo application, connected via LTI 1.1 | Technically feasible. Useful only to teachers who already know what they are looking for. A search that starts from the report fails because metadata is missing on both sides. |
| [Handing a material collection to the LMS](machbarkeitsstudie-lms-export.md): materials collected for a report go to the learning platform as a Common Cartridge, or to paper as a PDF | Export in the "Learning materials" tab | Feasible, and with no server involved. Moodle imports the cartridge since the export writes Common Cartridge 1.1. It carries the structure and the links, not the materials themselves. |
| [An assistant that can read the results](demo-rezepte.md#ein-assistent-der-die-auswertung-lesen-kann-der-mcp-server): a language model assembles the queries itself | MCP server in the repository (`mcp-server/`) | Described as a pilot in the demo application recipes (in German), with the open questions for real operation. |

Further questions will be added here once their page is written.
