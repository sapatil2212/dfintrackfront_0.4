import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

// Enhanced GST validation with proper format checking
const gstNumberValidation = (value) => {
  const gstRegex =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[A-Z0-9]{1}[A-Z]{1}[0-9A-Z]{1}$/;

  if (!value) return false;

  if (!gstRegex.test(value)) return false;

  // Validate state code (first two digits)
  const stateCode = parseInt(value.substring(0, 2));
  if (stateCode < 1 || stateCode > 37) return false;

  return true;
};

const validationSchema = Yup.object().shape({
  companyName: Yup.string()
    .required("Company Name is required")
    .min(2, "Company Name must be at least 2 characters")
    .max(100, "Company Name must not exceed 100 characters"),

  companyEmail: Yup.string()
    .required("Company Email is required")
    .email("Please enter a valid email address")
    .max(100, "Email must not exceed 100 characters"),

  contactPersonName: Yup.string()
    .required("Contact Person Name is required")
    .min(2, "Contact Person Name must be at least 2 characters")
    .max(100, "Contact Person Name must not exceed 100 characters"),

  companyContactNumber: Yup.string()
    .required("Contact Number is required")
    .matches(/^\d{10}$/, "Contact number must be exactly 10 digits"),

  companyAlternateContactNumber: Yup.string()
    .nullable()
    .matches(
      /^\d{10}$|^$/,
      "Alternate contact number must be 10 digits if provided"
    ),

  companyAddress: Yup.string()
    .required("Company Address is required")
    .max(255, "Address must not exceed 255 characters"),

  gstNumber: Yup.string()
    .required("GST Number is required")
    .test(
      "gst-valid",
      "Invalid GST Number format. Must be like: 22AAAAA0000A1Z5",
      gstNumberValidation
    ),
});

const CustomerMasterForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isViewMode: initialViewMode,
}) => {
  const [isViewMode, setIsViewMode] = useState(initialViewMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: initialData || {
      companyName: "",
      companyEmail: "",
      contactPersonName: "",
      companyContactNumber: "",
      companyAlternateContactNumber: "",
      companyAddress: "",
      gstNumber: "",
    },
    resolver: yupResolver(validationSchema),
  });

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      if (error.response?.status === 409) {
        setError("companyEmail", {
          type: "manual",
          message: "This email is already registered",
        });
      } else if (error.response?.data?.message?.includes("GST")) {
        setError("gstNumber", {
          type: "manual",
          message: error.response.data.message,
        });
      } else {
        setServerError(
          error.response?.data?.message ||
            "An error occurred while saving. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>
            {isViewMode
              ? "Customer Details"
              : initialData
              ? "Edit Customer"
              : "Add New Customer"}
          </DialogTitle>
        </DialogHeader>

        {serverError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Input
                {...register("companyName")}
                placeholder="Company Name"
                className={`w-full ${
                  errors.companyName ? "border-red-500" : ""
                }`}
                disabled={isSubmitting || isViewMode}
              />
              {errors.companyName && (
                <p className="text-red-500 text-sm">
                  {errors.companyName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Input
                {...register("companyEmail")}
                placeholder="Company Email"
                type="email"
                className={`w-full ${
                  errors.companyEmail ? "border-red-500" : ""
                }`}
                disabled={isSubmitting || isViewMode}
              />
              {errors.companyEmail && (
                <p className="text-red-500 text-sm">
                  {errors.companyEmail.message}
                </p>
              )}
            </div>

            {/* Other fields follow the same pattern... */}

            <div className="space-y-2">
              <Input
                {...register("gstNumber")}
                placeholder="GST Number (e.g., 22AAAAA0000A1Z5)"
                className={`w-full ${errors.gstNumber ? "border-red-500" : ""}`}
                disabled={isSubmitting || isViewMode}
              />
              {errors.gstNumber && (
                <p className="text-red-500 text-sm">
                  {errors.gstNumber.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            {isViewMode ? (
              <>
                <Button type="button" variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button type="button" onClick={() => setIsViewMode(false)}>
                  Edit
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerMasterForm;
