"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Pencil, X } from "lucide-react";

const ViewExpense = ({ expense, onEdit, onClose }) => {
  if (!expense) return null;

  // Format date string to a readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const fields = [
    { label: "Property", value: expense.propertyName || "N/A" },
    { label: "Expense Type", value: expense.expenseType || "N/A" },
    { label: "Generic Expense", value: expense.genericExpenses || "N/A" },
    { label: "Bank Account", value: expense.bankAccountName || "N/A" },
    {
      label: "Amount (₹)",
      value: expense.amount
        ? `₹${expense.amount.toLocaleString("en-IN")}`
        : "N/A",
    },
    { label: "Description", value: expense.description || "N/A" },
    { label: "Date", value: formatDate(expense.date) },
    { label: "Created By", value: expense.createdBy || "N/A" },
    { label: "Created At", value: formatDate(expense.createdAt) },
    { label: "Expense ID", value: expense.id ? `#${expense.id}` : "N/A" },
    { label: "Property ID", value: expense.propertyId || "N/A" },
    { label: "Bank Account ID", value: expense.bankAccountId || "N/A" },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <Card className="bg-white w-full max-w-4xl rounded-lg shadow-lg p-2  ">
        <CardContent className="p-6 ">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Expense Details</h2>
            <button
              className="text-gray-600 hover:text-gray-900"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Grid Layout for Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fields.map((field, index) => (
              <div key={index} className="space-y-1">
                <Label className="text-xs text-gray-600">{field.label}</Label>
                <p className="text-sm font-medium">{field.value}</p>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-4 text-xs h-8"
            >
              Close
            </Button>
            <Button
              onClick={onEdit}
              className="bg-blue-600 hover:bg-blue-800 text-white px-4 text-xs h-8 flex items-center gap-2"
            >
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewExpense;
