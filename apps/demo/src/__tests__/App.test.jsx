import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Die Anwendung spricht ausschließlich über diesen Dienst mit dem Backend —
// ihn zu ersetzen genügt, um das Zusammenspiel von Filtern, Reitern und
// Abfragen zu prüfen.
const antwortMitStufen = {
  data: [
    {
      id: 'g1',
      type: 'group',
      name: '3a Deutsch',
      competenceLevels: [
        { nameShort: 'I', name: 'Unter Mindeststandard', descriptiveStatistics: { frequency: 4 } },
        { nameShort: 'III', name: 'Regelstandard', descriptiveStatistics: { frequency: 16 } },
      ],
    },
  ],
};

const antwortMitItems = {
  data: [
    {
      id: 'g1',
      type: 'group',
      items: [
        {
          iqbId: 'D38701',
          name: '1.1',
          position: 1,
          exercise: { name: 'Geheimsache' },
          descriptiveStatistics: { mean: 0.84 },
          parameters: { competenceLevel: { nameShort: 'II' } },
        },
      ],
    },
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

vi.mock('../services/tba3Api', () => ({ tba3Api: api }));

const { default: App } = await import('../App');

describe('Demoanwendung', () => {
  beforeEach(() => {
    Object.values(api).forEach((fn) => fn.mockReset());
    api.getGroupCompetenceLevels.mockResolvedValue(antwortMitStufen);
    api.getSchoolCompetenceLevels.mockResolvedValue(antwortMitStufen);
    api.getStateCompetenceLevels.mockResolvedValue(antwortMitStufen);
    api.getGroupItems.mockResolvedValue(antwortMitItems);
    api.getSchoolItems.mockResolvedValue(antwortMitItems);
    api.getStateItems.mockResolvedValue(antwortMitItems);
    Object.values(api).forEach((fn) => { if (!fn.getMockImplementation()) fn.mockResolvedValue({ data: [] }); });
    window.history.replaceState({}, '', '/');
    localStorage.clear();
  });

  it('startet auf Gruppenebene und zeigt die Kompetenzstufen', async () => {
    render(<App />);

    await waitFor(() => expect(api.getGroupCompetenceLevels).toHaveBeenCalled());
    expect(screen.getByTestId('ebene-group')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('reiter-competence')).toHaveAttribute('aria-current', 'page');
  });

  it('zeigt die Übersichtskarten mit den Zahlen aus der Antwort', async () => {
    render(<App />);

    await waitFor(() => expect(screen.getByTestId('competency-total')).toHaveTextContent('20'));
    // 16 von 20 auf Stufe III → 80 % erreichen den Mindeststandard, 20 % darunter
    expect(screen.getByTestId('stat-at-or-above')).toHaveTextContent('80 %');
    expect(screen.getByTestId('stat-below-standard')).toHaveTextContent('20 %');
  });

  it('wechselt beim Klick auf einen Reiter die Ansicht und die Adresse', async () => {
    render(<App />);
    await waitFor(() => expect(api.getGroupCompetenceLevels).toHaveBeenCalled());

    await userEvent.click(screen.getByTestId('reiter-items'));

    await waitFor(() => expect(api.getGroupItems).toHaveBeenCalled());
    expect(screen.getByTestId('reiter-items')).toHaveAttribute('aria-current', 'page');
    expect(new URLSearchParams(window.location.search).get('tab')).toBe('items');
  });

  it('fragt nach dem Wechsel der Ebene die Schul-Endpunkte ab', async () => {
    render(<App />);
    await waitFor(() => expect(api.getGroupCompetenceLevels).toHaveBeenCalled());

    await userEvent.click(screen.getByTestId('ebene-school'));

    await waitFor(() => expect(api.getSchoolCompetenceLevels).toHaveBeenCalled());
    expect(screen.getByTestId('ebene-school')).toHaveAttribute('aria-pressed', 'true');
  });

  it('reicht den gewählten Datentyp an die Schnittstelle weiter', async () => {
    render(<App />);
    await waitFor(() => expect(api.getGroupCompetenceLevels).toHaveBeenCalled());

    await userEvent.selectOptions(screen.getByTestId('auswahl-datentyp'), 'students');

    await waitFor(() => {
      const [, params] = api.getGroupCompetenceLevels.mock.calls.at(-1);
      expect(params.type).toBe('students');
    });
  });

  it('nimmt den Reiter aus der Adresse, damit Ansichten verlinkbar sind', async () => {
    window.history.replaceState({}, '', '/?tab=items');
    render(<App />);

    await waitFor(() => expect(api.getGroupItems).toHaveBeenCalled());
    expect(screen.getByTestId('reiter-items')).toHaveAttribute('aria-current', 'page');
  });

  it('lässt fremde Parameter in der Adresse stehen, wenn die Filter sie schreiben', async () => {
    // `lang` gehört der gemeinsamen Leiste, nicht den Filtern. Die Leiste wird
    // zur Laufzeit nachgeladen und liest die Adresse erst danach — wirft der
    // Filter-Kontext den Parameter beim ersten Rendern weg, steht die Leiste
    // in der Browsersprache da, während der Inhalt daneben deutsch bleibt.
    window.history.replaceState({}, '', '/?lang=de');
    render(<App />);

    await waitFor(() => expect(api.getGroupCompetenceLevels).toHaveBeenCalled());
    await waitFor(() => {
      const params = new URLSearchParams(window.location.search);
      expect(params.get('level')).toBe('group');
      expect(params.get('lang')).toBe('de');
    });

    // Auch nach einem Filterwechsel, nicht nur beim ersten Schreiben
    await userEvent.click(screen.getByTestId('ebene-school'));

    await waitFor(() => expect(api.getSchoolCompetenceLevels).toHaveBeenCalled());
    expect(new URLSearchParams(window.location.search).get('lang')).toBe('de');
  });

  it('klappt die Filter auf schmalen Schirmen auf und zu', async () => {
    render(<App />);
    await waitFor(() => expect(api.getGroupCompetenceLevels).toHaveBeenCalled());

    const umschalter = screen.getByTestId('filter-umschalter');
    const bereich = document.getElementById('filterbereich');

    // Zugeklappt: nur die Voreinstellung für schmale Schirme, ab lg blendet CSS
    // die Klasse wieder aus.
    expect(umschalter).toHaveAttribute('aria-expanded', 'false');
    expect(bereich.className).toContain('hidden');

    await userEvent.click(umschalter);
    expect(umschalter).toHaveAttribute('aria-expanded', 'true');
    expect(bereich.className).not.toContain('hidden');

    await userEvent.click(umschalter);
    expect(umschalter).toHaveAttribute('aria-expanded', 'false');
  });

  it('meldet einen Fehler der Schnittstelle, statt leer zu bleiben', async () => {
    api.getGroupCompetenceLevels.mockRejectedValue(new Error('Backend nicht erreichbar'));
    render(<App />);

    await waitFor(() => {
      expect(within(screen.getByTestId('dashboard')).getByText(/fehler|error/i)).toBeInTheDocument();
    });
  });
});
