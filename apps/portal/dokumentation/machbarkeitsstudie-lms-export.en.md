# Handing a material collection to the LMS: Common Cartridge and PDF

Examined in the
prototype in the "Learning materials" tab of the demo application and with an
import into Moodle 4.5 on 14 October 2026.

## Result

- **Feasible, and with no server involved.** A teacher collects material for a
  report, per competence level or per group. The demo application outputs this
  collection in two ways: as a **Common Cartridge** (`.imscc`) for the
  learning platform and as a **PDF** for paper and filing. Both files are
  created in the browser; nothing from the report leaves the device for this.
- **The import into Moodle only worked after a correction.** In the version
  the prototype was built with, Moodle rejected the cartridge. It carried the
  identifier of Common Cartridge 1.3, which Moodle does not know, and the
  manifest violated the schema. Both are fixed: the demo application now
  writes Common Cartridge 1.1, and Moodle creates a course from it without any
  rework.
- **The cartridge carries the structure and the links, not the material
  itself.** In Moodle, each competence level arrives as a heading and each
  material as a page with description and link. Files, interactive tasks or
  videos are not included, because the demo application itself knows them only
  as references.
- **The PDF is the more robust route.** It needs no learning platform and no
  permissions there, and it can be read without the application. In return,
  nothing in it can be edited further.

## The question

A report shows where a learning group stands. A selection of material follows
from it: exercises for the group at level II, support material for level I,
something to go deeper for level IV. But the work with this material does not
happen in the report. It happens in the school's learning platform or on
paper.

The question was whether such a collection can be handed over so that it
arrives there without retyping and keeps its order, that is, which material
belongs to which level.

## Collecting material

Collecting happens in the "Learning materials" tab. It has three modes, and
all three write to the same store from which the export is made.

**By competence level.** The teacher picks a level. The tiles show how many
students of the selected group are at that level; the numbers come from the
API (`/competence-levels`).

![Five tiles for competence levels I to V with number and share of students; level II is selected.](/dokumentation/bilder/lms-stufen-en.png "Picking a level for the learning group 3a German. The assignment applies to all students at that level, not to individuals.")

Below are the materials that fit this level. One click on a card selects it, a
second click deselects it. Nothing is assigned until the button below is
pressed. "Search MUNDO" adds material from the media library; how that works
is described on the page
[Integrating media libraries](machbarkeitsstudie-mediatheken.md).

![Three material cards, two of them ticked, below them the button "Assign 2 materials". Top right, the button "Search MUNDO".](/dokumentation/bilder/lms-auswahl-en.png "Selecting and deselecting material: two cards are selected, nothing is assigned yet.")

**By group.** Instead of a level, the material is attached to a custom group
the teacher created beforehand in the "Students" tab, such as a support group
of five names.

**From the API.** The `/materials` draft delivers material that was attached
to levels, competences or tasks when the test was created. Whatever is
unambiguously assigned to a level there, the application takes over at the
press of a button.

The assignments live in the browser's `localStorage`
(`tba3_materials_by_level`, `tba3_external_materials`). The export box at the
end of the tab counts what has been collected and offers the two outputs.

![The "Export" box: three materials by competence level, zero by group, below it the buttons "All as .imscc" and "All as PDF".](/dokumentation/bilder/lms-export-en.png "The export combines both modes. Without an assignment, both buttons are disabled.")

## Route 1: Common Cartridge for the learning platform

### What a Common Cartridge is

IMS Common Cartridge is an open standard by 1EdTech (formerly IMS Global) for
exchanging course content between learning platforms. A cartridge is a ZIP
archive with the extension `.imscc`. It contains the content and a file
`imsmanifest.xml` that structures it. Moodle, Canvas, itslearning and other
platforms can import cartridges, but they do not all support every version or
every kind of content.

### What the demo application writes into it

The file is created in `apps/demo/src/utils/commonCartridgeExport.js` with
JSZip, which is only loaded on click. For the selection above (two materials
and one MUNDO hit at level II, one at level III) the archive looks like this:

