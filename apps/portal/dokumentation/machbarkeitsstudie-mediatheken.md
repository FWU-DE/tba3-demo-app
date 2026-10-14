# Mediatheken einbinden: Material zur Rückmeldung finden

Teil der [Machbarkeitsstudie](machbarkeitsstudie.md). Geprüft am Prototyp im
Reiter „Lernmaterialien“ der Demoanwendung, angebunden ist die Mediathek MUNDO.
Die Abfragen an MEM und an die Beispieldaten stammen vom 14.10.2026.

## Das Ergebnis vorweg

- **Technisch machbar.** Eine Lehrkraft öffnet MUNDO aus der Demoanwendung
  heraus, wählt Material aus und erhält es zurück. Es hängt dann direkt an der
  Kompetenzstufe oder Lerngruppe, an der sie gerade arbeitet. Dafür genügt ein
  verbreiteter Standard (LTI 1.1 Content-Item Selection), MUNDO muss dafür
  nichts Neues bauen.
- **Fachlich bringt es wenig, solange die Lehrkraft nicht schon weiß, was sie
  sucht.** Die Suche beginnt in MUNDO mit einer leeren Maske. Aus der
  Rückmeldung geht nichts in die Suche ein: keine Kompetenzstufe, keine
  Leitidee, keine Aufgabe.
- **Eine Suche, die von der Rückmeldung ausgeht, scheitert an zwei Lücken.**
  Die Rückmeldungen nennen ihre Kompetenzen nur als Kürzel ohne Bezugssystem.
  Und die Mediathek lässt sich nicht nach Leitidee oder Bildungsstandard
  durchsuchen, weil ihre Materialien nicht danach erschlossen sind.
- **MEM kann eine Seite der Brücke tragen, nicht beide.** Der
  Ontologieserver führt die KMK-Bildungsstandards mit stabilen Adressen und
  löst zum Beispiel die Mathematik-Leitideen L1 bis L5 auf. Die Verbindung zum
  Material fehlt dort aber genauso wie in der Mediathek.

## Die Frage

Eine Rückmeldung zeigt, wo eine Lerngruppe steht: wie viele Schüler:innen auf
welcher Kompetenzstufe liegen, welche Aufgaben schwerfielen, in welchem
Teilbereich die Gruppe unter dem Landesschnitt liegt. Die nächste Frage der
Lehrkraft lautet: *Womit arbeite ich jetzt weiter?*

Die Länder betreiben Mediatheken mit geprüftem Material. Untersucht wurde, ob
sich eine solche Mediathek so einbinden lässt, dass der Weg von der Rückmeldung
zum Material kurz wird. Das Material soll dabei dort landen, wo die Lehrkraft
es braucht: an der Stufe, an der Gruppe, im Export für die Lernplattform.

## So arbeitet der Prototyp

### Der Weg in Kürze

```
Demoanwendung                         MUNDO (mundo.schule/lti/)
─────────────                         ─────────────────────────
1. „In MUNDO suchen“
2. Anfrage signieren (OAuth 1.0a)
3. Formular im Popup absenden  ─────▶  Suchoberfläche von MUNDO
                                       4. Lehrkraft sucht und wählt
                               ◀─────  5. POST an content_item_return_url
6. /lti-callback nimmt die Auswahl an
7. postMessage ans öffnende Fenster
8. Auswahl prüfen, übernehmen,
   der aktuellen Stufe zuordnen
```

### Der Start: eine signierte LTI-Anfrage

MUNDO bietet eine LTI-Schnittstelle an. Darüber kann eine fremde Anwendung die
Suchoberfläche öffnen und sich die Auswahl zurückschicken lassen. Der Prototyp
nutzt dafür die *Content-Item Selection* aus LTI 1.1. Die Anfrage enthält
diese Felder:

