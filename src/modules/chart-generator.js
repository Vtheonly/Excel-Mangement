let myChart = null;

/**
 * Creates a new chart or updates an existing one on the given canvas.
 * @param {HTMLCanvasElement} canvasElement - The canvas to draw the chart on.
 * @param {object} chartData - The data for the chart, with { labels, data }.
 * @param {string} chartTitle - The title for the chart.
 * @param {string} chartType - The type of chart ('bar', 'pie', etc.).
 */
function createOrUpdateChart(canvasElement, chartData, chartTitle, chartType) {
  if (myChart) {
    myChart.destroy();
  }

  // For Pie charts, we need more colors
  const backgroundColors =
    chartType === "pie"
      ? generateColors(chartData.labels.length)
      : "rgba(0, 188, 212, 0.6)";

  const borderColors =
    chartType === "pie"
      ? backgroundColors.map((c) => c.replace("0.6", "1")) // make opaque
      : "rgba(0, 188, 212, 1)";

  const ctx = canvasElement.getContext("2d");
  myChart = new Chart(ctx, {
    type: chartType, // Dynamic chart type
    data: {
      labels: chartData.labels,
      datasets: [
        {
          label: "Count",
          data: chartData.data,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: chartType === "pie", // Only show legend for pie charts
          position: "right",
          labels: { color: "#e0e0e0" },
        },
        title: {
          display: true,
          text: chartTitle,
          color: "#e0e0e0",
          font: { size: 16 },
        },
      },
      scales: {
        // Hide scales for pie charts
        y: {
          display: chartType !== "pie",
          beginAtZero: true,
          ticks: { color: "#a0a0a0", precision: 0 },
          grid: { color: "rgba(160, 160, 160, 0.2)" },
        },
        x: {
          display: chartType !== "pie",
          ticks: { color: "#a0a0a0" },
          grid: { display: false },
        },
      },
    },
  });
}

// Helper function to generate an array of distinct colors for pie charts
function generateColors(count) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const hue = ((i * 360) / count) % 360;
    colors.push(`hsla(${hue}, 70%, 60%, 0.6)`);
  }
  return colors;
}

module.exports = { createOrUpdateChart };
