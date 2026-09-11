import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import CompetencyOverviewCards from '../CompetencyOverviewCards';

const chartData = [
  { level: 'I', count: 8, color: '#ef4444', name: 'Unter Mindeststandard' },
  { level: 'II', count: 22, color: '#f97316', name: 'Mindeststandard' },
  { level: 'III', count: 34, color: '#eab308', name: 'Regelstandard' },
  { level: 'IV', count: 26, color: '#22c55e', name: 'Regelstandard Plus' },
  { level: 'V', count: 10, color: '#16a34a', name: 'Optimalstandard' },
];

const stats = { total: 100, mean: 3.08, belowStandard: 0.08, atStandard: 0.56, aboveStandard: 0.36 };

describe('CompetencyOverviewCards', () => {
  it('zeigt Gesamtzahl und beide Kennzahlen', () => {
    render(<CompetencyOverviewCards chartData={chartData} stats={stats} />);

    expect(screen.getByTestId('competency-total')).toHaveTextContent('100');
    expect(screen.getByTestId('stat-at-or-above')).toHaveTextContent('92 %');
    expect(screen.getByTestId('stat-below-standard')).toHaveTextContent('8 %');
  });

  it('rechnet die Schülerzahlen aus den Anteilen zurück', () => {
    render(<CompetencyOverviewCards chartData={chartData} stats={stats} />);

    expect(screen.getByTestId('stat-at-or-above')).toHaveTextContent('92 Schüler*innen');
    expect(screen.getByTestId('stat-below-standard')).toHaveTextContent('8 Schüler*innen');
  });

  it('zeichnet je Stufe ein Ringsegment', () => {
    render(<CompetencyOverviewCards chartData={chartData} stats={stats} />);
    expect(screen.getByTestId('competency-donut').querySelectorAll('path')).toHaveLength(5);
  });

  it('bleibt leer, solange Daten fehlen — ohne zu werfen', () => {
    const { container: ohneAlles } = render(<CompetencyOverviewCards chartData={null} stats={null} />);
    expect(ohneAlles).toBeEmptyDOMElement();

    // Kommt vor: Verteilung schon da, Kennzahlen noch nicht
    const { container: halb } = render(<CompetencyOverviewCards chartData={chartData} stats={null} />);
    expect(halb).toBeEmptyDOMElement();

    const { container: leer } = render(<CompetencyOverviewCards chartData={[]} stats={stats} />);
    expect(leer).toBeEmptyDOMElement();
  });

  it('zeigt beim Überfahren eines Segments Stufe, Anzahl und Anteil', () => {
    render(<CompetencyOverviewCards chartData={chartData} stats={stats} />);
    const [ersterBogen] = screen.getByTestId('competency-donut').querySelectorAll('path');

    expect(screen.queryByTestId('competency-tooltip')).not.toBeInTheDocument();
    fireEvent.mouseEnter(ersterBogen, { clientX: 10, clientY: 10 });

    const tooltip = within(screen.getByTestId('competency-tooltip'));
    expect(tooltip.getByText('Stufe I')).toBeInTheDocument();
    expect(tooltip.getByText('Unter Mindeststandard')).toBeInTheDocument();
    expect(tooltip.getByText('8 Schüler*innen')).toBeInTheDocument();
    expect(tooltip.getByText('8 %')).toBeInTheDocument();

    fireEvent.mouseLeave(ersterBogen);
    expect(screen.queryByTestId('competency-tooltip')).not.toBeInTheDocument();
  });

  it('nennt das Fach im Ring, wenn eines übergeben wird', () => {
    render(<CompetencyOverviewCards chartData={chartData} stats={stats} subject="Deutsch" />);
    expect(screen.getByText('Deutsch')).toBeInTheDocument();
  });

  it('verkraftet eine einzelne Stufe mit vollem Kreis', () => {
    const eine = [{ level: 'III', count: 25, color: '#eab308', name: 'Regelstandard' }];
    render(<CompetencyOverviewCards chartData={eine} stats={{ ...stats, total: 25 }} />);

    const [bogen] = screen.getByTestId('competency-donut').querySelectorAll('path');
    expect(bogen.getAttribute('d')).toMatch(/^M [\d.]+ [\d.]+ A/);
    expect(screen.getByTestId('competency-total')).toHaveTextContent('25');
  });
});
