const { contextBridge, ipcRenderer } = require("electron");
const path = require("path");

const { calculateValueCounts, calculateNumericStats } = require(path.join(__dirname, "../modules/statistics.js"));
// REMOVED: No longer need chart-generator here

contextBridge.exposeInMainWorld("api", {
  // Main process communication
  loadFile: () => ipcRenderer.invoke('dialog:openFile'),
  exportPdf: (data) => ipcRenderer.invoke('export:pdf', data),

  // Window Controls
  minimizeWindow: () => ipcRenderer.send("minimize-window"),
  maximizeWindow: () => ipcRenderer.send("maximize-window"),
  closeWindow: () => ipcRenderer.send("close-window"),

  // Exposed backend modules
  calculateValueCounts,
  calculateNumericStats,
  // REMOVED: createOrUpdateChart is gone
});