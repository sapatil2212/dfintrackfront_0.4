"use client";

import { useEffect, useState } from "react";
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
import { useForm } from "react-hook-form";

const AddPropertyModal = ({ isOpen, onClose, onSubmit, property }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (property) {
      reset({
        name: property.name,
        address: property.address,
        description: property.description,
      });
    } else {
      reset({
        name: "",
        address: "",
        description: "",
      });
    }
  }, [property, reset, isOpen]);

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit({
        ...data,
        id: property?.id,
      });
      onClose();
    } catch (error) {
      console.error("Error saving property:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle>
            {property ? "Edit Property" : "Add New Property"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Grid Layout for Fields */}
          <div className="grid grid-cols-1 gap-4">
            {/* Property Name */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Property Name</Label>
              <Input
                {...register("name", {
                  required: "Property name is required",
                })}
                placeholder="Property Name"
                className="mt-1 bg-white border-gray-200 focus:border-blue-500 text-xs h-8 w-full"
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Address</Label>
              <Input
                {...register("address", {
                  required: "Address is required",
                })}
                placeholder="Address"
                className="mt-1 bg-white border-gray-200 focus:border-blue-500 text-xs h-8 w-full"
              />
              {errors.address && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* Description (Full Width) */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Description</Label>
              <Textarea
                {...register("description")}
                placeholder="Description"
                className="mt-1 bg-white border-gray-200 focus:border-blue-500 text-xs w-full resize-none min-h-24"
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
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPropertyModal;