| Feld | Wert im Prototyp | Bedeutung |
|---|---|---|
| `lti_message_type` | `ContentItemSelectionRequest` | „Lass die Lehrkraft etwas auswählen und schick es zurück.“ |
| `lti_version` | `LTI-1p0` | |
| `content_item_return_url` | `<Herkunft>/lti-callback` | Wohin MUNDO die Auswahl schickt |
| `accept_media_types` | `application/vnd.ims.lti.v1.ltilink,text/html` | Was zurückkommen darf |
| `accept_presentation_document_targets` | `window` | Material öffnet sich in einem eigenen Fenster |
| `roles` | `Instructor` | Die Anfrage kommt von einer Lehrkraft |
| `resource_link_id`, `context_id` | `tba3-material-picker`, `tba3-demo` | Feste Kennungen der Demo |
| `oauth_*` | Schlüssel, Nonce, Zeitstempel, HMAC-SHA1-Signatur | Signatur nach OAuth 1.0a |

Signiert wird im Browser über die Web Crypto API
(`apps/demo/src/utils/ltiOauth.js`). Danach schreibt der Prototyp ein Formular
in ein leeres Popup und sendet es ab. Der Umweg über `about:blank` hat einen
Grund: ein Formular aus einer `blob:`-Adresse käme mit der Herkunft `null` bei
MUNDO an und würde dort abgelehnt.

Die Zugangsdaten (Tool-URL, Consumer-Key, Shared Secret) trägt man im Dialog
ein. Sie stehen auf `mundo.schule/cms/lti` und werden im `localStorage`
abgelegt.

### Der Rückweg: die Auswahl kommt als Formular zurück

Nach der Auswahl schickt MUNDO ein Formular an die `content_item_return_url`.
Der Prototyp nimmt es unter `/lti-callback` an: im Entwicklungsserver über ein
Vite-Plugin (`apps/demo/vite.config.js`), im Docker-Container über
`tools/mock-server.mjs`. Die Antwort ist eine kleine HTML-Seite. Sie reicht die
Formulardaten per `postMessage` an das öffnende Fenster weiter.

Dort liest `MundoSearchModal.jsx` das Feld `content_items`, ein JSON-LD-Dokument
mit einem `@graph`. Pro Eintrag übernimmt der Prototyp diese Angaben:

| Angabe | Woher |
|---|---|
| Titel | `title`, sonst `text` |
| Beschreibung | `text` |
| Adresse | `url`, sonst die SODIX-Kennung aus `custom.mn` → `https://mundo.schule/details/<Kennung>` |
| Vorschaubild | `thumbnail['@id']` oder `thumbnail.url` |

Den Umweg über die SODIX-Kennung braucht es, weil MUNDO bei einem `LtiLinkItem`
keine direkte Adresse mitschickt. Ohne diese Ableitung hätte das übernommene
Material keinen Link.

### Was mit der Auswahl geschieht

Die Treffer landen in denselben beiden Ablagen wie das übrige Material
(`tba3_external_materials`, `tba3_materials_by_level`) und werden sofort der
gerade gewählten Kompetenzstufe oder Lerngruppe zugeordnet. Von da an
behandelt die Anwendung sie wie lokales Material: Sie erscheinen in der Liste
mit dem Vermerk „MUNDO“ und gehen in den PDF-Export und in die Common Cartridge
(`.imscc`) für die Lernplattform ein.

Für den Fall, dass LTI nicht zur Verfügung steht, gibt es einen zweiten Reiter.
Dort trägt man Titel, Adresse und Beschreibung eines Materials von Hand ein,
das man vorher auf mundo.schule gefunden hat.

### Was im Prototyp vereinfacht ist

Diese Punkte müsste ein Betrieb lösen. Sie ändern aber nichts an der Antwort
auf die Machbarkeitsfrage:

- **Das Shared Secret steht im Browser.** Wer die Seite öffnet, kann es
  auslesen. Im Betrieb gehört die Signatur auf einen Server. Besser noch wäre
  LTI 1.3 mit *Deep Linking*, weil dort Schlüsselpaare das gemeinsame Geheimnis
  ersetzen.
- **Der Rückweg fehlt im öffentlichen Deployment.** `/lti-callback` gibt es im
  Entwicklungsserver und im Docker-Container. Auf `tba3.vercel.app` antwortet
  die Adresse mit 404 (geprüft am 14.10.2026). Dort funktioniert deshalb nur
  die manuelle Eingabe.
- **`postMessage` geht an jede Herkunft (`'*'`).** Für eine Demo ist das
  vertretbar, im Betrieb wird die Zielherkunft festgelegt.
