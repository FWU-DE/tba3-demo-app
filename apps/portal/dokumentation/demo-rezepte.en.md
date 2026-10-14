<!-- Übersetzung von demo-rezepte.md, sha256:9bc350e4d417474593a5eafaac5fbfd3ccc3535b282010979b65b7b764181b2c -->

# TBA3 demo application: recipes

The [recipes for the interface](rezepte.md) answer which request fits which
question. This is the other half: what a user interface does with the answers.
The examples come from this repository's demo application, but they describe
patterns, not components — each of them can be rebuilt in another application.

This document belongs to this site and is maintained here, not in
`indibit-eu/tba3`.

## Showing individual results without showing names: observer mode

### The situation

Analyses at the individual level are rarely read alone. They are on the
projector in the class conference, they go through a video call as a shared
screen, they sit in a screenshot attached to a bug report — and someone is
watching who is authorized to see the numbers, but not the names behind them.

The obvious answer — just don't show the individual level in such situations —
ends the conversation before it starts. Anyone discussing support needs needs the
individual row; the distribution across the group says nothing about that. So
what is needed is not less content, but the same content without the name.

### The toggle

For this, the header of the demo application has a toggle with an eye, labeled
“Names” or “Observer” (`apps/demo/src/components/layout/Header.jsx`). One click
switches the entire application — not a single view, because the projector shows
the next one too.

The state lives next to the filters in `FilterContext`
(`apps/demo/src/context/FilterContext.jsx`), because every view that shows names
already depends on that context:

```jsx
const { observerMode } = useFilters();

<span className={observerMode ? 'blur select-none' : ''}>
  {student.firstName} {student.lastName}
</span>
```

Two classes, not one: `blur` softens the text, `select-none` keeps anyone from
selecting the illegible name with the mouse and dragging it to the clipboard.

![Student list in observer mode: gray smears where the names would be; next to them, learning group, subject, grade, and competence level remain readable.](/dokumentation/bilder/observer-liste-en.png "The student list with observer mode switched on. Only the first column is blurred; learning group, subject, grade, and competence level stay — otherwise the view would be worthless for the conversation it was opened for.")

### What gets hidden

| Place | normally | in observer mode |
|---|---|---|
| Student list | first and last name | blurred |
| Member list of a custom group | first and last name | blurred |
| Selection list in the group editor | first and last name | blurred |
| Data sheet (modal and full view) | name as heading | blurred |
| Student map, point label | initials (`AM`) | `••` |
| Student map, tooltip | name | blurred |

The point label is the case where the simple approach is not enough: even
blurred, two initials are still two characters in a known position, and in a
class of twelve that is as good as the name. So they are replaced instead of
blurred (`StudentMapCard.jsx`) — where the masking has little material to work
with, it has to take the material away.

### What stays visible on purpose

Class, subject, grade, competence level, and the covariates stay readable. That is
the point of the exercise: what is hidden is the person, not the result.

This also says what the mode does not protect against. Anyone who knows the class
can often infer the person from class, gender, and language spoken at home — in a
group of twelve, one covariate is sometimes enough. Observer mode protects against
the gaze of someone who does *not* know the group: against the projector in a full
room, the shared screen, the screenshot. No anonymization that leaves the results
in place protects against the colleague who teaches the class.

### What the mode does not do

- **The name is still in the DOM.** `blur` is a display filter, not a redaction:
  in the developer console, in the page source, and for screen readers, the name
  is there unchanged. That is the line between “not visible” and “not present”,
  and the mode is on the first side of it.
- **The export carries the real name.** The PDF of an individual report writes the
  name and file name unchanged (`apps/demo/src/utils/studentPdfExport.js`), even
  with observer mode switched on. This is defensible because a report goes to the
  person themselves, and a nameless PDF would be useless there — but so far it has
  not been an explicit decision. Anyone adopting the pattern should make it
  deliberately.
