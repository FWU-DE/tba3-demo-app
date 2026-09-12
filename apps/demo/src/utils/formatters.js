// Zahlen folgen der gewählten Sprache: im Deutschen Komma und schmales
// Leerzeichen vor dem Prozentzeichen, im Englischen Punkt.
import { sprache, uebersetze } from '../i18n';

const LOCALE = { de: 'de-DE', en: 'en-GB' };
const locale = () => LOCALE[sprache()] ?? LOCALE.de;

/**
 * Format a number as a percentage in the selected language
 * @param {number} value - Value between 0 and 1
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return `${(value * 100).toLocaleString(locale(), {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} %`;
};

/**
 * Format a number in the selected language
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
export const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return value.toLocaleString(locale(), {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format a student count
 * @param {number} count - Number of students
 * @returns {string} Formatted count
 */
export const formatStudentCount = (count) => {
  if (count === null || count === undefined) return '—';
  const formatted = formatNumber(count);
  return uebersetze(count === 1 ? 'gemeinsam.schuelerEiner' : 'gemeinsam.schuelerMehrere', { n: formatted });
};

/**
 * Format a decimal value for display
 * @param {number} value - Decimal value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted decimal
 */
export const formatDecimal = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return value.toLocaleString(locale(), {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};