- **Die Zuordnungen liegen im `localStorage`.** Sie gelten nur für ein Gerät
  und einen Browser.

## Warum es trotzdem wenig austrägt

Der Prototyp verkürzt den **zweiten** Schritt: Ein Material, das die Lehrkraft
gefunden hat, landet ohne Kopieren und Einfügen an der richtigen Stelle. Den
**ersten** Schritt verkürzt er nicht, also das Finden selbst.

Die Anfrage an MUNDO sagt nichts darüber, wofür gesucht wird. In ihr steht
weder die Kompetenzstufe noch die Leitidee, in der die Gruppe schwach
abgeschnitten hat, noch die Aufgabe, an der viele gescheitert sind. LTI 1.1
sieht für die Content-Item Selection auch kein Feld für einen Suchbegriff vor.
Eigene Parameter (`custom_*`) wären möglich, MUNDO müsste sie aber auswerten.
Die Lehrkraft steht also vor einer leeren Suchmaske und muss die Rückmeldung
selbst in Suchbegriffe übersetzen.

Für eine Lehrkraft, die genau weiß, was sie sucht („Bruchrechnung,
Klasse 6, Arbeitsblatt“), ist der Weg bequem. Für die eigentliche Frage nach
der Rückmeldung („Was hilft einer Gruppe, die bei *Messen* auf Stufe II liegt?“)
leistet er nichts, was die Lehrkraft nicht auch in einem zweiten Browserfenster
hätte.

Damit die Rückmeldung selbst die Suche anstoßen kann, müssten beide Seiten
dieselbe Sprache sprechen. Das tun sie heute nicht, und zwar auf keiner der
beiden Seiten.

### Lücke 1: Die Rückmeldungen nennen ihre Kompetenzen nur als Kürzel

Die Schnittstelle sieht Kompetenzangaben vor: an jedem Item hängen
`competences` mit Typ, Name, Beschreibung und `id`. In den Beispieldaten des
Referenzservers, auf denen die Demoanwendung läuft, sind diese Felder so
gefüllt:

| Feld | Inhalt in den Beispieldaten |
|---|---|
| `domain` (Teilbereich) | Zweibuchstabige Kürzel (`le`, `ho`, `zo`, `gm`, `ms` …), `id` immer `null` |
| `competences[].name` | Kürzel wie `3.3.b`, `1.09m`, `L4`, `K2` |
| `competences[].description` | in keinem einzigen Eintrag gefüllt |
| `competences[].id` | immer `null` |
| `competenceLevel.id` | immer `null` |

Die Leitidee steht also da, nur eben als `L4`. Das Problem ist, dass ein solches
Kürzel erst zusammen mit seinem Bezugssystem etwas bedeutet. Das zeigt sich
deutlich, wenn man es nachschlägt. Die Schreibweise `3.3` tragen in MEM
39 verschiedene Standards aus 38 Kompetenzkatalogen, von „Texte erschließen“
(Deutsch, Primarstufe) bis „Wirkung von Katalysatoren“ (Chemie). Auch die
Mathematik-Leitideen sind nicht eindeutig. Die Bildungsstandards von 2004
zählen sie als L1 bis L5 („Leitidee Zahl“, „Leitidee Messen“ …). Die Fassung
von 2022 nummeriert sie 1 bis 5 und schneidet sie anders zu („Zahl und
Operation“, „Größen und Messen“ …). Aus dem Kürzel allein geht nicht hervor,
welche der beiden Fassungen gemeint ist. Eine Beschreibung oder Kennung, die
das klären könnte, schickt die Schnittstelle nicht mit.

### Lücke 2: Die Mediathek ist nicht nach Bildungsstandards erschlossen

Selbst mit einer eindeutigen Leitidee fände sich in MUNDO nichts *über* die
Leitidee. Das Metadatenmodell, mit dem die MUNDO-Oberfläche arbeitet, enthält
diese Felder: Lernressourcentyp, Bildungsstufe, Schulart, Klassenstufe, Fach,
Lizenz, Schlagworte und Urheber. Ein Feld für einen Lehrplan, einen
Bildungsstandard, eine Leitidee oder eine Kompetenz gibt es nicht. Geprüft
wurde das am ausgelieferten Code von mundo.schule am 14.10.2026. Ob SODIX
intern mehr führt, als die Oberfläche zeigt, muss das SODIX-Team bestätigen.

