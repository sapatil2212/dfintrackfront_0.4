import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  updateCustomer,
  createCustomer,
} from "../../../slices/customerMasterSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EditCustomerForm = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const selectedCustomer = useSelector(
    (state) => state.customers.selectedCustomer
  );

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (selectedCustomer) {
      reset(selectedCustomer);
    } else {
      reset({
        companyName: "",
        companyEmail: "",
        contactPersonName: "",
        companyContactNumber: "",
        companyAlternateContactNumber: "",
        companyAddress: "",
        gstNumber: "",
      });
    }
  }, [selectedCustomer, reset]);

  const handleFormSubmit = async (data) => {
    try {
      if (selectedCustomer) {
        await dispatch(
          updateCustomer({ id: selectedCustomer.id, customerData: data })
        ).unwrap();
      } else {
        await dispatch(createCustomer(data)).unwrap();
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving customer:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>
            {selectedCustomer ? "Edit Customer" : "Add New Customer"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <Input
              {...register("companyName")}
              placeholder="Company Name"
              className="w-full"
            />
            <Input
              {...register("companyEmail")}
              placeholder="Company Email"
              type="email"
              className="w-full"
            />
            <Input
              {...register("contactPersonName")}
              placeholder="Contact Person Name"
              className="w-full"
            />
            <Input
              {...register("companyContactNumber")}
              placeholder="Contact Number"
              className="w-full"
            />
            <Input
              {...register("companyAlternateContactNumber")}
              placeholder="Alternate Contact Number"
              className="w-full"
            />
            <Input
              {...register("companyAddress")}
              placeholder="Company Address"
              className="w-full"
            />
            <Input
              {...register("gstNumber")}
              placeholder="GST Number"
              className="w-full"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCustomerForm;