- **The toggle does not survive a reload.** It lives in `useState`, not in the
  address bar: after `F5` the names are back, and a shared deep link does not
  carry the mode. For a toggle flipped during a conversation, that is workable; as
  the default for an “observer” role it would not be enough.

### Where the boundary really lies

With the delivering system. The interface does not require a real name: `name` on
the value group is described in the specification as “label of the value group”,
and the example there is already `Schüler 1`. Whether a response with
`type=students` carries a name, an abbreviation, or a pseudonym is therefore
decided by whoever delivers it — not by the user interface that displays it. For
value groups and `type`, see the [endpoint reference](endpunkt-referenz.md).

The demo application itself has no real names at all: it invents them
deterministically in the browser (`apps/demo/src/utils/studentData.js`) so that a
user interface with names can be seen at all. So observer mode protects nothing
here — it shows a pattern that would have something to protect in a real
application.

This gives the order for a real project:

1. Don't deliver names where none are needed — pseudonymization belongs in the
   backend, not in a CSS filter.
2. Show names only where the role needs them (the class teacher needs them, the
   school supervisory authority does not).
3. And for the moments when someone is watching, add a toggle like this one.

Observer mode is step 3. It does not replace steps 1 and 2.

### Building it yourself

Three ingredients, independent of the framework:

1. **A flag in a place every view already knows** — context, store, whatever the
   application has. A separate toggle per view would be wrong: whoever flips it
   wants it flipped everywhere.
2. **A rule for what it affects.** The short version: the name, nothing else.
   Everything else is result and should stay readable.
3. **Special handling for short forms.** Initials, abbreviations, avatars with
   letters — wherever few characters sit in a fixed position, replace instead of
   blurring.

And a fourth that is easily forgotten: a test that checks both — that the name is
hidden *and* that the result next to it is still there. In this repository,
`e2e/demo-schueler.spec.js` does that against the shipped build.

## A report that leaves the building: PDF export

### The situation

An analysis that exists only in the browser does not help at a parent-teacher
meeting, nor in the class teacher's binder. At some point something has to come
out that can be printed, passed on, and filed — and that is still readable
without the application.

The demo application produces two PDFs. They look alike because they use the same
drawing helpers, but they answer different questions:

| | individual report | material assignment |
|---|---|---|
| Trigger | button in a person's data sheet | button in the materials view |
| Module | `studentPdfExport.js` | `pdfExport.js` |
| Scope | one page per person | one page per group, plus divider pages |
| Content | competence level reached, results by sub-domain, recommended materials | assigned materials by competence level |
| File name | `Rueckmeldung_{Nachname}_{Vorname}.pdf` | `tba3_{Gruppe}_{Datum}.pdf` |

