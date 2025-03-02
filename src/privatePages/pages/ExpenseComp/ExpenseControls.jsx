import jsPDF from "jspdf";
import "jspdf-autotable";
import { utils, writeFile } from "xlsx";

/**
 * Export data to PDF format
 * @param {Array} data - The data to export
 */
export const exportToPDF = (data) => {
  const doc = new jsPDF();

  // Add a title to the PDF
  doc.setFontSize(18);
  doc.text("Expense Report", 14, 22);

  // Convert data to a format suitable for jspdf-autotable
  const tableData = data.map((expense) => [
    expense.id,
    expense.description,
    `₹${expense.amount.toLocaleString("en-IN")}`,
    new Date(expense.date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    expense.expenseType,
    expense.propertyName,
    expense.createdBy,
  ]);

  // Define table columns
  const headers = [
    "ID",
    "Description",
    "Amount",
    "Date",
    "Type",
    "Property",
    "Created By",
  ];

  // Add the table to the PDF
  doc.autoTable({
    head: [headers],
    body: tableData,
    startY: 30,
    theme: "striped",
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
  });

  // Save the PDF
  doc.save("expense_report.pdf");
};

/**
 * Export data to CSV format
 * @param {Array} data - The data to export
 */
export const exportToCSV = (data) => {
  // Convert data to CSV format
  const headers = [
    "ID",
    "Description",
    "Amount",
    "Date",
    "Type",
    "Property",
    "Created By",
  ];
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(","));

  // Add data rows
  data.forEach((expense) => {
    const row = [
      expense.id,
      `"${expense.description}"`, // Wrap in quotes to handle commas in description
      `₹${expense.amount.toLocaleString("en-IN")}`,
      new Date(expense.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      expense.expenseType,
      expense.propertyName,
      expense.createdBy,
    ];
    csvRows.push(row.join(","));
  });

  // Create CSV file
  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv" });

  // Create a link and trigger the download
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "expense_report.csv";
  link.click();
};

/**
 * Export data to Excel format
 * @param {Array} data - The data to export
 */
export const exportToExcel = (data) => {
  // Convert data to a worksheet
  const worksheet = utils.json_to_sheet(
    data.map((expense) => ({
      ID: expense.id,
      Description: expense.description,
      Amount: `₹${expense.amount.toLocaleString("en-IN")}`,
      Date: new Date(expense.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      Type: expense.expenseType,
      Property: expense.propertyName,
      "Created By": expense.createdBy,
    }))
  );

  // Create a workbook and add the worksheet
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Expenses");

  // Write the workbook to a file
  writeFile(workbook, "expense_report.xlsx");
};
