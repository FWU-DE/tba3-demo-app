import { jsPDF } from 'jspdf';
import {
  COMPETENCE_LEVELS,
  EDUCATIONAL_MATERIALS,
  GRADES,
  GROUPS,
  SUBJECTS,
} from './constants';
import {
  CARD_H,
  CONTENT_W,
  MARGIN,
  PAGE_H,
  PAGE_W,
  drawFooter,
  drawMaterialCard,
  generateQR,
  getMaterialUrl,
  hexToRgb,
  safe,
  setFont,
} from './pdfExport';

// Individuelle Rückmeldung für eine Schüler*in — ein PDF pro Person.
// Nutzt dieselben Zeichenhelfer wie der Gruppen-Export (pdfExport.js), damit
// beide Dokumente gleich aussehen.

const HEADER_H = 26;

const drawHeader = (pdf, student, group) => {
  const [r, g, b] = hexToRgb('#2563eb');
  pdf.setFillColor(r, g, b);
  pdf.rect(0, 0, PAGE_W, HEADER_H, 'F');

  setFont(pdf, 14, 'bold', [255, 255, 255]);
  pdf.text(safe(`${student.firstName} ${student.lastName}`), MARGIN, 12);

  const teile = [
    group?.name,
    SUBJECTS[student.subject]?.label ?? student.subject,
    GRADES[student.grade]?.label ?? student.grade,
  ].filter(Boolean);

  setFont(pdf, 8.5, 'normal', [219, 234, 254]);
  pdf.text(safe(teile.join('  ·  ')), MARGIN, 19);

  setFont(pdf, 7.5, 'normal', [191, 219, 254]);
  pdf.text('Individuelle Rückmeldung', PAGE_W - MARGIN, 12, { align: 'right' });
};

// Farbiges Feld mit der erreichten Kompetenzstufe.
const drawLevelPanel = (pdf, levelKey, y) => {
  const cfg = COMPETENCE_LEVELS[levelKey];
  if (!cfg) return y;
  const [r, g, b] = hexToRgb(cfg.color);

  pdf.setFillColor(r, g, b);
  pdf.roundedRect(MARGIN, y, CONTENT_W, 20, 2, 2, 'F');

  setFont(pdf, 7.5, 'normal', [255, 255, 255]);
  pdf.text('Erreichte Kompetenzstufe', MARGIN + 6, y + 7);

  setFont(pdf, 13, 'bold', [255, 255, 255]);
  pdf.text(safe(`Stufe ${levelKey}`), MARGIN + 6, y + 15.5);

  setFont(pdf, 9, 'normal', [255, 255, 255]);
  pdf.text(safe(cfg.description), MARGIN + 40, y + 15.5);

  return y + 20 + 8;
};

// Je Domäne eine Zeile mit farbigem Stufen-Chip.
const drawDomains = (pdf, domainLevels, y) => {
  const eintraege = Object.entries(domainLevels ?? {});
  if (eintraege.length === 0) return y;

  setFont(pdf, 9, 'bold', [17, 24, 39]);
  pdf.text('Ergebnisse nach Teilbereich', MARGIN, y);
  y += 6;

  eintraege.forEach(([domain, level]) => {
    const cfg = COMPETENCE_LEVELS[level];
    pdf.setFillColor(249, 250, 251);
    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.2);
    pdf.roundedRect(MARGIN, y, CONTENT_W, 9, 1.5, 1.5, 'FD');

    setFont(pdf, 8.5, 'normal', [55, 65, 81]);
    pdf.text(safe(domain), MARGIN + 4, y + 6);

    if (cfg) {
      const [r, g, b] = hexToRgb(cfg.color);
      pdf.setFillColor(r, g, b);
      pdf.roundedRect(PAGE_W - MARGIN - 40, y + 2, 36, 5, 1, 1, 'F');
      setFont(pdf, 6.5, 'bold', [255, 255, 255]);
      pdf.text(safe(`Stufe ${level} · ${cfg.description}`), PAGE_W - MARGIN - 22, y + 5.5, {
        align: 'center',
      });
    }
    y += 11;
  });

  return y + 4;
};

/**
 * Erzeugt die individuelle Rückmeldung als PDF und stößt den Download an.
 *
 * @param {Object} student – Datensatz aus utils/studentData.js
 * @returns {Promise<void>} – erfüllt sich, wenn die Datei erzeugt ist
 */
export const exportStudentPDF = async (student) => {
  if (!student) return;

  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const group = GROUPS.find((g) => g.id === student.classGroupId);
  const datum = new Date().toLocaleDateString('de-DE');

  drawHeader(pdf, student, group);

  let y = HEADER_H + 10;
  y = drawLevelPanel(pdf, student.competenceLevel, y);
  y = drawDomains(pdf, student.domainLevels, y);

  // Passende Materialien — dieselbe Auswahl wie in der Detailansicht.
  const materialien = EDUCATIONAL_MATERIALS.filter(
    (m) =>
      m.subject === student.subject &&
      m.grade === student.grade &&
      m.targetLevels?.includes(student.competenceLevel)
  );

  if (materialien.length > 0) {
    setFont(pdf, 9, 'bold', [17, 24, 39]);
    pdf.text('Empfohlene Materialien', MARGIN, y);
    y += 6;

    // QR-Codes vorab erzeugen — addImage selbst ist synchron.
    const qrCodes = await Promise.all(
      materialien.map((m) => generateQR(m.url || getMaterialUrl(m)).catch(() => null))
    );

    for (const [i, material] of materialien.entries()) {
      if (y + CARD_H > PAGE_H - 16) {
        drawFooter(pdf, datum);
        pdf.addPage();
        y = MARGIN;
      }
      drawMaterialCard(pdf, material, y, qrCodes[i]);
      y += CARD_H + 4;
    }
  }

  drawFooter(pdf, datum);

  const dateiname = `Rueckmeldung_${safe(student.lastName)}_${safe(student.firstName)}.pdf`
    .replace(/\s+/g, '_');
  pdf.save(dateiname);
};
