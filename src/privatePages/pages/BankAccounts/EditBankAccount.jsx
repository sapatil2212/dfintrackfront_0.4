import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

const EditBankAccount = ({ isOpen, onClose, onSubmit, account }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();
  const selectRef = useRef(null);

  useEffect(() => {
    if (account) {
      reset({
        accountHolderName: account.accountHolderName,
        accountType: account.accountType,
        accountNumber: account.accountNumber,
        bankName: account.bankName,
        branch: account.branch,
        description: account.description,
        initialBalance: account.initialBalance,
      });
    } else {
      reset({
        accountHolderName: "",
        accountType: "",
        accountNumber: "",
        bankName: "",
        branch: "",
        description: "",
        initialBalance: 0,
      });
    }

    // Remove focus and setTimeout logic completely
  }, [account, reset, isOpen]);

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit({
        ...data,
        initialBalance: parseFloat(data.initialBalance),
        id: account?.id,
      });
      onClose();
    } catch (error) {
      console.error("Error saving bank account:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle>
            {account ? "Edit Bank Account" : "Add New Bank Account"}
          </DialogTitle>
        </DialogHeader>

        {/* Grid Layout for Fields */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Account Holder Name */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">
                Account Holder Name
              </Label>
              <Input
                {...register("accountHolderName", {
                  required: "This field is required",
                })}
                placeholder="Account Holder Name"
                className="mt-1 bg-white border-gray-200 focus:border-blue-500 text-xs h-8 w-full"
                autoFocus={false}
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
              <Select
                onValueChange={(value) => setValue("accountType", value)}
                defaultValue={account?.accountType}
              >
                <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 mt-1 text-xs h-8 w-full">
                  <SelectValue placeholder="Select Account Type" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 text-xs">
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
                  required: "This field is required",
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
                  required: "This field is required",
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
                {...register("branch", { required: "This field is required" })}
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
              <Label className="text-xs text-gray-600">Initial Balance</Label>
              <Input
                {...register("initialBalance", {
                  required: "This field is required",
                  min: { value: 0, message: "Balance must be positive" },
                })}
                type="number"
                step="0.01"
                placeholder="Initial Balance"
                className="mt-1 bg-white border-gray-200 focus:border-blue-500 text-xs h-8 w-full"
              />
              {errors.initialBalance && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.initialBalance.message}
                </p>
              )}
            </div>
          </div>

          {/* Description (Full Width) */}
          <div className="space-y-1">
            <Label className="text-xs text-gray-600">Description</Label>
            <Input
              {...register("description")}
              placeholder="Description"
              className="mt-1 bg-white border-gray-200 focus:border-blue-500 text-xs h-8 w-full"
            />
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
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBankAccount;