```
tba3_alle_klassen_2026-10-14.imscc
├── imsmanifest.xml
└── content/__level_export__/
    ├── stufe_II/
    │   ├── mat-de-v3-01.html
    │   ├── mat-de-v3-02.html
    │   └── mundo-1791964302358-tjskw.html
    └── stufe_III/
        └── mat-de-v3-02.html
```

Each material becomes an HTML page of its own with title, type, duration,
subject, grade, target competence levels, description and direct link. The
manifest arranges the pages in three levels: group, competence level,
material.

```xml
<manifest identifier="tba3_cc_export"
  xmlns="http://www.imsglobal.org/xsd/imsccv1p1/imscp_v1p1" …>
  <metadata>
    <schema>IMS Common Cartridge</schema>
    <schemaversion>1.1.0</schemaversion>
    <lom:lom …>  <!-- title, language, description -->
  </metadata>
  <organizations>
    <organization identifier="tba3_org" structure="rooted-hierarchy">
      <item identifier="root">
        <item identifier="org_group___level_export__">
          <title>By competence level</title>
          <item identifier="org___level_export___level_II">
            <title>Competence level II  –  Minimum standard</title>
            <item identifierref="res___level_export___II_mat-de-v3-01">
              <title>Lesen üben: Satzverständnis</title>
            </item>
            …
  <resources>
    <resource identifier="res___level_export___II_mat-de-v3-01"
              type="webcontent"
              href="content/__level_export__/stufe_II/mat-de-v3-01.html">
      <file href="content/__level_export__/stufe_II/mat-de-v3-01.html"/>
    </resource>
    …
```

Labels and pages follow the language set at the moment of the click. The
titles of the materials come from the data and stay as they are.

### The test in Moodle

For the study, Moodle 4.5.4 was set up locally in Docker (images
`bitnamilegacy/moodle:4.5` and `bitnamilegacy/mariadb:11.4`). The import went
through Moodle's restore, which converts cartridges into a Moodle backup before
importing. A teacher takes the same route via *Course → More → Restore*. In
the default configuration the "Teacher" role may do this in their own course;
no admin is needed.

The first attempt with the prototype's file failed twice:

| Step | Moodle's message | Cause |
|---|---|---|
| Detecting the format | "Format: unknown", the import stops | The manifest carried the namespace of **Common Cartridge 1.3**. Moodle 4.5 only recognises 1.0 and 1.1 (`backup/converter/imscc1`, `imscc11`). |
| Checking the schema, after switching to 1.1 | `Element 'title': This element is not expected. Expected is one of (item, metadata)` | The `<organization>` carried a `<title>` of its own. The schema requires exactly one root `<item>` there. |

Both are now fixed in the export: the identifier of 1.1 instead of 1.3, and a
root `item` without a title. Nothing is lost with 1.1, because the cartridge
contains only web pages and a structure, and this version covers that
completely. A unit test
(`apps/demo/src/utils/__tests__/commonCartridgeExport.test.js`) pins both.
After that, Moodle imported the **unmodified** file from the demo application,
in German and in English:

![Moodle course page "Class 3a German – material after VERA". In the "General" section, the headings "Competence level II – Minimum standard" and "Competence level III – Standard", each followed by the materials as pages.](/dokumentation/bilder/lms-moodle-kurs-en.png "The imported course in Moodle 4.5. We gave the course its name during the import; the structure comes from the cartridge.")

![Moodle page "Area of rectangles" with the labels MUNDO (external) and Level II: Minimum standard, the direct link to mundo.schule and the line "Assigned to".](/dokumentation/bilder/lms-moodle-seite-en.png "A material as a page. The link leads to MUNDO; the material itself is not in Moodle.")

| In the cartridge | In Moodle |
|---|---|
| Group (`By competence level`) | a line of text at the top of the "General" section |
| Competence level | text and media area (label) as a heading |
| Material (`webcontent`, HTML) | "Page" activity |
| LOM title and description | not shown |

To smooth out before real use; none of them prevents the import:

- **Everything ends up in one section.** Moodle does not turn the levels of
  the structure into course sections but into headings within "General".
