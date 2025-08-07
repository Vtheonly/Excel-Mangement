/**
 * Calculates the frequency of each unique value in a specified column (for categorical data).
 * @param {Array<Array<any>>} rows - The 2D array of data rows.
 * @param {Array<string>} headers - The array of header names.
 * @param {string} columnName - The name of the column to analyze.
 * @returns {{labels: Array<string>, data: Array<number>}} - An object ready for Chart.js.
 */
function calculateValueCounts(rows, headers, columnName) {
  const columnIndex = headers.findIndex((h) => h === columnName);
  if (columnIndex === -1) throw new Error(`Column "${columnName}" not found.`);

  const counts = new Map();
  for (const row of rows) {
    const value = row[columnIndex] || "N/A"; // Use 'N/A' for empty cells
    counts.set(value, (counts.get(value) || 0) + 1);
  }

  const sortedCounts = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return {
    labels: sortedCounts.map((entry) => String(entry[0])), // Ensure labels are strings
    data: sortedCounts.map((entry) => entry[1]),
  };
}

/**
 * Calculates descriptive statistics for a specified numeric column.
 * @param {Array<Array<any>>} rows - The 2D array of data rows.
 * @param {Array<string>} headers - The array of header names.
 * @param {string} columnName - The name of the column to analyze.
 * @returns {object} - An object containing statistical measures.
 */
function calculateNumericStats(rows, headers, columnName) {
  const columnIndex = headers.findIndex((h) => h === columnName);
  if (columnIndex === -1) throw new Error(`Column "${columnName}" not found.`);

  // Filter for valid numbers, excluding null, undefined, and non-numeric strings
  const numbers = rows
    .map((row) => row[columnIndex])
    .filter((v) => v != null && !isNaN(parseFloat(v)) && isFinite(v))
    .map(Number);

  if (numbers.length === 0) {
    return { count: 0, sum: 0, mean: 0, median: 0, min: 0, max: 0 };
  }

  const sum = numbers.reduce((acc, val) => acc + val, 0);
  const mean = sum / numbers.length;

  numbers.sort((a, b) => a - b);
  const mid = Math.floor(numbers.length / 2);
  const median =
    numbers.length % 2 !== 0
      ? numbers[mid]
      : (numbers[mid - 1] + numbers[mid]) / 2;

  const min = numbers[0];
  const max = numbers[numbers.length - 1];

  return {
    count: numbers.length,
    sum: sum,
    mean: mean,
    median: median,
    min: min,
    max: max,
  };
}

module.exports = { calculateValueCounts, calculateNumericStats };
