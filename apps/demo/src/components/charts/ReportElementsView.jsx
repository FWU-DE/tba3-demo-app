// Der Reiter „Rückmeldeelemente": der Katalog aus den Sachberichten der vier
// Einrichtungen, gezeichnet mit den Daten der gerade gewählten Ebene.
//
// Warum das hier steht, obwohl andere Reiter dasselbe schon zeigen: Der Katalog
// ordnet die Darstellungen **nach der fachlichen Frage**, nicht nach der
// Ressource der Schnittstelle. Wer wissen will, wie vier Einrichtungen
// unabhängig voneinander dieselbe Frage beantwortet haben, findet hier alle
// Antworten nebeneinander — auch die, die im Reiter „Kompetenzstufen" oder
// „Item-Statistiken" schon einmal stehen. Die Doppelung ist der Zweck der
// Ansicht und kein Versehen.
//
// Gezeichnet wird mit `@tba3/bausteine` — demselben Paket, das ein fremdes
// Projekt bekommt. Was dort fehlt, bleibt leer und sagt, warum: entweder gibt
// es den Baustein noch nicht, oder die Schnittstelle liefert die Daten nicht.

import { useMemo, useState } from 'react';
import { KOMPONENTEN } from '@tba3/bausteine/react';
import {
  EINRICHTUNGEN, RUECKMELDUNGEN, nachSchichten, rueckmeldungenZu,
} from '../../../../shared/konsortium.js';
import { text as ausWoerterbuch } from '../../../../shared/sprache.js';
import { useFilters } from '../../context/useFilters';
import { useCompetenceLevels } from '../../hooks/useCompetenceLevels';
import { useItems } from '../../hooks/useItems';
import { useKonstanten, useSprache, useTexte } from '../../i18n';
import Card from '../common/Card';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSkeleton from '../common/LoadingSkeleton';
import {
  aufgabenZeilen, erwartungsPunkte, gesamtQuote, gesamtZeile, heatmapDaten, kennzahlen,
  kontextmerkmal, leisteZeilen, mittelwertZeilen, perzentilBaender, schuelerTabelle,
  standardErreichung, streuPunkte, uebersichtsKarten, zeugnissatzWerte,
} from '../../utils/reportElements';

// Auf Modulebene: als Objektliteral im Render wären es bei jedem Durchlauf neue
// Parameter, und der Daten-Hook liefe endlos nach.
const NUR_GRUPPE = { type: 'group' };
const NUR_SCHUELER = { type: 'students' };

/** kompetenzstufen-leiste → KompetenzstufenLeiste */
const pascal = (name) => name.replace(/(^|-)([a-zäöü])/g, (_, __, c) => c.toUpperCase());

const Element = ({ name, ...props }) => {
  const Komponente = KOMPONENTEN[pascal(name)];
  if (!Komponente) return null;
  return <Komponente {...props} />;
};

/**
 * Die Eigenschaften je Katalogeintrag. Ein Eintrag, der hier fehlt, wird nicht
 * gezeichnet — die Ansicht sagt dann, woran es liegt, statt eine leere Fläche
 * zu zeigen.
 */