- **"Folder" appears before each level.** Moodle's converter puts a folder icon
  in front of the label, and the image for it is missing in Moodle 4.5. So
  what you see is the alt text. This is down to Moodle, not the cartridge.
- **Part of the page design is lost.** Moodle takes over the content of the
  pages but not their embedded stylesheet. The coloured tags remain; spacing
  and boxes do not.

Other learning platforms (itslearning, Canvas, ILIAS, the states' own
platforms) were not tested. Common Cartridge 1.1 is considered the most widely
supported version, so an import there is likely, but not proven.

### What the cartridge does not do

- **It does not contain the material.** Each page points to a material that
  lives elsewhere. For MUNDO that is the detail page in the media library; for
  the demo application's sample materials it is a placeholder address. A
  cartridge can also carry files and tasks (QTI), but for that the application
  would have to own the material itself.
- **In level mode it names no learning group.** The group is then called "By
  competence level", not "3a German". The teacher names the course during the
  import.
- **It assigns nothing to anyone.** In Moodle the levels become headings, not
  groups. Who gets which material has to be set again there by the teacher,
  for example with groups and restrictions. Personal data is deliberately not
  in the file.
- **It is a copy.** If the assignment changes in the report, the course stays
  as it was imported. A live connection between report and learning platform
  would be LTI, not Common Cartridge.

## Route 2: PDF for paper and filing

The same export box creates a PDF: one page per group, with the materials by
competence level, each as a card with type, duration, description, target
levels, address and QR code. The PDF is created with jsPDF in the browser,
also only loaded on click.

![An A4 page headed "By competence level", a bar "Competence level II – Minimum standard" and three material cards with QR codes, the MUNDO hit among them.](/dokumentation/bilder/lms-pdf-en.png "The material assignment as a PDF. The QR codes of the sample materials point to placeholder addresses, as the footer says; the MUNDO hit carries its real address.")

The PDF is meant for parent meetings, the form teacher's folder or the
colleague who has no access to the report. It needs no learning platform and
no permissions there. The QR code takes students from the worksheet to the
material. How the file is built (font, page breaks, QR codes, and why none of
it happens on a server) is described in detail in the
[demo application recipes](demo-rezepte.md#a-report-that-leaves-the-building-pdf-export).

There is also a second PDF, the **individual report** for a single person,
created from the data sheet in the "Students" tab. It contains the level
reached, the results by sub-area and the matching materials.

## Both routes side by side

| | Common Cartridge | PDF |
|---|---|---|
| For | the learning platform | paper, filing, passing on |
| File | `.imscc` (ZIP with manifest and HTML pages) | `.pdf`, one page per group |
| Order | group → competence level → material, as headings in Moodle | group → competence level → material, as sections |
| Material | as a page with a link, not the material itself | as a card with link and QR code |
| Further editing | yes, in the course on the learning platform | no |
| Needs | permission to restore in the course | nothing |
| Checked | import into Moodle 4.5 | E2E test: the file arrives |
| Personal data | none | none (the individual report carries the name) |

## What follows

- **Handing over to the learning platform is feasible with an open
  standard**, without an interface to the platform and without a server. For
  Moodle this is now proven.
- **Common Cartridge 1.1 is the right version.** The newer 1.3 adds nothing for
  this content and locks Moodle out. Anyone developing the export further
  checks every change with a real import, because a cartridge that is merely
  well-formed can still be rejected.
- **The cartridge would be better with web links instead of pages.** Common
  Cartridge has web link resources of its own (`imswl`), which Moodle creates
  as a "URL" activity. One click would then lead straight to the material
  instead of to a page with a link. The assignment to the level would not be
  lost, because the level is already in the structure.
- **The export should pass on the name of the learning group.** "By competence
  level" as a group name is a quirk of the demo application, not a limit of
  the format.
- **Only with material the application owns does the cartridge carry
  content.** This is the same limit as with the
  [media libraries](machbarkeitsstudie-mediatheken.md): as long as material is
  known only as a reference, even the best handover can only hand over
  references.
