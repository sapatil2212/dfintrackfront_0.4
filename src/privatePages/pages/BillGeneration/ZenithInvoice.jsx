import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import dfintrack from "../../../assets/logo.png";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import zenith from "../../../assets/zenith.png";
import { Download, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBillByBookingId } from "../../../slices/BillSlice";

const ZenithInvoice = ({ booking, onClose, onConfirm }) => {
  const [bill, setBill] = useState(null);
  const [error, setError] = useState(null);
  const invoiceRef = useRef(null);
  const dispatch = useDispatch();

  const billState = useSelector((state) => state.bills);
  const reduxBill = billState?.bill;
  const loading = billState?.loading;
  const reduxError = billState?.error;

  useEffect(() => {
    if (booking?.id) {
      fetchBillDetails(booking.id);
    }
  }, [booking]);

  // Update bill state when reduxBill changes
  useEffect(() => {
    if (reduxBill) {
      const data = {
        ...booking,
        billNumber: reduxBill.billNumber || null,
        bookingAmount: booking.bookingAmount || null,
        stayGSTAmount: booking.stayGSTAmount || null,
        foodGSTAmount: booking.foodGSTAmount || null,
        totalBillAmount: booking.totalBillAmount || null,
        bookingNumber: booking.bookingNumber || null,
        guestName: booking.guestName || null,
        phoneNumber: booking.phoneNumber || null,
        checkInDate: booking.checkInDate || null,
        checkOutDate: booking.checkOutDate || null,
        numberOfRooms: booking.numberOfRooms || null,
        bookingType: booking.bookingType || null,
        occupancyType: booking.occupancyType || null,
        email: booking.email || null,
        paymentMode: booking.paymentMode || null,
        billingType: booking.billingType || null,
        bookingStatus: booking.bookingStatus || null,
        bookingDateTime: booking.bookingDateTime || null,
        propertyName: booking.property?.name || null,
        customerMaster: booking.customerMaster || null,
      };
      setBill(data);
    }
  }, [reduxBill, booking]);

  // Set error state if redux error occurs
  useEffect(() => {
    if (reduxError) {
      setError(reduxError);
    }
  }, [reduxError]);

  const fetchBillDetails = async (bookingId) => {
    try {
      console.log("Booking data received:", booking);
      // Dispatch the Redux action to fetch bill by booking ID
      dispatch(fetchBillByBookingId(bookingId));
    } catch (err) {
      setError("Failed to fetch bill details");
      console.error("Error fetching bill:", err);
    }
  };

  const handleExportPdf = async () => {
    if (!invoiceRef.current) return;

    const originalHeight = invoiceRef.current.style.height;
    invoiceRef.current.style.height = "auto";

    const canvas = await html2canvas(invoiceRef.current, {
      scale: 2,
      useCORS: true,
      logging: true,
      scrollY: -window.scrollY,
    });

    invoiceRef.current.style.height = originalHeight;

    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add the image to the PDF
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    // Save the PDF
    pdf.save(`zenith_invoice_${bill?.billNumber || "unknown"}.pdf`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "NULL";
    const date = new Date(dateString);
    return isNaN(date)
      ? "Invalid Date"
      : date.toLocaleDateString("en-US", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "NULL";
    const date = new Date(dateTimeString);
    return isNaN(date)
      ? "Invalid Date"
      : date.toLocaleString("en-US", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg">
          <p>Loading invoice details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-red-50 p-4 rounded-lg text-red-700">
          <p>{error}</p>
          <Button className="mt-4" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={onClose}
    >
      <div
        ref={invoiceRef}
        className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 p-4 w-[90%] max-w-3xl h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button (Cross Icon) */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="p-4 bg-white">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex flex-col items-center gap-1">
                <p className="text-[10px] text-gray-400">Powered By</p>
                <img src={dfintrack} alt="Company Logo" className="w-20 h-4" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-indigo-900">INVOICE</h1>
          </div>
        </div>

        {/* Thank you banner */}
        <div className="bg-green-100 p-3 flex justify-between items-center">
          <div className="flex items-start gap-3">
            <div className="bg-white p-1 rounded-md">
              <svg
                className="w-6 h-6 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-base text-gray-800">
                Thank you for your trust !
              </h2>
              <p className="text-[10px] text-gray-600">
                We are happy to serve you. This is a digitally generated
                invoice.
              </p>
            </div>
          </div>
          <div>
            <img
              src={zenith}
              alt="Zenith Hospitality Logo"
              className="w-20 h-8"
            />
          </div>
        </div>

        {/* Company Information (Conditional Rendering for Corporate Bookings) */}
        {bill?.bookingType === "CORPORATE" && bill?.customerMaster && (
          <div className="p-4">
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Company Information :
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] text-gray-500">Company Name :</p>
                <p className="text-[10px] font-semibold">
                  {bill.customerMaster.companyName || "NULL"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Contact Person :</p>
                <p className="text-[10px] font-semibold">
                  {bill.customerMaster.contactPersonName || "NULL"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Company Email :</p>
                <p className="text-[10px] font-semibold">
                  {bill.customerMaster.companyEmail || "NULL"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Company Contact :</p>
                <p className="text-[10px] font-semibold">
                  {bill.customerMaster.companyContactNumber || "NULL"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Alternate Contact :</p>
                <p className="text-[10px] font-semibold">
                  {bill.customerMaster.companyAlternateContactNumber || "NULL"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Company Address :</p>
                <p className="text-[10px] font-semibold">
                  {bill.customerMaster.companyAddress || "NULL"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">GST Number :</p>
                <p className="text-[10px] font-semibold">
                  {bill.customerMaster.gstNumber || "NULL"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Booking Details */}
        <div className="p-4">
          <h2 className="text-lg font-bold text-gray-800 mb-1">
            Booking Details :
          </h2>
          <div>
            <p className="text-sm font-semibold mb-4">
              {bill?.billNumber || "NULL"}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <div>
              <p className="text-[10px] text-gray-500">Guest Name :</p>
              <p className="text-[10px] font-semibold">
                {bill?.guestName || "NULL"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Booking Number:</p>
              <p className="text-[10px] font-semibold">
                {bill?.bookingNumber || "NULL"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Check - in</p>
              <p className="text-[10px] font-semibold">
                {formatDate(bill?.checkInDate) || "NULL"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Check - out</p>
              <p className="text-[10px] font-semibold">
                {formatDate(bill?.checkOutDate) || "NULL"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Booking Type</p>
              <p className="text-[10px] font-semibold">
                {bill?.bookingType || "NULL"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Phone Number</p>
              <p className="text-[10px] font-semibold">
                {bill?.phoneNumber || "NULL"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Number of Rooms</p>
              <p className="text-[10px] font-semibold">
                {bill?.numberOfRooms || "NULL"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Occupancy Type</p>
              <p className="text-[10px] font-semibold">
                {bill?.occupancyType || "NULL"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Email</p>
              <p className="text-[10px] font-semibold">
                {bill?.email || "NULL"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Payment Mode</p>
              <p className="text-[10px] font-semibold">
                {bill?.paymentMode || "NULL"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Billing Type</p>
              <p className="text-[10px] font-semibold">
                {bill?.billingType || "NULL"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 pb-1">Booking Status</p>
              <p className="text-[10px] font-semibold">
                <span
                  className={`px-1 py-0.5 rounded-full text-[8px] ${
                    bill?.bookingStatus === "PROFORMA"
                      ? "bg-yellow-50 text-yellow-700"
                      : bill?.bookingStatus === "CONFIRMED"
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {bill?.bookingStatus || "NULL"}
                </span>
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Booking Date & Time</p>
              <p className="text-[10px] font-semibold">
                {formatDateTime(bill?.bookingDateTime) || "NULL"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Property Name</p>
              <p className="text-[10px] font-semibold">
                {bill?.propertyName || "NULL"}
              </p>
            </div>
          </div>
        </div>

        {/* Price Summary */}
        <div className="p-4 bg-green-50 rounded-lg mx-3 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-2">
            Your Price Summary :
          </h2>

          <div className="space-y-2 border-b border-gray-300 pb-2 mb-2">
            <div className="flex justify-between">
              <p className="text-[10px] text-gray-600">Booking Amount :</p>
              <p className="text-[10px] font-semibold">
                Rs. {(bill?.bookingAmount || 0).toLocaleString()}/-
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-[10px] text-gray-600">SGST</p>
              <p className="text-[10px] font-semibold">
                Rs. {(bill?.stayGSTAmount || 0).toLocaleString()}/-
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-[10px] text-gray-600">Food Tax</p>
              <p className="text-[10px] font-semibold">
                Rs. {(bill?.foodGSTAmount || 0).toLocaleString()}/-
              </p>
            </div>
          </div>

          <div className="flex justify-between">
            <p className="text-sm font-bold text-green-600">TO PAY :</p>
            <p className="text-sm font-bold text-green-600">
              Rs. {(bill?.totalBillAmount || 0).toLocaleString()}/-
            </p>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="px-4 pb-4">
          <h3 className="font-semibold text-gray-700 mb-1 text-[10px]">
            Terms & Conditions:
          </h3>
          <ol className="list-decimal pl-4 text-[8px] text-gray-600 space-y-0.5">
            <li>
              This is a digital copy of the booking confirmation and not the
              final document.
            </li>
            <li>The details mentioned are subject to change.</li>
            <li>
              Please review the details carefully. If there are any
              discrepancies or changes, contact us immediately.
            </li>
          </ol>

          <h3 className="font-semibold text-gray-700 mt-2 mb-1 text-[10px]">
            Important Information:
          </h3>
          <ul className="text-[8px] text-gray-600 space-y-0.5">
            <li>* Standard Check-in: 12:00 PM</li>
            <li>* Standard Check-out: 11:00 AM</li>
            <li>* Please carry a valid ID proof</li>
            <li>* Early check-in subject to availability</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-gray-200 text-center text-[8px] text-gray-600">
          <p>
            Email: help@digiworldinfotech.com | Phone: +91 883 055 3868, +91 820
            841 5943
          </p>
        </div>

        {/* Export Button Fixed Position */}
        <div className="fixed bottom-0 right-[calc(50%-22rem)]">
          <Button
            onClick={handleExportPdf}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 shadow-lg text-[10px] p-2"
          >
            <Download className="w-3 h-3" />
            <span>Export Bill</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ZenithInvoice;
