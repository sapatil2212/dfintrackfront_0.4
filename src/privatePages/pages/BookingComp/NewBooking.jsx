import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import Calendar from "../../../components/Calendar";
import { fetchProperties } from "../../../slices/propertySlice";
import { fetchCustomers } from "../../../slices/customerMasterSlice";
import { fetchBankAccounts } from "../../../slices/BankAccountSlice";

const NewBooking = ({ onSubmit }) => {
  const dispatch = useDispatch();
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isFoodGSTApplicable, setIsFoodGSTApplicable] = useState(false);

  const [stayGSTAmount, setStayGSTAmount] = useState(0);
  const [foodGSTAmount, setFoodGSTAmount] = useState(0);
  const [totalGSTAmount, setTotalGSTAmount] = useState(0);

  const [sgstAmount, setSgstAmount] = useState(0);

  const {
    properties,
    status: propertyStatus,
    error: propertyError,
  } = useSelector((state) => state.properties);
  const {
    customers,
    status: customerStatus,
    error: customerError,
  } = useSelector((state) => state.customers);

  const {
    accounts: bankAccounts,
    status: bankAccountStatus,
    error: bankAccountError,
  } = useSelector((state) => state.bankAccounts);

  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    bookingType: "",
    propertyId: "",
    customerMasterId: "",
    guestName: "",
    phoneNumber: "",
    email: "",
    address: "",
    companyEmail: "",
    companyName: "",
    companyAddress: "",
    gstNumber: "",
    bookingAmount: "",
    advanceAmount: "",
    paymentType: "",
    bankAccount: "",
    modeOfPayment: "",
    checkInDate: null,
    checkOutDate: null,
    numberOfRooms: "",
    occupancyType: "SINGLE",
    customOccupancy: "",
    billingType: "NON_GST",
    bookingStatus: "PROFORMA",
    totalAmount: 0,
    remainingAmount: 0,
  });

  useEffect(() => {
    dispatch(fetchProperties());
    dispatch(fetchCustomers());
    dispatch(fetchBankAccounts());
  }, [dispatch]);

  const validateForm = () => {
    const errors = {};

    // Step 1 validations
    if (!formData.bookingType) errors.bookingType = "Booking type is required";
    if (!formData.propertyId) errors.propertyId = "Property is required";
    if (!formData.guestName) errors.guestName = "Guest name is required";
    if (!formData.phoneNumber) errors.phoneNumber = "Phone number is required";
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Invalid phone number format";
    }
    if (!formData.email) errors.email = "Email address is required";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (!formData.checkInDate) errors.checkInDate = "Check-in date is required";
    if (!formData.checkOutDate)
      errors.checkOutDate = "Check-out date is required";
    if (!formData.numberOfRooms)
      errors.numberOfRooms = "Number of rooms is required";

    // Step 2 validations
    if (!formData.bookingAmount)
      errors.bookingAmount = "Booking amount is required";
    if (!formData.bankAccount) errors.bankAccount = "Bank account is required";
    if (!formData.modeOfPayment)
      errors.modeOfPayment = "Payment mode is required";
    if (!formData.billingType) errors.billingType = "Billing type is required";
    if (formData.bookingType === "CORPORATE" && !formData.customerMasterId) {
      errors.customerMasterId =
        "Customer Master is required for corporate bookings";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStepOne = () => {
    const errors = {};
    if (!formData.bookingType) errors.bookingType = "Booking type is required";
    if (!formData.propertyId) errors.propertyId = "Property is required";
    if (!formData.guestName) errors.guestName = "Guest name is required";
    if (!formData.phoneNumber) errors.phoneNumber = "Phone number is required";
    if (!formData.email) errors.email = "Email is required";
    if (!formData.checkInDate) errors.checkInDate = "Check-in date is required";
    if (!formData.checkOutDate)
      errors.checkOutDate = "Check-out date is required";
    if (!formData.numberOfRooms)
      errors.numberOfRooms = "Number of rooms is required";
    if (!formData.occupancyType)
      errors.occupancyType = "Occupancy type is required";
    if (formData.occupancyType === "CUSTOM" && !formData.customOccupancy) {
      errors.customOccupancy = "Custom occupancy details required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStepTwo = () => {
    const errors = {};
    if (!formData.bookingAmount)
      errors.bookingAmount = "Booking amount is required";
    if (!formData.bankAccount) errors.bankAccount = "Bank account is required";
    if (!formData.modeOfPayment)
      errors.modeOfPayment = "Payment mode is required";
    if (!formData.billingType) errors.billingType = "Billing type is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateGSTAmounts = () => {
    const bookingAmount = parseFloat(formData.bookingAmount) || 0;
    let stayGST = 0;
    let foodGST = 0;

    if (formData.billingType === "GST") {
      // Calculate stay GST (12%)
      stayGST = bookingAmount * 0.12;
      setStayGSTAmount(stayGST);

      // Calculate food GST (5%) if applicable
      if (isFoodGSTApplicable) {
        foodGST = bookingAmount * 0.05;
        setFoodGSTAmount(foodGST);
      } else {
        setFoodGSTAmount(0);
      }

      // Set total GST
      setTotalGSTAmount(stayGST + foodGST);
    } else {
      setStayGSTAmount(0);
      setFoodGSTAmount(0);
      setTotalGSTAmount(0);
    }

    // Calculate total amount including GST
    const totalAmount = bookingAmount + stayGST + foodGST;
    const remainingAmount =
      totalAmount - (parseFloat(formData.advanceAmount) || 0);

    setFormData((prev) => ({
      ...prev,
      totalAmount,
      remainingAmount,
    }));
  };

  useEffect(() => {
    calculateGSTAmounts();
  }, [
    formData.bookingAmount,
    formData.advanceAmount,
    formData.billingType,
    isFoodGSTApplicable,
  ]);

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const formattedData = {
        ...formData,
        checkInDate: formData.checkInDate?.toISOString().split("T")[0],
        checkOutDate: formData.checkOutDate?.toISOString().split("T")[0],
        bankAccountId: parseInt(formData.bankAccount),
        paymentMode: formData.modeOfPayment?.toUpperCase(),
        stayGST: stayGSTAmount,
        foodGST: foodGSTAmount,
        acceptFoodGST: isFoodGSTApplicable,
        totalGSTAmount: totalGSTAmount,
        totalAmount: formData.totalAmount,
      };

      await onSubmit(formattedData);
    } catch (error) {
      console.error("Error in submit:", error);
      setValidationErrors((prev) => ({
        ...prev,
        submit: error.message || "Failed to submit booking",
      }));
    }
  };
  const handleChange = (name, value) => {
    setValidationErrors((prev) => ({ ...prev, [name]: undefined }));

    if (name === "billingType" && !["GST", "NON_GST"].includes(value)) {
      console.error("Invalid billing type:", value);
      setValidationErrors((prev) => ({
        ...prev,
        billingType: "Invalid billing type",
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getErrorMessage = (fieldName) => {
    return validationErrors[fieldName] ? (
      <span className="text-red-500 text-xs mt-1">
        {validationErrors[fieldName]}
      </span>
    ) : null;
  };

  const handleNext = () => {
    if (activeStep === 1 && !validateStepOne()) {
      return;
    }
    if (activeStep === 2 && !validateStepTwo()) {
      return;
    }

    if (activeStep === 2 && formData.bookingStatus === "CONFIRMED") {
      setFormData((prev) => ({
        ...prev,
        advanceAmount: prev.bookingAmount,
        remainingAmount: 0,
      }));
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Calculate total amount including GST
  const calculateTotalAmount = () => {
    const bookingAmount = parseFloat(formData.bookingAmount) || 0;
    const advanceAmount = parseFloat(formData.advanceAmount) || 0;

    let totalAmount = bookingAmount;

    // Add SGST (12%) if billing type is GST
    if (formData.billingType === "GST") {
      const sgst = bookingAmount * 0.12; // 12% SGST
      totalAmount += sgst;
      setSgstAmount(sgst); // Update SGST amount
    }

    if (formData.billingType === "GST" && isFoodGSTApplicable) {
      const foodGST = bookingAmount * 0.05; // 5% Food GST
      totalAmount += foodGST;
    }

    const remainingAmount = totalAmount - advanceAmount;

    setFormData((prev) => ({
      ...prev,
      totalAmount,
      remainingAmount,
    }));
  };

  useEffect(() => {
    calculateTotalAmount();
  }, [
    formData.bookingAmount,
    formData.advanceAmount,
    formData.billingType,
    isFoodGSTApplicable,
  ]);

  const handleBillingTypeChange = (value) => {
    if (value === "GST") {
      setIsFoodGSTApplicable(false);
    } else {
      setIsFoodGSTApplicable(false);
    }
    handleChange("billingType", value);
  };

  // Handle Food GST checkbox change
  const handleFoodGSTChange = (checked) => {
    setIsFoodGSTApplicable(checked);
  };

  const inputStyles =
    "bg-white border-gray-200 focus:border-blue-500 text-xs h-8";
  const selectTriggerStyles =
    "bg-white border-gray-200 focus:border-blue-500 text-xs h-8";
  const selectContentStyles = "bg-white border border-gray-200 text-xs";
  const selectItemStyles =
    "hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 text-xs";

  const selectedCustomer = customers.find(
    (customer) => customer.id.toString() === formData.customerMasterId
  );

  const getPreviewData = () => {
    switch (activeStep) {
      case 1:
        return [
          { label: "Booking Type", value: formData.bookingType || "-" },
          {
            label: "Property",
            value:
              properties.find((p) => p.id.toString() === formData.propertyId)
                ?.name || "-",
          },
          ...(formData.bookingType === "CORPORATE" && selectedCustomer
            ? [
                {
                  label: "Customer Master",
                  value: selectedCustomer.companyName,
                },
                {
                  label: "Company Email",
                  value: selectedCustomer.companyEmail,
                },
                {
                  label: "Company Address",
                  value: selectedCustomer.companyAddress,
                },
              ]
            : []),
          { label: "Guest Name", value: formData.guestName || "-" },
          { label: "Phone Number", value: formData.phoneNumber || "-" },
          { label: "Email Address", value: formData.email || "-" },
          { label: "Address", value: formData.address || "-" },
          {
            label: "Check-in Date",
            value: formData.checkInDate?.toLocaleDateString() || "-",
          },
          {
            label: "Check-out Date",
            value: formData.checkOutDate?.toLocaleDateString() || "-",
          },
          { label: "Number of Rooms", value: formData.numberOfRooms || "-" },
          { label: "Occupancy Type", value: formData.occupancyType || "-" },
          ...(formData.occupancyType === "CUSTOM"
            ? [
                {
                  label: "Custom Occupancy",
                  value: formData.customOccupancy || "-",
                },
              ]
            : []),
        ];
      case 2:
        return [
          {
            label: "Booking Amount",
            value: `₹${formData.bookingAmount || "0"}`,
          },
          {
            label: "Advance Amount",
            value: `₹${formData.advanceAmount || "0"}`,
          },
          {
            label: "Bank Account",
            value:
              bankAccounts.find((a) => a.id.toString() === formData.bankAccount)
                ?.accountHolderName || "-",
          },
          {
            label: "Payment Mode",
            value: formData.modeOfPayment
              ? formData.modeOfPayment.charAt(0).toUpperCase() +
                formData.modeOfPayment.slice(1)
              : "-",
          },
          { label: "Billing Type", value: formData.billingType || "-" },
          { label: "Booking Status", value: formData.bookingStatus || "-" },
          ...(formData.bookingStatus === "PROFORMA"
            ? [
                {
                  label: "Total Amount",
                  value: `₹${formData.totalAmount || "0"}`,
                },
                {
                  label: "Advance Amount",
                  value: `₹${formData.advanceAmount || "0"}`,
                },
                {
                  label: "Remaining Amount",
                  value: `₹${formData.remainingAmount || "0"}`,
                },
              ]
            : []),
        ];
      case 3:
        return [
          { label: "Booking Type", value: formData.bookingType || "-" },
          {
            label: "Property",
            value:
              properties.find((p) => p.id.toString() === formData.propertyId)
                ?.name || "-",
          },
          ...(formData.bookingType === "CORPORATE" && selectedCustomer
            ? [
                {
                  label: "Customer Master",
                  value: selectedCustomer.companyName,
                },
                {
                  label: "Company Email",
                  value: selectedCustomer.companyEmail,
                },
                {
                  label: "Company Address",
                  value: selectedCustomer.companyAddress,
                },
              ]
            : []),
          { label: "Guest Name", value: formData.guestName || "-" },
          { label: "Phone Number", value: formData.phoneNumber || "-" },
          { label: "Email Address", value: formData.email || "-" },
          { label: "Address", value: formData.address || "-" },
          {
            label: "Check-in Date",
            value: formData.checkInDate?.toLocaleDateString() || "-",
          },
          {
            label: "Check-out Date",
            value: formData.checkOutDate?.toLocaleDateString() || "-",
          },
          { label: "Number of Rooms", value: formData.numberOfRooms || "-" },
          { label: "Occupancy Type", value: formData.occupancyType || "-" },
          ...(formData.occupancyType === "CUSTOM"
            ? [
                {
                  label: "Custom Occupancy",
                  value: formData.customOccupancy || "-",
                },
              ]
            : []),
          {
            label: "Booking Amount",
            value: `₹${formData.bookingAmount || "0"}`,
          },
          {
            label: "Advance Amount",
            value: `₹${formData.advanceAmount || "0"}`,
          },
          {
            label: "Bank Account",
            value:
              bankAccounts.find((a) => a.id.toString() === formData.bankAccount)
                ?.accountHolderName || "-",
          },
          {
            label: "Payment Mode",
            value: formData.modeOfPayment
              ? formData.modeOfPayment.charAt(0).toUpperCase() +
                formData.modeOfPayment.slice(1)
              : "-",
          },
          { label: "Billing Type", value: formData.billingType || "-" },
          { label: "Booking Status", value: formData.bookingStatus || "-" },
          ...(formData.bookingStatus === "PROFORMA"
            ? [
                {
                  label: "Total Amount",
                  value: `₹${formData.totalAmount || "0"}`,
                },
                {
                  label: "Advance Amount",
                  value: `₹${formData.advanceAmount || "0"}`,
                },
                {
                  label: "Remaining Amount",
                  value: `₹${formData.remainingAmount || "0"}`,
                },
              ]
            : []),
        ];
      default:
        return [];
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-white flex gap-4">
      {/* Left Side: Form */}
      <div className="flex-1">
        <div className="bg-white border rounded-lg p-3 mb-2">
          {" "}
          {/* Reduced padding */}
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { step: 1, label: "Guest Details" },
              { step: 2, label: "Payment Details" },
              { step: 3, label: "Bill Details" },
            ].map(({ step, label }) => (
              <React.Fragment key={step}>
                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      activeStep >= step
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {step}
                  </div>
                  <span
                    className={`ml-2 text-xs ${
                      activeStep >= step ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {step < 3 && <div className="flex-1 h-0.25 mx-3 bg-gray-200" />}{" "}
                {/* Reduced height and margin */}
              </React.Fragment>
            ))}
          </div>
        </div>

        <Card className="bg-white border ">
          <CardContent className="p-3">
            {activeStep === 1 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h2 className="text-md font-semibold">Guest Details</h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-600">
                      Booking Type
                    </Label>
                    <Select
                      value={formData.bookingType}
                      onValueChange={(value) =>
                        handleChange("bookingType", value)
                      }
                    >
                      <SelectTrigger className={selectTriggerStyles}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className={selectContentStyles}>
                        <SelectItem
                          value="CORPORATE"
                          className={selectItemStyles}
                        >
                          Corporate
                        </SelectItem>
                        <SelectItem
                          value="PERSONAL"
                          className={selectItemStyles}
                        >
                          Personal
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {getErrorMessage("bookingType")}
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">Property</Label>
                    {propertyStatus === "loading" ? (
                      <div className="text-xs">Loading properties...</div>
                    ) : propertyStatus === "failed" ? (
                      <div className="text-xs text-red-500">
                        Error: {propertyError}
                      </div>
                    ) : (
                      <Select
                        value={formData.propertyId}
                        onValueChange={(value) =>
                          handleChange("propertyId", value)
                        }
                      >
                        <SelectTrigger className={selectTriggerStyles}>
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                        <SelectContent className={selectContentStyles}>
                          {properties.map((property) => (
                            <SelectItem
                              key={property.id}
                              value={property.id.toString()}
                              className={selectItemStyles}
                            >
                              {property.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {getErrorMessage("propertyId")}
                  </div>
                </div>

                {formData.bookingType === "CORPORATE" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-600">
                        Customer Master
                      </Label>
                      {customerStatus === "loading" ? (
                        <div className="text-xs">Loading customers...</div>
                      ) : customerStatus === "failed" ? (
                        <div className="text-xs text-red-500">
                          Error: {customerError}
                        </div>
                      ) : (
                        <Select
                          value={formData.customerMasterId}
                          onValueChange={(value) =>
                            handleChange("customerMasterId", value)
                          }
                        >
                          <SelectTrigger className={selectTriggerStyles}>
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                          <SelectContent className={selectContentStyles}>
                            {customers.map((customer) => (
                              <SelectItem
                                key={customer.id}
                                value={customer.id.toString()}
                                className={selectItemStyles}
                              >
                                {customer.companyName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-600">Guest Name</Label>
                    <Input
                      value={formData.guestName}
                      onChange={(e) =>
                        handleChange("guestName", e.target.value)
                      }
                      placeholder="Enter name"
                      className={`mt-1 ${inputStyles}`}
                    />
                    {getErrorMessage("guestName")}
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">
                      Phone Number
                    </Label>
                    <Input
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        handleChange("phoneNumber", e.target.value)
                      }
                      placeholder="Enter phone"
                      className={`mt-1 ${inputStyles}`}
                    />
                    {getErrorMessage("phoneNumber")}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-600">
                      Email Address
                    </Label>
                    <Input
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      type="email"
                      placeholder="Enter email"
                      className={`mt-1 ${inputStyles}`}
                      required
                    />
                    {getErrorMessage("email")}
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">Address</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="Enter address"
                      className={`mt-1 ${inputStyles}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-600">
                      Check-in Date
                    </Label>
                    <div
                      onClick={() => setShowCheckInCalendar(true)}
                      className={`mt-1 ${inputStyles} cursor-pointer border border-gray-200 rounded-md p-1`}
                    >
                      {formData.checkInDate
                        ? formData.checkInDate.toLocaleDateString()
                        : "Select check-in date"}
                    </div>
                    {showCheckInCalendar && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-3 relative">
                          <button
                            onClick={() => setShowCheckInCalendar(false)}
                            className="absolute top-1 right-1 p-1 rounded-full hover:bg-gray-100"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <Calendar
                            onDone={(date) => {
                              handleChange("checkInDate", date);
                              setShowCheckInCalendar(false);
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {getErrorMessage("checkInDate")}
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">
                      Check-out Date
                    </Label>
                    <div
                      onClick={() => setShowCheckOutCalendar(true)}
                      className={`mt-1 ${inputStyles} cursor-pointer border border-gray-200 rounded-md p-1`}
                    >
                      {formData.checkOutDate
                        ? formData.checkOutDate.toLocaleDateString()
                        : "Select check-out date"}
                    </div>
                    {showCheckOutCalendar && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-3 relative">
                          <button
                            onClick={() => setShowCheckOutCalendar(false)}
                            className="absolute top-1 right-1 p-1 rounded-full hover:bg-gray-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <Calendar
                            onDone={(date) => {
                              handleChange("checkOutDate", date);
                              setShowCheckOutCalendar(false);
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {getErrorMessage("checkOutDate")}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-600">
                      Number of Rooms
                    </Label>
                    <Input
                      type="number"
                      value={formData.numberOfRooms}
                      onChange={(e) =>
                        handleChange("numberOfRooms", e.target.value)
                      }
                      placeholder="Enter number of rooms"
                      className={`mt-1 ${inputStyles}`}
                    />
                    {getErrorMessage("numberOfRooms")}
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">
                      Occupancy Type
                    </Label>
                    <Select
                      value={formData.occupancyType}
                      onValueChange={(value) =>
                        handleChange("occupancyType", value)
                      }
                    >
                      <SelectTrigger className={selectTriggerStyles}>
                        <SelectValue placeholder="Select occupancy type" />
                      </SelectTrigger>
                      <SelectContent className={selectContentStyles}>
                        <SelectItem value="SINGLE" className={selectItemStyles}>
                          Single
                        </SelectItem>
                        <SelectItem value="DOUBLE" className={selectItemStyles}>
                          Double
                        </SelectItem>
                        <SelectItem value="TRIPLE" className={selectItemStyles}>
                          Triple
                        </SelectItem>
                        <SelectItem value="CUSTOM" className={selectItemStyles}>
                          Custom
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.occupancyType === "CUSTOM" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-600">
                        Custom Occupancy
                      </Label>
                      <Input
                        value={formData.customOccupancy}
                        onChange={(e) =>
                          handleChange("customOccupancy", e.target.value)
                        }
                        placeholder="Enter custom occupancy"
                        className={`mt-1 ${inputStyles}`}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={handleNext}
                    className="bg-blue-600 text-white px-4 text-xs h-8"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h2 className="text-md font-semibold">Payment Details</h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Booking Status */}
                  <div>
                    <Label className="text-xs text-gray-600">
                      Booking Status
                    </Label>
                    <Select
                      value={formData.bookingStatus}
                      onValueChange={(value) =>
                        handleChange("bookingStatus", value)
                      }
                    >
                      <SelectTrigger className={selectTriggerStyles}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className={selectContentStyles}>
                        <SelectItem
                          value="PROFORMA"
                          className={selectItemStyles}
                        >
                          Proforma
                        </SelectItem>
                        <SelectItem
                          value="CONFIRMED"
                          className={selectItemStyles}
                        >
                          Confirmed
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment Mode */}
                  <div>
                    <Label className="text-xs text-gray-600">
                      Payment Mode
                    </Label>
                    <Select
                      value={formData.modeOfPayment}
                      onValueChange={(value) =>
                        handleChange("modeOfPayment", value)
                      }
                    >
                      <SelectTrigger className={selectTriggerStyles}>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent className={selectContentStyles}>
                        <SelectItem value="cash" className={selectItemStyles}>
                          Cash
                        </SelectItem>
                        <SelectItem value="card" className={selectItemStyles}>
                          Credit Card
                        </SelectItem>
                        <SelectItem value="upi" className={selectItemStyles}>
                          UPI
                        </SelectItem>
                        <SelectItem
                          value="internetBanking"
                          className={selectItemStyles}
                        >
                          Internet Banking
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Booking Amount */}
                  <div>
                    <Label className="text-xs text-gray-600">
                      Booking Amount
                    </Label>
                    <Input
                      type="number"
                      value={formData.bookingAmount}
                      onChange={(e) =>
                        handleChange("bookingAmount", e.target.value)
                      }
                      placeholder="Enter amount"
                      className={`w-full ${inputStyles}`}
                    />
                  </div>

                  {/* Advance Amount */}
                  <div>
                    <Label className="text-xs text-gray-600">
                      Advance Amount
                    </Label>
                    <Input
                      type="number"
                      value={formData.advanceAmount}
                      onChange={(e) =>
                        handleChange("advanceAmount", e.target.value)
                      }
                      placeholder="Enter amount"
                      className={`w-full ${inputStyles}`}
                    />
                  </div>

                  {/* Bank Account */}
                  <div>
                    <Label className="text-xs text-gray-600">
                      Bank Account
                    </Label>
                    {bankAccountStatus === "loading" ? (
                      <div className="text-xs">Loading bank accounts...</div>
                    ) : bankAccountStatus === "failed" ? (
                      <div className="text-xs text-red-500">
                        Error: {bankAccountError}
                      </div>
                    ) : (
                      <Select
                        value={formData.bankAccount}
                        onValueChange={(value) =>
                          handleChange("bankAccount", value)
                        }
                      >
                        <SelectTrigger className={selectTriggerStyles}>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent className={selectContentStyles}>
                          {bankAccounts.map((account) => (
                            <SelectItem
                              key={account.id}
                              value={account.id.toString()}
                              className={selectItemStyles}
                            >
                              {account.accountHolderName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Billing Type */}
                  <div>
                    <Label className="text-xs text-gray-600">
                      Billing Type
                    </Label>
                    <Select
                      value={formData.billingType}
                      onValueChange={handleBillingTypeChange}
                    >
                      <SelectTrigger className={selectTriggerStyles}>
                        <SelectValue placeholder="Select billing type" />
                      </SelectTrigger>
                      <SelectContent className={selectContentStyles}>
                        <SelectItem value="GST" className={selectItemStyles}>
                          GST
                        </SelectItem>
                        <SelectItem
                          value="NON_GST"
                          className={selectItemStyles}
                        >
                          Non-GST
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {getErrorMessage("billingType")}
                  </div>
                </div>

                {/* Show GST options only when GST is selected */}
                {formData.billingType === "GST" && (
                  <div className="col-span-2 bg-gray-50 p-4 rounded-lg space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="food-gst"
                        checked={isFoodGSTApplicable}
                        onCheckedChange={handleFoodGSTChange}
                        className="mt-0.5"
                      />
                      <div>
                        <Label htmlFor="food-gst" className="text-sm">
                          Apply Food GST (5%)
                        </Label>
                        <p className="text-xs text-gray-500">
                          Check if food service included
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm">SGST (12%)</Label>
                        <Input
                          type="text"
                          value={`₹${sgstAmount.toFixed(2)}`}
                          readOnly
                          className="mt-1 bg-gray-100 h-8 text-sm"
                        />
                      </div>
                      {isFoodGSTApplicable && (
                        <div>
                          <Label className="text-sm">Food GST (5%)</Label>
                          <Input
                            type="text"
                            value={`₹${(formData.bookingAmount * 0.05).toFixed(
                              2
                            )}`}
                            readOnly
                            className="mt-1 bg-gray-100 h-8 text-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {formData.bookingStatus === "PROFORMA" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-600">
                        Total Amount
                      </Label>
                      <Input
                        type="number"
                        value={formData.totalAmount}
                        readOnly
                        className={`w-full ${inputStyles}`}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">
                        Advance Amount
                      </Label>
                      <Input
                        type="number"
                        value={formData.advanceAmount}
                        onChange={(e) =>
                          handleChange("advanceAmount", e.target.value)
                        }
                        placeholder="Enter amount"
                        className={`w-full ${inputStyles}`}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">
                        Remaining Amount
                      </Label>
                      <Input
                        type="number"
                        value={formData.remainingAmount}
                        readOnly
                        className={`w-full ${inputStyles}`}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="px-4 text-xs h-8"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="bg-blue-600 hover:bg-blue-800 text-white px-4 text-xs h-8"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-sm font-semibold mb-3">
                    Complete Booking Details
                  </h3>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    {getPreviewData().map((item, index) => (
                      <div key={index}>
                        <span className="text-xs text-gray-500">
                          {item.label}
                        </span>
                        <p className="font-medium">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="px-4 text-xs h-8"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => {
                      console.log("Submit button clicked");
                      handleSubmit();
                    }}
                    className="bg-blue-600 hover:bg-blue-800 text-white px-4 text-xs h-8"
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Side: Preview Data (Hidden for Step 3) */}
      {activeStep !== 3 && (
        <div className="w-1/3">
          <Card className="bg-white  border ">
            <CardContent className="p-3">
              <h2 className="text-md font-semibold mb-3">Preview</h2>
              <div className="space-y-2 text-xs">
                {getPreviewData().map((item, index) => (
                  <div key={index}>
                    <span className="text-xs text-gray-500">{item.label}</span>
                    <p className="font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NewBooking;
