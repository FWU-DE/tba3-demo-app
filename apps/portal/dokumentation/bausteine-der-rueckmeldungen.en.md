# Building blocks of the reports

Eleven reports, four institutions, five technologies — and again and again the
same displays under different names. This document extracts what can be reused:
not the code, but the **design**. Which display answers which subject question,
and where does it get its data?

The basis is the progress report of the steering group's closing meeting on 15 September 2026,
in which the four developing institutions brought their results together. The
reports are built with Vue 3 and Quasar, Vue 3 and Pinia, React 19 and
Material-UI, Angular 21 and ECharts, and vanilla JavaScript with Tabulator and
D3. That is exactly why no technology appears here: what five implementations
have in common is the statement, not the framework.

> **Every assignment names its evidence.** “Named by” means the institution
> described the building block itself. “Found at” means it was found in the
> running demo or the open source code — the progress reports are summaries and
> by no means name everything that was built. Whatever has neither does not
> appear here.

The survey at the artefact ran on 15 September 2026: all ten demos opened in the
browser, plus shallow clones of the four open repositories and a read through
their component directories. indibit's repository was not yet published; there
the source is the running application, whose Angular components are visible in
the DOM.

This document is generated from `apps/shared/konsortium.js`
(`npm run konsortium:doc`). The same data drives the
[report overview](/beispiele) and the “Report elements” tab of the
[demo application](/demo/?tab=elemente). As data they are at
[/gemeinsam/konsortium.json](/gemeinsam/konsortium.json).

## The 11 reports

