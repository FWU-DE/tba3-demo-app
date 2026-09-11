/**
 * Format a number as a percentage with German locale
 * @param {number} value - Value between 0 and 1
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return `${(value * 100).toLocaleString('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} %`;
};

/**
 * Format a number with German locale
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
export const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return value.toLocaleString('de-DE', {
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
  return count === 1 ? `${formatted} Schüler*in` : `${formatted} Schüler*innen`;
};

/**
 * Format a decimal value for display
 * @param {number} value - Decimal value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted decimal
 */
export const formatDecimal = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};
