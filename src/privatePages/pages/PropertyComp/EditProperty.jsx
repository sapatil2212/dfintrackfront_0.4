"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const EditProperty = ({ isOpen, onClose, onSubmit, property }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
  });

  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || "",
        address: property.address || "",
        description: property.description || "",
      });
    } else {
      setFormData({
        name: "",
        address: "",
        description: "",
      });
    }
  }, [property, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: property?.id,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-white p-6 sm:p-6">
        <DialogHeader>
          <DialogTitle>
            {property ? "Edit Property" : "Add New Property"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Property Name */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Property Name</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Property Name"
                className="mt-1 bg-white border-gray-200 focus:border-blue-500 text-xs h-8 w-full"
                autoFocus={false}
                required
              />
            </div>

            {/* Address */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Address</Label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Property Address"
                className="mt-1 bg-white border-gray-200 focus:border-blue-500 text-xs h-8 w-full"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Description</Label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Property Description"
                className="mt-1 bg-white border-gray-200 focus:border-blue-500 text-xs min-h-[80px] w-full resize-none"
              />
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
              {property ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProperty;
