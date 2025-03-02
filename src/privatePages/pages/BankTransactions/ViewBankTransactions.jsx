import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { format, parseISO } from "date-fns";

const ViewBankTransactions = ({ transaction, bankAccount, onClose }) => {
  // Handle the case where either transaction or bankAccount is not provided
  if (!transaction) {
    return (
      <Card className="bg-white  border border-gray-100">
        <CardContent className="p-4">
          <div className="text-center py-8">
            <p className="text-gray-500 text-xs">
              Transaction details not available
            </p>
            <button
              onClick={onClose}
              className="mt-4 bg-blue-600 text-white px-4 py-2 text-xs rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!bankAccount) {
    return (
      <Card className="bg-white border border-gray-100">
        <CardContent className="p-4">
          <div className="text-center py-8">
            <p className="text-gray-500 text-xs">
              Bank account details not available
            </p>
            <button
              onClick={onClose}
              className="mt-4 bg-blue-600 text-white px-4 py-2 text-xs rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Function to format date and time
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "Not specified";

    try {
      const dateTime = parseISO(dateTimeString);
      return format(dateTime, "MMM d, yyyy 'at' h:mm a");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date format";
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      // Get day as number
      const day = date.getDate();

      // Get month as uppercase abbreviated name
      const month = date
        .toLocaleString("en-US", { month: "short" })
        .toUpperCase();

      // Get full year
      const year = date.getFullYear();

      // Combine in desired format
      return `${day} ${month} ${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  // Function to get transaction type badge style
  const getTransactionTypeBadgeStyle = (type) => {
    switch (type?.toUpperCase()) {
      case "CREDIT":
        return "bg-green-50 text-green-700";
      case "DEBIT":
        return "bg-red-50 text-red-700";
      case "TRANSFER":
        return "bg-blue-50 text-blue-700";
      case "REFUND":
        return "bg-yellow-50 text-yellow-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  return (
    <Card className="bg-white  border border-gray-100">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Main content grid - side by side layout */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Transaction Details Section */}
            <div className="space-y-4">
              <h2 className="text-base font-medium text-gray-800">
                Transaction Details
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {/* Transaction ID */}
                <div>
                  <Label className="text-xs text-gray-600">
                    Transaction ID
                  </Label>
                  <div className="mt-1 text-xs font-medium">
                    {transaction.id}
                  </div>
                </div>

                {/* Transaction Type */}
                <div>
                  <Label className="text-xs text-gray-600">
                    Transaction Type
                  </Label>
                  <div className="mt-1 text-xs">
                    {transaction.transactionType}
                  </div>
                </div>

                {/* Transaction Date */}
                <div>
                  <Label className="text-xs text-gray-600">
                    Transaction Date
                  </Label>
                  <div className="mt-1 text-xs">
                    {formatDate(transaction.transactionDate)}
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <Label className="text-xs text-gray-600">Amount</Label>
                  <div className="mt-1 text-xs font-medium">
                    ₹{parseFloat(transaction.amount).toFixed(2)}
                  </div>
                </div>

                {/* Transaction Type (with badge) */}
                <div>
                  <Label className="text-xs text-gray-600">
                    Transaction Type
                  </Label>
                  <div className="mt-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTransactionTypeBadgeStyle(
                        transaction.transactionType
                      )}`}
                    >
                      {transaction.transactionType}
                    </span>
                  </div>
                </div>

                {/* Created At */}
                <div>
                  <Label className="text-xs text-gray-600">Created At</Label>
                  <div className="mt-1 text-xs">
                    {formatDateTime(transaction.createdAt)}
                  </div>
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <Label className="text-xs text-gray-600">Description</Label>
                  <div className="mt-1 text-xs">
                    {transaction.description || "No description provided"}
                  </div>
                </div>
              </div>
            </div>

            {/* Vertical Faint Line & Bank Account Details Section */}
            <div className="space-y-4 border-l border-gray-200 pl-4">
              <h2 className="text-base font-medium text-gray-800">
                Bank Account Details
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-600">
                    Account Holder Name
                  </Label>
                  <div className="mt-1 text-xs font-medium">
                    {bankAccount.accountHolderName}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-600">
                    Account Number
                  </Label>
                  <div className="mt-1 text-xs">
                    {bankAccount.accountNumber}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Bank Name</Label>
                  <div className="mt-1 text-xs">{bankAccount.bankName}</div>
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Branch</Label>
                  <div className="mt-1 text-xs">{bankAccount.branch}</div>
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Account Type</Label>
                  <div className="mt-1 text-xs">{bankAccount.accountType}</div>
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Balance</Label>
                  <div className="mt-1 text-xs font-medium">
                    ₹{parseFloat(bankAccount.balance).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-1.5 text-xs rounded hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ViewBankTransactions;
