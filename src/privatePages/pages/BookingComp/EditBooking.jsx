import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { fetchProperties } from "../../../slices/PropertySlice";
import { fetchCustomers } from "../../../slices/customerMasterSlice";
import { fetchBankAccounts } from "../../../slices/BankAccountSlice";
import { X } from "lucide-react";

const EditBooking = ({ initialData, onSubmit, onClose }) => {
  const dispatch = useDispatch();
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [isFoodGSTApplicable, setIsFoodGSTApplicable] = useState(false);
  const [stayGSTAmount, setStayGSTAmount] = useState(0);
  const [foodGSTAmount, setFoodGSTAmount] = useState(0);
  const [totalGSTAmount, setTotalGSTAmount] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const formatDate = (date) => {
    if (!date) return "";

    const day = date.getDate();
    const month = date
      .toLocaleString("en-US", { month: "short" })
      .toUpperCase();
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  };

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

  // Pre-fill form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        checkInDate: initialData.checkInDate
          ? new Date(initialData.checkInDate)
          : null,
        checkOutDate: initialData.checkOutDate
          ? new Date(initialData.checkOutDate)
          : null,
      });

      if (
        initialData.bookingType === "CORPORATE" &&
        initialData.customerMasterId
      ) {
        setIsFoodGSTApplicable(initialData.acceptFoodGST || false);
      }
    }
  }, [initialData]);

  useEffect(() => {
    dispatch(fetchProperties());
    dispatch(fetchCustomers());
    dispatch(fetchBankAccounts());
  }, [dispatch]);

  // Fetch customer details when booking type is CORPORATE
  useEffect(() => {
    if (
      formData.bookingType === "CORPORATE" &&
      formData.customerMasterId &&
      customers.length > 0
    ) {
      const customer = customers.find(
        (c) => c.id.toString() === formData.customerMasterId.toString()
      );
      if (customer) {
        setSelectedCustomer(customer);
        // Update form with corporate customer details but keep them non-editable
        setFormData((prev) => ({
          ...prev,
          companyName: customer.companyName || "",
          companyEmail: customer.companyEmail || "",
          companyAddress: customer.companyAddress || "",
          gstNumber: customer.gstNumber || "",
          billingType: customer.gstNumber ? "GST" : "NON_GST",
        }));
      }
    } else {
      setSelectedCustomer(null);
    }
  }, [formData.bookingType, formData.customerMasterId, customers]);

  // GST Calculation Logic
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

  // Handle confirmed booking logic
  useEffect(() => {
    if (formData.bookingStatus === "CONFIRMED") {
      setFormData((prev) => ({
        ...prev,
        advanceAmount: prev.bookingAmount,
      }));
    }
  }, [formData.bookingStatus, formData.bookingAmount]);

  // Validate form fields
  const validateForm = () => {
    const errors = {};

    if (!formData.bookingType) errors.bookingType = "Booking type is required";
    if (!formData.propertyId) errors.propertyId = "Property is required";
    if (formData.bookingType === "CORPORATE" && !formData.customerMasterId)
      errors.customerMasterId = "Customer is required for corporate booking";
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
    if (
      !formData.billingType ||
      !["GST", "NON_GST"].includes(formData.billingType)
    ) {
      errors.billingType = "Invalid billing type";
    }
    if (!formData.modeOfPayment)
      errors.modeOfPayment = "Payment mode is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      console.log("Validation failed");
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
      onClose(); // Close the modal after submission
    } catch (error) {
      console.error("Error in submit:", error);
      setValidationErrors((prev) => ({
        ...prev,
        submit: "Failed to submit booking. Please try again.",
      }));
    }
  };

  // Handle field changes
  const handleChange = (name, value) => {
    setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Display error message helper
  const getErrorMessage = (fieldName) => {
    return validationErrors[fieldName] ? (
      <span className="text-red-500 text-xs mt-1">
        {validationErrors[fieldName]}
      </span>
    ) : null;
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-100">
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center"></div>

          {/* Grid Layout for Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Column 1 */}
            <div className="space-y-2">
              {/* Booking Type */}
              <div>
                <Label className="text-xs text-gray-600">Booking Type</Label>
                <Select
                  value={formData.bookingType}
                  onValueChange={(value) => handleChange("bookingType", value)}
                >
                  <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 mt-1 text-xs h-8 w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 text-xs">
                    <SelectItem
                      value="CORPORATE"
                      className="hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 text-xs"
                    >
                      Corporate
                    </SelectItem>
                    <SelectItem
                      value="PERSONAL"
                      className="hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 text-xs"
                    >
                      Personal
                    </SelectItem>
                  </SelectContent>
                </Select>
                {getErrorMessage("bookingType")}
              </div>

              {/* Customer Master (Show only for corporate booking) */}
              {formData.bookingType === "CORPORATE" && (
                <div>
                  <Label className="text-xs text-gray-600">Customer</Label>
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
                      <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 mt-1 text-xs h-8 w-full">
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 text-xs">
                        {customers.map((customer) => (
                          <SelectItem
                            key={customer.id}
                            value={customer.id.toString()}
                            className="hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 text-xs"
                          >
                            {customer.companyName || customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {getErrorMessage("customerMasterId")}
                </div>
              )}

              {/* Property */}
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
                    onValueChange={(value) => handleChange("propertyId", value)}
                  >
                    <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 mt-1 text-xs h-8 w-full">
                      <SelectValue placeholder="Update Property" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 text-xs">
                      {properties.map((property) => (
                        <SelectItem
                          key={property.id}
                          value={property.id.toString()}
                          className="hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 text-xs"
                        >
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {getErrorMessage("propertyId")}
              </div>

              {/* Guest Name */}
              <div>
                <Label className="text-xs text-gray-600">Guest Name</Label>
                <Input
                  value={formData.guestName}
                  onChange={(e) => handleChange("guestName", e.target.value)}
                  placeholder="Enter name"
                  className="mt-1 bg-white border-gray-200 focus:border-blue-500 text-xs h-8 w-full"
                />
                {getErrorMessage("guestName")}
              </div>

              {/* Phone Number */}
              <div>
                <Label className="text-xs text-gray-600">Phone Number</Label>
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  placeholder="Enter phone"
                  className="mt-1 bg-white border-gray-200 focus:border-blue-500 text-xs h-8 w-full"
                />
                {getErrorMessage("phoneNumber")}
              </div>

              {/* Email */}
              <div>
                <Label className="text-xs text-gray-600">Email Address</Label>
                <Input
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  type="email"
                  placeholder="Enter email"
                  className="mt-1 bg-white border-gray-200 focus:border-blue-500 text-xs h-8 w-full"
                />
                {getErrorMessage("email")}
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-2">
              {/* Check-In Date */}
              <div>
                <Label className="text-xs text-gray-600">Check-In Date</Label>
                <div
                  onClick={() => setShowCheckInCalendar(true)}
                  className="mt-1 bg-white border-gray-200 focus:border-blue-500 text-xs cursor-pointer border  rounded-md p-2 h-8 flex items-center w-full"
                >
                  {formData.checkInDate
                    ? formatDate(formData.checkInDate)
                    : "Select check-in date"}
                </div>
                {showCheckInCalendar && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-4 relative">
                      <button
                        onClick={() => setShowCheckInCalendar(false)}
                        className="absolute top-2 right-3 p-1 rounded-full hover:bg-gray-100 bg-white z-10 border"
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
              {/* Booking Amount */}
              <div>
                <Label className="text-xs text-gray-600">Booking Amount</Label>
                <Input
                  type="number"
                  value={formData.bookingAmount}
                  onChange={(e) =>
                    handleChange("bookingAmount", e.target.value)
                  }
                  placeholder="Enter amount"
                  className="mt-1 bg-white border-gray-200 focus:border-blue-500 text-xs h-8 w-full"
                />
              </div>
              {/* Number of Rooms */}
              <div>
                <Label className="text-xs text-gray-600">Number of Rooms</Label>
                <Input
                  type="number"
                  value={formData.numberOfRooms}
                  onChange={(e) =>
                    handleChange("numberOfRooms", e.target.value)
                  }
                  placeholder="Enter number of rooms"
                  className="mt-1 bg-white border-gray-200 focus:border-blue-500 text-xs h-8 w-full"
                />
                {getErrorMessage("numberOfRooms")}
              </div>

              {/* Occupancy Type */}
              <div>
                <Label className="text-xs text-gray-600">Occupancy Type</Label>
                <Select
                  value={formData.occupancyType}
                  onValueChange={(value) =>
                    handleChange("occupancyType", value)
                  }
                >
                  <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 mt-1 text-xs h-8 w-full">
                    <SelectValue placeholder="Select occupancy type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 text-xs">
                    <SelectItem
                      value="SINGLE"
                      className="hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 text-xs"
                    >
                      Single
                    </SelectItem>
                    <SelectItem
                      value="DOUBLE"
                      className="hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 text-xs"
                    >
                      Double
                    </SelectItem>
                    <SelectItem
                      value="TRIPLE"
                      className="hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 text-xs"
                    >
                      Triple
                    </SelectItem>
                    <SelectItem
                      value="CUSTOM"
                      className="hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 text-xs"
                    >
                      Custom
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Occupancy (if applicable) */}
              {formData.occupancyType === "CUSTOM" && (
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
                    className="mt-1 bg-white border-gray-200 focus:border-blue-500 text-xs h-8 w-full"
                  />
                </div>
              )}
              {/* Booking Status */}
              <div>
                <Label className="text-xs text-gray-600">Booking Status</Label>
                <Select
                  value={formData.bookingStatus}
                  onValueChange={(value) =>
                    handleChange("bookingStatus", value)
                  }
                >
                  <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 mt-1 text-xs h-8 w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 text-xs">
                    <SelectItem
                      value="PROFORMA"
                      className="hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 text-xs"
                    >
                      Proforma
                    </SelectItem>
                    <SelectItem
                      value="CONFIRMED"
                      className="hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 text-xs"
                    >
                      Confirmed
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-2">
              {/* Check-Out Date */}
              <div>
                <Label className="text-xs text-gray-600">Check-Out Date</Label>
                <div
                  onClick={() => setShowCheckOutCalendar(true)}
                  className="mt-1 bg-white border-gray-200 focus:border-blue-500 text-xs cursor-pointer border rounded-md p-2 h-8 flex items-center w-full"
                >
                  {formData.checkOutDate
                    ? formatDate(formData.checkOutDate)
                    : "Select check-out date"}
                </div>
                {showCheckOutCalendar && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-4 relative">
                      <button
                        onClick={() => setShowCheckOutCalendar(false)}
                        className="absolute top-2 right-3 p-1 rounded-full hover:bg-gray-100 bg-white z-10 border"
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

              {/* Advance Amount */}
              <div>
                <Label className="text-xs text-gray-600">Advance Amount</Label>
                <Input
                  type="number"
                  value={formData.advanceAmount}
                  onChange={(e) =>
                    handleChange("advanceAmount", e.target.value)
                  }
                  placeholder="Enter amount"
                  className="mt-1 bg-white border-gray-200 focus:border-blue-500 text-xs h-8 w-full"
                  disabled={formData.bookingStatus === "CONFIRMED"}
                />
                {formData.bookingStatus === "CONFIRMED" && (
                  <p className="text-[9px] text-red-400 mt-1">
                    *For confirmed booking, No need to take advance amount
                  </p>
                )}
              </div>

              {/* Bank Account (Disabled) 
              <div>
                <Label className="text-xs text-gray-600">Bank Account</Label>
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
                    disabled
                  >
                    <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 mt-1 text-xs h-8 w-full">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 text-xs">
                      {bankAccounts.map((account) => (
                        <SelectItem
                          key={account.id}
                          value={account.id.toString()}
                          className="hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 text-xs"
                        >
                          {account.accountHolderName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>*/}

              {/* Payment Mode */}
              <div>
                <Label className="text-xs text-gray-600">Payment Mode</Label>
                <Select
                  value={formData.modeOfPayment}
                  onValueChange={(value) =>
                    handleChange("modeOfPayment", value)
                  }
                >
                  <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 mt-1 text-xs h-8 w-full">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 text-xs">
                    <SelectItem
                      value="cash"
                      className="hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 text-xs"
                    >
                      Cash
                    </SelectItem>
                    <SelectItem
                      value="card"
                      className="hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 text-xs"
                    >
                      Credit Card
                    </SelectItem>
                    <SelectItem
                      value="upi"
                      className="hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 text-xs"
                    >
                      UPI
                    </SelectItem>
                    <SelectItem
                      value="internetBanking"
                      className="hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 text-xs"
                    >
                      Internet Banking
                    </SelectItem>
                  </SelectContent>
                </Select>
                {getErrorMessage("modeOfPayment")}
              </div>

              {/* Billing Type */}
              <div>
                <Label className="text-xs text-gray-600">Billing Type</Label>
                <Select
                  value={formData.billingType}
                  onValueChange={(value) => handleChange("billingType", value)}
                >
                  <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 mt-1 text-xs h-8 w-full">
                    <SelectValue placeholder="Select billing type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 text-xs">
                    <SelectItem
                      value="GST"
                      className="hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 text-xs"
                    >
                      GST
                    </SelectItem>
                    <SelectItem
                      value="NON_GST"
                      className="hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 text-xs"
                    >
                      Non-GST
                    </SelectItem>
                  </SelectContent>
                </Select>
                {getErrorMessage("billingType")}
              </div>
              {/* GST Fields */}
              {formData.billingType === "GST" && (
                <div className="col-span-full rounded-md border border-gray-200 bg-gray-50 p-1">
                  <div className="flex flex-col space-y-1">
                    <div className="flex flex-row space-x-2">
                      <div className="flex-1">
                        <Label className="text-[10px]">SGST (12%)</Label>
                        <Input
                          type="text"
                          value={`₹${stayGSTAmount.toFixed(2)}`}
                          readOnly
                          className="mt-0.5 bg-gray-100 h-6 text-[10px]"
                        />
                      </div>
                      {isFoodGSTApplicable && (
                        <div className="flex-1">
                          <Label className="text-[10px]">Food GST (5%)</Label>
                          <Input
                            type="text"
                            value={`₹${foodGSTAmount.toFixed(2)}`}
                            readOnly
                            className="mt-0.5 bg-gray-100 h-6 text-[10px]"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex items-start space-x-1">
                      <Checkbox
                        id="food-gst"
                        checked={isFoodGSTApplicable}
                        onCheckedChange={(checked) =>
                          setIsFoodGSTApplicable(checked)
                        }
                        className="mt-0.5 h-3 w-3"
                      />
                      <div>
                        <Label htmlFor="food-gst" className="text-[10px]">
                          Apply Food GST (5%)
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Company Information in Grid Format */}
          {formData.bookingType === "CORPORATE" && selectedCustomer && (
            <div className="mt-4 p-3 rounded-md border border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs text-gray-600">Company Name</Label>
                  <Input
                    value={formData.companyName}
                    readOnly
                    className="mt-1 bg-gray-100 border-gray-200 text-xs h-8 w-full"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Company Email</Label>
                  <Input
                    value={formData.companyEmail}
                    readOnly
                    className="mt-1 bg-gray-100 border-gray-200 text-xs h-8 w-full"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">
                    Company Address
                  </Label>
                  <Input
                    value={formData.companyAddress}
                    readOnly
                    className="mt-1 bg-gray-100 border-gray-200 text-xs h-8 w-full"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">GST Number</Label>
                  <Input
                    value={formData.gstNumber}
                    readOnly
                    className="mt-1 bg-gray-100 border-gray-200 text-xs h-8 w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error message for entire form submission */}
          {validationErrors.submit && (
            <div className="text-red-500 text-xs mt-3">
              {validationErrors.submit}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="h-8 text-xs px-3 py-1 rounded-md border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="h-8 text-xs px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Update Booking
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EditBooking;
