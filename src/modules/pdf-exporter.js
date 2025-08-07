const { jsPDF } = require("jspdf");
require("jspdf-autotable"); // it auto-attaches to jsPDF

/**
 * Exports the given data table to a PDF file.
 * @param {Array<string>} headers - The table headers.
 * @param {Array<Array<any>>} rows - The table rows.
 * @param {string} fileName - The name of the file being exported.
 */
function exportToPdf(headers, rows, fileName) {
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

    const pdfFileName = `SheetWise-Export-${fileName.split(".")[0]}.pdf`;
    doc.save(pdfFileName);

    return {
      success: true,
      message: `Successfully exported to ${pdfFileName}`,
    };
  } catch (error) {
    console.error("PDF Export failed:", error);
    return { success: false, message: `PDF Export failed: ${error.message}` };
  }
}

module.exports = { exportToPdf };