const zeichnung = (id, q, hilfe) => {
  switch (id) {
    case 'kompetenzstufen-verteilung':
      return { name: 'kompetenzstufen-leiste', rows: leisteZeilen(q.stufen.data, hilfe) };
    case 'vergleichsebenen':
      return { name: 'kompetenzstufen-leiste', rows: q.ebenen };
    case 'uebersichtskarten':
      return { name: 'uebersichtskarten', karten: uebersichtsKarten(q.stufen.data, hilfe), spalten: 3 };
    case 'kennzahl-mit-vergleich':
      return { kacheln: kennzahlen(q.stufen.data, hilfe) };
    case 'loesungshaeufigkeit-je-aufgabe':
      return { name: 'aufgaben-tabelle', items: aufgabenZeilen(q.aufgaben.data) };
    case 'staerken-und-entwicklungsbedarfe':
      // Dieselben Aufgaben, nach der Abweichung geordnet: oben die Stärken,
      // unten die Entwicklungsbedarfe. Der Baustein kann das, die Sortierung
      // ist die ganze Differenz zum Eintrag darüber.
      return {
        name: 'aufgaben-tabelle',
        items: aufgabenZeilen(q.aufgaben.data).filter((z) => z.expected != null),
        sortierung: 'delta',
        richtung: 'ab',
      };
    case 'erwartung-gegen-ergebnis':
      return { name: 'erwartet-tatsaechlich', items: erwartungsPunkte(q.aufgaben.data) };
    case 'mittelwert-mit-unsicherheit':
      return { name: 'mittelwert-vergleich', rows: mittelwertZeilen(q.aufgaben.data, hilfe) };
    case 'streubereich-je-merkmal':
      return { name: 'perzentilbaender', items: perzentilBaender(q.schueler.data, hilfe) };
    case 'profil-heatmap':
      return { name: 'aufgaben-heatmap', ...heatmapDaten(q.schueler.data, q.aufgaben.data) };
    case 'personen-tabelle':
    case 'foerdergruppen':
      return { name: 'schueler-tabelle', ...schuelerTabelle(q.schueler.data, hilfe), auswaehlbar: id === 'foerdergruppen' };
    case 'kontextmerkmal-ring':
      // Zwei Ringe nebeneinander, wie in der Schulrückmeldung von indibit: die
      // Schnittstelle führt genau diese beiden Kovariaten je Schüler:in.
      return {
        ringe: [
          kontextmerkmal(q.schueler.data, { typ: 'gender', label: hilfe.geschlecht, beschriften: hilfe.geschlechtName }),
          kontextmerkmal(q.schueler.data, { typ: 'languageAtHome', label: hilfe.sprache, beschriften: hilfe.sprachName }),
        ].filter((r) => r.segmente.length > 0),
      };
    case 'standard-erreichung':
      return { name: 'standard-erreichung', ...standardErreichung(q.stufen.data, hilfe) };
    case 'zeugnissaetze': {
      const werte = zeugnissatzWerte(q.stufen.data, hilfe);
      return werte ? { name: 'zeugnissaetze', ...hilfe.zeugnissaetze(werte) } : null;
    }
    case 'punktwolke':
      return {
        name: 'streudiagramm',
        punkte: streuPunkte(q.schueler.data, q.stufenSchueler.data, hilfe),
        mittelwert: gesamtQuote(q.schueler.data),
      };
    default:
      return null;
  }
};

/** Hat die Zeichnung überhaupt etwas zu zeigen? */
const hatInhalt = (gezeichnet) => {
  if (!gezeichnet) return false;
  if (gezeichnet.kacheln) return gezeichnet.kacheln.length > 0;
  if (gezeichnet.ringe) return gezeichnet.ringe.length > 0;
  const { rows, items, karten, punkte, werte, zeilen, saetze } = gezeichnet;
  return [rows, items, karten, punkte, werte, zeilen, saetze]
    .some((liste) => Array.isArray(liste) && liste.length > 0);
};

const Traeger = ({ ids, t, gewaehlt }) => (
  <div className="flex flex-wrap gap-1.5">
    {ids.length === 0 ? (
      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
        {t('elemente.nurBibliothek')}
      </span>
    ) : (
      ids.map((e) => (
        <span key={e} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700" data-testid={`traeger-${e}`}>
          {ausWoerterbuch(EINRICHTUNGEN[e], gewaehlt)}
        </span>
      ))
    )}
  </div>
);

