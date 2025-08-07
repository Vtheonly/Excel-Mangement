const ExcelJS = require('exceljs');

async function parseExcelFile(filePath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.worksheets[0]; // Get the first worksheet
    if (!worksheet) {
        throw new Error("No worksheets found in the file.");
    }

    let headers = [];
    const rows = [];
    
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        // row.values is a sparse array [undefined, 'val1', undefined, 'val2']. We want a dense one.
        const rowValues = [];
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            rowValues[colNumber - 1] = cell.value;
        });

        if (rowNumber === 1) {
            headers = rowValues;
        } else {
            rows.push(rowValues);
        }
    });

    return { headers, rows };
}

module.exports = { parseExcelFile };