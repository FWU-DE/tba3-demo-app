# Handing over result data for further work: a concept draft using AIS.schule

No prototype. Information on AIS comes from the public project site
[ais.schule](https://ais.schule/) and from a review of the AIS repositories,
which are not yet public, on 14 October 2026. What comes from the repositories
is **abstracted**: names and structures are simplified and translated, and no
source code is reproduced. AIS is under development, so things may change
quickly.

## Result

- **In substance the two fit together.** VERA provides a diagnosis; AIS aims
  to help teachers with diagnostics, support and lesson planning. Both are
  explicitly not meant for grading. A report that does not end in the report
  but carries on into planning is exactly the case AIS is designed for.
- **The first step needs no personal data.** What is handed over is the result
  of the *learning group*: how the class is distributed across the competence
  levels and in which competences it is below the reference value. From that, a
  learning system can derive suggestions for learning paths and material, which
  the teacher decides on.
- **The same shared key is missing as with the media libraries.** The API
  names competences only as codes without a reference system (`L2`, `3.3.b`).
  Another system can do nothing with them as long as it is unclear which
  educational standard is meant. The solution is the same as on the page
  [Integrating media libraries](machbarkeitsstudie-mediatheken.md): a
  resolvable identifier per competence.
- **Individual results are the high hurdle.** VERA codes and the pseudonyms of a
  learning system have nothing in common. The teacher would have to create the
  link, and whether the results may be passed on at all is a question for the
  states, not for technology.
- **In the AIS pilot the grades do not meet.** VERA is taken in grades 3 and 8;
  the pilot works in grades 5 and 6. A trial would therefore need either older
  VERA 3 results as a starting point after the transition to secondary school,
  or a later extension of AIS to further grades.

## The question

A report is an end point: the teacher reads it, draws conclusions and plans
accordingly, mostly in their head. The previous sub-concepts examined how
*material* gets from the report into the learning platform. This one is about
the *results themselves*: can they be handed to a system that keeps working
with them, for example by suggesting learning paths or by knowing a class's
learning state from the start instead of having to establish it first?

## AIS.schule in brief

AIS (Adaptive Intelligent System) is a project of FWU on behalf of the German
states, funded by the DigitalPakt Schule. According to the project site, it is
building an AI-supported teaching and learning environment for general
education schools:

- Students get **adaptive learning paths** that change with their learning
  state and progress, and an **AI tutor**.
- Teachers get an **overview of their class's learning state**, a
  **recommendation system for lesson planning** and an editor for learning
  material.
- Media providers and the OER community can publish material.
- **"AIS is not used for performance assessment or grading"** but for
  supporting learning.
- From the 2026/27 school year a **pilot** runs at selected schools with
  material for German and mathematics in grades 5 and 6. Data is processed
  under pseudonyms.

## Where results would arrive in AIS (abstracted)

For a handover, three things matter in AIS: how it keeps the learning state,
how a teacher plans, and what both refer to in subject terms.

```ts
// Subject model: knowledge components, bundled into skills and domains,
// linked by prerequisites ("first A, then B").
type ComponentId = string;

// Learning state: per student and knowledge component.
interface LearningState {
  student: Pseudonym;      // no real name, no VERA code
  component: ComponentId;
  mastery: number;         // 0 … 1, estimated from the answers
  history: number[];
  attempts: number;        // 0 means: never measured directly, only inferred
}

// Overview for teachers: condensed per component into four classes.
type Standing = 'mastered' | 'in progress' | 'needs practice' | 'no data';

// Planning: one section of a learning path.
interface PlanSection {
  mode: 'mastery' | 'practice' | 'assessment' | 'explore';
  scope: { kind: 'component' | 'skill' | 'domain' | 'standard'; id: string }[];
  entry?: {                // differentiation: who gets this section
    when: 'mastery below' | 'mastery reached';
    component: ComponentId;
    threshold: number;
  };
}
```

| From the report (TBA3) | In AIS | Fit |
|---|---|---|
| competence, key idea (today only as a code) | planning scope of kind `standard` | **Good.** Planning already provides for a reference to a standard. What is missing are the identifiers on the TBA3 side and a standard → components mapping in AIS. |
| the group's level distribution per sub-area | `Standing` per component in the overview | **Medium.** Different granularity: VERA measures sub-areas, AIS keeps fine-grained components. Enough for context next to its own picture (route 2), not for merging. |
| a person's level I–V | `LearningState.mastery` with `attempts = 0` | **Conceivable as a starting value.** The distinction between "measured" and "only estimated" already exists, and a VERA value clearly belongs to the second kind. |

- **The learning state deliberately has no write path from outside.** An
  application may not set it. The path was closed so that no one can grade
  themselves. Importing VERA results would therefore need a separate,
  clearly marked path that records the source, not a detour through the
  existing interface.
- **The curriculum reference goes through MEM, but to the state curricula.**
  AIS maps its components via MEM to the curricula of individual states (so
  far Bavaria and Saxony, proposed by machine and under review). A mapping to
  the **IQB's KMK educational standards**, which VERA is built on, does not
  exist. And because MEM itself has no path from an educational standard to a
  state curriculum (see
  [Integrating media libraries](machbarkeitsstudie-mediatheken.md#what-the-bridge-lacks)),
  that detour does not help either. This mapping would have to be built new on
  the AIS side.
- **People exist only as pseudonyms.** The school is stored only as a hash,
  real names are kept separately in a store of their own, and every database
  separates tenants at row level. There is no shared key with the VERA codes,
  and rightly so.
- **The learning analytics service is not an open Learning Record Store.** It
  accepts a fixed list of verbs and only from services with elevated rights.
  This confirms the assessment of route 4 below.

AIS's product planning includes a learning-state overview per person,
practice recommendations based on diagnostics, and learning groups with
aggregated learning states. A design draft shows the learning state per
standard on a five-step scale from "none" through minimum, regular and regular
plus to "optimal". That corresponds almost exactly to VERA levels I to V. What
has been built is the draft, not the application. There are no plans so far
that name TBA3 or VERA explicitly.

## What the API could hand over

The reporting API delivers results on three levels (learning group, school,
state), each either for the group or for each individual (`type=group` or
`type=students`). For further work in a learning system these responses matter
most:

| Response | Content | Personal data |
|---|---|---|
| `/groups/{id}/competence-levels` | distribution of the group across competence levels I–V, per sub-area | no |
| `/groups/{id}/items` | solution frequency per task, with competence reference, requirement area and level of the task | no |
| `/groups/{id}/aggregations?aggregation=competence` | results per competence, aggregated | no |
| the same with `type=students` | the same per student, under a code | yes, pseudonymous |
| `/schools/…`, `/states/…` | reference values for school and state | no |

![Five tiles for competence levels I to V with number and share of students of the learning group 3a German.](/dokumentation/bilder/lms-stufen-en.png "A learning group's distribution across competence levels, as the API delivers it. Exactly this information, per competence instead of per test, would be the core of a handover.")

## Four routes, ranked by suitability

### 1. Group results into planning

From the report, the teacher hands over their class's result. The learning
system then suggests which competences should take priority in the coming
weeks and which learning paths or materials fit which level. The teacher
accepts, changes or discards.

- **What TBA3 has to deliver:** a resolvable identifier per competence, the
  level distribution and the solution frequency, plus the reference value.
- **What the learning system has to offer:** a place where a teacher can load
  such a package for their learning group, and a mapping from educational
  standards to its own learning objectives and content.
- **Data protection:** no personal data. This is the easiest case.

### 2. Group results as context in the overview

The learning system shows the VERA result next to its own picture of the
class's learning state, without merging the two. The teacher then sees, for
example, that the class was weak in *measuring* in the VERA test but has since
caught up in the learning system. Technically this route needs the same as the
first, just without suggestions.

### 3. Individual results as a starting point

For each student, the learning system takes the level reached as a starting
point instead of establishing the learning state through its own tasks first.
This would be the biggest gain and the highest hurdle:

- **No shared key.** VERA knows the children by a test code, a learning system
  by its own pseudonym. Only the teacher can bring them together, preferably in
  their own browser, so that neither the learning system learns the test codes
  nor the API the pseudonyms.
- **A test result is not a learning state.** A VERA result is a measurement on
  one day. A learning system should keep it as an estimate with source and
  date that its own observations override, not as a fixed value.
- **Passing it on must be permitted.** What VERA results may be used for is
  regulated by the states. Whether passing them to a learning system is covered
  has to be settled before anything is built.

### 4. Learning analytics standards such as xAPI

xAPI describes individual learning actions ("solved task 3") and collects them
in a Learning Record Store. VERA results are the opposite: aggregated test
results, often at group level. They can be broken down into statements, but
that loses what makes them meaningful (level, reference value, reference
group). For handing over results, a small format of its own fits better. xAPI
only becomes an option if individual task responses are to be passed on.

## A draft handover format

The package for the first route could look like this. The format is a proposal
of this study, not part of the API, and has not been agreed with anyone. The
level distribution comes from the demo application's sample data; the other
numbers are set for illustration. The field names are German, as in the
rest of the project:

```json
{
  "format": "tba3-ergebnispaket/0.1-entwurf",
  "erstellt": "2026-10-14",
  "test": {
    "name": "VERA 3 Deutsch",
    "bildungsstandards": "https://w3id.org/iqb/bista04-de-p/"
  },
  "lerngruppe": {
    "bezeichnung": "3a Deutsch",
    "fach": "Deutsch",
    "jahrgang": 3
  },
  "personenbezug": false,
  "teilbereiche": [
    {
      "kennung": "https://w3id.org/iqb/bista04-de-p/…",
      "bezeichnung": "Lesen – mit Texten und Medien umgehen",
      "kompetenzstufen": { "I": 0.08, "II": 0.22, "III": 0.34, "IV": 0.24, "V": 0.12 },
      "vergleich": { "ebene": "land", "mindeststandard_erreicht": 0.88 }
    }
  ],
  "kompetenzen": [
    {
      "kennung": "https://w3id.org/iqb/bista04-de-p/…",
      "kuerzel": "3.3",
      "bezeichnung": "Texte erschließen",
      "loesungshaeufigkeit": 0.61,
      "vergleich_land": 0.68
    }
  ]
}
```

- **The identifier is an address; the code is just an extra.** `kennung`
  points to the standard in the IQB vocabulary as held by the ontology server
  [MEM](machbarkeitsstudie-mediatheken.md#could-mem-be-the-intermediate-layer).
  A receiving system can look it up instead of having to maintain a list of
  codes per subject and version. The `…` stand for the identifiers the API
  does not deliver yet. The specification already has the field for them
  (`competences[].id`); it is just left empty.
- **The version of the standards is in the package.** The 2004 and 2022
  educational standards number the same content differently. Without the
  version, even an address cannot be mapped unambiguously.
- **`personenbezug` (personal data) is stated explicitly.** A package with
  individual results would be a different package with different rules. The
  receiving system should not have to infer it from the content.

## How the handover could work

```
Report (TBA3 front end)                  Learning system (e.g. AIS)
───────────────────────                  ──────────────────────────
1. Teacher opens the report
   for their class
2. "Hand over to learning system"
3. Package is created in the browser
   (group level only)
4. Handover as a file or a link  ─────▶  5. Assign the package to the
                                            teacher's learning group
                                         6. Resolve the identifiers
                                            (educational standard →
                                            own learning objectives)
                                         7. Suggestions for learning
                                            paths and material per level
                                         8. Teacher decides
```

For the handover in step 4 there are three routes, from simplest to most
involved:

| Route | How | Advantage | Drawback |
|---|---|---|---|
| File | The teacher downloads the package and uploads it into the learning system, as with the [Common Cartridge](machbarkeitsstudie-lms-export.md). | No connection between the systems; the teacher sees what is handed over. | One more step. |
| Link | The report opens the learning system and passes the package along at launch, for example as a parameter of an LTI launch. | One click. | Both systems have to know each other. |
| Server to server | The learning system fetches the results itself through the API. | Always current. | Needs access rights to the results; the hardest case for data protection. |

For a trial the file is enough. It keeps the systems cleanly apart and leaves
the decision about passing on data where it belongs, with the teacher.

## What is missing on both sides

| Side | What is missing | Effort |
|---|---|---|
| API (TBA3) | fill `competences[].id` and sub-areas with resolvable identifiers, include the version of the standards | low; the fields are already there |
| Report front end | an export "Hand over to learning system" in the format above | low; similar to the cartridge export |
| Learning system (AIS) | an import for group results, assigned to a learning group and appearing in planning as a scope of kind `standard` | medium |
| Learning system (AIS) | a mapping from the KMK educational standards to its own knowledge components, next to the existing mapping to state curricula | high; needs subject-matter review |
| Learning system (AIS), individual results only | a separate, clearly marked write path for the learning state that records source and date and flags the value as "estimated" | medium, but only after clarification by the states |
| States | clarifying whether and for what VERA results may be passed to a learning system; mandatory for individual results | open |

## What follows

- **Handing over group results is feasible and the easy case for data
  protection.** It asks little of the TBA3 side: identifiers instead of codes,
  and an export.
- **The identifiers are the lever again.** Without them the media library
  search fails, and without them a learning system cannot do anything with the
  results either. Filling `competences[].id` helps all three sub-concepts at once.
- **The real work lies in the learning system.** It has to map educational
  standards to its own learning objectives. That is subject-matter work, not
  technical work, and it decides whether the suggestions are any good.
- **Individual results only after legal clarification.** Technically, a link
  could be built so that neither system learns the other's identifiers. Whether
  it may be built is for the states to decide.
- **For a trial with AIS the grades have to match.** In the pilot (grades 5 and
  6) there are no fresh VERA results. One option would be to use the VERA 3
  results as a starting point after the transition to secondary school. But by
  then they are about one and a half years old and usually come from a
  different school, the primary school.
