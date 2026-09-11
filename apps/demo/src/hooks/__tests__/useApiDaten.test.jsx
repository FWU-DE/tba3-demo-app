import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useApiDaten } from '../useApiDaten';

// Ein Abruf, dessen Auflösung der Test selbst steuert.
const steuerbar = () => {
  const offen = [];
  const abrufen = vi.fn(() => new Promise((fertig, fehlschlag) => offen.push({ fertig, fehlschlag })));
  return { abrufen, offen };
};

describe('useApiDaten', () => {
  it('lädt die Daten der gewählten Ebene', async () => {
    const abrufe = { group: vi.fn().mockResolvedValue({ data: ['A'] }) };
    const { result } = renderHook(() => useApiDaten(abrufe, 'group', '3a-deutsch', { type: '' }));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(['A']);
    expect(result.current.error).toBeNull();
    expect(abrufe.group).toHaveBeenCalledWith('3a-deutsch', { type: '' });
  });

  it('verwirft die Antwort einer überholten Anfrage', async () => {
    // Der Kern der Sache: wer schnell zwischen Filtern wechselt, darf nicht das
    // Ergebnis der alten Anfrage zu sehen bekommen, nur weil sie später eintrifft.
    const { abrufen, offen } = steuerbar();
    const abrufe = { group: abrufen };

    const { result, rerender } = renderHook(({ id }) => useApiDaten(abrufe, 'group', id), {
      initialProps: { id: 'alt' },
    });

    rerender({ id: 'neu' });
    await waitFor(() => expect(offen).toHaveLength(2));

    // Erst die neue Anfrage beantworten, danach die überholte alte.
    await act(async () => { offen[1].fertig({ data: 'neu' }); });
    await act(async () => { offen[0].fertig({ data: 'alt' }); });

    expect(result.current.data).toBe('neu');
  });

  it('zeigt wieder Laden an, sobald sich die Parameter ändern', async () => {
    const abrufe = { group: vi.fn().mockResolvedValue({ data: [] }) };
    const { result, rerender } = renderHook(({ params }) => useApiDaten(abrufe, 'group', 'g1', params), {
      initialProps: { params: { type: '' } },
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    rerender({ params: { type: 'students' } });
    expect(result.current.loading).toBe(true);
  });

  it('lädt nicht neu, wenn dieselben Parameter als neues Objekt kommen', async () => {
    const abrufe = { group: vi.fn().mockResolvedValue({ data: [] }) };
    const { result, rerender } = renderHook(({ params }) => useApiDaten(abrufe, 'group', 'g1', params), {
      initialProps: { params: { type: 'students' } },
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    rerender({ params: { type: 'students' } }); // inhaltsgleich, andere Identität
    expect(result.current.loading).toBe(false);
    expect(abrufe.group).toHaveBeenCalledTimes(1);
  });

  it('reicht Fehler durch, ohne alte Daten zu behalten', async () => {
    const abrufe = { group: vi.fn().mockRejectedValue(new Error('Backend weg')) };
    const { result } = renderHook(() => useApiDaten(abrufe, 'group', 'g1'));

    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.error.message).toBe('Backend weg');
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('meldet eine unbekannte Ebene als Fehler, ohne abzufragen', () => {
    const abrufe = { group: vi.fn() };
    const { result } = renderHook(() => useApiDaten(abrufe, 'galaxie', 'g1'));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.loading).toBe(false);
    expect(abrufe.group).not.toHaveBeenCalled();
  });

  it('fragt ohne Id gar nicht erst ab', () => {
    const abrufe = { group: vi.fn() };
    const { result } = renderHook(() => useApiDaten(abrufe, 'group', null));

    expect(abrufe.group).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('lädt auf refetch erneut', async () => {
    const abrufe = { group: vi.fn().mockResolvedValue({ data: [] }) };
    const { result } = renderHook(() => useApiDaten(abrufe, 'group', 'g1'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.refetch());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(abrufe.group).toHaveBeenCalledTimes(2));
  });
});
