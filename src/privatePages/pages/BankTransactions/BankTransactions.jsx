import React, { useState, useEffect, useMemo } from "react";
import { Search, Eye, Trash, Download, ArrowUpDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBankAccounts,
  fetchBankAccountTransactions,
  fetchAllTransactions,
  removeTransaction,
} from "../../../slices/BankAccountSlice";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Pagination from "../ExpenseComp/Pagination";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import DeleteModal from "../../../components/DeleteModel";
import SuccessModal from "../../../components/SuccessModal";
import ViewBankTransactions from "./ViewBankTransactions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const BankTransactions = () => {
  const dispatch = useDispatch();
  const [selectedBankAccount, setSelectedBankAccount] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedBankAccountForView, setSelectedBankAccountForView] =
    useState(null);

  // Add sorting state
  const [sortConfig, setSortConfig] = useState({
    key: "transactionDate",
    direction: "desc", // Default sort by date descending (newest first)
  });

  const { accounts, transactions, allTransactions, status, error } =
    useSelector((state) => state.bankAccounts);

  // Initial load of accounts and all transactions
  useEffect(() => {
    dispatch(fetchBankAccounts());
    dispatch(fetchAllTransactions());
  }, [dispatch]);

  // Fetch transactions when bank account selection changes
  useEffect(() => {
    if (selectedBankAccount) {
      dispatch(fetchBankAccountTransactions(selectedBankAccount.id));
      // Reset to first page when changing accounts
      setCurrentPage(1);
    }
  }, [selectedBankAccount, dispatch]);

  // Sorting function
  const requestSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  // Sorting indicator component
  const SortIndicator = ({ column }) => {
    if (sortConfig.key !== column) {
      return <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />;
    }
    return sortConfig.direction === "asc" ? (
      <svg
        className="ml-1 h-4 w-4 text-blue-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 15l7-7 7 7"
        ></path>
      </svg>
    ) : (
      <svg
        className="ml-1 h-4 w-4 text-blue-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 9l-7 7-7-7"
        ></path>
      </svg>
    );
  };

  // Process transactions with memoization for better performance
  const displayedTransactions = useMemo(() => {
    // Use the correct source of transactions based on selection
    let dataSource = selectedBankAccount ? transactions : allTransactions;

    if (!dataSource) return [];

    // Clone the array to avoid mutating the original
    let filtered = [...dataSource];

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((transaction) => {
        const account = accounts.find(
          (a) => a.id === transaction.bankAccountId
        );

        return (
          transaction.id?.toString().includes(searchQuery) ||
          (account?.accountNumber || "").includes(searchQuery) ||
          (account?.bankName || "").toLowerCase().includes(lowercaseQuery) ||
          (account?.accountHolderName || "")
            .toLowerCase()
            .includes(lowercaseQuery)
        );
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.transactionType === statusFilter
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        // Handle amount sorting
        if (sortConfig.key === "amount") {
          return sortConfig.direction === "asc"
            ? a.amount - b.amount
            : b.amount - a.amount;
        }

        // Handle date sorting
        if (sortConfig.key === "transactionDate") {
          const dateA = new Date(a.transactionDate);
          const dateB = new Date(b.transactionDate);
          return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
        }

        // Handle bank account related fields
        if (
          ["accountNumber", "bankName", "accountHolderName"].includes(
            sortConfig.key
          )
        ) {
          const accountA = accounts.find((acc) => acc.id === a.bankAccountId);
          const accountB = accounts.find((acc) => acc.id === b.bankAccountId);

          if (!accountA || !accountB) return 0;

          const valueA = accountA[sortConfig.key] || "";
          const valueB = accountB[sortConfig.key] || "";

          return sortConfig.direction === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }

        // Handle transaction type
        if (sortConfig.key === "transactionType") {
          return sortConfig.direction === "asc"
            ? a.transactionType.localeCompare(b.transactionType)
            : b.transactionType.localeCompare(a.transactionType);
        }

        // Default string comparison for other fields
        const valueA = a[sortConfig.key] || "";
        const valueB = b[sortConfig.key] || "";

        if (typeof valueA === "string" && typeof valueB === "string") {
          return sortConfig.direction === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }

        return 0;
      });
    }

    return filtered;
  }, [
    selectedBankAccount,
    transactions,
    allTransactions,
    searchQuery,
    statusFilter,
    accounts,
    sortConfig,
  ]);

  // Reset page if we have fewer items than current page allows
  useEffect(() => {
    const maxPage = Math.ceil(displayedTransactions.length / itemsPerPage);
    if (currentPage > maxPage && maxPage > 0) {
      setCurrentPage(maxPage);
    }
  }, [displayedTransactions.length, currentPage, itemsPerPage]);

  const handleBankAccountChange = (event) => {
    const accountId = parseInt(event.target.value); // Convert string to number

    // If empty, clear selection and fetch all transactions
    if (!accountId) {
      setSelectedBankAccount(null);
      dispatch(fetchAllTransactions());
      return;
    }

    // Find the account object by id
    const account = accounts.find((a) => a.id === accountId);

    if (account) {
      setSelectedBankAccount(account);
    }
  };

  // Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayedTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Function to format date and time on separate lines
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const formattedTime = date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    return (
      <div>
        <div>{formattedDate}</div>
        <div className="text-xs text-gray-500">{formattedTime}</div>
      </div>
    );
  };

  // Handle checkbox selection for all transactions
  const handleSelectAllToggle = (checked) => {
    if (checked) {
      setSelectedTransactions(
        currentItems.map((transaction) => transaction.id)
      );
    } else {
      setSelectedTransactions([]);
    }
  };

  // Handle checkbox selection for a single transaction
  const handleSingleTransactionSelect = (transactionId) => {
    setSelectedTransactions((prev) =>
      prev.includes(transactionId)
        ? prev.filter((id) => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  // Handle delete for selected transactions
  const handleDeleteSelectedTransactions = async () => {
    try {
      // Delete each selected transaction
      for (const transactionId of selectedTransactions) {
        await dispatch(removeTransaction(transactionId)).unwrap();
      }

      setSuccessMessage(
        `${selectedTransactions.length} transaction(s) deleted successfully!`
      );
      setSuccessModalOpen(true);
      setSelectedTransactions([]); // Clear selection after deletion
      setIsDeleteModalOpen(false);

      // Refresh transactions list based on current view
      if (selectedBankAccount) {
        dispatch(fetchBankAccountTransactions(selectedBankAccount.id));
      } else {
        dispatch(fetchAllTransactions());
      }
    } catch (error) {
      console.error("Failed to delete transactions:", error);
    }
  };

  // Handle single transaction delete
  const handleDeleteTransaction = async (transactionId) => {
    try {
      setSelectedTransaction(transactionId);
      setIsDeleteModalOpen(true);
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  // Handle view transaction details
  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);

    // Find the related bank account
    const bankAccount = accounts.find(
      (account) => account.id === transaction.bankAccountId
    );

    setSelectedBankAccountForView(bankAccount);
    setIsViewModalOpen(true);
  };

  // Export table data in different formats
  const exportData = (format) => {
    const fileName = `transactions_${new Date().toISOString().split("T")[0]}`;

    const tableColumns = [
      "Account No.",
      "Holder Name",
      "Bank Name",
      "Amount",
      "Type",
      "Date & Time",
      "Description",
    ];

    const tableRows = displayedTransactions.map((transaction) => {
      const account = accounts.find((a) => a.id === transaction.bankAccountId);
      return [
        account?.accountNumber || "N/A",
        account?.accountHolderName || "N/A",
        account?.bankName || "N/A",
        `₹${transaction.amount.toLocaleString()}`,
        transaction.transactionType,
        new Date(transaction.transactionDate).toLocaleString(),
        transaction.description,
      ];
    });

    try {
      switch (format) {
        case "csv": {
          const csv = Papa.unparse({
            fields: tableColumns,
            data: tableRows,
          });
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `${fileName}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          break;
        }
        case "excel": {
          const ws = XLSX.utils.aoa_to_sheet([tableColumns, ...tableRows]);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Transactions");
          XLSX.writeFile(wb, `${fileName}.xlsx`);
          break;
        }
        case "pdf": {
          const doc = new jsPDF();
          doc.setFontSize(20);

          const pageWidth = doc.internal.pageSize.getWidth();
          doc.text("Transactions Report", pageWidth / 2, 10, {
            align: "center",
          });

          doc.autoTable({
            head: [tableColumns],
            body: tableRows,
            startY: 20,
            theme: "grid",
            styles: {
              fontSize: 8,
              cellPadding: 2,
              overflow: "linebreak",
              font: "helvetica",
            },
            columnStyles: {
              0: { cellWidth: 20 }, // Account No.
              1: { cellWidth: 25 }, // Holder Name
              2: { cellWidth: 25 }, // Bank Name
              3: { cellWidth: 15 }, // Amount
              4: { cellWidth: 15 }, // Type
              5: { cellWidth: 25 }, // Date & Time
              6: { cellWidth: 40 }, // Description
            },
          });

          doc.save(`${fileName}.pdf`);
          break;
        }
      }
    } catch (error) {
      console.error(`Export failed: ${error}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-sm"
    >
      <h1 className="text-xl font-bold text-gray-800 mb-6">
        Bank Transaction List
      </h1>

      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex flex-wrap gap-4">
          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by ID, Account, Bank..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-sm"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Status dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 w-36 text-sm"
            >
              <option value="all">All Status</option>
              <option value="CREDIT">CREDIT</option>
              <option value="DEBIT">DEBIT</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>

          <div className="relative">
            <select
              value={selectedBankAccount ? selectedBankAccount.id : ""}
              onChange={handleBankAccountChange}
              className="appearance-none px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 w-48 text-sm"
            >
              <option value="">All Bank Accounts</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.accountHolderName} - {account.bankName}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          Showing {displayedTransactions.length > 0 ? indexOfFirstItem + 1 : 0}{" "}
          to {Math.min(indexOfLastItem, displayedTransactions.length)} of{" "}
          {displayedTransactions.length} entries
          {selectedBankAccount && (
            <span> for {selectedBankAccount.accountHolderName}'s account</span>
          )}
        </div>

        <div className="flex gap-4">
          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-1 text-sm"
              >
                <Download className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg">
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
        </div>
      </div>

      {/* Selected Transactions Section */}
      {selectedTransactions.length > 0 && (
        <div className="bg-blue-50 p-4 mb-4 rounded-lg flex justify-between items-center">
          <span className="text-blue-800">
            {selectedTransactions.length} transaction(s) selected
          </span>
          <Button
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700"
          >
            <Trash className="w-4 h-4 text-white" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Loading State */}
      {status === "loading" && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {/* Error State */}
      {status === "failed" && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          Error loading transactions: {error}
        </div>
      )}

      {/* Empty State */}
      {status !== "loading" && currentItems.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-gray-500">
            No transactions found for the selected filters
          </p>
        </div>
      )}

      {/* Transactions table */}
      {status !== "loading" && currentItems.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-[50px] py-3 px-4">
                  <Checkbox
                    checked={
                      currentItems.length > 0 &&
                      selectedTransactions.length === currentItems.length
                    }
                    onCheckedChange={handleSelectAllToggle}
                  />
                </th>
                <th
                  className="p-3 text-left font-medium text-gray-500  border-b border-gray-200 cursor-pointer"
                  onClick={() => requestSort("accountNumber")}
                >
                  <div className="flex items-center">
                    Account No.
                    <SortIndicator column="accountNumber" />
                  </div>
                </th>
                <th
                  className="p-3 text-left font-medium text-gray-500  border-b border-gray-200 cursor-pointer"
                  onClick={() => requestSort("accountHolderName")}
                >
                  <div className="flex items-center">
                    Holder Name
                    <SortIndicator column="accountHolderName" />
                  </div>
                </th>
                <th
                  className="p-3 text-left font-medium text-gray-500  border-b border-gray-200 cursor-pointer"
                  onClick={() => requestSort("bankName")}
                >
                  <div className="flex items-center">
                    Bank Name
                    <SortIndicator column="bankName" />
                  </div>
                </th>
                <th
                  className="p-3 text-left font-medium text-gray-500  border-b border-gray-200 cursor-pointer"
                  onClick={() => requestSort("amount")}
                >
                  <div className="flex items-center">
                    Amount
                    <SortIndicator column="amount" />
                  </div>
                </th>
                <th
                  className="p-3 text-left font-medium text-gray-500  border-b border-gray-200 cursor-pointer"
                  onClick={() => requestSort("transactionType")}
                >
                  <div className="flex items-center">
                    Type
                    <SortIndicator column="transactionType" />
                  </div>
                </th>
                <th
                  className="p-3 text-left font-medium text-gray-500  border-b border-gray-200 cursor-pointer"
                  onClick={() => requestSort("transactionDate")}
                >
                  <div className="flex items-center">
                    Date & Time
                    <SortIndicator column="transactionDate" />
                  </div>
                </th>
                <th className="p-3 text-left font-medium text-gray-500  border-b border-gray-200">
                  Description
                </th>
                <th className="p-3 text-left font-medium text-gray-500  border-b border-gray-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((transaction) => {
                const account = accounts.find(
                  (a) => a.id === transaction.bankAccountId
                );
                return (
                  <tr
                    key={transaction.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="w-[50px] py-3 px-4">
                      <Checkbox
                        checked={selectedTransactions.includes(transaction.id)}
                        onCheckedChange={() =>
                          handleSingleTransactionSelect(transaction.id)
                        }
                      />
                    </td>
                    <td className="p-3">{account?.accountNumber || "N/A"}</td>
                    <td className="p-3">
                      {account?.accountHolderName || "N/A"}
                    </td>
                    <td className="p-3">{account?.bankName || "N/A"}</td>
                    <td className="p-3 font-medium">
                      ₹{transaction.amount.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
                          transaction.transactionType === "CREDIT"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {transaction.transactionType}
                      </span>
                    </td>
                    <td className="p-3 text-[12px]">
                      {formatDateTime(transaction.transactionDate)}
                    </td>
                    <td className="p-3 text-[12px] whitespace-normal break-words max-h-10 overflow-hidden">
                      {transaction.description}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleViewTransaction(transaction)}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={() =>
                            handleDeleteTransaction(transaction.id)
                          }
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        totalItems={displayedTransactions.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* Delete Modal */}
      <DeleteModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={
          selectedTransactions.length > 1
            ? handleDeleteSelectedTransactions
            : async () => {
                try {
                  await dispatch(
                    removeTransaction(selectedTransaction)
                  ).unwrap();
                  setSuccessMessage("Transaction deleted successfully!");
                  setSuccessModalOpen(true);
                  setIsDeleteModalOpen(false);

                  // Refresh transactions
                  if (selectedBankAccount) {
                    dispatch(
                      fetchBankAccountTransactions(selectedBankAccount.id)
                    );
                  } else {
                    dispatch(fetchAllTransactions());
                  }
                } catch (error) {
                  console.error("Failed to delete transaction:", error);
                }
              }
        }
        message={
          selectedTransactions.length > 1
            ? "Are you sure you want to delete the selected transactions?"
            : "Are you sure you want to delete this transaction?"
        }
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModalOpen}
        message={successMessage}
        onClose={() => setSuccessModalOpen(false)}
      />

      {/* View Transaction Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="bg-white max-w-4xl">
          <ViewBankTransactions
            transaction={selectedTransaction}
            bankAccount={selectedBankAccountForView}
            onClose={() => setIsViewModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default BankTransactions;
