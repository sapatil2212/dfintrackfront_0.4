"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";

const UpdateExpense = ({
  expense,
  onClose,
  onSubmit,
  properties = [],
  bankAccounts = [],
}) => {
  const [formData, setFormData] = useState({
    propertyId: expense?.propertyId || "",
    expenseType: expense?.expenseType || "",
    customExpenseType: expense?.customExpenseType || "",
    genericExpenses: expense?.genericExpenses || "",
    customGenericExpenses: expense?.customGenericExpenses || "",
    bankAccountId: expense?.bankAccountId || "",
    amount: expense?.amount || "",
    description: expense?.description || "",
  });

  const [errors, setErrors] = useState({
    propertyId: "",
    expenseType: "",
    genericExpenses: "",
    bankAccountId: "",
    amount: "",
    description: "",
    insufficientBalance: "",
  });

  const expenseTypes = [
    "Rent",
    "Lightbill",
    "Gas",
    "Wifi",
    "TV/Cable Recharge",
    "Grocery",
    "Repair/Maintenance",
    "Other",
  ];

  const genericExpenses = ["TDS", "GST", "Other"];

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });

    if (name === "bankAccountId" || name === "amount") {
      setErrors((prev) => ({ ...prev, insufficientBalance: "" }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!formData.propertyId) {
      newErrors.propertyId = "Property is required";
      isValid = false;
    }

    if (!formData.expenseType) {
      newErrors.expenseType = "Expense Type is required";
      isValid = false;
    }

    if (!formData.genericExpenses) {
      newErrors.genericExpenses = "Generic Expense is required";
      isValid = false;
    }

    if (!formData.bankAccountId) {
      newErrors.bankAccountId = "Bank Account is required";
      isValid = false;
    }

    if (!formData.amount) {
      newErrors.amount = "Amount is required";
      isValid = false;
    }

    if (!formData.description) {
      newErrors.description = "Description is required";
      isValid = false;
    }

    // Check for insufficient balance
    if (formData.bankAccountId && formData.amount) {
      const selectedAccount = bankAccounts.find(
        (account) => account.id === formData.bankAccountId
      );
      if (
        selectedAccount &&
        parseFloat(formData.amount) > selectedAccount.balance
      ) {
        newErrors.insufficientBalance =
          "Insufficient balance in the selected account";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const payload = {
        ...formData,
        expenseType:
          formData.expenseType === "Other"
            ? formData.customExpenseType
            : formData.expenseType,
        genericExpenses:
          formData.genericExpenses === "Other"
            ? formData.customGenericExpenses
            : formData.genericExpenses,
      };
      onSubmit(payload);
    }
  };
  useEffect(() => {
    if (expense) {
      setFormData({
        propertyId: expense.propertyId || "",
        expenseType: expense.expenseType || "",
        customExpenseType: expense.customExpenseType || "",
        genericExpenses: expense.genericExpenses || "",
        customGenericExpenses: expense.customGenericExpenses || "",
        bankAccountId: expense.bankAccountId || "",
        amount: expense.amount || "",
        description: expense.description || "",
      });
    }
  }, [expense]);
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <Card className="bg-white w-full max-w-md rounded-lg shadow-lg">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Update Expense</h2>
            <button
              className="text-gray-600 hover:text-gray-900"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Select Property */}
            <div>
              <Label className="text-xs text-gray-600">Select Property</Label>
              <Select
                value={formData.propertyId}
                onValueChange={(value) => handleChange("propertyId", value)}
              >
                <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 text-xs h-8">
                  <SelectValue placeholder="Select Property" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 text-xs">
                  {properties.map((property) => (
                    <SelectItem
                      key={property.id}
                      value={property.id}
                      className="hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 text-xs"
                    >
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.propertyId && (
                <p className="text-xs text-red-500 mt-1">{errors.propertyId}</p>
              )}
            </div>

            {/* Expense Type */}
            <div>
              <Label className="text-xs text-gray-600">Expense Type</Label>
              <Select
                value={formData.expenseType}
                onValueChange={(value) => handleChange("expenseType", value)}
              >
                <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 text-xs h-8">
                  <SelectValue placeholder="Select Expense Type" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 text-xs">
                  {expenseTypes.map((type) => (
                    <SelectItem
                      key={type}
                      value={type}
                      className="hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 text-xs"
                    >
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.expenseType === "Other" && (
                <Input
                  type="text"
                  value={formData.customExpenseType}
                  onChange={(e) =>
                    handleChange("customExpenseType", e.target.value)
                  }
                  placeholder="Enter custom expense type"
                  className="mt-1 bg-white border-gray-200 focus:border-blue-500 text-xs h-8"
                />
              )}
              {errors.expenseType && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.expenseType}
                </p>
              )}
            </div>

            {/* Generic Expense */}
            <div>
              <Label className="text-xs text-gray-600">Generic Expense</Label>
              <Select
                value={formData.genericExpenses}
                onValueChange={(value) =>
                  handleChange("genericExpenses", value)
                }
              >
                <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 text-xs h-8">
                  <SelectValue placeholder="Select Generic Expense" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 text-xs">
                  {genericExpenses.map((expense) => (
                    <SelectItem
                      key={expense}
                      value={expense}
                      className="hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 text-xs"
                    >
                      {expense}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.genericExpenses === "Other" && (
                <Input
                  type="text"
                  value={formData.customGenericExpenses}
                  onChange={(e) =>
                    handleChange("customGenericExpenses", e.target.value)
                  }
                  placeholder="Enter custom generic expense"
                  className="mt-1 bg-white border-gray-200 focus:border-blue-500 text-xs h-8"
                />
              )}
              {errors.genericExpenses && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.genericExpenses}
                </p>
              )}
            </div>

            {/* Deduct from Account */}
            <div>
              <Label className="text-xs text-gray-600">
                Deduct from Account
              </Label>
              <Select
                value={formData.bankAccountId}
                onValueChange={(value) => handleChange("bankAccountId", value)}
              >
                <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 text-xs h-8">
                  <SelectValue placeholder="Select Bank Account" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 text-xs">
                  {bankAccounts.map((account) => (
                    <SelectItem
                      key={account.id}
                      value={account.id}
                      className="hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 text-xs"
                    >
                      {account.accountHolderName} - ₹{" "}
                      {account.balance?.toLocaleString("en-IN")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bankAccountId && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.bankAccountId}
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <Label className="text-xs text-gray-600">Amount (₹)</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                className="bg-white border-gray-200 focus:border-blue-500 text-xs h-8"
              />
              {errors.amount && (
                <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
              )}
              {errors.insufficientBalance && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.insufficientBalance}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label className="text-xs text-gray-600">Description</Label>
              <Input
                type="text"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="bg-white border-gray-200 focus:border-blue-500 text-xs h-8"
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-4 text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-4 text-xs h-8"
            >
              Update Expense
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateExpense;
