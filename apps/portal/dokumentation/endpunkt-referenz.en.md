<!-- Übersetzung von endpunkt-referenz.md, sha256:8973eaae0359e2ce93b65f2575c4163a8b7ef5e2b51d8d24f06b526c31e543cf -->

# TBA3 evaluation interface: endpoint reference

This reference is aimed at frontend and backend developers. It describes all endpoints defined by the spec,
as well as the conventions that make sense on these endpoints.

Basic terms (value group, 3-layer architecture) are explained in [Concepts and architecture](konzepte.md).

---

## Language convention

The interface is defined in **English**: field names, endpoints and keys are English (e.g. `competenceLevels`, `descriptiveStatistics`, `frequency`).

**Values** are usually passed in **German**, as they come from German-language systems (e.g. `"name": "Regelstandard"`, `"name": "Leseverstehen"`).
Values whose possible values are jointly defined as a convention may also be English (e.g. `"value": "male"` for covariates).

---

## What the spec defines

The spec defines **9 endpoints**: 3 levels × 3 data types. Each endpoint returns an **array of value groups**.
What a single value group represents (a learning group, a student, a school, a comparison value …)
depends on the backend implementation or on the query parameter `type`.

---

### Competence level distribution (`/competence-levels`)

Each value group contains a `competenceLevels[]` array. Each entry describes a competence level (e.g. "Regelstandard", the standard level) with the associated descriptive statistics (frequency, mean, total).

