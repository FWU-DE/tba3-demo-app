# Integrating media libraries: finding material for a report

Part of the [feasibility study](machbarkeitsstudie.md). Examined in the
prototype in the "Learning materials" tab of the demo application, connected
to the media library MUNDO. The queries against MEM and the sample data date
from 14 October 2026.

## The result up front

- **Technically feasible.** A teacher opens MUNDO from within the demo
  application, selects material and gets it back. It is then attached directly
  to the competence level or learning group they are working on. A widely used
  standard (LTI 1.1 Content-Item Selection) is enough; MUNDO does not have to
  build anything new.
- **In the classroom it achieves little, unless the teacher already knows what
  they are looking for.** The search in MUNDO starts with an empty form. Nothing
  from the report goes into the search: no competence level, no key idea
  (*Leitidee*), no task.
- **A search that starts from the report fails because of two gaps.** The
  reports name their competences only as codes without a reference system.
  And the media library cannot be searched by key idea or educational
  standard, because its materials are not indexed that way.
- **MEM can carry one side of the bridge, not both.** The ontology server
  holds the KMK educational standards with stable addresses and resolves, for
  example, the mathematics key ideas L1 to L5. But the link to the material is
  missing there just as it is in the media library.

## The question

A report shows where a learning group stands: how many students are at which
competence level, which tasks were hard, in which sub-area the group is below
the state average. The teacher's next question is: *what do I work with now?*

The German states run media libraries with reviewed material. The question
was whether such a library can be integrated so that the way from the report
to the material becomes short. The material should end up where the teacher
needs it: at the level, at the group, in the export for the learning
platform.

## How the prototype works

### The flow in brief

```
Demo application                      MUNDO (mundo.schule/lti/)
────────────────                      ─────────────────────────
1. "Search in MUNDO"
2. Sign the request (OAuth 1.0a)
3. Submit form in a popup     ─────▶  MUNDO search interface
                                      4. Teacher searches and selects
                              ◀─────  5. POST to content_item_return_url
6. /lti-callback receives the selection
7. postMessage to the opening window
8. Check the selection, take it over,
   assign it to the current level
```

### The start: a signed LTI request

MUNDO offers an LTI interface. Through it, an external application can open
the search interface and have the selection sent back. The prototype uses the
*Content-Item Selection* from LTI 1.1. The request contains these fields:

| Field | Value in the prototype | Meaning |
|---|---|---|
| `lti_message_type` | `ContentItemSelectionRequest` | "Let the teacher pick something and send it back." |
| `lti_version` | `LTI-1p0` | |
| `content_item_return_url` | `<origin>/lti-callback` | Where MUNDO sends the selection |
| `accept_media_types` | `application/vnd.ims.lti.v1.ltilink,text/html` | What may come back |
| `accept_presentation_document_targets` | `window` | Material opens in a window of its own |
| `roles` | `Instructor` | The request comes from a teacher |
| `resource_link_id`, `context_id` | `tba3-material-picker`, `tba3-demo` | Fixed identifiers of the demo |
| `oauth_*` | key, nonce, timestamp, HMAC-SHA1 signature | Signature according to OAuth 1.0a |

The signature is computed in the browser with the Web Crypto API
(`apps/demo/src/utils/ltiOauth.js`). The prototype then writes a form into an
empty popup and submits it. The detour via `about:blank` has a reason: a form
from a `blob:` address would arrive at MUNDO with the origin `null` and be
rejected.

The credentials (tool URL, consumer key, shared secret) are entered in the
dialog. They are listed at `mundo.schule/cms/lti` and stored in
`localStorage`.

### The way back: the selection returns as a form

After the selection, MUNDO posts a form to the `content_item_return_url`. The
prototype receives it at `/lti-callback`: in the development server through a
Vite plugin (`apps/demo/vite.config.js`), in the Docker container through
`tools/mock-server.mjs`. The response is a small HTML page that passes the
form data to the opening window via `postMessage`.

There, `MundoSearchModal.jsx` reads the field `content_items`, a JSON-LD
document with an `@graph`. For each entry the prototype takes over these
details:

| Detail | Source |
|---|---|
| Title | `title`, otherwise `text` |
| Description | `text` |
| Address | `url`, otherwise the SODIX identifier from `custom.mn` → `https://mundo.schule/details/<identifier>` |
| Preview image | `thumbnail['@id']` or `thumbnail.url` |

The detour via the SODIX identifier is needed because MUNDO sends no direct
address with an `LtiLinkItem`. Without it, the material taken over would have
no link.

### What happens to the selection

The hits end up in the same two stores as all other material
(`tba3_external_materials`, `tba3_materials_by_level`) and are immediately
assigned to the competence level or learning group currently selected. From
then on the application treats them like local material: they appear in the
list marked "MUNDO" and are included in the PDF export and in the Common
Cartridge (`.imscc`) for the learning platform.

