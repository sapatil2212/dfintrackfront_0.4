"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AddBankAccountModal = ({ isOpen, onClose, onSubmit, bankAccount }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  // For handling select field which can't directly use register
  const accountType = watch(
    "accountType",
    bankAccount?.accountType || "SAVINGS"
  );

  useEffect(() => {
    if (bankAccount) {
      reset({
        accountHolderName: bankAccount.accountHolderName,
        accountType: bankAccount.accountType,
        accountNumber: bankAccount.accountNumber,
        bankName: bankAccount.bankName,
        branch: bankAccount.branch,
        description: bankAccount.description,
        initialBalance: bankAccount.initialBalance,
      });
    } else {
      reset({
        accountHolderName: "",
        accountType: "SAVINGS",
        accountNumber: "",
        bankName: "",
        branch: "",
        description: "",
        initialBalance: "",
      });
    }
  }, [bankAccount, reset, isOpen]);

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit({
        ...data,
        id: bankAccount?.id,
      });
      onClose();
    } catch (error) {
      console.error("Error saving bank account:", error);
    }
  };

  const handleSelectChange = (value) => {
    setValue("accountType", value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle>
            {bankAccount ? "Edit Bank Account" : "Add New Bank Account"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Grid Layout for Fields */}
          <div className="grid grid-cols-2 gap-4">
            {/* Account Holder Name */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">
                Account Holder Name
              </Label>
              <Input
                {...register("accountHolderName", {
                  required: "Account holder name is required",
                })}
                placeholder="Account Holder Name"
                className="mt-1 bg-white border-gray-200 focus:border-blue-500 text-xs h-8 w-full"
              />
              {errors.accountHolderName && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.accountHolderName.message}
                </p>
              )}
            </div>

            {/* Account Type */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Account Type</Label>
              <Select value={accountType} onValueChange={handleSelectChange}>
                <SelectTrigger className="mt-1 bg-white border-gray-200 focus:border-blue-500 text-xs h-8 w-full">
                  <SelectValue placeholder="Select Account Type" />
                </SelectTrigger>
                <SelectContent className=" bg-white">
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                  <SelectItem value="CURRENT">Current</SelectItem>
                  <SelectItem value="BUSINESS">Business</SelectItem>
                  <SelectItem value="PERSONAL">Personal</SelectItem>
                </SelectContent>
              </Select>
              {errors.accountType && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.accountType.message}
                </p>
              )}
            </div>

            {/* Account Number */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Account Number</Label>
              <Input
                {...register("accountNumber", {
                  required: "Account number is required",
                })}
                placeholder="Account Number"
                className="mt-1 bg-white border-gray-200 focus:border-blue-500 text-xs h-8 w-full"
              />
              {errors.accountNumber && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.accountNumber.message}
                </p>
              )}
            </div>

            {/* Bank Name */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Bank Name</Label>
              <Input
                {...register("bankName", {
                  required: "Bank name is required",
                })}
                placeholder="Bank Name"
                className="mt-1 bg-white border-gray-200 focus:border-blue-500 text-xs h-8 w-full"
              />
              {errors.bankName && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.bankName.message}
                </p>
              )}
            </div>

            {/* Branch */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Branch</Label>
              <Input
                {...register("branch", {
                  required: "Branch is required",
                })}
                placeholder="Branch"
                className="mt-1 bg-white border-gray-200 focus:border-blue-500 text-xs h-8 w-full"
              />
              {errors.branch && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.branch.message}
                </p>
              )}
            </div>

            {/* Initial Balance */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">
                Initial Balance (₹)
              </Label>
              <Input
                type="number"
                {...register("initialBalance", {
                  required: "Initial balance is required",
                })}
                placeholder="Initial Balance"
                className="mt-1 bg-white border-gray-200 focus:border-blue-500 text-xs h-8 w-full"
              />
              {errors.initialBalance && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.initialBalance.message}
                </p>
              )}
            </div>

            {/* Description (Full Width) */}
            <div className="space-y-1 col-span-2">
              <Label className="text-xs text-gray-600">Description</Label>
              <Input
                {...register("description", {
                  required: "Description is required",
                })}
                placeholder="Description"
                className="mt-1 bg-white border-gray-200 focus:border-blue-500 text-xs h-8 w-full"
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-8 text-xs px-3 py-1 rounded-md border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-8 text-xs px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              {bankAccount ? "Update" : "Add Account"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBankAccountModal;
