import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { EDUCATIONAL_MATERIALS, GROUPS } from './constants';
import { konstantenJetzt, sprache, uebersetze } from '../i18n';

// Die Ausgabe entsteht auf Zuruf, nicht beim Rendern. Die beschrifteten
// Konstanten werden deshalb zu Beginn jedes Exports frisch geholt — sonst
// stünde im PDF die Sprache, die beim Laden des Moduls galt.
let { MATERIAL_TYPES, SUBJECTS, GRADES, COMPETENCE_LEVELS } = konstantenJetzt();

export const beschriftungenAktualisieren = () => {
  ({ MATERIAL_TYPES, SUBJECTS, GRADES, COMPETENCE_LEVELS } = konstantenJetzt());
};

const LOCALE = { de: 'de-DE', en: 'en-GB' };

// Demo base URL – replace with real LMS URL in production
const MATERIAL_BASE_URL = 'https://tba3.bildung.example/materialien';
export const getMaterialUrl = (material) => `${MATERIAL_BASE_URL}/${material.id}`;

// ── Helpers ───────────────────────────────────────────────────────────────────

export const hexToRgb = (hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

// Strip emoji / non-latin characters that jsPDF Helvetica can't render
export const safe = (str) =>
  String(str ?? '').replace(
    // Emoji und Variantenselektoren, die jsPDFs Helvetica nicht darstellen kann
    /[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]|[\u{FE00}-\u{FE0F}]|\u{FEFF}/gu,
    ''
  ).trim();

export const generateQR = (url) =>
  QRCode.toDataURL(url, { width: 160, margin: 1, color: { dark: '#111827', light: '#ffffff' } });

// ── Drawing helpers ───────────────────────────────────────────────────────────

export const PAGE_W = 210;
export const PAGE_H = 297;
export const MARGIN = 14;
export const CONTENT_W = PAGE_W - 2 * MARGIN;

export const setFont = (pdf, size, style = 'normal', color = [17, 24, 39]) => {
  pdf.setFontSize(size);
  pdf.setFont('helvetica', style);
  pdf.setTextColor(...color);
};

// Draw a filled rounded rectangle (helper around jsPDF's roundedRect)
export const fillRect = (pdf, x, y, w, h, r, rgb) => {
  pdf.setFillColor(...rgb);
  pdf.setDrawColor(...rgb);
  pdf.roundedRect(x, y, w, h, r, r, 'F');
};

// ── Page sections ─────────────────────────────────────────────────────────────

const HEADER_H = 24;

const drawHeader = (pdf, group, pageNum, totalPages) => {
  const subject = SUBJECTS[group.subject];
  const grade = GRADES[group.grade];

  // Blue header band
  pdf.setFillColor(30, 64, 175);
  pdf.rect(0, 0, PAGE_W, HEADER_H, 'F');

  // Group name
  setFont(pdf, 15, 'bold', [255, 255, 255]);
  pdf.text(safe(group.name), MARGIN, 11);

  // Subtitle — die Abschnittsköpfe im Stufenmodus sind keine echten Lerngruppen
  // und haben weder Fach noch Klassenstufe. Ohne die Prüfung stünde dort ein
  // Mittelpunkt ohne alles daneben.
  const subtitle = [subject?.name ?? group.subject, grade?.name ?? group.grade]
    .map((teil) => safe(teil ?? ''))
    .filter(Boolean)
    .join(' · ');
  if (subtitle) {
    setFont(pdf, 8.5, 'normal', [186, 211, 253]);
    pdf.text(subtitle, MARGIN, 18);
  }

  // Right: branding + page count
  setFont(pdf, 8, 'normal', [186, 211, 253]);
  pdf.text(safe(uebersetze('ausgabe.lernmaterialien')), PAGE_W - MARGIN, 10, { align: 'right' });
  pdf.text(safe(uebersetze('ausgabe.seiteVon', { n: pageNum, gesamt: totalPages })), PAGE_W - MARGIN, 17, { align: 'right' });
};

const drawSeparatorPage = (pdf, title, subtitle, date) => {
  // Full navy background
  pdf.setFillColor(30, 64, 175);
  pdf.rect(0, 0, PAGE_W, PAGE_H, 'F');

  // Decorative horizontal rule
  pdf.setDrawColor(99, 133, 225);
  pdf.setLineWidth(0.5);
  pdf.line(MARGIN, PAGE_H / 2 - 20, PAGE_W - MARGIN, PAGE_H / 2 - 20);

  // Section label
  setFont(pdf, 9, 'normal', [186, 211, 253]);
  pdf.text(safe(uebersetze('ausgabe.abschnitt')), PAGE_W / 2, PAGE_H / 2 - 14, { align: 'center' });

  // Large title
  setFont(pdf, 26, 'bold', [255, 255, 255]);
  pdf.text(safe(title), PAGE_W / 2, PAGE_H / 2 + 4, { align: 'center' });

  // Subtitle
  setFont(pdf, 11, 'normal', [186, 211, 253]);
  pdf.text(safe(subtitle), PAGE_W / 2, PAGE_H / 2 + 16, { align: 'center' });

  // Decorative rule below
  pdf.setDrawColor(99, 133, 225);
  pdf.line(MARGIN, PAGE_H / 2 + 24, PAGE_W - MARGIN, PAGE_H / 2 + 24);

  // Branding footer
  setFont(pdf, 7, 'normal', [186, 211, 253]);
  pdf.text(safe(uebersetze('ausgabe.fusszeile', { datum: date })), PAGE_W / 2, PAGE_H - 12, { align: 'center' });
};

export const drawFooter = (pdf, date) => {
  setFont(pdf, 6.5, 'normal', [156, 163, 175]);
  pdf.text(safe(uebersetze('ausgabe.exportiertAus', { datum: date })), MARGIN, PAGE_H - 6);
  pdf.text(safe(uebersetze('ausgabe.demoUrls')), PAGE_W - MARGIN, PAGE_H - 6, { align: 'right' });
  // Hairline above footer
  pdf.setDrawColor(229, 231, 235);
  pdf.setLineWidth(0.2);
  pdf.line(MARGIN, PAGE_H - 9, PAGE_W - MARGIN, PAGE_H - 9);
};

export const LEVEL_BAR_H = 7;

export const drawLevelBar = (pdf, levelKey, y) => {
  const cfg = COMPETENCE_LEVELS[levelKey];
  if (!cfg) {
    // Unknown level key (group-mode export): neutral gray section header
    pdf.setFillColor(107, 114, 128);
    pdf.rect(MARGIN, y, 3, LEVEL_BAR_H, 'F');
    pdf.setFillColor(240, 242, 244);
    pdf.rect(MARGIN + 3, y, CONTENT_W - 3, LEVEL_BAR_H, 'F');
    setFont(pdf, 8.5, 'bold', [55, 65, 81]);
    pdf.text(safe(uebersetze('ausgabe.zugewiesene')), MARGIN + 6, y + 5);
    return;
  }
  const [r, g, b] = hexToRgb(cfg.color);

  // Coloured left accent strip
  pdf.setFillColor(r, g, b);
  pdf.rect(MARGIN, y, 3, LEVEL_BAR_H, 'F');

  // Light tinted background
  pdf.setFillColor(r, g, b, 0.08);
  pdf.setFillColor(Math.min(255, r + 190), Math.min(255, g + 190), Math.min(255, b + 190));
  pdf.rect(MARGIN + 3, y, CONTENT_W - 3, LEVEL_BAR_H, 'F');

  setFont(pdf, 8.5, 'bold', [r, g, b]);
  pdf.text(safe(uebersetze('ausgabe.stufeMitText', { n: levelKey, text: cfg.description })), MARGIN + 6, y + 5);
};

export const CARD_H = 38;
const QR_SIZE = 26;
const TEXT_W = CONTENT_W - QR_SIZE - 10;

export const drawMaterialCard = (pdf, material, y, qrDataUrl) => {
  const type = MATERIAL_TYPES[material.type];
  const url = material.url || getMaterialUrl(material);

  // Card border + background
  pdf.setFillColor(249, 250, 251);
  pdf.setDrawColor(209, 213, 219);
  pdf.setLineWidth(0.25);
  pdf.roundedRect(MARGIN, y, CONTENT_W, CARD_H, 2, 2, 'FD');

  // QR code
  if (qrDataUrl) {
    pdf.addImage(qrDataUrl, 'PNG', MARGIN + CONTENT_W - QR_SIZE - 3, y + 4, QR_SIZE, QR_SIZE);
  }

  // Type badge — show "MUNDO" for external materials
  const isExternal = material.source === 'mundo';
  const badgeColor = isExternal ? '#1d4ed8' : '#2563eb';
  const badgeLabel = isExternal ? 'MUNDO' : (safe(type?.label ?? material.type) || '?');
  const [tr, tg, tb] = hexToRgb(badgeColor);
  pdf.setFillColor(tr, tg, tb);
  pdf.roundedRect(MARGIN + 3, y + 3, 22, 4.5, 1, 1, 'F');
  setFont(pdf, 6.5, 'bold', [255, 255, 255]);
  pdf.text(badgeLabel, MARGIN + 14, y + 6.2, { align: 'center' });

  // Duration (skip for external materials)
  if (!isExternal) {
    const dur = safe(material.duration);
    if (dur) {
      setFont(pdf, 7, 'normal', [107, 114, 128]);
      pdf.text(dur, MARGIN + 27, y + 6.2);
    }
  }

  // Title
  setFont(pdf, 9.5, 'bold', [17, 24, 39]);
  const titleLines = pdf.splitTextToSize(safe(material.title) || safe(uebersetze('ausgabe.keinTitel')), TEXT_W);
  if (titleLines.length > 0) pdf.text(titleLines.slice(0, 2), MARGIN + 3, y + 13);

  // Description
  setFont(pdf, 7.5, 'normal', [75, 85, 99]);
  const descLines = pdf.splitTextToSize(safe(material.description) || '', TEXT_W);
  if (descLines.length > 0) pdf.text(descLines.slice(0, 2), MARGIN + 3, y + 20);

  // Target levels
  const levelKeys = material.targetLevels ?? [];
  let lx = MARGIN + 3;
  levelKeys.forEach((lk) => {
    const cfg = COMPETENCE_LEVELS[lk];
    if (!cfg) return;
    const [r, g, b] = hexToRgb(cfg.color);
    pdf.setFillColor(r, g, b);
    pdf.roundedRect(lx, y + 26, 12, 4, 1, 1, 'F');
    setFont(pdf, 6, 'bold', [255, 255, 255]);
    pdf.text(safe(uebersetze('gemeinsam.stufe', { n: lk })), lx + 6, y + 28.8, { align: 'center' });
    lx += 14;
  });

  // URL (blue, left column – full TEXT_W available)
  if (url) {
    setFont(pdf, 6.5, 'normal', [37, 99, 235]);
    const shortUrl = url.length > 68 ? url.slice(0, 68) + '…' : url;
    pdf.text(shortUrl, MARGIN + 3, y + 35);
  }
};

// ── Public entry point ────────────────────────────────────────────────────────

/**
 * Generate and download a PDF with one page per group.
 * Each page lists the assigned materials grouped by competence level,
 * including a QR code and demo URL per material.
 *
 * @param {Object} assignments    – { [groupId]: { [levelKey]: materialId[] } }
 * @param {string} [filterGroupId] – export only this group when provided
 */
export const exportPDF = async (assignments, filterGroupId = null, extraGroups = [], extraMaterials = []) => {
  beschriftungenAktualisieren();
  const allMaterials = [...EDUCATIONAL_MATERIALS, ...extraMaterials];
  const allGroups = [...GROUPS, ...extraGroups];
  const groupsToExport = (filterGroupId ? allGroups.filter((g) => g.id === filterGroupId) : allGroups)
    .filter((g) => {
      const byLevel = assignments[g.id];
      return byLevel && Object.values(byLevel).some((ids) => ids.length > 0);
    });

  if (groupsToExport.length === 0) {
    throw new Error(
      filterGroupId
        ? uebersetze('ausgabe.keineFuerKlasse')
        : uebersetze('ausgabe.keineVorhanden')
    );
  }

  // Pre-generate all QR codes in parallel
  const qrCache = {};
  await Promise.all(
    groupsToExport.flatMap((group) =>
      Object.values(assignments[group.id] ?? {})
        .flat()
        .map(async (materialId) => {
          if (qrCache[materialId]) return;
          const material = allMaterials.find((m) => m.id === materialId);
          if (material) {
            const qrUrl = material.url || getMaterialUrl(material);
            try { qrCache[materialId] = await generateQR(qrUrl); } catch { /* skip QR for this material */ }
          }
        })
    )
  );

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const date = new Date().toLocaleDateString(LOCALE[sprache()] ?? LOCALE.de);
  const STANDARD_LEVEL_ORDER = ['I', 'II', 'III', 'IV', 'V'];

  for (let gi = 0; gi < groupsToExport.length; gi++) {
    const group = groupsToExport[gi];
    const prevGroup = gi > 0 ? groupsToExport[gi - 1] : null;

    if (gi > 0) {
      // Insert a separator page when transitioning between section types (level ↔ group)
      if (prevGroup?._type && group._type && prevGroup._type !== group._type) {
        pdf.addPage();
        const isGroupSection = group._type === 'group';
        drawSeparatorPage(
          pdf,
          isGroupSection ? uebersetze('ausgabe.nachGruppe') : uebersetze('ausgabe.nachStufe'),
          isGroupSection
            ? uebersetze('ausgabe.zuordnungGruppe')
            : uebersetze('ausgabe.zuordnungStufe'),
          date
        );
      }
      pdf.addPage();
    }

    drawHeader(pdf, group, gi + 1, groupsToExport.length);
    drawFooter(pdf, date);

    const byLevel = assignments[group.id] ?? {};
    // Use standard order when possible, append any extra keys (e.g. '_all' for group-mode)
    const knownKeys = new Set(STANDARD_LEVEL_ORDER);
    const extraKeys = Object.keys(byLevel).filter((k) => !knownKeys.has(k));
    const levelOrder = [...STANDARD_LEVEL_ORDER.filter((k) => k in byLevel), ...extraKeys];

    let y = HEADER_H + 6;
    const bottomBoundary = PAGE_H - 12; // leave room for footer

    for (const lk of levelOrder) {
      const materialIds = byLevel[lk] ?? [];
      if (materialIds.length === 0) continue;

      // Page break before level bar if needed
      if (y + LEVEL_BAR_H + CARD_H + 4 > bottomBoundary) {
        pdf.addPage();
        drawFooter(pdf, date);
        y = MARGIN;
      }

      drawLevelBar(pdf, lk, y);
      y += LEVEL_BAR_H + 3;

      for (const materialId of materialIds) {
        const material = allMaterials.find((m) => m.id === materialId);
        if (!material) continue;

        // Page break before card if needed
        if (y + CARD_H + 2 > bottomBoundary) {
          pdf.addPage();
          drawFooter(pdf, date);
          y = MARGIN;
        }

        drawMaterialCard(pdf, material, y, qrCache[materialId]);
        y += CARD_H + 3;
      }

      y += 3;
    }
  }

  const allGroupsForName = [...GROUPS, ...extraGroups];
  const namePart = filterGroupId
    ? (allGroupsForName.find((g) => g.id === filterGroupId)?.name ?? filterGroupId).replace(/\s+/g, '_')
    : 'alle_klassen';
  pdf.save(`tba3_${namePart}_${new Date().toISOString().slice(0, 10)}.pdf`);

  return groupsToExport.reduce(
    (sum, g) =>
      sum +
      Object.values(assignments[g.id] ?? {}).reduce((s, ids) => s + ids.length, 0),
    0
  );
};