Es bleibt die Volltextsuche über Titel, Beschreibung und Schlagworte. Ein
Material über Längen und Flächen steht dort unter „Flächeninhalt“ oder
„Umfang“, kaum unter „Leitidee Messen“. Eine Suche mit der Leitidee als
Begriff liefert deshalb nur zufällige Treffer.

## Könnte MEM die Zwischenschicht sein?

[MEM](https://mem.schule/) (Metadata for Education Media) ist ein
Ontologieserver der FWU. Er bildet Lehrpläne in einer gemeinsamen Ontologie ab
und ist über einen öffentlichen SPARQL-Endpunkt
(`sparql.mem.edufeed.org`) sowie einen MCP-Server
([`FWU-DE/mem-mcp`](https://github.com/FWU-DE/mem-mcp)) erreichbar. Die Frage
war, ob MEM die beiden Lücken überbrücken kann: Kürzel aus der Rückmeldung
hinein, durchsuchbare Begriffe für die Mediathek heraus.

### Was MEM mitbringt

Neben den Lehrplänen von fünf Ländern (Bayern, Sachsen, Rheinland-Pfalz,
Brandenburg, Berlin) enthält MEM einen eigenen Graphen mit den
**KMK-Bildungsstandards in der Fassung des IQB**
(`https://w3id.org/lehrplan/bistas`). Er umfasst rund 6.700 Begriffe als
SKOS-Vokabular, jeder mit einer stabilen Adresse unter `w3id.org/iqb/`, einer
Notation und einer Bezeichnung. Die Fächer reichen von Deutsch und Mathematik
über die Fremdsprachen bis zu den Naturwissenschaften, die Stufen von der
Primarstufe bis zur Sekundarstufe II, jeweils in den Fassungen von 2004 und
2022.

Die Mathematik-Leitideen der Beispieldaten finden sich dort vollständig:

| Kürzel in der Rückmeldung | Begriff in MEM | Adresse |
|---|---|---|
| `L1` | Leitidee Zahl | `w3id.org/iqb/bista04-ma-s1/ie/7dd44a45-…` |
| `L2` | Leitidee Messen | `w3id.org/iqb/bista04-ma-s1/ie/3daa740c-…` |
| `L3` | Leitidee Raum und Form | `w3id.org/iqb/bista04-ma-s1/ie/44130980-…` |
| `L4` | Leitidee Funktionaler Zusammenhang | `w3id.org/iqb/bista04-ma-s1/ie/0e22ccfe-…` |
| `L5` | Leitidee Daten und Zufall | `w3id.org/iqb/bista04-ma-s1/ie/ccabc0a7-…` |

Das Vokabular, in dem sich Rückmeldung und Material treffen könnten, gibt es
also schon. Es ist offen zugänglich, und es stammt vom IQB, das auch die Tests
entwickelt.

### Wie weit die Kürzel tragen

Für jede Kombination aus Fach und Stufe in den Beispieldaten wurden die
Kompetenzkürzel gegen die passenden Kataloge in MEM abgeglichen. Gezählt ist
jeweils die Fassung mit den meisten Treffern:

| Fach, Stufe | Art | Kürzel | in MEM gefunden | Fassung |
|---|---|---|---|---|
| Mathematik 8 | Leitidee | 5 | 5 | 2004 |
| Mathematik 8 | Allgemeine Kompetenz | 6 | 6 | 2004 |
| Mathematik 8 | Kompetenz | 31 | 0 | – |
| Mathematik 3 | Kompetenz | 47 | 27 | 2004 |
| Deutsch 8 | Kompetenz | 19 | 14 | 2004 |
| Deutsch 3 | Kompetenz | 11 | 0 | – |

Die groben Ebenen (Leitidee, allgemeine Kompetenz) lassen sich auflösen, sobald
man die Fassung kennt. Die feinen Kürzel der Items (`1.09m`, `3.3.i`) folgen in
zwei Fällen einer Zählung, die in den veröffentlichten Standards nicht
vorkommt. Wo sie gefunden wurden, stimmt zunächst nur die Schreibweise. Ob
derselbe Standard gemeint ist, wurde nicht geprüft.

### Was zur Brücke fehlt

```
Rückmeldung          MEM                          Mediathek
───────────          ───                          ─────────
„L2“  ──── ✗ ────▶   Leitidee Messen      ──── ✗ ────▶   Material
          Fassung    w3id.org/iqb/…                Erschließung
          fehlt                                    fehlt
```

1. **Die Rückmeldung muss sagen, welcher Begriff gemeint ist.** Das Feld dafür
   gibt es schon: `competences[].id` ist in der Spezifikation vorgesehen und
   bleibt heute leer. Stünde dort die `w3id.org/iqb/…`-Adresse, wäre die erste
   Lücke geschlossen, ohne dass sich die Schnittstelle ändern müsste. Das
   betrifft die Testentwicklung und die Spezifikation in `indibit-eu/tba3`,
   nicht die Oberfläche.
2. **Das Material muss mit denselben Begriffen erschlossen sein.** Hier hilft
   MEM nicht. Die Ontologie beschreibt Lehrpläne und Standards, sie verbindet
   sie aber nicht mit Medien. Solange MUNDO-Materialien keine Bildungsstandards
   tragen, findet auch die beste Adresse nichts. Das ist der teure Teil: eine
   redaktionelle oder maschinell unterstützte Nacherschließung des Bestands.
3. **Vom Standard zum Landeslehrplan führt in MEM kein Weg.** Kein Lehrplan der
   fünf Länder verweist dort auf einen Bildungsstandard. Wer Material über den
   Landeslehrplan erschließt, kommt deshalb auch über diesen Umweg nicht von
   der Rückmeldung zum Material.

### Was MEM heute schon leisten könnte

Etwas lässt sich auch ohne die beiden fehlenden Teile verbessern: MEM übersetzt
die Kürzel in Worte. Statt „L2“ zeigt die Anwendung „Leitidee Messen“ und kann
der Lehrkraft die Bezeichnungen der Standards darunter als Suchvorschläge
anbieten. Das macht aus der leeren Suchmaske eine vorbelegte. Damit es geht,
muss die Anwendung die Fassung kennen (pro Test fest hinterlegt), und MUNDO
muss einen Suchbegriff beim Start annehmen. Treffsicherer wird die Suche
dadurch nur so weit, wie die Volltextsuche reicht. Es bleibt eine Hilfe beim
Formulieren der Suche, eine Zuordnung ist es nicht.

## Was daraus folgt

- **Als Komfortfunktion lohnt die Einbindung.** Wer gezielt sucht, spart sich
  das Kopieren, und das Material landet im Export. Für einen Betrieb gehört die
  Signatur auf einen Server, und der Rückweg muss auch im öffentlichen
  Deployment funktionieren.
- **„Passendes Material zur Rückmeldung“ sollte man nicht versprechen**,
  solange beide Lücken offen sind. Ein Knopf, der nach einer Empfehlung
  aussieht und eine leere Suchmaske öffnet, enttäuscht beim ersten Mal.
- **Der günstigste Hebel liegt auf der Seite der Rückmeldung:**
  `competences[].id` mit der IQB-Adresse füllen. Das kostet wenig, das Feld
  existiert bereits, und jede spätere Anbindung an eine Mediathek, an MEM oder
  an den Materialien-Entwurf profitiert davon.
- **Der teure Hebel liegt bei der Mediathek:** Material nach
  Bildungsstandards erschließen. Ohne diesen Schritt bleibt jede Zwischenschicht
  ohne Gegenstück.
- **Der Materialien-Entwurf umgeht beide Lücken.** `/materials` hängt Material
  direkt an ein Item, eine Kompetenz oder eine Stufe, und zwar dort, wo der Test
  entsteht. Dann muss nichts gesucht werden, weil die Zuordnung schon beim
  Erstellen des Tests getroffen wurde. Die Demoanwendung zeigt diesen Weg im
  dritten Modus des Reiters „Lernmaterialien“ neben dem MUNDO-Weg.
