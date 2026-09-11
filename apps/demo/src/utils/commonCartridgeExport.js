import JSZip from 'jszip';
import {
  EDUCATIONAL_MATERIALS,
  MATERIAL_TYPES,
  SUBJECTS,
  GRADES,
  COMPETENCE_LEVELS,
  GROUPS,
} from './constants';

const CC_VERSION = '1.3.0';
const CC_XMLNS = 'http://www.imsglobal.org/xsd/imsccv1p3/imscp_v1p1';
const CC_SCHEMA_LOCATION = [
  'http://www.imsglobal.org/xsd/imsccv1p3/imscp_v1p1',
  'http://www.imsglobal.org/profile/cc/ccv1p3/ccv1p3_imscp_v1p2_v1p0.xsd',
].join(' ');

// Sanitise strings for use as XML identifiers
const toId = (str) => str.replace(/[^a-zA-Z0-9_-]/g, '_');

// Escape characters that are special in XML
const xmlEscape = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// ── HTML page for one material ────────────────────────────────────────────────

const buildMaterialHtml = (material, group, levelKey) => {
  const type = MATERIAL_TYPES[material.type];
  const subject = SUBJECTS[material.subject];
  const grade = GRADES[material.grade];
  const level = COMPETENCE_LEVELS[levelKey];

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <title>${xmlEscape(material.title)}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1f2937; }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    .subtitle { color: #6b7280; font-size: 0.9rem; margin-bottom: 1.5rem; }
    .meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1.5rem; }
    .badge { padding: 3px 10px; border-radius: 999px; font-size: 0.8rem; font-weight: 600; color: #fff; }
    .section { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 1rem; }
    .section h2 { font-size: 1rem; margin: 0 0 8px; color: #374151; }
    .section p { margin: 0; color: #4b5563; font-size: 0.95rem; line-height: 1.6; }
    .level-bar { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
    .level-dot { width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; }
    footer { margin-top: 2rem; font-size: 0.75rem; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 12px; }
  </style>
</head>
<body>
  <h1>${xmlEscape(material.title)}</h1>
  <div class="subtitle">${xmlEscape(material.source === 'mundo' ? 'MUNDO (extern)' : (type?.label ?? material.type))} · ${xmlEscape(material.duration ?? '')}</div>

  <div class="meta">
    ${subject ? `<span class="badge" style="background:${subject.color ?? '#6b7280'}">${xmlEscape(subject.name)}</span>` : ''}
    ${grade ? `<span class="badge" style="background:#6b7280">${xmlEscape(grade.name)}</span>` : ''}
    <span class="badge" style="background:#2563eb">Gruppe: ${xmlEscape(group.name)}</span>
    ${level ? `<span class="badge" style="background:${level.color ?? '#6b7280'}">Stufe ${xmlEscape(levelKey)}: ${xmlEscape(level.description ?? '')}</span>` : ''}
  </div>

  <div class="section">
    <h2>Beschreibung</h2>
    <p>${xmlEscape(material.description)}</p>
  </div>

  ${(material.targetLevels ?? []).length > 0 ? `<div class="section">
    <h2>Ziel-Kompetenzstufen</h2>
    ${material.targetLevels
      .map((l) => {
        const lv = COMPETENCE_LEVELS[l];
        return `<div class="level-bar">
          <div class="level-dot" style="background:${lv?.color ?? '#6b7280'}"></div>
          <span><strong>Stufe ${l}</strong> – ${xmlEscape(lv?.description ?? '')}</span>
        </div>`;
      })
      .join('\n    ')}
  </div>` : ''}
  ${material.url ? `<div class="section"><h2>Direktlink</h2><p><a href="${xmlEscape(material.url)}">${xmlEscape(material.url)}</a></p></div>` : ''}

  <div class="section">
    <h2>Zugeordnet an</h2>
    <p>Gruppe: <strong>${xmlEscape(group.name)}</strong> · Kompetenzstufe: <strong>${xmlEscape(levelKey)}</strong></p>
  </div>

  <footer>Exportiert aus TBA3 Demo App · ${new Date().toLocaleDateString('de-DE')}</footer>
</body>
</html>`;
};

// ── imsmanifest.xml ───────────────────────────────────────────────────────────

const buildManifest = (items) => {
  // items: [{ group, levelKey, material, resourceId, filePath }]

  // Group by group, then by level
  const byGroup = {};
  items.forEach((item) => {
    if (!byGroup[item.group.id]) byGroup[item.group.id] = { group: item.group, byLevel: {} };
    if (!byGroup[item.group.id].byLevel[item.levelKey])
      byGroup[item.group.id].byLevel[item.levelKey] = [];
    byGroup[item.group.id].byLevel[item.levelKey].push(item);
  });

  const STANDARD_LEVEL_ORDER = ['I', 'II', 'III', 'IV', 'V'];

  // Build <item> tree
  const orgItems = Object.values(byGroup)
    .map(({ group, byLevel }) => {
      const groupItemId = `org_group_${toId(group.id)}`;
      // Include all level keys: standard order first, then any extras (e.g. '_all')
      const knownKeys = new Set(STANDARD_LEVEL_ORDER);
      const extraKeys = Object.keys(byLevel).filter((k) => !knownKeys.has(k));
      const allLevelKeys = [...STANDARD_LEVEL_ORDER.filter((k) => byLevel[k]), ...extraKeys];

      const levelItems = allLevelKeys
        .map((lk) => {
          const level = COMPETENCE_LEVELS[lk];
          const levelItemId = `org_${toId(group.id)}_level_${toId(lk)}`;
          const levelTitle = level
            ? `Kompetenzstufe ${lk} – ${xmlEscape(level.description ?? '')}`
            : 'Zugewiesene Materialien';
          const matItems = byLevel[lk]
            .map(
              ({ resourceId, material }) =>
                `          <item identifier="org_${toId(resourceId)}" identifierref="${resourceId}">
            <title>${xmlEscape(material.title)}</title>
          </item>`
            )
            .join('\n');
          return `      <item identifier="${levelItemId}">
        <title>${levelTitle}</title>
${matItems}
      </item>`;
        })
        .join('\n');
      return `    <item identifier="${groupItemId}">
      <title>${xmlEscape(group.name)}</title>
${levelItems}
    </item>`;
    })
    .join('\n');

  // Build <resources> list
  const resources = items
    .map(
      ({ resourceId, filePath }) =>
        `    <resource identifier="${resourceId}" type="webcontent" href="${filePath}">
      <file href="${filePath}"/>
    </resource>`
    )
    .join('\n');

  const exportDate = new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="tba3_cc_export"
  xmlns="${CC_XMLNS}"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="${CC_SCHEMA_LOCATION}">
  <metadata>
    <schema>IMS Common Cartridge</schema>
    <schemaversion>${CC_VERSION}</schemaversion>
    <lom:lom xmlns:lom="http://ltsc.ieee.org/xsd/imsccv1p3/LOM/manifest">
      <lom:general>
        <lom:title>
          <lom:string language="de">TBA3 Lernmaterialien</lom:string>
        </lom:title>
        <lom:description>
          <lom:string language="de">Exportierte Lernmaterialien aus TBA3 Demo App, gruppiert nach Klassen und Kompetenzstufen. Erstellt: ${exportDate}</lom:string>
        </lom:description>
      </lom:general>
    </lom:lom>
  </metadata>
  <organizations>
    <organization identifier="tba3_org" structure="rooted-hierarchy">
      <title>TBA3 Lernmaterialien</title>
${orgItems}
    </organization>
  </organizations>
  <resources>
${resources}
  </resources>
</manifest>`;
};

// ── Public export function ────────────────────────────────────────────────────

/**
 * Build and download an IMS Common Cartridge (.imscc).
 *
 * @param {Object} assignments  - { [groupId]: { [levelKey]: [materialId, ...] } }
 * @param {string} [filterGroupId] - If provided, only export this one group.
 */
export const exportCommonCartridge = async (assignments, filterGroupId = null, extraGroups = [], extraMaterials = []) => {
  const zip = new JSZip();
  const allMaterials = [...EDUCATIONAL_MATERIALS, ...extraMaterials];
  const allGroups = [...GROUPS, ...extraGroups];
  const groupsToExport = filterGroupId
    ? allGroups.filter((g) => g.id === filterGroupId)
    : allGroups.filter((g) => assignments[g.id]);

  // Collect all items that actually have assignments
  const items = [];

  groupsToExport.forEach((group) => {
    const groupAssign = assignments[group.id];
    if (!groupAssign) return;

    Object.entries(groupAssign).forEach(([levelKey, materialIds]) => {
      if (!materialIds || materialIds.length === 0) return;

      materialIds.forEach((materialId) => {
        const material = allMaterials.find((m) => m.id === materialId);
        if (!material) return;

        const resourceId = `res_${toId(group.id)}_${levelKey}_${toId(material.id)}`;
        const filePath = `content/${toId(group.id)}/stufe_${levelKey}/${toId(material.id)}.html`;

        items.push({ group, levelKey, material, resourceId, filePath });
      });
    });
  });

  if (items.length === 0) {
    const label = filterGroupId
      ? `Keine zugewiesenen Materialien für diese Klasse.`
      : 'Keine zugewiesenen Materialien vorhanden.';
    throw new Error(label);
  }

  // Add content HTML files
  items.forEach(({ group, levelKey, material, filePath }) => {
    zip.file(filePath, buildMaterialHtml(material, group, levelKey));
  });

  // Add manifest
  zip.file('imsmanifest.xml', buildManifest(items));

  // Build a readable filename
  const singleGroup = filterGroupId ? [...GROUPS, ...extraGroups].find((g) => g.id === filterGroupId) : null;
  const namePart = singleGroup
    ? toId(singleGroup.name).toLowerCase()
    : 'alle_klassen';
  const filename = `tba3_${namePart}_${new Date().toISOString().slice(0, 10)}.imscc`;

  // Generate and download
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return items.length;
};