![List "Assigned materials – Level II" with two materials from the local pool and one entry tagged MUNDO with a link to mundo.schule.](/dokumentation/bilder/mundo-zugewiesen-en.png "A MUNDO hit among the local materials of level II. It is included in both exports, as shown on the page about handing over to the LMS.")

In case LTI is not available there is a second tab. There, the teacher enters
the title, address and description of a material found on mundo.schule by
hand.

![The dialog "MUNDO material search" with the tabs LTI search, Manual and Config. On the left the form for title, URL and description, on the right the list of selected materials with one entry and the button "Take over 1 material".](/dokumentation/bilder/mundo-dialog-en.png "The MUNDO dialog in the “Manual” tab. The selection collects on the right, whether it comes from the LTI search or from the form.")

### What the prototype simplifies

These points would have to be solved for operation. They do not change the
answer to the feasibility question:

- **The shared secret is in the browser.** Anyone who opens the page can read
  it. In operation the signature belongs on a server. Better still would be
  LTI 1.3 with *Deep Linking*, where key pairs replace the shared secret.
- **The way back is missing in the public deployment.** `/lti-callback`
  exists in the development server and in the Docker container. On
  `tba3.vercel.app` the address returns 404 (checked on 14 October 2026), so
  only manual entry works there.
- **`postMessage` goes to any origin (`'*'`).** Acceptable for a demo; in
  operation the target origin is fixed.
- **The assignments live in `localStorage`.** They apply to one device and one
  browser only.

## Why it still achieves little

The prototype shortens the **second** step: a material the teacher has found
lands in the right place without copy and paste. It does not shorten the
**first** step, the finding itself.

The request to MUNDO says nothing about what the search is for. It contains
neither the competence level nor the key idea in which the group did poorly,
nor the task many students failed. LTI 1.1 Content-Item Selection has no
field for a search term either. Custom parameters (`custom_*`) would be
possible, but MUNDO would have to evaluate them. So the teacher faces an empty
search form and has to translate the report into search terms themselves.

