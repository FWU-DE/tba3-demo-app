<!-- Übersetzung von rezepte.md, sha256:4d4e6b91aa885694ea251b6768414d2555f09dcf2356139f38a2e83e462c9bdd -->

# TBA3 evaluation interface: recipes

This page records insights from various discussions that arose in the course of developing
and, above all, using the interface.

## Handling covariates at student and group level

### At student level: covariates directly on the value group

At student level, covariates are unambiguous and are delivered directly on the value group:

```json
{
  "name": "Schüler 1",
  "type": "student",
  "covariates": [
    { "type": "gender", "label": "Geschlecht", "value": "female" },
    { "type": "languageAtHome", "label": "Sprache zu Hause", "value": "german" }
  ],
  "items": []
}
```

### At group level: aggregations instead of covariates

At group or school level, a covariate such as "gender" is no longer a single value but a distribution (e.g. 12 female, 8 male). That does not fit the `type/label/value` schema of covariates, which expects a single value.

The `/aggregations` endpoint is better suited: it breaks the results down by one dimension and automatically includes the frequencies.

**Request**

```
GET /groups/3a-deutsch/aggregations?aggregation=gender
```

**Response**

The response contains one aggregation with descriptive statistics per gender. The `descriptiveStatistics` provide both the number of students in this group (`total`) and the mean solution rate.

```json
{
  "name": "Klasse 3a",
  "type": "group",
  "domain": { "name": "Leseverstehen" },
  "aggregations": [
    {
      "type": "gender",
      "value": "female",
      "descriptiveStatistics": { "total": 12, "frequency": 9, "mean": 0.75 }
    },
    {
      "type": "gender",
      "value": "male",
      "descriptiveStatistics": { "total": 8, "frequency": 5, "mean": 0.63 }
    }
  ]
}
```

### At group level: covariates for classifying the group

Covariates can also make sense at group level – when the aim is not to show the distribution within the group, but to classify/cluster the group as a whole by a distribution of characteristics.

**Example:** When comparing several classes, it should be visible whether the gender distribution has an influence on the results. For this, each class is given an aggregated covariate:

```json
{
  "name": "Klasse 3a",
  "type": "group",
  "covariates": [
    { "type": "genderDistribution", "label": "Geschlechterverteilung", "value": "majority-female" }
  ],
  "competenceLevels": []
}
```

This way, groups can be compared or filtered by this characteristic without having to break down the full distribution.

### Summary

| Level   | Goal                                       | Mechanism                         | Example                      |
|---------|--------------------------------------------|-----------------------------------|------------------------------|
| Student | Characteristic of a person                 | Covariate on the value group      | `"value": "female"`          |
| Group   | See the distribution within the group      | `/aggregations` endpoint          | `?aggregation=gender`        |
| Group   | Classify the group as a whole              | Covariate with aggregated value   | `"value": "majority-female"` |

---

## Key ideas in mathematics: domain vs. competences

### Background

In German, French and English there are usually two domains (e.g. reading comprehension and spelling), for each of which separate competence levels are calculated.
The responses are grouped by domain – each domain yields its own value group.

Mathematics is different: currently, in many cases both V3 and V8 are evaluated using the **global model**.
There is only one competence level for the entire subject.
The term "key idea" (Leitidee) is used for two different concepts here:

1. **Key idea as domain:** The level at which competence levels could theoretically be calculated.
2. **Key idea as item property:** Which content area a task assesses. An item can also be assigned to several key ideas.

### Recommendation

Do **not** group the data in mathematics by domain.
Key ideas as content assignments are stored in the `competences` metadata on the items.
The response comes back flat; the frontend can group and display by `competences` if needed.

Should a system evaluate mathematics by key-idea domains (i.e. calculate competence levels per key idea),
it is free to use the key ideas as `domain` and to group the response accordingly. Both are spec-compliant.

**Example: items in mathematics**

```
GET /groups/8a-mathe/items
```

```json
[
  {
    "name": "Klasse 8a",
    "type": "group",
    "domain": null,
    "subject": { "name": "Mathematik" },
    "items": [
      {
        "name": "01.02",
        "competences": [{ "name": "L1 - Zahlen und Operationen" }],
        "descriptiveStatistics": { "total": 20, "frequency": 15, "mean": 0.75 }
      },
      {
        "name": "02.01",
        "competences": [{ "name": "L3 - Raum und Form" }],
        "descriptiveStatistics": { "total": 20, "frequency": 12, "mean": 0.60 }
      }
    ]
  }
]
```

