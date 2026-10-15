# An assistant that can read the results

There is a prototype for this sub-concept: an **MCP server** in the repository
(`mcp-server/`). It does not run on this site but in the Docker image of the
demo application.

The images on this page show **re-enacted conversations**. We wrote the
questions and the answer texts. We did not make up the figures in the answers:
for every image, a script started the MCP server and made exactly the queries an
assistant would make, against the demo application's sample data. If the
sample data changes, the figures in the images change with it.

## Terms

- **Language model:** a large language model (LLM) such as the ones behind
  ChatGPT, Claude or Mistral. It understands a question in natural language and
  phrases an answer.
- **Assistant:** the application in which you write with the language model.
- **MCP (Model Context Protocol):** an open standard through which an assistant
  can access external data sources.
- **MCP server:** the program that opens up a data source for the assistant.
  Ours describes seven **tools** to the language model, that is, seven queries
  it may make: for example “list the learning groups” or “get the competence
  levels of a learning group”. Each tool calls the TBA3 results interface.

## Findings

- **It works technically.** The language model picks the suitable tools from the
  seven, calls them and phrases an answer from the figures. Nobody has to build
  a dedicated view for the question beforehand.
- **It helps most with questions that need figures from several views.** For
  example: “How is my class doing compared with the school and the state?” In a
  report, the teacher has to look up three values and put them side by side.
  The assistant makes the three queries itself and answers with a table.
- **The interface's responses are not always unambiguous.** For the state, for
  instance, it returns two test booklets without saying which one the class
  took. A person would ask. A language model guesses unless it is explicitly
  told to give both values.
- **The biggest hurdle is data protection.** When asked, the prototype passes
  results of individual children, including gender and language at home, to the
  language model. Before anything like this is used in schools, the states have
  to decide which language model may see which data.

## How a request works

![Diagram: The teacher asks in their own words. The assistant, a language model, picks the queries and phrases the answer. The MCP server describes seven tools. The results interface TBA3 returns the figures. The connection between assistant and MCP server is marked red: this is where the data leaves the school if the language model is an external service.](/dokumentation/bilder/assistent-schaubild-en.png "Four parties. Marked red is the stretch on which result data reaches the language model.")

1. The teacher asks a question in the assistant, in their own words.
2. The language model reads the question and the descriptions of the seven
   tools. It decides which queries it needs.
3. The MCP server runs these queries against the results interface and returns
   the figures to the language model.
4. The language model phrases the answer from the figures.

A report only answers the questions for which a view was built when it was
designed. With an assistant, the teacher decides what they want to know, and
the language model puts together the queries for it.

## Three questions

Each question shows a different aspect: what the assistant does well, where it
runs into limits of the interface, and where data protection has to come in.

### Class, school and state compared

![Re-enacted conversation: a teacher asks how their 3a is doing in reading compared with school and state. Below, four queries to the results interface, then a table with the shares below the minimum standard and at the standard or above for class, school and two state test booklets. A note says the response does not reveal which booklet the class took.](/dokumentation/bilder/assistent-vergleich-en.png "Re-enacted conversation. The grey box shows the four queries the assistant made.")

- **Question:** How is 3a doing in reading, compared with the school and the
  state?
- **What the assistant does:** It first looks up the identifier under which the
  class is listed (`3a-deutsch`). Then it fetches the competence levels for
  class, school and state and sets them side by side in a table.
- **What it shows:** The lookup matters. A language model that has to guess an
  identifier guesses plausibly and wrongly; that is why the prototype has its
  own lookup tools. In addition, the interface returns two test booklets for the
  state without saying which one belongs to the class. The interface should
  therefore state for every result which test it belongs to.

### Difficult items and suitable material

![Re-enacted conversation: the teacher asks on which maths items 3a was clearly below other primary schools and whether there is material for children at level II. Two queries, then a table with three items, their competence level and the solution frequency in 3a compared with primary schools, followed by three materials from “Mathe sicher können”.](/dokumentation/bilder/assistent-material-en.png "Re-enacted conversation. Item results and material catalogue in one answer.")

- **Question:** On which maths items was 3a clearly below other primary
  schools, and is there material for the children at level II?
- **What the assistant does:** It fetches the results per item and compares
  them with the solution frequency at primary schools that the interface
  supplies with every item. It then queries the material catalogue for
  level II material.
- **What it shows:** Two sources are combined in one answer. Whether the
  material fits the items is the teacher's decision, and the assistant says so.
  In the prototype, the material catalogue is built in and contains only
  mathematics from “Mathe sicher können”. With the material interface
  (`/materials`), the assistant could query material assigned to exactly one
  item or competence.

### Individual children: where the line is

![Re-enacted conversation: the teacher asks which children in 3a are below the minimum standard in reading. One query with type=students, then a table of three student codes with gender and language at home. A note marked red says that this individual data went to the language model.](/dokumentation/bilder/assistent-grenze-en.png "Re-enacted conversation. The question is obvious; the answer is the problem.")

- **Question:** Which children in 3a are below the minimum standard in
  reading?
- **What the assistant does:** It retrieves the results of individual children.
  The interface also returns gender and language at home, and the assistant
  passes both to the language model. In the prototype, nothing stops it.
- **What it shows:** Everything a query returns ends up with the language model.
  If the model runs at an external provider, this data leaves the school. The
  codes are not names, but combined with class, gender and language at home
  they are easy to match in a class of 25 children.

## What it is worth in the classroom

- **Questions in one's own words** instead of searching for the right view.
  This helps most when preparing a subject conference or a meeting with the
  school management, where several classes and levels come together.
- **The queries must be visible.** A figure whose source you cannot see is no
  use in a conversation about learning levels. The grey box in the images is
  therefore not decoration but a precondition.
- **The assistant does not replace the report.** It answers questions the report
  leaves open. What a figure means for teaching is still up to the teacher.

## What operation would have to settle

- **Which language model?** A model run by the state or by a provider under a
  data-processing agreement, or a freely available service. This determines
  which data may go to the model at all.
- **Which data?** An assistant for group results only is a different decision
  from one with results of individual children. The MCP server should not offer
  individual data at all while this question is open.
- **Who is asking?** The prototype has no sign-in and no roles. It cannot
  restrict answers to “your class” even if it wanted to.
- **Unambiguous responses.** Every result should name test, grade and test
  booklet, and the list of learning groups should come from the interface
  instead of a built-in list.

The technical details are in the
[demo application recipes](demo-rezepte.md#an-assistant-that-can-read-the-results-the-mcp-server).
They describe the seven tools, the two transport routes and operation in the
container.