const ReportElementsView = () => {
  const t = useTexte();
  const gewaehlt = useSprache();
  const { COMPETENCE_LEVELS, GENDERS, LANGUAGES } = useKonstanten();
  const { selectedLevel, selectedGroup, selectedSchool, selectedState, getSelectedId } = useFilters();
  const [einrichtung, setEinrichtung] = useState('');

  const id = getSelectedId();
  const stufen = useCompetenceLevels(selectedLevel, id, NUR_GRUPPE);
  const aufgaben = useItems(selectedLevel, id, NUR_GRUPPE);
  const schueler = useItems(selectedLevel, id, NUR_SCHUELER);
  const stufenSchueler = useCompetenceLevels(selectedLevel, id, NUR_SCHUELER);

  // Die Vergleichsebenen brauchen dieselbe Größe auf drei Ebenen — ohne
  // Bezugsebene ist ein Ergebnis keine Aussage, und genau das ist der Baustein.
  const ebeneGruppe = useCompetenceLevels('group', selectedGroup, NUR_GRUPPE);
  const ebeneSchule = useCompetenceLevels('school', selectedSchool, NUR_GRUPPE);
  const ebeneLand = useCompetenceLevels('state', selectedState, NUR_GRUPPE);

  const hilfe = useMemo(() => ({
    // Die Domänenkürzel der Schnittstelle haben Namen; fehlt einer, steht das
    // Kürzel da statt „undefined".
    domaene: (code) => (code ? t(`vergleich.domaenen.${code}`) : t('elemente.ohneDomaene')),
    farbe: (stufe) => COMPETENCE_LEVELS[stufe]?.color,
    hinweis: t('elemente.abMindeststandard'),
    gesamt: t('elemente.insgesamt'),
    label: t('elemente.mindeststandardErreicht'),
    geschlecht: t('elemente.geschlecht'),
    sprache: t('elemente.spracheZuhause'),
    geschlechtName: (code) => GENDERS[code] ?? code,
    sprachName: (code) => LANGUAGES[code] ?? code,
    // Die Vorlagen stehen in i18n, nicht im Baustein: wie über eine Lerngruppe
    // geschrieben wird, ist keine Entscheidung einer Visualisierung.
    zeugnissaetze: (werte) => ({
      titel: t('elemente.zeugnissaetzeTitel'),
      werte,
      saetze: [
        { id: 'lage', stufe: werte.stufe, vorlage: t('elemente.satzLage'), grundlage: t('elemente.satzGrundlage') },
        { id: 'schwerpunkt', vorlage: t(werte.lage === 'auffaellig' ? 'elemente.satzAuffaellig' : 'elemente.satzUnauffaellig'),
          grundlage: t('elemente.satzGrundlageUnter') },
      ],
    }),
  }), [t, COMPETENCE_LEVELS, GENDERS, LANGUAGES]);

  const ebenen = useMemo(() => [
    gesamtZeile(ebeneGruppe.data, { label: t('seitenleiste.lerngruppe'), farbe: hilfe.farbe }),
    gesamtZeile(ebeneSchule.data, { label: t('seitenleiste.schule'), farbe: hilfe.farbe }),
    gesamtZeile(ebeneLand.data, { label: t('seitenleiste.bundesland'), farbe: hilfe.farbe }),
  ].filter(Boolean), [ebeneGruppe.data, ebeneSchule.data, ebeneLand.data, t, hilfe]);

  const q = { stufen, aufgaben, schueler, stufenSchueler, ebenen };

  const laedt = [stufen, aufgaben, schueler, stufenSchueler].some((a) => a.loading);
  const fehler = [stufen, aufgaben, schueler, stufenSchueler].find((a) => a.error);

  const schichten = useMemo(() => nachSchichten().map((schicht) => ({
    ...schicht,
    bausteine: schicht.bausteine.filter(
      (b) => !einrichtung || rueckmeldungenZu(b.id).some((r) => r.einrichtung === einrichtung),
    ),
  })), [einrichtung]);

  const gezeigt = schichten.reduce((n, s) => n + s.bausteine.length, 0);

  return (
    <div className="space-y-6" data-testid="ansicht-elemente">
      <Card title={t('elemente.titel')} testid="elemente-einleitung">
        <p className="text-sm text-gray-600 mb-4">{t('elemente.einleitung')}</p>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="elemente-einrichtung" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
              {t('elemente.einrichtung')}
            </label>
            <select
              id="elemente-einrichtung"
              data-testid="elemente-einrichtung"
              value={einrichtung}
              onChange={(e) => setEinrichtung(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">{t('elemente.alleEinrichtungen')}</option>
              {Object.keys(EINRICHTUNGEN).map((e) => (
                <option key={e} value={e}>{ausWoerterbuch(EINRICHTUNGEN[e], gewaehlt)}</option>
              ))}
            </select>
          </div>
          <p className="text-sm text-gray-500 pb-2" data-testid="elemente-anzahl" aria-live="polite">
            {t('elemente.anzahl', { n: gezeigt, rueckmeldungen: RUECKMELDUNGEN.length })}
          </p>
          <a
            href="/dokumentation/bausteine-der-rueckmeldungen"
            className="text-sm font-semibold text-primary pb-2 hover:underline"
            data-testid="elemente-katalog"
          >
            {t('elemente.zumKatalog')}
          </a>
        </div>
      </Card>

      {fehler && <ErrorMessage error={fehler.error} retry={fehler.refetch} />}

      {schichten.map((schicht) => (
        <div key={schicht.id} data-testid={`schicht-${schicht.id}`}>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{ausWoerterbuch(schicht.kurz, gewaehlt)}</h3>
          <p className="text-sm text-gray-500 mb-4">{ausWoerterbuch(schicht.beschreibung, gewaehlt)}</p>

          <div className="space-y-6">
            {schicht.bausteine.map((baustein) => {
              const gezeichnet = baustein.quelle ? zeichnung(baustein.id, q, hilfe) : null;
              const traeger = rueckmeldungenZu(baustein.id).map((r) => r.einrichtung);

              return (
                <Card key={baustein.id} testid={`baustein-${baustein.id}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <h4 className="text-base font-semibold text-gray-900">
                      {ausWoerterbuch(baustein.name, gewaehlt)}
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {baustein.beleg === 'artefakt' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700" data-testid={`beleg-${baustein.id}`}>
                          {t('elemente.amArtefakt')}
                        </span>
                      )}
                      <Traeger ids={[...new Set(traeger)]} t={t} gewaehlt={gewaehlt} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{ausWoerterbuch(baustein.zweck, gewaehlt)}</p>
                  <p className="text-xs text-gray-400 mb-4">
                    {t('elemente.daten', { daten: ausWoerterbuch(baustein.daten, gewaehlt) })}
                    {baustein.element && ` · <tba3-${baustein.element}>`}
                  </p>

                  {laedt && baustein.quelle && <LoadingSkeleton height="220px" />}

                  {!laedt && hatInhalt(gezeichnet) && (
                    <div className="overflow-x-auto" data-testid={`zeichnung-${baustein.id}`}>
                      {gezeichnet.kacheln && (
                        <div className="flex flex-wrap gap-4">
                          {gezeichnet.kacheln.map((kachel) => (
                            <Element key={kachel.id} name="kennzahl-kachel" {...kachel} />
                          ))}
                        </div>
                      )}
                      {gezeichnet.ringe && (
                        <div className="flex flex-wrap gap-8">
                          {gezeichnet.ringe.map((ring) => (
                            <Element key={ring.label} name="kontextmerkmal-ring" {...ring} />
                          ))}
                        </div>
                      )}
                      {!gezeichnet.kacheln && !gezeichnet.ringe && <Element {...gezeichnet} />}
                    </div>
                  )}

                  {!laedt && !hatInhalt(gezeichnet) && (
                    <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3" data-testid={`ohne-daten-${baustein.id}`}>
                      {baustein.element
                        ? t('elemente.ohneDaten', { daten: ausWoerterbuch(baustein.daten, gewaehlt) })
                        : t('elemente.ohneBaustein')}
                      {baustein.reiter && ` ${t('elemente.stattdessen', { reiter: t(`reiter.${baustein.reiter}`) })}`}
                      {baustein.offen && ` ${ausWoerterbuch(baustein.offen, gewaehlt)}`}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReportElementsView;
