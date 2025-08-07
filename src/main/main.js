// At the top with other requires
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs"); // Add Node's File System module
const { jsPDF } = require("jspdf"); // Require jsPDF here
require("jspdf-autotable"); // Require the autotable plugin here
const path = require("path");
const { parseExcelFile } = require("../modules/excel-handler.js");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.loadFile(path.join(__dirname, "../renderer/index.html"));
}

ipcMain.handle("dialog:openFile", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Excel Files", extensions: ["xlsx", "xls"] }],
  });

  if (canceled || filePaths.length === 0) {
    return null;
  }

  try {
    const filePath = filePaths[0];
    const data = await parseExcelFile(filePath);
    return { ...data, filePath }; // Send headers, rows, and filePath back
  } catch (error) {
    console.error("Error parsing Excel file:", error);
    return { error: error.message };
  }
});

ipcMain.handle("export:pdf", async (event, data) => {
  const { headers, rows, fileName } = data;

  // Let the user choose where to save the file
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    // Pass browser window
    title: "Save PDF Export",
    defaultPath: `SheetWise-Export-${fileName.split(".")[0]}.pdf`,
    filters: [{ name: "PDF Documents", extensions: ["pdf"] }],
  });

  if (canceled || !filePath) {
    return { success: false, message: "PDF export cancelled." };
  }

  try {
    const doc = new jsPDF();
    doc.text(`Data Export from: ${fileName}`, 14, 15);
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 20,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 186] },
    });

    // Get PDF data as a buffer and write it to the chosen file path
    const pdfData = doc.output("arraybuffer");
    fs.writeFileSync(filePath, Buffer.from(pdfData));

    return { success: true, message: `PDF successfully saved!` };
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    return {
      success: false,
      message: `Failed to generate PDF: ${error.message}`,
    };
  }
});

// Standabtnrd window controls
ipcMain.on("minimize-window", () => win.minimize());
ipcMain.on("maximize-window", () => {
  if (win.isMaximized()) {
    win.unmaximize();
  } else {
    win.maximize();
  }
});
ipcMain.on("close-window", () => win.close());

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