| Institution | Report | Audiences | Subject | Grade | Links |
|---|---|---|---|---|---|
| kompetenztest.de (FSU Jena) | Repeated measurement, German, grade 3 | Teacher, Student | German | Grade 3 | [Demo](https://development.tba.i.c.netzkolchose.de/) · [Code](https://github.com/kompetenztestde/report-messwiederholung) |
| kompetenztest.de (FSU Jena) | Learning status barometer, German, grade 8 | Teacher, Subject department, Student | German | Grade 8 | [Demo](https://lernstand-barometer.ktest.de/login) · [Code](https://github.com/kompetenztestde/lernstand-barometer) |
| kompetenztest.de (FSU Jena) | Competence status, mathematics: student report, grade 8 | Student | Mathematics | Grade 8 | [Demo](https://kompetenztestde.github.io/kompetenzstand-mathematik) · [Code](https://github.com/kompetenztestde/kompetenzstand-mathematik) |
| kompetenztest.de (FSU Jena) | Competence status, mathematics: class report, grade 8 | Teacher | Mathematics | Grade 8 | [Demo](https://kompetenztestde.github.io/kompetenzstand-mathematik-klassenbericht/) · [Code](https://github.com/kompetenztestde/kompetenzstand-mathematik-klassenbericht) |
| indibit | Class report | Teacher | German | Grade 8 | [Demo](https://apps.indibit.eu/tba3/class-teacher) · [Code](https://github.com/indibit-eu/tba3-elements) · [Docs](https://apps.indibit.eu/tba3/docs/) |
| indibit | School report | School leadership | any subject | all | [Demo](https://apps.indibit.eu/tba3/school-manager) · [Code](https://github.com/indibit-eu/tba3-elements) · [Docs](https://apps.indibit.eu/tba3/docs/) |
| indibit | School supervision report | School supervision | any subject | all | [Demo](https://apps.indibit.eu/tba3/school-supervision) · [Code](https://github.com/indibit-eu/tba3-elements) · [Docs](https://apps.indibit.eu/tba3/docs/) |
| ISQ Berlin | Role-based feedback portal, VERA 3 / VERA 8 | Teacher, School leadership, School supervision, Student | German, Mathematics, English, French | Grade 3, Grade 8 | [Demo](https://tba3.isqberlin.de/) · [Code](https://git.imp.fu-berlin.de/isq/feedbacksysteme/tbaiii) |
| zepf (RPTU) | Mathematics, grade 3 | Teacher | Mathematics | Grade 3 | [Demo](https://zepf-rptu.github.io/TBA3/ma) · [Code](https://github.com/zepf-RPTU/TBA3) · [Docs](https://zepf-rptu.github.io/TBA3/docs/) |
| zepf (RPTU) | English, grade 8 | Teacher | English | Grade 8 | [Demo](https://zepf-rptu.github.io/TBA3/en) · [Code](https://github.com/zepf-RPTU/TBA3) · [Docs](https://zepf-rptu.github.io/TBA3/docs/) |
| zepf (RPTU) | School leadership | School leadership | any subject | all | [Demo](https://zepf-rptu.github.io/TBA3/sl) · [Code](https://github.com/zepf-RPTU/TBA3) · [Docs](https://zepf-rptu.github.io/TBA3/docs/) |

What is provisional about these links:

- **Repeated measurement, German, grade 3** (kompetenztest.de (FSU Jena)): KT-internal hosting in progress. Built in cooperation with TBA II.
- **Competence status, mathematics: class report, grade 8** (kompetenztest.de (FSU Jena)): Published after the progress report (8 Oct 2026) and added with the survey of 14 Oct 2026. In the demo, choose “Demo-Zugang: Ja” and sign in.
- **Class report** (indibit): The component library is published as tba3-elements. Licence: MIT.
- **School supervision report** (indibit): The state of Hesse is building its own school supervision reports on this development status.
- **Role-based feedback portal, VERA 3 / VERA 8** (ISQ Berlin): Demo available until 31 Oct 2027; the repository is scheduled to move, and the current address requires a login (as of 14 Oct 2026). Design decisions, architecture and API documentation live in the repository. The support system, item recommendations and AI items are marked beta.

## Display blocks

Pure display, no data fetching of their own. Whatever is handed in gets drawn — interchangeable and with no knowledge of where the numbers came from.

### Distribution across competence levels

How does a group spread across the competence levels? Stacked, with the minimum standard marked and a colour scale that carries the order of the levels rather than blurring it.

*Data:* Competence levels per level · *Library:* `<tba3-kompetenzstufen-leiste>` · *Named by:* kompetenztest.de (FSU Jena), indibit, ISQ Berlin, zepf (RPTU)

![Column chart per domain: number of students at competence levels Ia to V, minimum standard marked under level II, with key figures for optimal and minimum standard alongside.](/beispiele/bilder/originale/kompetenzstufen-verteilung.jpg "Original: indibit, Class report")

![Rebuilt as <tba3-kompetenzstufen-leiste>](/dokumentation/bilder/baustein-kompetenzstufen-leiste-en.png "Rebuild: <tba3-kompetenzstufen-leiste>, with sample data")

### Solution frequency per item

Which items stand out? The group’s solution frequency against the reference range, sortable — the deviation is the information, not the absolute value.

*Data:* Items per level · *Library:* `<tba3-aufgaben-tabelle>` · *Named by:* kompetenztest.de (FSU Jena), indibit, ISQ Berlin, zepf (RPTU)

![Horizontal bars per item with the class solution rate, green above and red below the state average, which is marked as a vertical line labelled “Ø L”.](/beispiele/bilder/originale/loesungshaeufigkeit-je-aufgabe.jpg "Original: indibit, Class report")

![Rebuilt as <tba3-aufgaben-tabelle>](/dokumentation/bilder/baustein-aufgaben-tabelle-en.png "Rebuild: <tba3-aufgaben-tabelle>, with sample data")

### Expectation against result

The same question as a picture: actual against expected solution rate per item. Whatever falls well below the diagonal was harder here than elsewhere.

*Data:* Items per level, with a reference value · *Library:* `<tba3-erwartet-tatsaechlich>` · *Named by:* no progress report — the building block comes from the library

![Item list of the subject report: per item the class mean next to the fair comparison value as two bars](/beispiele/bilder/originale/erwartung-gegen-ergebnis.jpg "Original: kompetenztest.de (FSU Jena), Learning status barometer, German, grade 8")

![Rebuilt as <tba3-erwartet-tatsaechlich>](/dokumentation/bilder/baustein-erwartet-tatsaechlich-en.png "Rebuild: <tba3-erwartet-tatsaechlich>, with sample data")

### Mean with uncertainty

One value per reference group on a shared scale, with an uncertainty range. Small cohorts should not produce overconfident statements — the range says how far the point can be trusted.

*Data:* Aggregations per level · *Library:* `<tba3-mittelwert-vergleich>` · *Named by:* no progress report — the building block comes from the library

![Rebuilt as <tba3-mittelwert-vergleich>](/dokumentation/bilder/baustein-mittelwert-vergleich-en.png "Rebuild: <tba3-mittelwert-vergleich>, with sample data")

### Spread per characteristic

Where does the middle range lie per sub-domain — and where within it does a single student stand? Shows spread rather than only the mean.

*Data:* Aggregations per sub-domain · *Library:* `<tba3-perzentilbaender>` · *Named by:* kompetenztest.de (FSU Jena), ISQ Berlin

![“Homogeneity of the class”: a marker “class” on a scale from rather homogeneous to rather heterogeneous](/beispiele/bilder/originale/streubereich-je-merkmal.jpg "Original: kompetenztest.de (FSU Jena), Competence status, mathematics: class report, grade 8")

![Rebuilt as <tba3-perzentilbaender>](/dokumentation/bilder/baustein-perzentilbaender-en.png "Rebuild: <tba3-perzentilbaender>, with sample data")

### Progress across measurement points

Several measurements as a line, with a band and a comparison line. The only block that can show a development rather than a state.

*Data:* Several measurements of the same group · *Library:* `<tba3-lernstands-verlauf>` · *Named by:* kompetenztest.de (FSU Jena), ISQ Berlin, zepf (RPTU)

![Learning trajectory of one student across three measurement points as a line through the flock, the other students faded in the background](/beispiele/bilder/originale/verlauf-ueber-messzeitpunkte.jpg "Original: kompetenztest.de (FSU Jena), Repeated measurement, German, grade 3")

![Rebuilt as <tba3-lernstands-verlauf>](/dokumentation/bilder/baustein-lernstands-verlauf-en.png "Rebuild: <tba3-lernstands-verlauf>, with sample data")

### Profile heat map

Items or characteristics against people or learning groups, coloured by deviation. The pattern is the statement: a row that is cool throughout concerns everyone; a cool column concerns one person.

*Data:* Items per student · *Library:* `<tba3-aufgaben-heatmap>` · *Named by:* kompetenztest.de (FSU Jena), indibit

![“Results in detail”: matrix of students × items, solved items green, grouped by solution frequency, with half-year grade and characteristic columns](/beispiele/bilder/originale/profil-heatmap.jpg "Original: kompetenztest.de (FSU Jena), Competence status, mathematics: class report, grade 8")

![Rebuilt as <tba3-aufgaben-heatmap>](/dokumentation/bilder/baustein-aufgaben-heatmap-en.png "Rebuild: <tba3-aufgaben-heatmap>, with sample data")

### Table per person

Solution shares per student and sub-domain, sortable and selectable. The table is the most honest display: it compresses nothing and hides nothing.

*Data:* Items per student · *Library:* `<tba3-schueler-tabelle>` · *Named by:* kompetenztest.de (FSU Jena), indibit, zepf (RPTU)

![Class table of the mathematics report with one row per student: number correct, distribution bar and competence level](/beispiele/bilder/originale/personen-tabelle.jpg "Original: zepf (RPTU), Mathematics, grade 3")

![Rebuilt as <tba3-schueler-tabelle>](/dokumentation/bilder/baustein-schueler-tabelle-en.png "Rebuild: <tba3-schueler-tabelle>, with sample data")

### Scatter plot

Students as points in two dimensions. Shows clusters and outliers that a table or a bar chart swallows.

*Data:* Items per student · *Library:* `<tba3-streudiagramm>` · *Named by:* zepf (RPTU)

![Scatter plot: listening against reading solution rate per student, with CEFR thresholds and markers for class, school and state](/beispiele/bilder/originale/punktwolke.jpg "Original: zepf (RPTU), English, grade 8")

![Rebuilt as <tba3-streudiagramm>](/dokumentation/bilder/baustein-streudiagramm-en.png "Rebuild: <tba3-streudiagramm>, with sample data")

### Position scale with zones

Every student as their own marker on a continuous point scale, the competence levels as zones beneath. Makes visible how close someone is to the next level — the level alone does not say that.

*Data:* Point values per student · *Library:* `<tba3-bista-verteilung>` · *Named by:* kompetenztest.de (FSU Jena)

![Repeated reading measurement: birds as students on the reading-speed scale at the March 2026 measurement point, with the zones syllables/gull, word/finch, text/eagle on the right](/beispiele/bilder/originale/positionsskala-mit-zonen.jpg "Original: kompetenztest.de (FSU Jena), Repeated measurement, German, grade 3")

![Rebuilt as <tba3-bista-verteilung>](/dokumentation/bilder/baustein-bista-verteilung-en.png "Rebuild: <tba3-bista-verteilung>, with sample data")

### Key figure with comparison

One number, one reference value, a small trend. The entry point of every overview — and the place where it is easiest to lie when the reference value is missing.

*Data:* Competence levels or aggregations per level · *Library:* `<tba3-kennzahl-kachel>` · *Named by:* kompetenztest.de (FSU Jena), indibit

![Class total of 50 % as a bar above the corrected state average of 42 %](/beispiele/bilder/originale/kennzahl-mit-vergleich.jpg "Original: kompetenztest.de (FSU Jena), Competence status, mathematics: class report, grade 8")

![Rebuilt as <tba3-kennzahl-kachel>](/dokumentation/bilder/baustein-kennzahl-kachel-en.png "Rebuild: <tba3-kennzahl-kachel>, with sample data")

### Overview cards

One card per area, with a ring, a key figure and a detail that opens up. The summary you can unfold, rather than the summary you have to believe.

*Data:* Competence levels per domain · *Library:* `<tba3-uebersichtskarten>` · *Named by:* kompetenztest.de (FSU Jena), indibit

![School overview: number of participants, ring for socio-economic status, share reaching the minimum standard per subject, and rings for participation rate, gender and home language.](/beispiele/bilder/originale/uebersichtskarten.jpg "Original: indibit, School report")

![Rebuilt as <tba3-uebersichtskarten>](/dokumentation/bilder/baustein-uebersichtskarten-en.png "Rebuild: <tba3-uebersichtskarten>, with sample data")

### Area map

Schools and areas on a map, coupled with a table and a search. For school supervision, the location within the district is itself a characteristic — in a list it is invisible.

*Data:* Schools of a level with location data · *Library:* none yet · *Named by:* ISQ Berlin

### Solution rate by characteristic

How does the result relate to a background characteristic? The solution rate per value (social index, gender, home language) next to the comparison groups, with its range. Shows inequality as a gradient instead of a single figure.

*Data:* Aggregations by covariates · *Library:* `<tba3-merkmal-gradient>` · *Found at:* indibit

![Grouped column chart: solution rate by social status A to E for the school, the comparison school and the state average, with range and an explanatory sentence.](/beispiele/bilder/originale/sozialer-gradient.jpg "Original: indibit, School report")

![Rebuilt as <tba3-merkmal-gradient>](/dokumentation/bilder/baustein-merkmal-gradient-en.png "Rebuild: <tba3-merkmal-gradient>, with sample data")

### Deviation per learning group

How far is each class above or below the school value? One bar per class around a zero line. For school leadership, the quickest answer to where a conversation is worthwhile.

*Data:* Competence levels or solution rates per learning group and school · *Library:* `<tba3-abweichung-je-gruppe>` · *Found at:* zepf (RPTU)

![Deviation of classes from the school value in percentage points, one bar per class around a zero line, for German spelling](/beispiele/bilder/originale/abweichung-je-lerngruppe.jpg "Original: zepf (RPTU), School leadership")

![Rebuilt as <tba3-abweichung-je-gruppe>](/dokumentation/bilder/baustein-abweichung-je-gruppe-en.png "Rebuild: <tba3-abweichung-je-gruppe>, with sample data")

### Two groups mirrored

Two groups to the left and right of a central axis, by competence level or score — like a population pyramid. Makes differences in the shape of the distribution visible, not just in the mean.

*Data:* Competence levels of two learning groups · *Library:* `<tba3-gruppen-pyramide>` · *Found at:* zepf (RPTU)

![Mirrored competence-level distribution: girls left, boys right of the central axis, like a population pyramid](/beispiele/bilder/originale/gruppen-gegenueberstellung.jpg "Original: zepf (RPTU), School leadership")

![Rebuilt as <tba3-gruppen-pyramide>](/dokumentation/bilder/baustein-gruppen-pyramide-en.png "Rebuild: <tba3-gruppen-pyramide>, with sample data")

### Radar chart of sub-competences

Several sub-competences, one per axis, a person against the class and comparison groups. The profile is the message — whether it is round or dents in one place.

*Data:* Results per sub-competence and person · *Library:* `<tba3-netzdiagramm>` · *Found at:* zepf (RPTU)

![Radar chart with six axes (listening and reading, each global, detailed, selective): one student against class, school and state](/beispiele/bilder/originale/netzdiagramm.jpg "Original: zepf (RPTU), English, grade 8")

![Rebuilt as <tba3-netzdiagramm>](/dokumentation/bilder/baustein-netzdiagramm-en.png "Rebuild: <tba3-netzdiagramm>, with sample data")

### Context characteristic as a ring

One categorical characteristic of the group — socio-economic status, participation rate, gender, language at home — as a ring with a legend, the centre carrying the total or the median category. Results cannot be placed without the composition of the group; hence this ring appears four times side by side in the school report.

*Data:* Covariates per student · *Library:* `<tba3-kontextmerkmal-ring>` · *Found at:* indibit, zepf (RPTU)

![Three ring charts side by side: participation rate 80 %, gender and home language with the total 214 in the centre and a legend below.](/beispiele/bilder/originale/kontextmerkmal-ring.jpg "Original: indibit, School report")

![Rebuilt as <tba3-kontextmerkmal-ring>](/dokumentation/bilder/baustein-kontextmerkmal-ring-en.png "Rebuild: <tba3-kontextmerkmal-ring>, with sample data")

### Learning progress as figures

Every student as their own figure on a plane of measurement point and ability, the competence levels as named zones rather than numbers. In the repeated measurement they are birds whose species carries the level — a display a third-grader can read about herself.

*Data:* Several measurements per student · *Library:* `<tba3-lernverlauf-figuren>` · *Found at:* kompetenztest.de (FSU Jena)

![Teacher view of the repeated measurement: every student as a bird across three measurement points (March 2025, autumn 2025, March 2026), competence levels as zones syllables/gull, word/finch, text/eagle](/beispiele/bilder/originale/lernverlauf-figuren.jpg "Original: kompetenztest.de (FSU Jena), Repeated measurement, German, grade 3")

![Rebuilt as <tba3-lernverlauf-figuren>](/dokumentation/bilder/baustein-lernverlauf-figuren-en.png "Rebuild: <tba3-lernverlauf-figuren>, with sample data")

## Report elements

Groupings that make sense in the subject — the actual report format. An element answers a question someone in the staff room really asks, and can be reused on its own.

### Comparison levels

The same figure side by side at several reference levels: class, school, fair comparison with structurally similar schools, district, state. Without a reference level a result is not a statement.

*Data:* The same resource at several levels · *Library:* `<tba3-kompetenzstufen-leiste>` · *Named by:* kompetenztest.de (FSU Jena), indibit, ISQ Berlin, zepf (RPTU)

![“Class results in sub-areas”: bars of class average against corrected state average for total, key ideas, process competences, requirement levels and competence levels, toggle for school average](/beispiele/bilder/originale/vergleichsebenen.jpg "Original: kompetenztest.de (FSU Jena), Competence status, mathematics: class report, grade 8")

![Rebuilt as <tba3-kompetenzstufen-leiste>](/dokumentation/bilder/baustein-kompetenzstufen-leiste-en.png "Rebuild: <tba3-kompetenzstufen-leiste>, with sample data")

### Strengths and development needs

Characteristics ordered by their distance from the expectation — read from the top they are strengths, from the bottom development needs. One calculation, two ends, and no ranking of people.

*Data:* Items or characteristics against a reference value · *Library:* `<tba3-aufgaben-tabelle>` · *Named by:* kompetenztest.de (FSU Jena), indibit, ISQ Berlin

![“Top items”: three items the class solved particularly well compared with the state average, as a podium with class and state value](/beispiele/bilder/originale/staerken-und-entwicklungsbedarfe.jpg "Original: kompetenztest.de (FSU Jena), Competence status, mathematics: class report, grade 8")

![Rebuilt as <tba3-aufgaben-tabelle>](/dokumentation/bilder/baustein-aufgaben-tabelle-en.png "Rebuild: <tba3-aufgaben-tabelle>, with sample data")

### Support groups

Learners bundled by support level, adjustable by hand. The hand-over point outwards: what gets passed on is not a result value but a group with a clear need.

*Data:* Results per student plus a rule · *Library:* `<tba3-schueler-tabelle>` · *Named by:* indibit, ISQ Berlin

![Four support buckets for one sub-competence: intensive support, support, consolidation and extension, each with its solution-rate range and the assigned students.](/beispiele/bilder/originale/foerdergruppen.jpg "Original: indibit, Class report")

![Rebuilt as <tba3-schueler-tabelle>](/dokumentation/bilder/baustein-schueler-tabelle-en.png "Rebuild: <tba3-schueler-tabelle>, with sample data")

### Material link-up

From a finding to fitting support material without leaving the application. The step that decides whether a report changes anything or merely describes.

*Data:* A characteristic or support group as a query · *Library:* none yet · *Named by:* kompetenztest.de (FSU Jena), indibit, ISQ Berlin, zepf (RPTU)

![March 2026 measurement point with the “flight training” support material opened for the text/eagle group: reading tandem, reading pass, sorting text sections, reading pilot, reader’s theatre and more](/beispiele/bilder/originale/materialanbindung.jpg "Original: kompetenztest.de (FSU Jena), Repeated measurement, German, grade 3")

### Item browser

Search, view, collect and assign items — the item itself rather than only its identifier. Only then can one check whether a striking solution frequency was about ability or about the item.

*Data:* An item catalogue with content · *Library:* none yet · *Named by:* kompetenztest.de (FSU Jena), ISQ Berlin

![“Support materials” page: pointer to the task browser with preview image and a “To the task browser” button](/beispiele/bilder/originale/aufgabenbrowser.jpg "Original: kompetenztest.de (FSU Jena), Learning status barometer, German, grade 8")

### Individual report

One person’s own report: what I could already do, where the next step lies — no ranking, no mark. The same data as the group view, a different responsibility.

*Data:* One student’s results · *Library:* none yet · *Named by:* kompetenztest.de (FSU Jena), indibit, ISQ Berlin

![Student report, step “What we noticed”: bar of 60 % solved correctly against 40 % incorrectly and a personal interpretation](/beispiele/bilder/originale/einzelbericht.jpg "Original: kompetenztest.de (FSU Jena), Competence status, mathematics: student report, grade 8")

### Guided sequence

The report as a numbered sequence rather than a dashboard. Whoever does not handle test data daily is given an order — in the mathematics report it is seven steps.

*Data:* The same data, only in a fixed order · *Library:* none yet · *Named by:* kompetenztest.de (FSU Jena)

![Footer of the class report with back and next buttons and seven dots for the steps, the second active](/beispiele/bilder/originale/gefuehrter-ablauf.jpg "Original: kompetenztest.de (FSU Jena), Competence status, mathematics: class report, grade 8")

### Automatic insights

Sentences generated from distribution, comparison and development, depending on the filters set. It saves the reader the reading — and the chance to read it differently. Hence a sentence must name its calculation.

*Data:* The filters set and their results · *Library:* none yet · *Named by:* indibit, ISQ Berlin, zepf (RPTU)

![Recommended fields of action: automatically prioritised cards with urgency, a data-based rationale and suggested actions.](/beispiele/bilder/originale/automatische-hinweise.jpg "Original: indibit, School report")

### Awards

Rule-based highlights — “clearly above the district average”, “outperforms structurally comparable schools”. It works only as long as the rule is visible; otherwise it is a ranking with a friendly name.

*Data:* Comparison values plus a disclosed rule · *Library:* none yet · *Named by:* kompetenztest.de (FSU Jena), ISQ Berlin

![Subject department view: per item and class a coloured cell “Excellent”, “Good”, “Okay”, “Not good” relative to the fair comparison value](/beispiele/bilder/originale/auszeichnungen.jpg "Original: kompetenztest.de (FSU Jena), Learning status barometer, German, grade 8")

### Questionnaire scales next to the test result

Self-efficacy and teaching quality from the accompanying questionnaire, per class as a box plot or stacked bar and over time. Puts how the class sees its teaching and itself next to the test result.

*Data:* Questionnaire data — not part of the API · *Library:* none yet · *Found at:* zepf (RPTU)

![Stacked bars of self-efficacy per class and for the school in four rating bands](/beispiele/bilder/originale/fragebogenskalen.jpg "Original: zepf (RPTU), School leadership")

### Standard attainment

One percentage as a headline — how many reach the minimum standard — with a bar per subject or domain beneath it. The number everyone asks for first, with its breakdown right next to it so it does not stand alone.

*Data:* Competence levels per domain · *Library:* `<tba3-standard-erreichung>` · *Found at:* indibit

![80 % reaching the minimum standard as a large figure, below it one bar each for German (83 %) and French (76 %).](/beispiele/bilder/originale/standard-erreichung.jpg "Original: indibit, School report")

![Rebuilt as <tba3-standard-erreichung>](/dokumentation/bilder/baustein-standard-erreichung-en.png "Rebuild: <tba3-standard-erreichung>, with sample data")

### Report card sentences

Sentences formulated from the results, to adopt and adapt. The step a teacher takes after the report anyway — and the only block here whose output is text rather than a picture.

*Data:* Competence levels per student or group · *Library:* `<tba3-zeugnissaetze>` · *Found at:* kompetenztest.de (FSU Jena)

![“Report card sentences” tab: table with student, total score and a generated report card sentence with a copy button](/beispiele/bilder/originale/zeugnissaetze.jpg "Original: kompetenztest.de (FSU Jena), Repeated measurement, German, grade 3")

![Rebuilt as <tba3-zeugnissaetze>](/dokumentation/bilder/baustein-zeugnissaetze-en.png "Rebuild: <tba3-zeugnissaetze>, with sample data")

### Self-assessment against result

What the student thinks she can do, next to what the test measures. The gap between the two is often the more interesting finding than the result alone — and it appears in no report that knows only results.

*Data:* Collected self-assessment, not part of the API · *Library:* `<tba3-selbsteinschaetzung>` · *Found at:* kompetenztest.de (FSU Jena)

![Self-assessment conversation summary for reading comprehension and spelling: self-assessment and result as level bars with key icons, next to “Still to practise” and “Already achieved”](/beispiele/bilder/originale/selbsteinschaetzung.jpg "Original: kompetenztest.de (FSU Jena), Learning status barometer, German, grade 8")

![Rebuilt as <tba3-selbsteinschaetzung>](/dokumentation/bilder/baustein-selbsteinschaetzung-en.png "Rebuild: <tba3-selbsteinschaetzung>, with sample data")

### Item preview

The item itself in an overlay, opened from the table. Without it a striking solution frequency is a number about which one cannot decide whether it was about ability or about the item.

*Data:* Item content, not only identifier and statistics · *Library:* none yet · *Found at:* kompetenztest.de (FSU Jena), zepf (RPTU)

![Expanded item 1.1 “PE lesson”: class mean and fair comparison value, correct solution, item characteristics and preview images of stimulus and item](/beispiele/bilder/originale/aufgabenvorschau.jpg "Original: kompetenztest.de (FSU Jena), Learning status barometer, German, grade 8")

## Frame

What every report needs regardless of subject and year: who may see what, how selections are made, how something is kept and recalled, and how the whole stays understandable and operable.

### Role views

Cascading views of the same data: supervision sees the district, leadership the school, the teacher the class and individual students, the student their own results. One library, four compositions.

*Data:* The level and permissions of the signed-in person · *Library:* none yet · *Named by:* kompetenztest.de (FSU Jena), ISQ Berlin

![Student view of the same data: “Adrian – here is your test result” with his own bird and flight path across three measurement points](/beispiele/bilder/originale/rollensichten.jpg "Original: kompetenztest.de (FSU Jena), Repeated measurement, German, grade 3")

### Filter bar

Level, subject, year, data type. The selection belongs in the address bar, otherwise a view cannot be shared and the back button does the wrong thing.

*Data:* The vocabulary of the API · *Library:* none yet · *Named by:* indibit, ISQ Berlin

![Filter bar: a school authority drop-down, below it buttons for year (V3, V8) and subject (German, Mathematics).](/beispiele/bilder/originale/filterleiste.jpg "Original: indibit, School supervision report")

### Working state

Saving and recalling the filters set, notes and comments. A report is rarely read in one sitting; without a working state every meeting starts over.

*Data:* The signed-in person’s profile · *Library:* none yet · *Named by:* ISQ Berlin, zepf (RPTU)

![Notes drawer with page tabs, formatting bar and a button to link a module](/beispiele/bilder/originale/arbeitsstand.jpg "Original: zepf (RPTU), Mathematics, grade 3")

### Export the report

A version that leaves the device — bound to the filters set and, where sensible, editable before export. In a meeting there is paper on the table, not a dashboard.

*Data:* The current state of the view · *Library:* none yet · *Named by:* kompetenztest.de (FSU Jena), ISQ Berlin

![“Download reports” page: subject report, class report, subject department and self-assessment as PDF per class, tabular evaluation as HTML, ODS and CSV](/beispiele/bilder/originale/bericht-ausgeben.jpg "Original: kompetenztest.de (FSU Jena), Learning status barometer, German, grade 8")

### Explanatory texts

Tooltips, a glossary, onboarding tours per role. Kept independent of the data — at zepf in separate JSON files — so the text can change without touching the analysis.

*Data:* None — deliberately kept separate · *Library:* none yet · *Named by:* kompetenztest.de (FSU Jena), ISQ Berlin, zepf (RPTU)

![Side panel “Results in detail – help & operation” with a read-aloud button and numbered explanations of views, options, characteristics and sorting](/beispiele/bilder/originale/erklaertexte.jpg "Original: kompetenztest.de (FSU Jena), Competence status, mathematics: class report, grade 8")

### Bilingualism

German and English in the same application. The choice belongs to the reader and holds across all views; sample data stays untranslated because in operation it comes from the API.

*Data:* None — labels, not results · *Library:* none yet · *Named by:* ISQ Berlin

### Accessibility

Contrast, keyboard operation, meaning not carried by colour alone. Made checkable rather than aspired to: indibit runs WCAG 2.1 AA as a fixed process step (95/100), while ISQ states it is aimed at and not formally verified.

*Data:* None — a property of every display · *Library:* none yet · *Named by:* ISQ Berlin

### Names versus codes

A switch that replaces names with codes and leaves the results standing. Anyone discussing a report on a projector or in a screen share needs exactly this — and needs it as one action, not as preparation.

*Data:* None — a display decision · *Library:* none yet · *Found at:* kompetenztest.de (FSU Jena)

![“Names / Codes” toggle set to “Codes”, the birds carry three-letter codes instead of names](/beispiele/bilder/originale/pseudonymisierung.jpg "Original: kompetenztest.de (FSU Jena), Repeated measurement, German, grade 3")

### Glossary with search

The technical terms in one place, searchable, reachable from every view. “Competence level”, “fair comparison”, “solution frequency” are not self-explanatory to readers, and a tooltip only answers the question asked at that exact spot.

*Data:* None — kept independent of the data · *Library:* `<tba3-glossar>` · *Found at:* zepf (RPTU)

![Glossary with a search field and expandable terms, the first entry “competence level (primary)” opened](/beispiele/bilder/originale/glossar-mit-suche.jpg "Original: zepf (RPTU), Mathematics, grade 3")

![Rebuilt as <tba3-glossar>](/dokumentation/bilder/baustein-glossar-en.png "Rebuild: <tba3-glossar>, with sample data")

### Export with a selection

Choosing what goes in before exporting. A report containing everything does not get read; the selection is the difference between an output and a template for the meeting.

*Data:* The current state of the view plus a selection · *Library:* none yet · *Found at:* zepf (RPTU)

![Report view with two marked modules on a page preview and the “export as PDF” button](/beispiele/bilder/originale/export-mit-auswahl.jpg "Original: zepf (RPTU), Mathematics, grade 3")

## Summary

The catalogue lists **43 building blocks** in three layers:
29 from the progress reports, 14 from the running
demos and their source code.

**What only the survey at the artefact revealed:**
Solution rate by characteristic, Deviation per learning group, Two groups mirrored, Radar chart of sub-competences, Questionnaire scales next to the test result, Context characteristic as a ring, Learning progress as figures, Standard attainment, Report card sentences, Self-assessment against result, Item preview, Names versus codes, Glossary with search, Export with a selection. None of these appears in a
progress report — which says nothing about their value, but a lot about how
complete a project summary can be. Anyone who only reads the reports misses a
quarter of what was built.

**What at least three of the four institutions built independently:**
Distribution across competence levels, Solution frequency per item, Progress across measurement points, Table per person, Comparison levels, Strengths and development needs, Material link-up, Individual report, Automatic insights, Explanatory texts. This is the reliable core of a
report — anyone building a new one starts here.

**What is not yet a building block in `@tba3/bausteine`** (18 entries):
Area map, Material link-up, Item browser, Individual report, Guided sequence, Automatic insights, Awards, Questionnaire scales next to the test result, Role views, Filter bar, Working state, Export the report, Explanatory texts, Bilingualism, Accessibility, Item preview, Names versus codes, Export with a selection. Some of these are not
visualisations but frames, and do not belong in a visualisation library either.
The rest is a list of open work.

**What the library contains without any progress report naming it**
(2 entries): Expectation against result, Mean with uncertainty.
This is no criticism of the reports — they describe what the groups asked for,
not everything on screen. But it is the part of the catalogue that lacks
evidence, and that should be visible.