| Level          | Path                              | Value group contains                                         | Swagger UI                                                                       |
|----------------|-----------------------------------|--------------------------------------------------------------|----------------------------------------------------------------------------------|
| Learning group | `/groups/{id}/competence-levels`  | `competenceLevels[]` with levels + descriptive statistics    | [Link](https://apps.indibit.eu/tba3-api/docs#/groups/getGroupCompetenceLevels)   |
| School         | `/schools/{id}/competence-levels` | `competenceLevels[]` with levels + descriptive statistics    | [Link](https://apps.indibit.eu/tba3-api/docs#/schools/getSchoolCompetenceLevels) |
| State          | `/states/{id}/competence-levels`  | `competenceLevels[]` with levels + descriptive statistics    | [Link](https://apps.indibit.eu/tba3-api/docs#/states/getStateCompetenceLevels)   |

**Behavior with `type=student`:** At student level, only the **achieved** competence level is returned per student (not all levels with `frequency=0`).
The `competenceLevels[]` array then usually contains exactly one entry.

---

### Solution frequencies (`/items`)

Each value group contains an `items[]` array. Each entry describes a single item (test task) with its solution frequency and optional item parameters.

| Level          | Path                  | Value group contains                           | Swagger UI                                                            |
|----------------|-----------------------|------------------------------------------------|-----------------------------------------------------------------------|
| Learning group | `/groups/{id}/items`  | `items[]` with solution frequencies per item   | [Link](https://apps.indibit.eu/tba3-api/docs#/groups/getGroupItems)   |
| School         | `/schools/{id}/items` | `items[]` with solution frequencies per item   | [Link](https://apps.indibit.eu/tba3-api/docs#/schools/getSchoolItems) |
| State          | `/states/{id}/items`  | `items[]` with solution frequencies per item   | [Link](https://apps.indibit.eu/tba3-api/docs#/states/getStateItems)   |

---

### Aggregations (`/aggregations`)

Each value group contains an `aggregations[]` array. Each entry describes an aggregation by a particular type (e.g. by competence or gender) with descriptive statistics. Which kinds of aggregation are available is controlled by the `aggregation` parameter (→ query parameters).

| Level          | Path                         | Value group contains                                  | Swagger UI                                                                   |
|----------------|------------------------------|-------------------------------------------------------|------------------------------------------------------------------------------|
| Learning group | `/groups/{id}/aggregations`  | `aggregations[]` with type + descriptive statistics   | [Link](https://apps.indibit.eu/tba3-api/docs#/groups/getGroupAggregations)   |
| School         | `/schools/{id}/aggregations` | `aggregations[]` with type + descriptive statistics   | [Link](https://apps.indibit.eu/tba3-api/docs#/schools/getSchoolAggregations) |
| State          | `/states/{id}/aggregations`  | `aggregations[]` with type + descriptive statistics   | [Link](https://apps.indibit.eu/tba3-api/docs#/states/getStateAggregations)   |

---

## Response contents of a value group

For orientation, the basic structure of a value group:

```
Value-Group
├── id           (optional) — unique identifier
├── name         (required) — label, e.g. "Klasse 8a"
├── type         (required) — type of a value group
├── domain       (optional)
│   ├── id       (optional)
│   └── name     (required) — e.g. "Leseverstehen"
├── subject      (optional)
│   ├── id       (optional)
│   └── name     (required) — e.g. "Deutsch"
├── covariates   (optional) — covariates of the value group (gender, language, ...)
├── properties   (optional) — free key-value metadata
└── ... result data (depending on the endpoint)
```

Besides the endpoint-specific result data (`competenceLevels`, `items`, `aggregations`), every value group carries optional context fields.
Conceptually, all these fields are metadata about the value group.
`subject` and `domain` are deliberately modeled as separate fields (not as properties), because reports very often group by subject and domain — they are structural metadata.
`covariates` are typed characteristics of the people in the group.
`properties` are completely free key-value pairs for everything else.

---

### `type`: value group type

The value group has a `type` field that describes its granularity. This lets a report element recognize
what a value group represents — even without knowing the original request.

| Value       | Meaning            |
|-------------|--------------------|
| `student`   | Individual student |
| `group`     | Learning group     |
| `school`    | School             |
| `district`  | City/municipality  |
| `authority` | School authority   |
| `state`     | State              |

---

### `subject` and `domain`: subject area and domain

`subject` and `domain` are separate response fields (not properties), because reports almost always group by subject and domain.

`subject` is an object with `id` (optional) and `name` (required), e.g. `{ name: "Deutsch" }`.
`domain` is likewise an object with `id` (optional) and `name` (required). The `name` contains the long description of the domain, e.g. `{ name: "Leseverstehen" }`.

For the **query parameter** `domain`, abbreviations for sub-areas of a subject are used. The abbreviations correspond to the domain designations in the IQB item statistics tables ([competence level models](https://www.iqb.hu-berlin.de/de/bista/entwicklung/kompetenzstufenmodelle/)).

| Subject     | Subject abbreviation | Possible domain abbreviations (query parameter)                                                                                                                                                    |
|-------------|----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| German      | `de`                 | `rs` (spelling/orthography), `le` (reading), `ho` (listening/speaking and listening), `sp` (language and language use/language use)                                                                |
| Mathematics | `ma`                 | V8 none, V3  `zo` (numbers and operations), `rf` (space and shape), `gm` (quantities and measurement), `dh` (data, frequencies and probabilities), `ms` (patterns and structures)                  |
| English     | `en`                 | `ho` (listening comprehension), `le` (reading comprehension)                                                                                                                                       |
| French      | `fr`                 | `ho` (listening comprehension), `le` (reading comprehension)                                                                                                                                       |

**Important: query abbreviation vs. response object.** The abbreviations in the table above are values for the `domain` **query parameter** (e.g. `?domain=rs`).
The `domain` field in the **response**, by contrast, is an object with the long description, e.g. `{ name: "Rechtschreibung" }`.
The backend sets the long description depending on context — it can vary by grade level (e.g. `rs` = "Rechtschreibung" in primary school, "Orthografie" in lower secondary).

**Grouping by domain:** Whether the response is grouped by domain (one value group per domain) or returned flat
depends on the endpoint and use case. Details and recommendations in [Recipe: grouping by domain](rezepte.md#grouping-by-domain-when-does-it-make-sense).

Details and examples on the special case of mathematics are described in [Recipe: key ideas in mathematics](rezepte.md#key-ideas-in-mathematics-domain-vs-competences).

---

### `covariates`: characteristics of people and groups

Array of typed characteristics on a value group. Each covariate has `type`, `label`, `value`.

Predefined types:

| `type`           | Description                                          | Example `value`s                                        |
|------------------|------------------------------------------------------|---------------------------------------------------------|
| `gender`         | Gender                                               | `male`, `female`, `diverse`                             |
| `languageAtHome` | Language at home                                     | `german`, `other`, `english`, `french`                  |
| Any              | Freely extensible — `label` describes the characteristic | e.g. school type, SES, migration background         |

Further, custom covariates can be added in the same schema.
A recipe for handling covariates at other levels can be found in
[Handling covariates at student and group level](./rezepte.md#handling-covariates-at-student-and-group-level).

---

### `properties`: free key-value metadata

Completely open key-value pairs (`key`, `value`) for system-specific metadata about the value group itself.

Known examples:

| `key`               | Description              | Example                |
|---------------------|--------------------------|------------------------|
| `firstName`         | First name               | `Maria`                |
| `lastName`          | Last name                | `Muster`               |
| `startTime`         | Test start               | `2024-03-15T08:00:00Z` |
| `endTime`           | Test end                 | `2024-03-15T09:30:00Z` |
| `testDuration`      | Test duration in seconds | `2541`                 |
| `schoolType`        | School type              | `Gymnasium`            |
| `testPeriod`        | Testing period           | `2024-03`              |
| `booklet`           | Test booklet identifier  | `V8-2024-DE-TH01`      |
| `participationRate` | Participation rate       | `0.93`                 |

---

### Distinction: covariates vs. properties

|                  | Covariates                                 | Properties                                  |
|------------------|--------------------------------------------|---------------------------------------------|
| **Describe**     | Characteristics of the **people** (group)  | Metadata about the **value group** itself   |
| **Example**      | Gender distribution, language distribution | Test duration, school type, test booklet    |
| **Structure**    | Typed (`type`, `label`, `value`)           | Open key-value pairs (`key`, `value`)       |
| **Predefined**   | `gender`, `languageAtHome` + `other`       | Completely free                             |

**Rule of thumb:** composition of the group of people → covariates. Context of the assessment → properties.

---

### Example response: competence level distribution with comparison group

`GET /groups/3a-deutsch/competence-levels?comparison=3b-deutsch`

```json
[
  {
    "name": "Klasse 3a",
    "type": "group",
    "domain": { "name": "Leseverstehen" },
    "subject": { "name": "Deutsch" },
    "competenceLevels": [
      {
        "nameShort": "II",
        "name": "Mindeststandard",
        "descriptiveStatistics": { "frequency": 5, "total": 20, "mean": 0.25 }
      },
      {
        "nameShort": "III",
        "name": "Regelstandard",
        "descriptiveStatistics": { "frequency": 10, "total": 20, "mean": 0.50 }
      },
      {
        "nameShort": "IV",
        "name": "Optimalstandard",
        "descriptiveStatistics": { "frequency": 5, "total": 20, "mean": 0.25 }
      }
    ]
  },
  {
    "name": "Klasse 3b",
    "type": "group",
    "domain": { "name": "Leseverstehen" },
    "subject": { "name": "Deutsch" },
    "competenceLevels": [
      {
        "nameShort": "II",
        "name": "Mindeststandard",
        "descriptiveStatistics": { "frequency": 8, "total": 22, "mean": 0.36 }
      },
      {
        "nameShort": "III",
        "name": "Regelstandard",
        "descriptiveStatistics": { "frequency": 9, "total": 22, "mean": 0.41 }
      },
      {
        "nameShort": "IV",
        "name": "Optimalstandard",
        "descriptiveStatistics": { "frequency": 5, "total": 22, "mean": 0.23 }
      }
    ]
  }
]
```

The first value group contains the results of the requested learning group (3a), the second the comparison group (3b). Both carry `domain` and `subject` as objects with a `name` field.

---

## Query parameters: proposed conventions

The spec defines all query parameters as **free strings**. The following conventions are a **proposal**.
Every backend can introduce its own values. A backend does not have to adopt any of these conventions,
provided it documents this accordingly for report and frontend.

The query parameters often use the same values as the response fields, but extend them with **combinability** (comma-separated).

---

### `type`: controlling granularity

The `type` parameter determines which kind of value groups the response contains. The individual values are described under [Response contents → type](#type-value-group-type).

Several values can be passed comma-separated.
The endpoint then returns value groups for each of the combined granularity levels in a single response.

| Path                                   | `type`           | Result                                      | Mock server                                                                                      |
|----------------------------------------|------------------|---------------------------------------------|--------------------------------------------------------------------------------------------------|
| `/groups/3a-deutsch/competence-levels` | `group,student`  | VGs for the learning group + one per student | [Link](https://apps.indibit.eu/tba3-api/groups/3a-deutsch/competence-levels?type=group,students) |
| `/states/beispielland/items`           | `state,district` | VGs for the state + one per district         | [Link](https://apps.indibit.eu/tba3-api/states/beispielland/items?type=state,district)           |

Without a `type` parameter, the backend decides which granularity it delivers by default.

---

### `comparison`: comparison values

> **Spec = free string.** The values and their meaning are defined by the backend, not by the spec.

The `comparison` parameter controls which comparison value groups are returned in addition to the primary results.
Several values can be combined comma-separated.

**Proposed syntax:** prefix `type-id` or just `value`, comma-separated — e.g. `comparison=group-3b,group-3c,state-average`.
The syntax is easy to parse in the backend and allows any combination.

**Rule of thumb**: If only the `type` is given, the backend usually decides which comparison groups are delivered.
If specific comparison groups are wanted, they are referenced with `type-<id>`.

#### Proposed comparison types

The comparison types derive from the [`type` values](#type-value-group-type): whatever exists as a `type` in the response usually also makes sense as a comparison group.

| Comparison       | Meaning                                                                       | Example                 |
|------------------|-------------------------------------------------------------------------------|-------------------------|
| `student-<id>`   | Specific student                                                              | `student-12345`         |
| `group-<id>`     | Specific learning group                                                       | `group-3b`              |
| `school-<id>`    | Specific school                                                               | `school-gs-musterstadt` |
| `school-average` | School average (convenience for the school of the requested group)            | `school-average`        |
| `district-<id>`  | Specific city/municipality                                                    | `district-nord`         |
| `authority-<id>` | Specific school authority                                                     | `authority-12345`       |
| `state-average`  | State average                                                                 | `state-average`         |
| `year-<jahr>`    | Comparison with a specific year                                               | `year-2024`             |

Beyond that, every report can introduce its own values, e.g. for special comparison groups or shortcuts
that bundle several comparison groups:

| Shortcut example        | Meaning                                                                                       |
|-------------------------|-----------------------------------------------------------------------------------------------|
| `group`                 | Backend decides, e.g. all learning groups of a school                                        |
| `group-parallel`        | All parallel classes                                                                          | 
| `year`                  | Backend decides, e.g. the last four rounds                                                    |
| `faircomparison`        | Fair comparison value (adjusted for background characteristics). The backend chooses the appropriate level |
| `group-faircomparison`  | Fair comparison value at group level                                                          |
| `school-faircomparison` | Fair comparison value at school level                                                         |

#### Examples by level

**Learning group level (`/groups/{id}/…`):**

| Scenario              | Request example                                                            |
|-----------------------|----------------------------------------------------------------------------|
| Parallel class(es)    | `?comparison=group-3b,group-3c,group-3d` or `?comparison=group-parallel`   |
| School average        | `?comparison=school-average`                                               |
| State average         | `?comparison=state-average`                                                |
| Previous years' values | `?comparison=year-2024,year-2023`                                         |
| Combined              | `?comparison=state-average,year-2024`                                      |

**School level (`/schools/{id}/…`):**

| Scenario                   | Request example                                   |
|----------------------------|---------------------------------------------------|
| Classes as comparison      | `?comparison=group-3a,group-3b,group-3c,group-3d` |
| Another school             | `?comparison=school-gs-musterstadt`               |
| School year comparison     | `?comparison=year-2024,year-2023`                 |

**State level (`/states/{id}/…`):**

| Scenario                          | Request example                           |
|-----------------------------------|-------------------------------------------|
| Districts as comparison           | `?comparison=district-nord,district-sued` |
| School authorities as comparison  | `?comparison=authority-12345`             |

**Note on the mock server:** The mock server currently accepts simple comma-separated IDs without a type prefix (e.g. `comparison=3b-deutsch`).

---

**Distinction:** `comparison` returns values for **other groups** (e.g. parallel class, state average). `aggregation` returns **other views of the same group** (e.g. broken down by competence or gender).

### `aggregation`: aggregation types

> **Spec = free string.** Which kinds of aggregation a backend supports is not prescribed by the spec.

The `aggregation` parameter is only relevant for the `/aggregations` endpoint. It determines the dimensions by which the results are broken down.

| Value        | Meaning                    | Mock server         |
|--------------|----------------------------|---------------------|
| `competence` | By competences             | Implemented         |
| `gender`     | By gender of the students  | Implemented         |
| `exercise`   | By task                    | Not implemented     |

Several values can be combined comma-separated: `aggregation=competence,gender`

Mock server examples:
- [/groups/3a-deutsch/aggregations?aggregation=competence](https://apps.indibit.eu/tba3-api/groups/3a-deutsch/aggregations?aggregation=competence)
- [/groups/3a-deutsch/aggregations?aggregation=gender](https://apps.indibit.eu/tba3-api/groups/3a-deutsch/aggregations?aggregation=gender)

---

### `domain`: filtering by domain

> **Spec = free string.** The parameter is defined in `api/components/parameters.yml`, but not yet bound to any endpoints.

The `domain` parameter filters the results by domain. Without this parameter, the backend returns results across all domains.
The values and abbreviations are described under [Response contents → subject and domain](#subject-and-domain-subject-area-and-domain).

The subject abbreviation is a useful shortcut: `domain=rs,le` is equivalent in content to `domain=de` if, in a given year, the domains _orthography_ and _reading comprehension_ are tested, for example.

**Note on the mock server:** The mock server returns `domain` fields on value groups, but has no server-side filter implemented — the parameter is ignored.

---

## Error behavior

| HTTP status             | Meaning                                                                         | Example                                                                               |
|-------------------------|---------------------------------------------------------------------------------|---------------------------------------------------------------------------------------|
| `200` with empty array  | Parameter is understood, but there is no data for it                            | `?domain=sp` returns `[]` because no language use data is available                   |
| `400 Bad Request`       | Syntactically invalid request (defined in the spec)                             |                                                                                       |
| `404 Not Found`         | Path ID (group, school, state) is unknown                                       | `/groups/unbekannt/competence-levels`                                                 |
| `501 Not Implemented`   | Backend does not recognize or does not support a query parameter value          | `?comparison=pilotierung` → `{ "message": "comparison 'pilotierung' not supported" }` |

`501 Not Implemented` is the agreed convention when a backend fundamentally does not support a parameter value.
The response body contains an explanatory message. This lets a frontend distinguish between "no data available" (200 + empty array) and "not supported" (501).
