"use client";

import React from "react";
import { useSelector } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Pencil, X } from "lucide-react";

const ViewCustomerDetails = ({ isOpen, onClose, onEditClick }) => {
  const customer = useSelector((state) => state.customers.selectedCustomer);

  if (!isOpen || !customer) return null;

  const fields = [
    { label: "Company Name", value: customer.companyName || "N/A" },
    { label: "Company Email", value: customer.companyEmail || "N/A" },
    { label: "Contact Person", value: customer.contactPersonName || "N/A" },
    { label: "Contact Number", value: customer.companyContactNumber || "N/A" },
    {
      label: "Alternate Contact",
      value: customer.companyAlternateContactNumber || "N/A",
    },

    { label: "GST Number", value: customer.gstNumber || "N/A" },
    { label: "Company Address", value: customer.companyAddress || "N/A" },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <Card className="bg-white w-full max-w-xl rounded-lg shadow-lg p-2">
        {" "}
        {/* Reduced width to max-w-xl */}
        <CardContent className="p-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Customer Details</h2>
            <button
              className="text-gray-600 hover:text-gray-900"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            {" "}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {" "}
              {fields.map((field, index) => (
                <div key={index} className="space-y-1">
                  <Label className="text-xs text-gray-600">{field.label}</Label>
                  <p className="text-sm font-medium">{field.value}</p>
                </div>
              ))}
            </div>
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
              onClick={onEditClick}
              className="bg-blue-600 hover:bg-blue-800 text-white px-4 text-xs h-8 flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewCustomerDetails;
