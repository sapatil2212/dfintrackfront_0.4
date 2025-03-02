import * as Tooltip from "@radix-ui/react-tooltip";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import jsPDF from "jspdf";
import "jspdf-autotable";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import Pagination from "./ExpenseComp/Pagination";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  Pencil,
  Trash2,
  PlusCircle,
  Download,
  Upload,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DatePickerWithRange from "./ExpenseComp/DateRangePicker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { setExpenses, setLoading, setError } from "../../slices/expensesSlice";
import ExpenseService from "../../services/ExpenseService";
import Loader from "../../components/Loaders/Loader";
import { motion } from "framer-motion";
import AddExpense from "./ExpenseComp/AddExpense";
import { fetchBankAccounts } from "../../slices/bankAccountSlice";
import { fetchProperties } from "../../slices/PropertySlice";
import { jwtDecode } from "jwt-decode";
import SuccessModal from "../../components/SuccessModal";
import DeleteModal from "../../components/DeleteModel";
import ViewExpense from "./ExpenseComp/ViewExpense"; // Import ViewExpense
import UpdateExpense from "./ExpenseComp/UpdateExpense"; // Import UpdateExpense

const ExpenseDashboard = () => {
  const dispatch = useDispatch();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const { expenses, loading, error } = useSelector((state) => state.expenses);
  const { properties } = useSelector((state) => state.properties);
  const { accounts: bankAccounts } = useSelector((state) => state.bankAccounts);
  const user = useSelector((state) => state.user);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Handle View Expense
  const handleViewExpense = (expense) => {
    setSelectedExpense(expense);
    setIsViewModalOpen(true);
  };

  // Add this function to your ExpenseDashboard component
  const handleUpdateExpense = (expense) => {
    setSelectedExpense(expense);
    setIsUpdateModalOpen(true);
  };

  // ExpenseDashboard.js
  const handleUpdateExpenseSubmit = async (data) => {
    try {
      const updatedExpense = await ExpenseService.updateExpense(
        selectedExpense.id,
        data
      );
      dispatch(updateExpense(updatedExpense)); // Update the state in Redux
      showSuccessMessage("Expense updated successfully!");
      setIsUpdateModalOpen(false);
      fetchExpenses(); // Refresh the list of expenses
    } catch (error) {
      console.error("Error updating expense:", error);
      dispatch(setError("Failed to update expense"));
    }
  };

  // Handle Close for View Modal
  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedExpense(null);
  };

  // Handle Close for Update Modal
  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedExpense(null);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredExpenses.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  useEffect(() => {
    fetchExpenses();
    dispatch(fetchProperties());
    dispatch(fetchBankAccounts());
  }, [dispatch]);

  useEffect(() => {
    filterAndSortExpenses();
  }, [expenses, dateRange, sortConfig, selectedProperty]);

  const filterAndSortExpenses = () => {
    let result = [...expenses];

    // Apply date range filter
    if (dateRange.from && dateRange.to) {
      result = result.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= dateRange.from && expenseDate <= dateRange.to;
      });
    }

    // Apply property filter
    if (selectedProperty !== "all") {
      result = result.filter(
        (expense) => expense.propertyName === selectedProperty
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredExpenses(result);
  };

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  };

  const exportData = async (format) => {
    try {
      const fileName = `expenses_${selectedProperty}_${
        new Date().toISOString().split("T")[0]
      }`;

      switch (format) {
        case "csv": {
          const csv = Papa.unparse(filteredExpenses);
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `${fileName}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          showSuccessMessage(`Exported as ${fileName}.csv`);
          break;
        }

        case "excel": {
          const ws = XLSX.utils.json_to_sheet(filteredExpenses);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Expenses");
          XLSX.writeFile(wb, `${fileName}.xlsx`);
          showSuccessMessage(`Exported as ${fileName}.xlsx`);
          break;
        }

        case "pdf": {
          const doc = new jsPDF();
          doc.text("Expenses Report", 14, 10);
          const tableColumn = [
            "ID",
            "Description",
            "Amount",
            "Date",
            "Type",
            "Property",
            "Created By",
          ];
          const tableRows = filteredExpenses.map((exp) => [
            exp.id,
            exp.description,
            `₹${exp.amount.toLocaleString("en-IN")}`,
            new Date(exp.date).toLocaleDateString("en-IN"),
            exp.expenseType,
            exp.propertyName,
            exp.createdBy,
          ]);
          doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
          });
          doc.save(`${fileName}.pdf`);
          showSuccessMessage(`Exported as ${fileName}.pdf`);
          break;
        }
      }
    } catch (error) {
      dispatch(setError(`Failed to export as ${format}: ${error.message}`));
    }
  };

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileType = file.name.split(".").pop().toLowerCase();

    if (fileType === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (result) => {
          await processImportedData(result.data);
        },
      });
    } else if (fileType === "xlsx") {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const workbook = XLSX.read(e.target.result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        await processImportedData(data);
      };
      reader.readAsBinaryString(file);
    } else if (fileType === "pdf") {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const pdf = await pdfjsLib.getDocument({ data: e.target.result })
          .promise;
        let extractedText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          extractedText += textContent.items.map((item) => item.str).join(" ");
        }
        const parsedData = parsePDFText(extractedText);
        await processImportedData(parsedData);
      };
      reader.readAsArrayBuffer(file);
    } else {
      dispatch(
        setError("Unsupported file format. Please upload CSV, XLSX, or PDF.")
      );
    }
  };

  // Parse PDF text into structured data (if applicable)
  const parsePDFText = (text) => {
    // Implement logic based on your PDF structure
    const lines = text.split("\n").filter((line) => line.trim() !== "");
    return lines.map((line) => {
      const [
        id,
        description,
        amount,
        date,
        expenseType,
        propertyName,
        createdBy,
      ] = line.split(" ");
      return {
        id,
        description,
        amount: parseFloat(amount.replace("₹", "")),
        date: new Date(date).toISOString(),
        expenseType,
        propertyName,
        createdBy,
      };
    });
  };

  // Process and save imported data
  const processImportedData = async (importedExpenses) => {
    try {
      for (const expense of importedExpenses) {
        await ExpenseService.createExpense({
          ...expense,
          createdBy: getUsernameFromToken(),
        });
      }
      showSuccessMessage("Data imported successfully!");
      fetchExpenses();
    } catch (error) {
      dispatch(setError(`Failed to import data: ${error.message}`));
    }
  };
  const getUsernameFromToken = () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode(token);
        return decoded.name || decoded.sub;
      }
      return null;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchExpenses();
    dispatch(fetchProperties());
    dispatch(fetchBankAccounts());
  }, [dispatch]);

  const fetchExpenses = async () => {
    try {
      dispatch(setLoading(true));
      const response =
        user.accountType === "ADMIN"
          ? await ExpenseService.getAllExpenses()
          : await ExpenseService.getExpenses();
      dispatch(setExpenses(Array.isArray(response) ? response : []));
    } catch (err) {
      dispatch(setError(err.message || "Error fetching expenses"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSubmit = async (data) => {
    try {
      const username = getUsernameFromToken();
      const expenseData = {
        ...data,
        createdBy: username,
      };

      await ExpenseService.createExpense(expenseData);
      showSuccessMessage("Expense added successfully!");
      fetchExpenses();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding expense:", error);
      dispatch(setError("Failed to add expense"));
    }
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setIsSuccessModalOpen(true);
    setTimeout(() => {
      setIsSuccessModalOpen(false);
    }, 2000);
  };

  const handleDeleteClick = (expense) => {
    setExpenseToDelete(expense);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await ExpenseService.deleteExpense(expenseToDelete.id);
      setIsDeleteModalOpen(false);
      showSuccessMessage("Expense deleted successfully!");
      fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
      dispatch(setError("Failed to delete expense"));
    } finally {
      setExpenseToDelete(null);
    }
  };

  if (loading) return <Loader />;
  if (error)
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );

  const handleSelectAllToggle = (checked) => {
    if (checked) {
      setSelectedExpenses(currentItems.map((expense) => expense.id));
    } else {
      setSelectedExpenses([]);
    }
  };

  const handleSingleExpenseSelect = (expenseId) => {
    setSelectedExpenses((prev) =>
      prev.includes(expenseId)
        ? prev.filter((id) => id !== expenseId)
        : [...prev, expenseId]
    );
  };

  const handleMultipleDelete = async () => {
    try {
      for (const expenseId of selectedExpenses) {
        await ExpenseService.deleteExpense(expenseId);
      }
      showSuccessMessage(
        `${selectedExpenses.length} expenses deleted successfully!`
      );
      fetchExpenses();
      setSelectedExpenses([]);
    } catch (error) {
      console.error("Error deleting expenses:", error);
      dispatch(setError("Failed to delete selected expenses"));
    }
  };

  return (
    <>
      {/* Success Modal moved outside of motion.div */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={successMessage}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="p-6 bg-white rounded-xl shadow-sm mx-4 my-6"
      >
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {user.accountType === "ADMIN" ? "All Expenses" : "My Expenses"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage and track your expenses
            </p>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <DatePickerWithRange
              className="w-[300px] bg-white"
              value={dateRange}
              onChange={setDateRange}
            />
            {/* Clear Button */}
            {(dateRange?.from || dateRange?.to) && (
              <Button
                variant="outline"
                className="px-4 mt-4 sm:mt-0 sm:ml-4 hover:bg-gray-100 transition-colors duration-200"
                onClick={() => setDateRange({ from: undefined, to: undefined })}
              >
                Clear
              </Button>
            )}
            {/* Sort By Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white">
                <DropdownMenuItem onClick={() => handleSort("propertyName")}>
                  Property Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("amount")}>
                  Amount
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("date")}>
                  Date
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => exportData("csv")}>
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportData("excel")}>
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportData("pdf")}>
                  PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Import Button */}
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => document.getElementById("file-import").click()}
            >
              <Upload className="w-4 h-4" />
              <input
                id="file-import"
                type="file"
                accept=".csv,.xlsx,.pdf"
                className="hidden"
                onChange={handleFileImport}
              />
            </Button>

            {/* Add Expense Button */}
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Add Expense
            </Button>
          </div>
        </div>
        {selectedExpenses.length > 0 && (
          <div className="bg-blue-50 p-4 mb-4 rounded-lg flex justify-between items-center">
            <span className="text-blue-800">
              {selectedExpenses.length} expense(s) selected
            </span>
            <Button
              onClick={handleMultipleDelete}
              className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 text-white" />
              Delete Selected
            </Button>
          </div>
        )}

        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[50px] py-3 px-4">
                  <Checkbox
                    checked={
                      currentItems.length > 0 &&
                      selectedExpenses.length === currentItems.length
                    }
                    onCheckedChange={handleSelectAllToggle}
                  />
                </TableHead>
                <TableHead className="py-3 px-4 text-gray-700 font-medium">
                  ID
                </TableHead>
                <TableHead className="py-3 px-4 text-gray-700 font-medium">
                  Description
                </TableHead>
                <TableHead className="py-3 px-4 text-gray-700 font-medium">
                  Amount
                </TableHead>
                <TableHead className="py-3 px-4 text-gray-700 font-medium">
                  Date
                </TableHead>
                <TableHead className="py-3 px-4 text-gray-700 font-medium">
                  Type
                </TableHead>
                <TableHead className="py-3 px-4 text-gray-700 font-medium">
                  Property
                </TableHead>
                <TableHead className="py-3 px-4 text-gray-700 font-medium">
                  Created By
                </TableHead>
                <TableHead className="py-3 px-4 text-gray-700 font-medium">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length > 0 ? (
                currentItems.map((expense) => (
                  <TableRow
                    key={expense.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="w-[50px]">
                      <Checkbox
                        checked={selectedExpenses.includes(expense.id)}
                        onCheckedChange={() =>
                          handleSingleExpenseSelect(expense.id)
                        }
                      />
                    </TableCell>
                    <TableCell className="py-3 px-4">{expense.id}</TableCell>
                    <TableCell className="py-3 px-4">
                      {expense.description}
                    </TableCell>
                    <TableCell className="py-3 px-4 font-semibold text-red-600">
                      ₹{expense.amount.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      {new Date(expense.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                        {expense.expenseType}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      {expense.propertyName}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      {expense.createdBy}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewExpense(expense)}
                          className="hover:bg-gray-100 hover:text-gray-900"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateExpense(expense)}
                          className="hover:bg-blue-100 hover:text-blue-600"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(expense)}
                          className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-gray-500"
                  >
                    No expenses found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Pagination
          totalItems={filteredExpenses.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />

        <AddExpense
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleSubmit}
          properties={properties}
          bankAccounts={bankAccounts}
          createdBy={getUsernameFromToken()}
        />

        <DeleteModal
          open={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setExpenseToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          message={`Are you sure you want to delete this expense? This action cannot be undone.`}
        />

        {/* View Expense Modal */}
        {isViewModalOpen && (
          <ViewExpense
            expense={selectedExpense}
            onClose={handleCloseViewModal}
            onEdit={() => {
              setIsViewModalOpen(false);
              setIsUpdateModalOpen(true);
            }}
          />
        )}

        {/* Update Expense Modal */}
        {isUpdateModalOpen && (
          <UpdateExpense
            expense={selectedExpense}
            onClose={handleCloseUpdateModal}
            onSubmit={handleUpdateExpenseSubmit} // Pass the update handler
            properties={properties}
            bankAccounts={bankAccounts}
          />
        )}
      </motion.div>
    </>
  );
};

export default ExpenseDashboard;