The value group here has no `domain` – the assignment to key ideas lies in the `competences` of the individual items. A frontend that wants to group by key idea can do so locally.

---

## Grouping by domain: when does it make sense?

The spec allows responses to be grouped by domain (one value group per domain) or returned flat (one value group for everything). Which approach makes sense depends on the endpoint and use case.

### `/competence-levels`: always group by domain

Competence levels are calculated specifically for a domain (e.g. "reading comprehension" or "spelling").
A value group without a domain could not be meaningfully interpreted here.
The response should therefore always be grouped by domain.

A special case is mathematics, when it is evaluated using the global model and no domain grouping takes place –
see [Recipe: key ideas in mathematics](#key-ideas-in-mathematics-domain-vs-competences).

### `/items`: depends on the presentation

**Ungrouped** makes sense if all items of a test are to be shown flat in one table –
e.g. a student table with all results. `response.length` then directly gives the number of items.
The domain is still available on the individual item via the `parameters`.

**Grouped** makes sense if the presentation is to be split by test domain – e.g. separate item tables for "reading comprehension" and "spelling".

### `/aggregations`: depends on the presentation

**Ungrouped** makes sense if, for example, solution rates per task or per competence are to be calculated and displayed
without distinguishing by domain. Or for all aggregations that are not related in content to the test booklet (e.g. gender).

**Grouped** makes sense if the same aggregations are additionally to be shown separately by test domain –
e.g. solution rates per competence, once for "listening comprehension" and once for "reading comprehension".

### Summary

| Endpoint             | Grouped                       | Ungrouped                  | Recommendation                                                                          |
|----------------------|-------------------------------|----------------------------|-----------------------------------------------------------------------------------------|
| `/competence-levels` | CL per domain                 | –                          | grouped (except the [mathematics special case](#key-ideas-in-mathematics-domain-vs-competences)) |
| `/items`             | Item table per domain         | All items flat             | depends on the presentation                                                             |
| `/aggregations`      | Aggregations per domain       | All aggregations flat      | tends towards ungrouped                                                                 |

Both are spec-compliant. The backend makes the decision – ideally aligned with the requirements of the report.

---

## Combining aggregations at different levels

### Background

In practice there are two independent hierarchies on which data can be aggregated:

1. **Educational standards:** items → tasks → competence areas/key ideas → domains → subject
2. **Group:** students → learning group → school → district → state

These hierarchies are orthogonal to each other: an aggregation by competence area can take place at student level as well as at class level.

### Implementation via the interface

The combination of `type` and `aggregation` maps exactly this nesting:

**Solution frequencies by key idea at class level:**

```
GET /groups/8a-mathe/aggregations?aggregation=competence
```

Returns the mean solution rate of the class per key idea.

**Solution frequencies by key idea at class and student level:**

```
GET /groups/8a-mathe/aggregations?type=group,students&aggregation=competence
```

Returns the mean solution rate per key idea for the class **and** for each student. With `comparison`, reference values (e.g. piloting, state average) can be added as well:

```
GET /groups/8a-mathe/aggregations?type=group,students&aggregation=competence&comparison=state-average
```

### Splitting into multiple requests

You do not have to pack everything into a single request. Especially when combining several `type` values, the responses can become very large.
Instead, the data can be split into smaller, clearer requests – e.g. separated by `type`:

```
GET /groups/8a-mathe/aggregations?type=group&aggregation=competence
GET /groups/8a-mathe/aggregations?type=students&aggregation=competence
```

This returns the same data as a combined request with `type=group,students`, but in smaller responses that are easier to process.
Which approach fits better depends on the use case.

### Summary

| What                                                      | How                                                                    |
|-----------------------------------------------------------|------------------------------------------------------------------------|
| Choose educational-standards level (e.g. competence area) | `aggregation=competence`                                               |
| Choose group level (e.g. class + students)                | `type=group,students`                                                  |
| Add reference values                                      | `comparison=state-average`                                             |
| Combine everything                                        | `?type=group,students&aggregation=competence&comparison=state-average` |
| Alternatively: split                                      | Separate requests per `type` for smaller responses                     |

