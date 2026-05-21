import { useState, useEffect } from 'react';
import { tba3Api } from '../services/tba3Api';
import { GROUPS } from '../utils/constants';

const DOMAIN_LABELS = {
  ho: 'Hörverstehen',
  le: 'Leseverstehen',
  rs: 'Rechtschreibung',
};

function extractByDomain(apiData) {
  const result = {};
  for (const entry of (apiData || [])) {
    if (!entry) continue;
    const domain = entry.domain?.name;
    if (!domain) continue;
    result[domain] = {};
    for (const cl of (entry.competenceLevels || [])) {
      result[domain][cl.nameShort] = cl.descriptiveStatistics.mean;
    }
  }
  return result;
}

function averageStateByDomain(stateData) {
  const acc = {};
  for (const entry of (stateData || [])) {
    if (!entry) continue;
    const domain = entry.domain?.name;
    if (!domain) continue;
    if (!acc[domain]) acc[domain] = {};
    for (const cl of (entry.competenceLevels || [])) {
      if (!acc[domain][cl.nameShort]) acc[domain][cl.nameShort] = { sum: 0, n: 0 };
      acc[domain][cl.nameShort].sum += cl.descriptiveStatistics.mean;
      acc[domain][cl.nameShort].n += 1;
    }
  }
  const result = {};
  for (const [domain, levels] of Object.entries(acc)) {
    result[domain] = {};
    for (const [level, { sum, n }] of Object.entries(levels)) {
      result[domain][level] = sum / n;
    }
  }
  return result;
}

function computeStats(domainLevels) {
  if (!domainLevels) return { belowMin: 0, upperLevels: 0, optimal: 0 };
  const entries = Object.entries(domainLevels);
  const belowMin = entries
    .filter(([l]) => l === 'Ia' || l === 'Ib' || l === 'I')
    .reduce((s, [, m]) => s + m, 0);
  const upper = entries
    .filter(([l]) => l === 'IV' || l === 'V')
    .reduce((s, [, m]) => s + m, 0);
  const optimal = domainLevels['V'] ?? 0;
  return {
    belowMin: Math.round(belowMin * 100),
    upperLevels: Math.round(upper * 100),
    optimal: Math.round(optimal * 100),
  };
}

function computeDeltas(ownLevels, refLevels) {
  const deltas = {};
  for (const level of Object.keys(ownLevels || {})) {
    if (refLevels?.[level] != null) {
      deltas[level] = Math.round((ownLevels[level] - refLevels[level]) * 100);
    }
  }
  return deltas;
}

export function useCompetenceDelta(groupId, stateId = 'beispielland') {
  const [result, setResult] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    if (!groupId) return;

    let cancelled = false;

    async function load() {
      try {
        const currentGroup = GROUPS.find(g => g.id === groupId);
        const peers = currentGroup
          ? GROUPS.filter(g =>
              g.id !== groupId &&
              g.subject === currentGroup.subject &&
              g.grade === currentGroup.grade
            )
          : [];

        const [ownResp, stateResp, ...peerResps] = await Promise.all([
          tba3Api.getGroupCompetenceLevels(groupId),
          tba3Api.getStateCompetenceLevels(stateId),
          ...peers.map(p => tba3Api.getGroupCompetenceLevels(p.id)),
        ]);

        if (cancelled) return;

        const ownByDomain = extractByDomain(ownResp.data);
        const stateByDomain = averageStateByDomain(stateResp.data);
        const peerByDomain = Object.fromEntries(
          peers.map((p, i) => [p.id, extractByDomain(peerResps[i].data)])
        );

        const domains = Object.keys(ownByDomain).map(code => ({
          code,
          label: DOMAIN_LABELS[code] || code,
        }));

        const ownStats = Object.fromEntries(
          domains.map(({ code }) => [code, computeStats(ownByDomain[code])])
        );

        const comparisons = {
          landesmittelwert: Object.fromEntries(
            domains.map(({ code }) => [
              code,
              {
                deltas: computeDeltas(ownByDomain[code], stateByDomain[code]),
                ...computeStats(stateByDomain[code]),
              },
            ])
          ),
          ...Object.fromEntries(
            peers.map(p => [
              p.id,
              Object.fromEntries(
                domains.map(({ code }) => [
                  code,
                  {
                    deltas: computeDeltas(ownByDomain[code], peerByDomain[p.id][code]),
                    ...computeStats(peerByDomain[p.id][code]),
                  },
                ])
              ),
            ])
          ),
        };

        setResult({
          loading: false,
          error: null,
          data: {
            domains,
            ownStats,
            comparisons,
            availableComparisons: [
              { id: 'landesmittelwert', label: 'Landesmittelwert' },
              ...peers.map(p => ({ id: p.id, label: p.name })),
            ],
            currentGroup,
          },
        });
      } catch (err) {
        if (!cancelled) setResult({ loading: false, error: err, data: null });
      }
    }

    load();
    return () => { cancelled = true; };
  }, [groupId, stateId]);

  return result;
}
