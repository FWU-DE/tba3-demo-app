// Der Reiter „Rückmeldeelemente" zeichnet den Katalog aus
// `apps/shared/konsortium.js` mit den Daten der gewählten Ebene.
//
// Geprüft wird das, was still kaputtgehen kann: dass jeder Katalogeintrag
// vorkommt (ein vergessener fiele niemandem auf, weil die Seite lang ist), dass
// ein Eintrag mit Datenweg wirklich zeichnet statt eine leere Karte zu
// hinterlassen, und dass einer ohne Baustein sagt, warum — statt nichts.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BAUSTEINE, rueckmeldungenZu } from '../../../../../shared/konsortium.js';

const stufen = (typ, id) => ({
  id,
  type: typ,
  name: id,
  domain: { name: 'le' },
  competenceLevels: [
    { nameShort: 'I', name: 'Unter Mindeststandard', descriptiveStatistics: { total: 2, mean: 0.5, frequency: 1 } },
    { nameShort: 'III', name: 'Regelstandard', descriptiveStatistics: { total: 2, mean: 0.5, frequency: 1 } },
  ],
});

const aufgabe = (iqbId, mean) => ({
  iqbId,
  name: iqbId,
  position: 1,
  exercise: { name: 'Geheimsache' },
  descriptiveStatistics: { total: 2, mean },
  parameters: {
    competenceLevel: { nameShort: 'II' },
    solutionFrequencyPrimarySchool: 0.6,
  },
});

const gruppenItems = {
  data: [{ id: 'g1', type: 'group', domain: { name: 'le' }, items: [aufgabe('D38701', 0.8), aufgabe('D38702', 0.4)] }],
};

const schuelerItems = {
  data: [
    { id: 's1', type: 'student', name: 'Anna B.', domain: { name: 'le' },
      covariates: [{ type: 'gender', value: 'f' }],
      items: [aufgabe('D38701', 1), aufgabe('D38702', 0)] },
    { id: 's2', type: 'student', name: 'Ben C.', domain: { name: 'le' },
      covariates: [{ type: 'gender', value: 'm' }],
      items: [aufgabe('D38701', 0), aufgabe('D38702', 1)] },
  ],
};

const api = {
  getGroupCompetenceLevels: vi.fn(),
  getGroupItems: vi.fn(),
  getGroupAggregations: vi.fn(),
  getSchoolCompetenceLevels: vi.fn(),
  getSchoolItems: vi.fn(),
  getSchoolAggregations: vi.fn(),
  getStateCompetenceLevels: vi.fn(),
  getStateItems: vi.fn(),
  getStateAggregations: vi.fn(),
};

vi.mock('../../../services/tba3Api', () => ({ tba3Api: api }));

const { FilterProvider } = await import('../../../context/FilterContext');
const { default: ReportElementsView } = await import('../ReportElementsView');

const zeichnen = () => render(
  <FilterProvider>
    <ReportElementsView />
  </FilterProvider>,
);

describe('Rückmeldeelemente', () => {
  beforeEach(() => {
    Object.values(api).forEach((fn) => fn.mockReset());
    // Die Stufen-Antwort hängt am Datentyp: type=students liefert eine Zeile je
    // Schüler:in, alles andere die Aggregatebene.
    const stufenAntwort = (id, params = {}) => Promise.resolve({
      data: params.type === 'students'
        ? [stufen('student', 's1'), stufen('student', 's2')]
        : [stufen('group', id)],
    });
    api.getGroupCompetenceLevels.mockImplementation(stufenAntwort);
    api.getSchoolCompetenceLevels.mockImplementation(stufenAntwort);
    api.getStateCompetenceLevels.mockImplementation(stufenAntwort);

    const itemAntwort = (_id, params = {}) =>
      Promise.resolve(params.type === 'students' ? schuelerItems : gruppenItems);
    api.getGroupItems.mockImplementation(itemAntwort);
    api.getSchoolItems.mockImplementation(itemAntwort);
    api.getStateItems.mockImplementation(itemAntwort);

    window.history.replaceState({}, '', '/');
    localStorage.clear();
  });

  it('führt jeden Baustein des Katalogs mit einer eigenen Karte', async () => {
    zeichnen();
    await waitFor(() => expect(api.getGroupItems).toHaveBeenCalled());

    for (const baustein of BAUSTEINE) {
      expect(screen.getByTestId(`baustein-${baustein.id}`), baustein.id).toBeInTheDocument();
    }
  });

  it('zeichnet jeden Baustein, für den ein Datenweg hinterlegt ist', async () => {
    zeichnen();

    for (const baustein of BAUSTEINE.filter((b) => b.quelle)) {
      await waitFor(
        () => expect(screen.getByTestId(`zeichnung-${baustein.id}`)).toBeInTheDocument(),
        { timeout: 3000 },
      );
    }
  });

  it('sagt bei einem Baustein ohne Datenweg, woran es liegt', async () => {
    zeichnen();
    await waitFor(() => expect(api.getGroupItems).toHaveBeenCalled());

    // Der Verlauf über Messzeitpunkte ist gebaut, aber die Schnittstelle
    // liefert eine Erhebung — die Karte muss das sagen statt leer zu bleiben.
    const verlauf = await screen.findByTestId('ohne-daten-verlauf-ueber-messzeitpunkte');
    expect(verlauf.textContent).toMatch(/Erhebungen|measurements/);

    // Die Materialanbindung hat keinen Baustein, aber einen Reiter, der
    // dieselbe Frage beantwortet.
    const material = screen.getByTestId('ohne-daten-materialanbindung');
    expect(material.textContent).toMatch(/Lernmaterialien|Learning materials/);
  });

  it('zeigt zu jedem Baustein, welche Einrichtungen ihn genannt haben', async () => {
    zeichnen();
    await waitFor(() => expect(api.getGroupItems).toHaveBeenCalled());

    const karte = screen.getByTestId('baustein-gefuehrter-ablauf');
    // Den geführten Ablauf nennt allein der Kompetenzstand Mathematik.
    expect(rueckmeldungenZu('gefuehrter-ablauf').map((r) => r.einrichtung)).toEqual(['kt']);
    expect(within(karte).getByTestId('traeger-kt')).toBeInTheDocument();
    expect(within(karte).queryByTestId('traeger-isq')).toBeNull();
  });

  it('schränkt den Katalog auf eine Einrichtung ein', async () => {
    zeichnen();
    await waitFor(() => expect(api.getGroupItems).toHaveBeenCalled());

    await userEvent.selectOptions(screen.getByTestId('elemente-einrichtung'), 'zepf');

    const vomZepf = BAUSTEINE.filter((b) => rueckmeldungenZu(b.id).some((r) => r.einrichtung === 'zepf'));
    expect(vomZepf.length).toBeGreaterThan(0);
    expect(vomZepf.length).toBeLessThan(BAUSTEINE.length);

    for (const baustein of vomZepf) {
      expect(screen.getByTestId(`baustein-${baustein.id}`), baustein.id).toBeInTheDocument();
    }
    // Den geführten Ablauf nennt das zepf nicht — er darf jetzt nicht dastehen.
    expect(screen.queryByTestId('baustein-gefuehrter-ablauf')).toBeNull();
    expect(screen.getByTestId('elemente-anzahl').textContent).toContain(String(vomZepf.length));
  });
});