For a teacher who knows exactly what they are looking for ("fractions, grade 6,
worksheet"), the route is convenient. For the actual question after the report
("what helps a group that is at level II in *measuring*?") it offers nothing
they would not also have in a second browser window.

For the report itself to trigger the search, both sides would have to speak
the same language. Today they do not, on either side.

### Gap 1: the reports name their competences only as codes

The API provides for competence information: every item carries
`competences` with type, name, description and `id`. In the sample data of
the reference server, on which the demo application runs, these fields are
filled as follows:

| Field | Content in the sample data |
|---|---|
| `domain` (sub-area) | two-letter codes (`le`, `ho`, `zo`, `gm`, `ms` …), `id` always `null` |
| `competences[].name` | codes such as `3.3.b`, `1.09m`, `L4`, `K2` |
| `competences[].description` | not filled in a single entry |
| `competences[].id` | always `null` |
| `competenceLevel.id` | always `null` |

So the key idea is there, just as `L4`. The problem is that such a code only
means something together with its reference system. Looking it up makes this
obvious. In MEM, the notation `3.3` is carried by 39 different standards from
38 competence catalogues, from "Texte erschließen" (German, primary) to
"Wirkung von Katalysatoren" (chemistry). Even the mathematics key ideas are
not unambiguous. The 2004 educational standards count them as L1 to L5
("Leitidee Zahl", "Leitidee Messen" …). The 2022 version numbers them 1 to 5
and draws the lines differently ("Zahl und Operation", "Größen und Messen" …).
The code alone does not say which of the two versions is meant, and the API
sends no description or identifier that could settle it.

### Gap 2: the media library is not indexed by educational standards

Even with an unambiguous key idea, MUNDO would find nothing *about* the key
idea. The metadata model the MUNDO interface works with contains these
fields: learning resource type, educational level, school type, grade, subject,
licence, keywords and author. There is no field for a curriculum, an
educational standard, a key idea or a competence. This was checked against
the code delivered by mundo.schule on 14 October 2026. Whether SODIX holds more
internally than the interface shows has to be confirmed by the SODIX team.

What remains is full-text search over title, description and keywords. A
material on lengths and areas is listed under "Flächeninhalt" or "Umfang",
hardly under "Leitidee Messen". A search using the key idea as a term
therefore produces only chance hits.

## Could MEM be the intermediate layer?

[MEM](https://mem.schule/) (Metadata for Education Media) is an ontology server
of FWU. It models curricula in a shared ontology and can be reached through a
public SPARQL endpoint (`sparql.mem.edufeed.org`) and an MCP server
([`FWU-DE/mem-mcp`](https://github.com/FWU-DE/mem-mcp)). The question was
whether MEM can bridge both gaps: codes from the report going in, searchable
terms for the media library coming out.

### What MEM provides

Besides the curricula of five states (Bavaria, Saxony, Rhineland-Palatinate,
Brandenburg, Berlin), MEM contains a graph of its own with the **KMK
educational standards in the IQB's version**
(`https://w3id.org/lehrplan/bistas`). It comprises about 6,700 concepts as a
SKOS vocabulary, each with a stable address under `w3id.org/iqb/`, a notation
and a label. The subjects range from German and mathematics through the
foreign languages to the sciences, the levels from primary to upper secondary,
in the 2004 and 2022 versions.

The mathematics key ideas of the sample data are all there:

| Code in the report | Concept in MEM | Address |
|---|---|---|
| `L1` | Leitidee Zahl (number) | `w3id.org/iqb/bista04-ma-s1/ie/7dd44a45-…` |
| `L2` | Leitidee Messen (measuring) | `w3id.org/iqb/bista04-ma-s1/ie/3daa740c-…` |
| `L3` | Leitidee Raum und Form (space and shape) | `w3id.org/iqb/bista04-ma-s1/ie/44130980-…` |
| `L4` | Leitidee Funktionaler Zusammenhang (functional relationships) | `w3id.org/iqb/bista04-ma-s1/ie/0e22ccfe-…` |
| `L5` | Leitidee Daten und Zufall (data and chance) | `w3id.org/iqb/bista04-ma-s1/ie/ccabc0a7-…` |

So the vocabulary in which report and material could meet already exists. It
is openly accessible, and it comes from the IQB, which also develops the
tests.

### How far the codes get

For every combination of subject and grade in the sample data, the competence
codes were matched against the corresponding catalogues in MEM. The table
counts the version with the most hits:

| Subject, grade | Kind | Codes | found in MEM | Version |
|---|---|---|---|---|
| Mathematics 8 | key idea | 5 | 5 | 2004 |
| Mathematics 8 | general competence | 6 | 6 | 2004 |
| Mathematics 8 | competence | 31 | 0 | – |
| Mathematics 3 | competence | 47 | 27 | 2004 |
| German 8 | competence | 19 | 14 | 2004 |
| German 3 | competence | 11 | 0 | – |

The coarse levels (key idea, general competence) can be resolved as soon as
the version is known. The fine item codes (`1.09m`, `3.3.i`) follow, in two
cases, a numbering that does not occur in the published standards. Where they
were found, only the notation matches so far. Whether the same standard is
meant was not checked.

### What the bridge lacks

```
Report               MEM                          Media library
──────               ───                          ─────────────
"L2"  ──── ✗ ────▶   Leitidee Messen      ──── ✗ ────▶   material
         version     w3id.org/iqb/…                indexing
         missing                                   missing
```

1. **The report has to say which concept is meant.** The field for it already
   exists: `competences[].id` is part of the specification and is empty today.
   If it carried the `w3id.org/iqb/…` address, the first gap would be closed
   without changing the API. This concerns test development and the
   specification in `indibit-eu/tba3`, not the front end.
2. **The material has to be indexed with the same concepts.** MEM does not
   help here. The ontology describes curricula and standards but does not link
   them to media. As long as MUNDO materials carry no educational standards,
   even the best address finds nothing. This is the expensive part: an
   editorial or machine-assisted re-indexing of the collection.
3. **In MEM there is no path from a standard to a state curriculum.** No
   curriculum of the five states refers to an educational standard there. If
   material is indexed by state curriculum, this detour does not lead from the
   report to the material either.

### What MEM could do today

One thing can be improved even without the two missing parts: MEM turns the
codes into words. Instead of "L2" the application shows "Leitidee Messen" and
can offer the teacher the labels of the standards below it as search
suggestions. That turns the empty search form into a pre-filled one. For this
to work, the application has to know the version (fixed per test), and MUNDO
has to accept a search term at launch. The search becomes more accurate only
as far as full-text search reaches. It remains an aid for phrasing the search,
not an assignment.

## What follows

- **As a convenience feature the integration is worth it.** Anyone searching
  for something specific saves copying, and the material ends up in the
  export. For operation, the signature belongs on a server and the way back
  must also work in the public deployment.
- **"Matching material for the report" should not be promised** as long as
  both gaps are open. A button that looks like a recommendation and opens an
  empty search form disappoints the first time.
- **The cheapest lever is on the report side:** fill `competences[].id` with
  the IQB address. It costs little, the field already exists, and every later
  connection to a media library, to MEM or to the materials draft benefits.
- **The expensive lever is with the media library:** index material by
  educational standards. Without this step, any intermediate layer has nothing
  to connect to.
- **The materials draft avoids both gaps.** `/materials` attaches material
  directly to an item, a competence or a level, at the place where the test is
  made. Then nothing has to be searched, because the assignment was already
  made when the test was created. The demo application shows this route in the
  third mode of the "Learning materials" tab, next to the MUNDO route.