![An A4 page: a blue band with the student's name at the top, below it a colored box with the competence level reached, a list of sub-domains each with its own level, and three material cards with QR codes.](/dokumentation/bilder/pdf-rueckmeldung-en.png "The individual report. The name is in the header — observer mode deliberately does not apply here. The footer marks the addresses as demo URLs.")

![An A4 page titled “By competence level”, below it a colored bar for the competence level and three material cards with QR codes.](/dokumentation/bilder/pdf-materialzuordnung-en.png "The material assignment, here the section for one competence level. Both outputs share header, footer, material card, and QR code — which is why they look alike even though they come from different modules.")

Alongside them, the same content is available as a Common Cartridge (`.imscc`,
`commonCartridgeExport.js`) — for the learning management system instead of the
printer. The PDF is the output for people, the cartridge the one for machines;
anyone who builds only one of them is almost certainly building the wrong one.

### Everything in the browser, nothing on a server

Both outputs are created in the browser. Not a single byte of the report goes to a
service for this; there is no export endpoint and no intermediate storage on
third-party infrastructure — what leaves the device is the file in the download
folder.

This is not a side issue but the reason this design is an option for individual
data at all. A server-side PDF service would have to receive names and results,
and that would start an entirely different discussion — data processing
agreements, retention, deletion periods. Anyone who later moves the export to a
server after all is shifting more than computing load.

### Loaded only on click

jsPDF is large. So it is not part of the bundle loaded at startup, but only
arrives when someone actually exports:

```jsx
const handleDownloadPDF = async () => {
  setPdfLoading(true);
  try {
    const { exportStudentPDF } = await import('../../utils/studentPdfExport');
    await exportStudentPDF(student);
  } finally {
    setPdfLoading(false);
  }
};
```

For scale: the demo application's main bundle is around 870 KB, the lazily loaded
chunk with jsPDF and the QR generator around 410 KB, the one for the Common
Cartridge around 100 KB. Bundled statically, the first page load would grow by
more than half — for a feature most visits never touch.

The `finally` is part of it: without it, the button would stay in its loading
state forever after an error.

A lazily loaded chunk brings its own source of failure — it can be missing from
the build or sit under the wrong path, and neither shows up during development.
The E2E tests therefore wait for the download event
(`e2e/demo-schueler.spec.js`, `e2e/demo-materialien.spec.js`): a file that
arrives is also proof that the chunk is being shipped.

### The language is fetched on click, not when the module loads

The labeled constants live at module level, but are fetched again at the start of
every export:

```js
let { COMPETENCE_LEVELS, GRADES, SUBJECTS } = konstantenJetzt();

export const exportStudentPDF = async (student) => {
  ({ COMPETENCE_LEVELS, GRADES, SUBJECTS } = konstantenJetzt());
  // …
};
```

This looks like double work and is the heart of the matter: the module is loaded
on the first export, and the language can still be switched afterward. Without the
second line, the PDF would show the language that was active at the first click —
and nobody would think to blame the time the module was loaded. Everything
translated outside a component therefore calls `uebersetze()` at call time
instead of at import time.

### What the standard font can do — and what it can't

jsPDF ships with PDF's 14 standard fonts; Helvetica is used. It covers Western
Europe: umlauts, accents, and ß come out correctly. Emoji do not come out — they
come out as garbage, and the material types in the demo application carry some in
the user interface.

So every string passes through `safe()` before it goes into the PDF:

```js
export const safe = (str) =>
  String(str ?? '').replace(
    /[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]|[\u{FE00}-\u{FE0F}]|\u{FEFF}/gu,
    ''
  ).trim();
```

That is the cheap solution and the right one for this purpose: emoji are
decoration here. But as soon as names come into play that don't fit into WinAnsi —
Cyrillic, Greek, Turkish ı, Polish ł — throwing characters away no longer helps,
because then you are throwing away the name. Then there is no way around an
embedded font (`pdf.addFileToVFS` and `pdf.addFont`), and the bundle grows by the
font file. For a project with real student data, that is the default, not the
exception.

### QR codes up front, because drawing is synchronous

Every material card carries a QR code. Generating it is asynchronous, placing it
in the PDF is not — `pdf.addImage` does not accept a promise. So the codes are
generated before the drawing loop starts:

```js
const qrCodes = await Promise.all(
  materialien.map((m) => generateQR(m.url || getMaterialUrl(m)).catch(() => null))
);
```

Two decisions in two lines: all at once instead of one after another, and a
`catch` that returns `null`. A QR code that fails leaves the card without an
image — it does not make the whole export fail. For an operation someone started
and is waiting on, partial output is almost always better than an error message.

Where the codes point to is explicitly nothing in the demo application:
`https://tba3.bildung.example/materialien/{id}` is a placeholder address, and the
footer of every page says so — “Demo-URLs – keine echten Links” (“demo URLs – not
real links”). A printout outlives its occasion by years; a dead link in it that is
not marked as such misleads someone who has long forgotten where the sheet came
from.

### Page breaks are computed by hand

jsPDF has no text flow. There is a pointer `y`, and whoever draws moves it
forward. Whether the next block still fits on the page has to be checked
**before** drawing:

```js
if (y + CARD_H > PAGE_H - 16) {
  drawFooter(pdf, datum);
  pdf.addPage();
  y = MARGIN;
}
drawMaterialCard(pdf, material, y, qrCodes[i]);
y += CARD_H + 4;
```

The footer is drawn on the **old** page before the new one begins. Anyone who
wants to set all footers in one go at the end has to walk through every page
again — and forgets the last one. The block heights are therefore constants
(`CARD_H`, `LEVEL_BAR_H`, `HEADER_H`) rather than numbers in the drawing code: a
card height maintained in two places will eventually break the page in the wrong
spot.

### What the export does not do

- **Observer mode does not apply.** The individual report carries the real name in
  the header and in the file name, even while the user interface is blurring every
  name. For a report to the person themselves, that is right — a nameless sheet
  could not be matched to anyone. As a *silent* exception to a protection someone
  switched on, it is still a decision that should be made explicitly; see
  [observer mode](demo-rezepte.md#what-the-mode-does-not-do).
- **The file is checked, not its content.** The E2E tests show that a click
  produces a PDF file with the expected name. Whether the correct competence level
  is in it, no test checks — that would require reading the PDF back. Anyone
  securing the content is best off doing so one level down, at the functions that
  prepare the values.
- **There is no preview.** The click creates the file and starts the download;
  what is in it only shows up in the viewer.

### Building it yourself

1. **Load only on click.** A PDF library does not belong in the bundle every visit
   pays for.
2. **Translate at call time, not at import time.** Otherwise the output freezes the
   language of the first click.
3. **Settle the font before the content.** Which characters can appear in the
   document decides whether the standard font is enough — and that question is
   asked before the first layout, not after the first report of broken names.
4. **Everything asynchronous before the drawing loop.** Images, QR codes, lazily
   loaded data — the loop itself stays synchronous and therefore readable.
5. **Partial output beats an error message.** What decorates may be missing; what
   carries meaning must be there.

## An assistant that can read the results: the MCP server

> **A pilot, not a product.** What is described here came out of the feasibility
> study and answers one question — *is this possible at all, and what would it
> take?* — and no other. It is not a recommendation for operation, not part of the
> interface, and nothing a project should rely on without first answering the
> questions in the section “What real operation would have to solve”.

What this looks like for teachers is shown in the sub-concept
[An assistant that can read the results](machbarkeitsstudie-assistent.md),
with three conversations as a mockup.

### The idea

An analysis interface answers the questions someone anticipated when designing the
user interface. “Which task formats in 8b are below the state average, and is there
material for them?” is not one of them — the question cuts across three endpoints
and a catalog, and building a view for every such combination never ends.

The Model Context Protocol reverses the direction: instead of anticipating the
question, you describe the available queries to the language model, and it
combines them. The pilot tests whether the TBA3 endpoints can be described in a
way that produces something useful.

### What the server offers

Seven tools (`mcp-server/server-impl.js`). How to start and connect them and which
environment variables exist is in the package README; here is what is behind them:

| Tool | behind it |
|---|---|
| `tba3_list_entities` | schools, learning groups, federal states — built in, not from the interface |
| `tba3_list_subjects` | the four subjects |
| `tba3_list_grades` | grade 3 and grade 8 |
| `tba3_get_competence_levels` | `GET /{ebene}/{id}/competence-levels` |
| `tba3_get_aggregations` | `GET /{ebene}/{id}/aggregations` |
| `tba3_get_items` | `GET /{ebene}/{id}/items` |
| `tba3_list_materials` | a built-in materials catalog, not an endpoint |

Four answer “what is there?”, three “what does it look like?”. This split is the
reason the whole thing works at all: a model that has to guess an identifier like
`8b-mathe` will guess — plausibly and wrongly. The three `get` tools pass through
to the interface, each with `entityType`, `entityId`, and the `type` parameter.

The demo application's help view lists only six of them: `tba3_list_materials` is
missing from its table. Two lists that can drift apart are one too many — anyone
extending the server should also update the view in
`apps/demo/src/components/HelpView.jsx`.

### Two ways in

The same server (`createMcpServer()`), two transports:

- **stdio** (`index.js`) — the route for a development environment on the same
  machine. The client starts the process itself; there is no port and no network
  boundary.
- **Streamable HTTP** (`server-http.js`) — the route for a deployment. `POST /mcp`,
  deliberately without a session (`sessionIdGenerator: undefined`): each request
  creates a server instance that disappears afterward. This makes the service
  arbitrarily scalable and also means it remembers nothing — including anything it
  could use to recognize a caller.

That the core knows nothing about either is the real work behind this split: the
tools are described once, and the mode of operation decides which transport
carries them.

### Where it runs — and where it doesn't

In the **Docker image**: `docker-entrypoint.sh` starts it on port 3000, nginx
passes `/mcp` through to it, and `TBA3_API_BASE_URL` points by default to the mock
in the same container. The image is also built separately
(`ghcr.io/FWU-DE/tba3-demo-app-mcp`) so the server can be run without the site.

![The “Help” tab of the demo application: the MCP server heading, below it a box on running the MCP server in Docker with the example command for the container.](/dokumentation/bilder/mcp-hilfe-en.png "The help tab of the demo application explains how to connect. Below it — cut off here — is the client configuration with an address built from `window.location.origin`: on the public site it therefore points nowhere.")

**Not** on the public deployment: `vercel.json` has no `/mcp` route, and there is
no function there that would speak MCP. The help view, however, builds the address
from `window.location.origin` — so on the public site it shows an address nobody
answers, unless `VITE_MCP_HTTP_URL` is set to a real deployment at build time.
Anyone demonstrating the pilot demonstrates it from the container, not from the
browser.

### What real operation would have to solve

The pilot answers the technical question with yes. The questions it leaves open
are the harder ones — and they are not leftover work but groundwork:

- **There is no authentication.** Whoever reaches `/mcp` reaches every learning
  group, every school, every state. The pilot is protected by nothing but the
  reachability of its container.
- **There is no caller.** The server calls the interface without any identity. So
  it could not restrict anything to “your class” even if it wanted to — a role and
  permission layer is not missing, it is not provided for.
- **Individual data goes to a language model.** All three data tools accept
  `type=students`. Whatever comes back goes to the client and thus to the model
  behind it — depending on the setup, to a third-party service. That is the
  decision that belongs before the first line of code, not after the prototype;
  see [observer mode](demo-rezepte.md#where-the-boundary-really-lies), where the
  same boundary is described from the other side.
- **The server is untested.** `mcp-server/` is deliberately not a workspace — its
  own lockfile, its own Docker context — and so it is not covered by `npm test`
  either. Acceptable for a pilot; not for a service that hands out results data.
- **The directory is built in, not queried.** Learning groups, schools, subjects,
  grades, and the materials catalog are in `server-impl.js`. For the pilot that is
  right, and the README explains why: a tool that first has to make a request to
  say which requests are possible helps nobody. What remains open is where a real
  server would get the directory from — the interface has no endpoint that lists
  learning groups, and for a caller without an identity the answer would not be
  unambiguous anyway.

### What to take away from it

Regardless of whether an MCP server is the end result:

1. **Lookup tools first.** A model that has to guess identifiers will guess. The
   three list tools cost little and noticeably change the hit rate.
2. **One tool per endpoint**, not one tool per question. The questions come
   differently than anticipated anyway — that was the whole point.
3. **Separate the core from the transport.** What the tools do has nothing to do
   with stdio or HTTP, and separated, both can be operated.
4. **The data protection question comes first**, not last. A prototype that already
   hands out individual data has made the decision silently.

The practical side — starting, environment variables, connecting to Claude Code or
Cursor, the image from CI — is in the
[README of the MCP package](https://github.com/FWU-DE/tba3-demo-app/blob/main/mcp-server/README.md).
