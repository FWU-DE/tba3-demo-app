# An assistant that can read the results

Prototype: the MCP server in the repository (`mcp-server/`), a pilot. The
conversations on this page are **mockups**: the questions and wording are
invented. The figures are real. For every image, the pilot's tools were actually
called against the demo application's sample data.

## Findings

- **It works technically.** A language model that is told which queries the
  results interface offers assembles them itself. It answers questions for which
  nobody built a view.
- **The benefit lies in questions that cross several queries.** The class
  against school and state, weak items together with suitable material: in a
  report that takes several views and the teacher's own reasoning. The
  assistant does it in one step.
- **The interface's responses are not unambiguous enough for a model.** For the
  state, two test booklets come back, with no indication of which one the class
  took. A person asks. A model guesses, or lists both if told to.
- **The real hurdle is data protection.** When asked, the pilot passes
  individual data, including gender and language at home, to the language
  model. Before anything like this runs in schools, the states have to decide
  which model may see the data and which data at all.

## How it fits together

A report answers the questions that were foreseen when it was designed. “On
which items was my class below other primary schools, and is there material for
them?” is not one of them. Building a separate view for every such combination
never ends.

The **Model Context Protocol (MCP)** is an open standard through which an
assistant can use tools. The MCP server tells it which queries exist and what
they need. Which of them answer a question is up to the language model.

![Diagram: The teacher asks in their own words. The assistant, a language model, picks the queries and phrases the answer. The MCP server describes seven tools. The results interface TBA3 returns the figures. The connection between assistant and MCP server is marked red: this is where the data leaves the school if the language model is an external service.](/dokumentation/bilder/assistent-schaubild-en.png "Four parties. The critical stretch is between MCP server and language model.")

## Three conversations

### The class in comparison

![Mockup of an assistant conversation: a teacher asks how their 3a is doing in reading compared with school and state. Below, four tool calls to the results interface, then a table with the shares below the minimum standard and at the standard or above for class, school and two state test booklets. A note says the response does not reveal which booklet the class took.](/dokumentation/bilder/assistent-vergleich-en.png "Mockup. Four queries, one table. The grey box shows what happened in the background.")

The assistant first looks up what the class is called in the data, then fetches
the competence levels for class, school and state. The order matters: **a model
that has to guess an identifier such as `3a-deutsch` guesses plausibly and
wrongly.** That is why the pilot has its own lookup tools.

The state response contains two test booklets for German in grade 3, and
nothing in it says which one belongs to this class. In a report this goes
unnoticed, because the view hard-wires it. An assistant has to disclose it. For
the interface this means: a value group should say which test it belongs to.

### Weak items and suitable material

![Mockup: the teacher asks on which maths items 3a was clearly below other primary schools and whether there is material for children at level II. Two tool calls, then a table with three items, their competence level and the solution frequency in 3a compared with primary schools, followed by three materials from “Mathe sicher können”.](/dokumentation/bilder/assistent-material-en.png "Mockup. Item results and material catalogue in one answer.")

Here the assistant crosses two sources: **the solution frequency per item**
with the primary-school reference value every item carries, and **the material
catalogue**. Whether the material fits the items remains the teacher's
decision, and the assistant says so.

In the pilot, the material catalogue is built in. It contains only mathematics
from “Mathe sicher können”. With the material interface (`/materials`), the
assistant could instead query material that is assigned to an item or a
competence.

### Where the line is

![Mockup: the teacher asks which children in 3a are below the minimum standard in reading. One tool call with type=students, then a table of three student codes with gender and language at home. A note marked red says that this individual data went to the language model.](/dokumentation/bilder/assistent-grenze-en.png "Mockup. The question is obvious; the answer is the problem.")

This is the question a teacher is most likely to ask. **In the pilot, nothing
stops the assistant from answering it.** It retrieves the individual data, and
with it gender and language at home, because the interface returns them.
Everything a tool returns goes to the language model. If the model runs at an
external provider, this data leaves the school.

The codes are pseudonyms, not names. Combined with class, gender and language
at home, they are still easy to match in a class of 25 children.

## What it is worth in the classroom

- **Questions in one's own words** instead of searching for the right view.
  This helps most when preparing a subject conference or a meeting with the
  school management, where several classes and levels come together.
- **The queries must be visible.** A figure without a source is worthless in a
  conversation about learning levels. The grey box in the mockups is not
  decoration but a precondition.
- **The assistant does not replace the report.** It answers the questions the
  report leaves open. Interpretation, meaning what a figure means for teaching,
  stays with the teacher.

## What operation would have to settle

- **Which model?** A model run by the state or by a provider under a
  data-processing agreement, or an external service. This determines which data
  may go to the model at all.
- **Which data?** An assistant for group results only is a different decision
  from one with individual data. The tool should not offer individual data at
  all until that question is answered.
- **Who is asking?** The pilot has no sign-in and no roles. It could not
  restrict answers to “your class” even if it wanted to.
- **Unambiguous responses.** Value groups should name test, grade and test
  booklet, and a directory of learning groups should come from the interface
  instead of a built-in list.

The technical details are in the
[demo application recipes](demo-rezepte.md#an-assistant-that-can-read-the-results-the-mcp-server).
They describe the seven tools, the two transports and operation in
the container.
