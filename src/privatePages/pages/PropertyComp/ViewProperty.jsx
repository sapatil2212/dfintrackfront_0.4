"use client";

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

const ViewProperty = ({ isOpen, onClose, onEdit, property }) => {
  if (!isOpen || !property) return null;

  const fields = [
    { label: "Property Name", value: property.name },
    { label: "Address", value: property.address },
    { label: "Description", value: property.description },
    // Add more fields as needed, for example:
    { label: "Property Type", value: property.propertyType },
    { label: "Size", value: property.size },
    { label: "Year Built", value: property.yearBuilt },
    { label: "Price", value: property.price },
    { label: "Status", value: property.status },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] bg-white">
        <DialogHeader>
          <DialogTitle>Property Details</DialogTitle>
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
                <Button onClick={() => onEdit(property)}>Edit</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default ViewProperty;
