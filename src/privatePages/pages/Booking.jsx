"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { generateBill, resetBillState } from "../../slices/BillSlice";
import { fetchProperties } from "../../slices/PropertySlice";

import {
  setBookings,
  addBooking,
  updateBooking,
  deleteBooking,
  setLoading,
  setError,
} from "../../slices/BookingSlice";
import bookingService from "../../services/BookingService";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NewBooking from "../../privatePages/pages/BookingComp/NewBooking";
import EditBooking from "../../privatePages/pages/BookingComp/EditBooking";
import ViewBookingModal from "../pages/BookingComp/BookingDetailsModal";

import SuccessModal from "../../components/SuccessModal";
import DeleteModal from "../../components/DeleteModel";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DatePickerWithRange from "./ExpenseComp/DateRangePicker";
import {
  ArrowUpDown,
  Download,
  PlusCircle,
  Trash2,
  Eye,
  ArrowRight,
  Pencil,
  Home,
  Loader2,
  Search,
} from "lucide-react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Pagination from "./ExpenseComp/Pagination";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

import BillGeneration from "../pages/BillGeneration/BillGeneration";

const LoaderComponent = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
    <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
      <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
      <p className="text-gray-700">Processing your request...</p>
    </div>
  </div>
);

const BookingManagement = () => {
  const dispatch = useDispatch();
  const { bookings, loading, error } = useSelector((state) => state.bookings);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [selectedBookings, setSelectedBookings] = useState([]);

  const [isBillGenerationOpen, setIsBillGenerationOpen] = useState(false);
  const [selectedBookingForBill, setSelectedBookingForBill] = useState(null);
  const [billGenerated, setBillGenerated] = useState(false);
  const [localBillLoading, setLocalBillLoading] = useState(false);
  const [localBillSuccess, setLocalBillSuccess] = useState(false);

  const billState = useSelector((state) => state.bill);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [remainingAmount, setRemainingAmount] = useState("");
  const [bookingToConfirm, setBookingToConfirm] = useState(null);

  const { properties } = useSelector((state) => state.properties);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const { bill, loading: billLoading, success: billSuccess } = billState || {};

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBookings();
    dispatch(fetchProperties());
  }, [dispatch]);

  useEffect(() => {
    setLocalBillLoading(billLoading);

    if (billSuccess) {
      setLocalBillSuccess(true);
      setTimeout(() => {
        setLocalBillSuccess(false);
      }, 2000);
    }
  }, [billLoading, billSuccess]);

  const handleGenerateBillClick = (booking) => {
    console.log("Selected Booking for Bill:", booking);
    setSelectedBookingForBill(booking);
    setIsBillGenerationOpen(true);
  };

  useEffect(() => {
    return () => {
      dispatch(resetBillState());
    };
  }, [dispatch]);

  const handleConfirmAndGenerateBill = async (bookingId) => {
    try {
      setLocalBillLoading(true);
      const bill = await dispatch(generateBill(bookingId)).unwrap();
      setBillGenerated(true);
      setLocalBillLoading(false);
      setLocalBillSuccess(true);
      setTimeout(() => {
        setLocalBillSuccess(false);
      }, 2000);
      return bill;
    } catch (error) {
      setLocalBillLoading(false);
      console.error("Error generating bill:", error);
      throw error;
    }
  };

  const handleCloseModal = () => {
    setIsBillGenerationOpen(false);
    setSelectedBookingForBill(null);
    setBillGenerated(false);
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setSuccessModalOpen(true);
    setTimeout(() => {
      setSuccessModalOpen(false);
    }, 2000);
  };

  const filteredBookings = bookings
    .filter((booking) => {
      if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const bookingNumber = String(booking.number || "").toLowerCase();
        const guestName = String(booking.guestName || "").toLowerCase();

        if (
          !bookingNumber.includes(lowerCaseSearchTerm) &&
          !guestName.includes(lowerCaseSearchTerm)
        ) {
          return false;
        }
      }

      // Filter by date range
      if (dateRange.from && dateRange.to) {
        const bookingDate = new Date(booking.checkInDate);
        if (bookingDate < dateRange.from || bookingDate > dateRange.to) {
          return false;
        }
      }

      // Filter by selected property
      if (selectedProperty) {
        return booking.property?.id === selectedProperty;
      }

      return true;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      const modifier = sortConfig.direction === "ascending" ? 1 : -1;
      return a[sortConfig.key] < b[sortConfig.key]
        ? -1 * modifier
        : a[sortConfig.key] > b[sortConfig.key]
        ? 1 * modifier
        : 0;
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      dispatch(setLoading(true));
      const fetchedBookings = await bookingService.getAllBookings();
      dispatch(setBookings(fetchedBookings));
    } catch (error) {
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleCreateBooking = async (bookingData) => {
    try {
      dispatch(setLoading(true));
      const transformedData = {
        ...bookingData,
        bankAccountId: bookingData.bankAccount,
      };
      const newBooking = await bookingService.createBooking(transformedData);
      dispatch(addBooking(newBooking));
      setIsDialogOpen(false);
      showSuccessMessage("Booking created successfully!");
    } catch (error) {
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleUpdateBooking = async (bookingData) => {
    try {
      dispatch(setLoading(true));
      const updatedBooking = await bookingService.updateBooking(
        bookingData.id,
        bookingData
      );
      dispatch(updateBooking(updatedBooking));
      setIsEditDialogOpen(false);
      showSuccessMessage("Booking updated successfully!");
    } catch (error) {
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };
  const handleDeleteBooking = async (id) => {
    try {
      dispatch(setLoading(true));
      await bookingService.deleteBooking(id);
      dispatch(deleteBooking(id));
      showSuccessMessage("Booking deleted successfully!");
    } catch (error) {
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };
  const handleConfirmBooking = async (id, remainingAmount) => {
    try {
      dispatch(setLoading(true));
      const confirmedBooking = await bookingService.confirmBooking(
        id,
        remainingAmount
      );
      dispatch(updateBooking(confirmedBooking));
      showSuccessMessage("Booking confirmed successfully!");
    } catch (error) {
      dispatch(setError(error.message || "Failed to confirm booking"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleCancelBooking = async (id, refundAmount) => {
    try {
      dispatch(setLoading(true));
      await bookingService.cancelBooking(id, refundAmount);
      await fetchBookings();
      showSuccessMessage("Booking canceled successfully!");
    } catch (error) {
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };
  const handleDeleteClick = (booking) => {
    setBookingToDelete(booking);
    setIsDeleteModalOpen(true);
  };

  const handleCancelClick = (booking) => {
    setBookingToCancel(booking);
    setIsCancelModalOpen(true);
  };

  const handleRefundAmountChange = (e) => {
    const value = e.target.value;
    if (!isNaN(value) && value >= 0) {
      setRefundAmount(value);
    }
  };

  const confirmCancellation = async () => {
    if (bookingToCancel) {
      const amount = parseFloat(refundAmount);
      if (amount < 0) {
        alert("Refund amount cannot be negative.");
        return;
      }
      await handleCancelBooking(bookingToCancel.id, amount);
      setIsCancelModalOpen(false);
      setRefundAmount("");
    }
  };

  const confirmDeletion = async () => {
    if (bookingToDelete) {
      await handleDeleteBooking(bookingToDelete.id);
      setIsDeleteModalOpen(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  };

  const exportData = (format) => {
    const fileName = `bookings_${new Date().toISOString().split("T")[0]}`;

    const tableColumns = [
      "ID",
      "Guest Name",
      "Phone Number",
      "Email",
      "Check-In Date",
      "Check-Out Date",
      "Number of Rooms",
      "Occupancy Type",
      "Booking Status",
      "Booking Amount",
      "Advance Amount",
      "Remaining Amount",
      "Property Name",
      "Payment Mode",
      "Billing Type",
      "Total Bill Amount",
      "Booking Date",
    ];

    const tableRows = filteredBookings.map((booking) => [
      booking.id,
      booking.guestName,
      booking.phoneNumber,
      booking.email,
      formatDate(booking.checkInDate),
      formatDate(booking.checkOutDate),
      booking.numberOfRooms,
      booking.occupancyType,
      booking.bookingStatus,
      booking.bookingAmount,
      booking.advanceAmount,
      booking.remainingAmount,
      booking.property?.name || "N/A",
      booking.paymentMode,
      booking.billingType,
      booking.totalBillAmount,
      formatDate(booking.bookingDateTime),
    ]);

    try {
      switch (format) {
        case "csv": {
          const csv = Papa.unparse({
            fields: tableColumns,
            data: tableRows,
          });
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `${fileName}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          break;
        }
        case "excel": {
          const ws = XLSX.utils.aoa_to_sheet([tableColumns, ...tableRows]);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Bookings");
          XLSX.writeFile(wb, `${fileName}.xlsx`);
          break;
        }
        case "pdf": {
          const doc = new jsPDF();
          doc.setFontSize(20);

          const pageWidth = doc.internal.pageSize.getWidth();
          doc.text("Bookings Report", pageWidth / 2, 10, { align: "center" });

          const tableColumns = [
            "ID",
            "Guest Name",
            "Phone No.",
            "Email",
            "C-In Date",
            "C-O Date",
            "No of Rooms",
            "Occupancy Type",
            "Booking Status",
            "Booking Amount",
            "Advance Amount",
            "Remaining Amount",
            "Property Name",
            "Payment Mode",
            "Billing Type",
            "Total Bill Amount",
            "Booking Date",
          ];

          const tableRows = filteredBookings.map((booking) => [
            booking.id,
            booking.guestName,
            booking.phoneNumber,
            booking.email,
            formatDate(booking.checkInDate),
            formatDate(booking.checkOutDate),
            booking.numberOfRooms,
            booking.occupancyType,
            booking.bookingStatus,
            booking.bookingAmount,
            booking.advanceAmount,
            booking.remainingAmount,
            booking.property?.name || "N/A",
            booking.paymentMode,
            booking.billingType,
            booking.totalBillAmount,
            formatDate(booking.bookingDateTime),
          ]);

          // AutoTable configuration
          doc.autoTable({
            head: [tableColumns],
            body: tableRows,
            startY: 20,
            theme: "grid",
            styles: {
              fontSize: 6,
              cellPadding: 2,
              overflow: "linebreak",
              font: "helvetica",
            },
            columnStyles: {
              0: { cellWidth: 8 }, // ID
              1: { cellWidth: 10 }, // Guest Name
              2: { cellWidth: 15 }, // Phone Number
              3: { cellWidth: 15 }, // Email
              4: { cellWidth: 10 }, // Check-In Date
              5: { cellWidth: 10 }, // Check-Out Date
              6: { cellWidth: 10 }, // Number of Rooms
              7: { cellWidth: 10 }, // Occupancy Type
              8: { cellWidth: 10 }, // Booking Status
              9: { cellWidth: 15 }, // Booking Amount
              10: { cellWidth: 10 }, // Advance Amount
              11: { cellWidth: 10 }, // Remaining Amount
              12: { cellWidth: 15 }, // Property Name
              13: { cellWidth: 10 }, // Payment Mode
              14: { cellWidth: 10 }, // Billing Type
              15: { cellWidth: 15 }, // Total Bill Amount
              16: { cellWidth: 10 }, // Booking Date
            },
            didDrawCell: (data) => {
              if (data.section === "body" && data.column.index === 3) {
                const lines = doc.splitTextToSize(
                  data.cell.raw,
                  data.cell.width - 4
                );
                if (lines.length > 1) {
                  data.row.height = lines.length * 4;
                }
              }
            },
          });

          // Save the PDF
          doc.save(`${fileName}.pdf`);
          break;
        }
      }
    } catch (error) {
      console.error(`Export failed: ${error}`);
    }
  };

  const handleSelectAllToggle = (checked) => {
    if (checked) {
      setSelectedBookings(currentItems.map((booking) => booking.id));
    } else {
      setSelectedBookings([]);
    }
  };

  const handleSingleBookingSelect = (bookingId) => {
    setSelectedBookings((prev) =>
      prev.includes(bookingId)
        ? prev.filter((id) => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const handleMultipleDelete = async () => {
    try {
      for (const bookingId of selectedBookings) {
        await bookingService.deleteBooking(bookingId);
      }
      setSuccessMessage(
        `${selectedBookings.length} booking(s) deleted successfully!`
      );
      setSuccessModalOpen(true);
      fetchBookings();
      setSelectedBookings([]);
    } catch (error) {
      dispatch(setError(error.message));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  if (loading)
    return (
      <div className="p-6">
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );

  if (error)
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-lg">
        Error: {error}
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-6 bg-white rounded-xl shadow-sm mx-4 my-6"
    >
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        {/* Heading Text */}
        <div className="flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800">
            Booking Management
          </h2>
          <p className="text-xs text-gray-500">
            Manage and track your bookings
          </p>
        </div>

        {/* Calendar, Sort, Filter, Export, and Add Booking Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 pr-4 py-1 w-40 h-8 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"
              size={12}
            />
          </div>

          {/* Calendar */}
          <DatePickerWithRange
            className="flex flex-wrap  w-[200px] bg-white"
            value={dateRange}
            onChange={setDateRange}
          />

          {/* Sort By Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-1 text-sm"
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white">
              <DropdownMenuItem onClick={() => handleSort("guestName")}>
                Guest Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("checkInDate")}>
                Check-In Date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("bookingStatus")}>
                Status
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filter by Property Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-1 text-sm"
              >
                <Home className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white">
              <DropdownMenuItem onClick={() => setSelectedProperty(null)}>
                All Properties
              </DropdownMenuItem>
              {properties.map((property) => (
                <DropdownMenuItem
                  key={property.id}
                  onClick={() => setSelectedProperty(property.id)}
                >
                  {property.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-1 text-sm"
              >
                <Download className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg">
              <DropdownMenuItem onClick={() => exportData("csv")}>
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData("excel")}>
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData("pdf")}>
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Booking Button */}
          <Button
            onClick={() => {
              setCurrentBooking(null);
              setIsDialogOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center gap-1 text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Add Booking
          </Button>
        </div>
      </div>
      {/* Display Selected Property */}
      {selectedProperty && (
        <div className="bg-blue-50 p-2 rounded-lg text-sm font-semibold text-blue-800 mb-2">
          Showing bookings for Property :{" "}
          {properties.find((p) => p.id === selectedProperty)?.name}
        </div>
      )}

      {/* Selected Bookings Section */}
      {selectedBookings.length > 0 && (
        <div className="bg-blue-50 p-4 mb-4 rounded-lg flex justify-between items-center">
          <span className="text-blue-800">
            {selectedBookings.length} booking(s) selected
          </span>
          <Button
            onClick={handleMultipleDelete}
            className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 text-white" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Table Section */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[50px] py-3 px-4">
                <Checkbox
                  checked={
                    currentItems.length > 0 &&
                    selectedBookings.length === currentItems.length
                  }
                  onCheckedChange={handleSelectAllToggle}
                />
              </TableHead>
              <TableHead className="py-3 px-4 text-gray-700 font-medium">
                ID
              </TableHead>
              <TableHead className="py-3 px-4 text-gray-700 font-medium">
                Guest Name
              </TableHead>
              <TableHead className="py-3 px-4 text-gray-700 font-medium">
                Check-In
              </TableHead>
              <TableHead className="py-3 px-4 text-gray-700 font-medium">
                Check-Out
              </TableHead>
              <TableHead className="py-3 px-4 text-gray-700 font-medium">
                Status
              </TableHead>

              <TableHead className="py-3 px-4 text-gray-700 font-medium">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentItems.length > 0 ? (
              currentItems.map((booking) => (
                <TableRow
                  key={booking.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="w-[50px]">
                    <Checkbox
                      checked={selectedBookings.includes(booking.id)}
                      onCheckedChange={() =>
                        handleSingleBookingSelect(booking.id)
                      }
                    />
                  </TableCell>
                  <TableCell className="py-3 px-4">{booking.id}</TableCell>
                  <TableCell className="py-3 px-4">
                    {booking.guestName}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    {formatDate(booking.checkInDate)}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    {formatDate(booking.checkOutDate)}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        booking.bookingStatus === "PROFORMA"
                          ? "bg-yellow-50 text-yellow-700"
                          : booking.bookingStatus === "CONFIRMED"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {booking.bookingStatus}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setIsViewModalOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentBooking(booking);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(booking)}
                        className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {booking.bookingStatus === "PROFORMA" && (
                        <Button
                          size="sm"
                          className="ml-auto border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600 hover:border-green-600 flex items-center gap-2"
                          onClick={() => {
                            setBookingToConfirm(booking);
                            setIsConfirmModalOpen(true);
                          }}
                        >
                          Confirm Booking
                        </Button>
                      )}
                      {(booking.bookingStatus === "PROFORMA" ||
                        booking.bookingStatus === "CONFIRMED") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 border-red-500 hover:text-red-600 hover:border-red-600"
                          onClick={() => handleCancelClick(booking)}
                        >
                          Cancel Booking
                        </Button>
                      )}

                      {/* Update the "Generate Bill" button in the table */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600 flex items-center gap-1"
                        onClick={() => handleGenerateBillClick(booking)}
                      >
                        {billGenerated ? "View Bill" : "Generate Bill"}
                        <ArrowRight className="w-4 h-4 text-blue-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-500"
                >
                  No bookings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Render BillGeneration */}
      {isBillGenerationOpen && selectedBookingForBill && (
        <BillGeneration
          booking={selectedBookingForBill}
          onClose={handleCloseModal}
          onConfirm={handleConfirmAndGenerateBill}
        />
      )}

      {/* Render BillGeneration as a Pop-up Modal */}
      <Dialog
        open={isBillGenerationOpen}
        onOpenChange={setIsBillGenerationOpen}
      >
        <DialogContent className="bg-white max-w-4xl">
          <DialogHeader>
            <DialogTitle>Generate Bill</DialogTitle>
          </DialogHeader>
          <BillGeneration
            booking={selectedBookingForBill}
            onClose={handleCloseModal}
            onConfirm={handleConfirmAndGenerateBill}
          />
        </DialogContent>
      </Dialog>

      {/* Show Loader While Generating Bill */}
      {localBillLoading && <LoaderComponent />}

      {/* Show Success Modal After Bill Generation */}
      {billSuccess && (
        <SuccessModal
          isOpen={true}
          message="Bill generated successfully!"
          onClose={() => dispatch(resetBillState())}
        />
      )}

      {/* Show Loader While Generating Bill */}
      {localBillLoading && <LoaderComponent />}

      {/* Show Success Modal After Bill Generation */}
      {billSuccess && (
        <SuccessModal
          isOpen={true}
          message="Bill generated successfully!"
          onClose={() => dispatch(resetBillState())}
        />
      )}
      {/* Pagination */}
      <Pagination
        totalItems={filteredBookings.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* Dialogs and Modals */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white max-w-4xl">
          <DialogHeader>
            <DialogTitle>New Booking</DialogTitle>
          </DialogHeader>
          <NewBooking onSubmit={handleCreateBooking} />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
          </DialogHeader>
          <EditBooking
            initialData={currentBooking}
            onSubmit={handleUpdateBooking}
            onClose={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="bg-white max-w-4xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          <ViewBookingModal
            booking={selectedBooking}
            onClose={() => setIsViewModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <SuccessModal
        isOpen={successModalOpen}
        message={successMessage}
        onClose={() => setSuccessModalOpen(false)}
      />
      <DeleteModal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setBookingToDelete(null);
        }}
        onConfirm={confirmDeletion}
        message="Are you sure you want to delete this booking?"
      />

      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="bg-white max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
          </DialogHeader>
          <div>
            <p className="text-sm">
              Are you sure you want to cancel this booking?
            </p>
            {/* Display Booking Amount */}
            <div className="mt-2">
              <p className="text-xs text-green-700">
                Booking Amount: {bookingToCancel?.bookingAmount}
              </p>
              <p className="text-xs font-semibold text-red-500">
                Remaining Amount: {bookingToCancel?.remainingAmount}
              </p>
            </div>
            <Input
              type="number"
              placeholder="Enter refund amount"
              value={refundAmount}
              onChange={handleRefundAmountChange}
              className="mt-2"
            />
            {/* Smaller gray text */}
            <p className="text-xs text-gray-500 mt-1">
              *Valid Refund amount (0-Booking Amount)
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsCancelModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmCancellation}
              disabled={!refundAmount || parseFloat(refundAmount) < 0}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="bg-white max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
          </DialogHeader>
          <div>
            <p>Enter the remaining amount to confirm the booking:</p>

            {/* Display Booking Amount */}
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Booking Amount: {bookingToConfirm?.bookingAmount}
              </p>
              <p className="text-sm text-gray-500">
                Remaining Amount: {bookingToConfirm?.remainingAmount}
              </p>
            </div>

            {/* Input for Remaining Amount */}
            <Input
              type="number"
              placeholder="Remaining Amount"
              value={remainingAmount}
              onChange={(e) => setRemainingAmount(e.target.value)}
              className="mt-2"
            />
            {/* Smaller gray text */}
            <p className="text-xs text-gray-500 mt-1">
              *Valid Remaining amount(0-Booking Amount)
            </p>
            {/* Display Remaining Amount */}
            {remainingAmount && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Enter Remaining Amount: {remainingAmount}
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsConfirmModalOpen(false);
                setRemainingAmount("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const amount = parseFloat(remainingAmount);
                if (isNaN(amount)) {
                  dispatch(setError("Please enter a valid number."));
                  return;
                }
                if (amount < 0) {
                  dispatch(setError("Remaining amount cannot be negative."));
                  return;
                }
                if (amount > bookingToConfirm?.bookingAmount) {
                  dispatch(
                    setError(
                      "Remaining amount cannot exceed the booking amount."
                    )
                  );
                  return;
                }
                handleConfirmBooking(bookingToConfirm.id, amount);
                setIsConfirmModalOpen(false);
                setRemainingAmount("");
              }}
              // Disable the button if the remaining amount is invalid
              disabled={
                !remainingAmount ||
                isNaN(parseFloat(remainingAmount)) ||
                parseFloat(remainingAmount) < 0 ||
                parseFloat(remainingAmount) > bookingToConfirm?.bookingAmount
              }
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <SuccessModal
        isOpen={successModalOpen}
        message={successMessage}
        onClose={() => setSuccessModalOpen(false)}
      />
    </motion.div>
  );
};

export default BookingManagement;
