document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const loadFileBtn = document.getElementById("load-file-btn");
  const fileInfo = document.getElementById("file-info");
  const tableContainer = document.getElementById("table-container");
  const historyList = document.getElementById("history-list");
  const mainChartCanvas = document.getElementById("main-chart");
  const columnSelect = document.getElementById("column-select");
  const numericStatsDisplay = document.getElementById("numeric-stats-display");
  const exportPdfBtn = document.getElementById("export-pdf-btn");

  const barChartBtn = document.getElementById("bar-chart-btn");
  const pieChartBtn = document.getElementById("pie-chart-btn");

  const minimizeBtn = document.getElementById("minimize-btn");
  const maximizeBtn = document.getElementById("maximize-btn");
  const closeBtn = document.getElementById("close-btn");

  // --- State ---
  let currentData = { headers: [], rows: [], filePath: null };
  let currentChartType = "bar"; // Default chart type

  // --- Functions ---

  // --- START: CHART LOGIC (MOVED HERE) ---
  let myChart = null;

  // Helper function to generate an array of distinct colors for pie charts
  function generateColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = ((i * 360) / count) % 360;
      colors.push(`hsla(${hue}, 70%, 60%, 0.6)`);
    }
    return colors;
  }

  /**
   * Creates a new chart or updates an existing one on the given canvas.
   * This function now lives directly in the renderer.
   */
  function createOrUpdateChart(
    canvasElement,
    chartData,
    chartTitle,
    chartType
  ) {
    if (myChart) {
      myChart.destroy();
    }

    const backgroundColors =
      chartType === "pie"
        ? generateColors(chartData.labels.length)
        : "rgba(0, 188, 212, 0.6)";

    const borderColors =
      chartType === "pie"
        ? backgroundColors.map((c) => c.replace("0.6", "1"))
        : "rgba(0, 188, 212, 1)";

    const ctx = canvasElement.getContext("2d");
    myChart = new Chart(ctx, {
      // This will now work correctly!
      type: chartType,
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
            display: chartType === "pie",
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
  // --- END: CHART LOGIC ---

  const addToHistory = (message) => {
    const li = document.createElement("li");
    const timestamp = new Date().toLocaleTimeString();
    li.textContent = `[${timestamp}] ${message}`;
    historyList.prepend(li);
  };

  const populateColumnSelector = () => {
    columnSelect.innerHTML = ""; // Clear existing options
    currentData.headers.forEach((header) => {
      if (header) {
        // Only add valid headers
        const option = document.createElement("option");
        option.value = header;
        option.textContent = header;
        columnSelect.appendChild(option);
      }
    });
  };

  const renderTable = () => {
    if (!currentData.rows.length) {
      tableContainer.innerHTML = `<div class="placeholder"><p>No data to display.</p></div>`;
      return;
    }

    const table = document.createElement("table");
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    currentData.headers.forEach((headerText) => {
      const th = document.createElement("th");
      th.textContent = headerText || "Column";
      headerRow.appendChild(th);
    });

    const tbody = table.createTBody();
    currentData.rows.forEach((rowData) => {
      const row = tbody.insertRow();
      currentData.headers.forEach((_, index) => {
        const cell = row.insertCell();
        cell.textContent = rowData[index] || "";
      });
    });

    tableContainer.innerHTML = "";
    tableContainer.appendChild(table);
  };

  const analyzeAndDisplayData = () => {
    const columnToAnalyze = columnSelect.value;
    if (!columnToAnalyze) {
      mainChartCanvas.style.display = "none";
      numericStatsDisplay.style.display = "none";
      return;
    }

    try {
      // Heuristic to check if column is numeric: check first 10 data rows
      const columnIndex = currentData.headers.indexOf(columnToAnalyze);
      const sampleData = currentData.rows
        .slice(0, 10)
        .map((r) => r[columnIndex])
        .filter((v) => v != null);
      const numericCount = sampleData.filter(
        (v) => !isNaN(parseFloat(v)) && isFinite(v)
      ).length;
      const isNumeric = numericCount / sampleData.length > 0.5; // If > 50% are numbers, treat as numeric

      if (isNumeric) {
        // --- NUMERIC COLUMN ---
        const stats = window.api.calculateNumericStats(
          currentData.rows,
          currentData.headers,
          columnToAnalyze
        );
        numericStatsDisplay.innerHTML = `
                <p><span>Count:</span> <span>${stats.count}</span></p>
                <p><span>Sum:</span> <span>${stats.sum.toLocaleString()}</span></p>
                <p><span>Mean:</span> <span>${stats.mean.toFixed(2)}</span></p>
                <p><span>Median:</span> <span>${stats.median.toLocaleString()}</span></p>
                <p><span>Min:</span> <span>${stats.min.toLocaleString()}</span></p>
                <p><span>Max:</span> <span>${stats.max.toLocaleString()}</span></p>
            `;
        numericStatsDisplay.style.display = "block";
        addToHistory(`Calculated numeric stats for "${columnToAnalyze}".`);
        mainChartCanvas.style.display = "block";
      } else {
        // --- CATEGORICAL COLUMN ---
        numericStatsDisplay.style.display = "none";
        mainChartCanvas.style.display = "block";
      }

      // Always generate a chart (it acts as a histogram for numeric data)
      const valueCounts = window.api.calculateValueCounts(
        currentData.rows,
        currentData.headers,
        columnToAnalyze
      );
      const chartTitle = `Distribution for "${columnToAnalyze}"`;

      // Call the local function directly
      createOrUpdateChart(
        mainChartCanvas,
        valueCounts,
        chartTitle,
        currentChartType
      );

      addToHistory(
        `Generated ${currentChartType} chart for "${columnToAnalyze}".`
      );
    } catch (error) {
      console.error(error);
      addToHistory(`Analysis Error: ${error.message}`);
    }
  };

  // --- Event Listeners ---
  loadFileBtn.addEventListener("click", async () => {
    try {
      const result = await window.api.loadFile();

      if (result && !result.error) {
        currentData = result;
        const fileName = result.filePath.split(/[\\/]/).pop();
        fileInfo.textContent = `Loaded: ${fileName}`;
        addToHistory(`File loaded: ${fileName}`);

        renderTable();
        populateColumnSelector();
        analyzeAndDisplayData(); // Analyze the first column by default
      } else if (result && result.error) {
        fileInfo.textContent = "Error loading file.";
        addToHistory(`Error: ${result.error}`);
      } else {
        addToHistory("File open dialog was cancelled.");
      }
    } catch (error) {
      console.error("Error in loadFileBtn listener:", error);
      addToHistory(`A critical error occurred: ${error.message}`);
    }
  });

  columnSelect.addEventListener("change", analyzeAndDisplayData);

  barChartBtn.addEventListener("click", () => {
    currentChartType = "bar";
    pieChartBtn.classList.remove("active");
    barChartBtn.classList.add("active");
    analyzeAndDisplayData();
  });

  pieChartBtn.addEventListener("click", () => {
    currentChartType = "pie";
    barChartBtn.classList.remove("active");
    pieChartBtn.classList.add("active");
    analyzeAndDisplayData();
  });

  exportPdfBtn.addEventListener("click", async () => {
    if (!currentData || currentData.rows.length === 0) {
      addToHistory("No data to export.");
      return;
    }
    const fileName = currentData.filePath.split(/[\\/]/).pop();
    addToHistory(`Exporting ${fileName} to PDF...`);

    const result = await window.api.exportPdf({
      headers: currentData.headers,
      rows: currentData.rows,
      fileName: fileName,
    });

    addToHistory(result.message);
  });

  // Window control listeners
  minimizeBtn.addEventListener("click", () => window.api.minimizeWindow());
  maximizeBtn.addEventListener("click", () => window.api.maximizeWindow());
  closeBtn.addEventListener("click", () => window.api.closeWindow());
});
