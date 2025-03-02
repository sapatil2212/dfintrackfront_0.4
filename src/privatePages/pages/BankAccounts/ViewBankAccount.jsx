import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const ViewBankAccount = ({ isOpen, onClose, onEditClick, account }) => {
  if (!isOpen || !account) return null;

  const fields = [
    { label: "Account ID", value: account.id },
    { label: "Account Holder Name", value: account.accountHolderName },
    {
      label: "Balance",
      value: account.balance
        ? `₹ ${parseFloat(account.balance).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        : "₹ 0.00",
    },
    {
      label: "Account Type",
      value: account.accountType && account.accountType.replace("_", " "),
    },
    { label: "Bank Account Number", value: account.accountNumber },
    { label: "Bank Name", value: account.bankName },
    { label: "Branch", value: account.branch },
    { label: "Description", value: account.description },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] bg-white">
        <DialogHeader>
          <DialogTitle>Bank Account Details</DialogTitle>
        </DialogHeader>

        <Card className="bg-white shadow-sm border border-gray-100">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Grid Layout for Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Column 1 */}
                <div className="space-y-2">
                  {fields.slice(0, 3).map((field) => (
                    <div key={field.label}>
                      <Label className="text-xs text-gray-600">
                        {field.label}
                      </Label>
                      <div className="mt-1 text-sm">{field.value || "N/A"}</div>
                    </div>
                  ))}
                </div>

                {/* Column 2 */}
                <div className="space-y-2">
                  {fields.slice(3, 6).map((field) => (
                    <div key={field.label}>
                      <Label className="text-xs text-gray-600">
                        {field.label}
                      </Label>
                      <div className="mt-1 text-sm">{field.value || "N/A"}</div>
                    </div>
                  ))}
                </div>

                {/* Column 3 */}
                <div className="space-y-2">
                  {fields.slice(6).map((field) => (
                    <div key={field.label}>
                      <Label className="text-xs text-gray-600">
                        {field.label}
                      </Label>
                      <div className="mt-1 text-sm">{field.value || "N/A"}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Close and Edit Buttons */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button onClick={() => onEditClick(account)}>Edit</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default ViewBankAccount;
