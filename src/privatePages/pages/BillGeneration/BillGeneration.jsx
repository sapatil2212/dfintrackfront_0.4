import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Loader from "../../../components/Loaders/Loader";
import SuccessModal from "../../../components/SuccessModal";
import ZenithInvoice from "./ZenithInvoice";
import { useDispatch, useSelector } from "react-redux";
import { fetchBillByBookingId } from "../../../slices/BillSlice";

const BillGeneration = ({ booking, onClose, onConfirm, bill }) => {
  const [isBillGenerated, setIsBillGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isZenithInvoiceOpen, setIsZenithInvoiceOpen] = useState(false);
  const [isCheckingBill, setIsCheckingBill] = useState(true);

  const dispatch = useDispatch();
  const billState = useSelector((state) => state.bills);
  const existingBill = billState?.bill;
  const billLoading = billState?.loading;

  useEffect(() => {
    if (booking?.id) {
      setIsCheckingBill(true);
      dispatch(fetchBillByBookingId(booking.id)).finally(() => {
        setIsCheckingBill(false);
      });
    }
  }, [booking, dispatch]);

  useEffect(() => {
    if (existingBill) {
      setIsBillGenerated(true);
    }
  }, [existingBill]);

  useEffect(() => {
    if (isSuccessModalOpen) {
      const timer = setTimeout(() => {
        setIsSuccessModalOpen(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccessModalOpen]);

  if (!booking) {
    return null;
  }

  const handleGenerateBill = async () => {
    try {
      if (!booking || !booking.id) {
        console.error("Cannot generate bill: booking ID is undefined");
        return;
      }
      setIsLoading(true);
      await onConfirm(booking.id);
      setIsBillGenerated(true);
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Error generating bill:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewBill = () => {
    setIsZenithInvoiceOpen(true);
  };

  return (
    <>
      <Card className="bg-white border border-gray-100">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <div>
                  <Label className="text-xs text-gray-600">Booking No.</Label>
                  <div className="mt-1 text-sm">{booking.bookingNumber}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Booking Type</Label>
                  <div className="mt-1 text-sm">{booking.bookingType}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Property</Label>
                  <div className="mt-1 text-sm">{booking.property?.name}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Guest Name</Label>
                  <div className="mt-1 text-sm">{booking.guestName}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Phone Number</Label>
                  <div className="mt-1 text-sm">{booking.phoneNumber}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Email Address</Label>
                  <div className="mt-1 text-sm">{booking.email}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <Label className="text-xs text-gray-600">Check-In Date</Label>
                  <div className="mt-1 text-sm">
                    {new Date(booking.checkInDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">
                    Booking Amount
                  </Label>
                  <div className="mt-1 text-sm">{booking.bookingAmount}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">
                    Number of Rooms
                  </Label>
                  <div className="mt-1 text-sm">{booking.numberOfRooms}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">
                    Occupancy Type
                  </Label>
                  <div className="mt-1 text-sm">{booking.occupancyType}</div>
                </div>
                {booking.occupancyType === "CUSTOM" && (
                  <div>
                    <Label className="text-xs text-gray-600">
                      Custom Occupancy
                    </Label>
                    <div className="mt-1 text-sm">
                      {booking.customOccupancy}
                    </div>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-gray-600">
                    Booking Status
                  </Label>
                  <div className="mt-1 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full font-semibold ${
                        booking.bookingStatus === "PROFORMA"
                          ? "bg-yellow-50 text-yellow-700"
                          : booking.bookingStatus === "CONFIRMED"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {booking.bookingStatus}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Billing Type</Label>
                  <div className="mt-1 text-sm">{booking.billingType}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <Label className="text-xs text-gray-600">
                    Check-Out Date
                  </Label>
                  <div className="mt-1 text-sm">
                    {new Date(booking.checkOutDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">
                    Advance Amount
                  </Label>
                  <div className="mt-1 text-sm">{booking.advanceAmount}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Payment Mode</Label>
                  <div className="mt-1 text-sm">{booking.paymentMode}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Total Amount</Label>
                  <div className="mt-1 text-sm">
                    ₹{booking.totalBillAmount?.toFixed(2) || "0.00"}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">
                    Food GST Amount
                  </Label>
                  <div className="mt-1 text-sm">
                    ₹{booking.foodGSTAmount || "0.00"}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">
                    Stay GST Amount
                  </Label>
                  <div className="mt-1 text-sm">
                    ₹{booking.stayGSTAmount?.toFixed(2) || "0.00"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-8 pt-5">
              <Button
                variant="outline"
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </Button>

              {isCheckingBill ? (
                <Button disabled className="bg-gray-400 text-white">
                  Checking Bill Status...
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleGenerateBill}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Generating..." : "Generate Bill"}
                  </Button>

                  {isBillGenerated && (
                    <Button
                      onClick={handleViewBill}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      View Bill
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && <Loader />}

      <SuccessModal
        isOpen={isSuccessModalOpen}
        message="Bill generated successfully!"
        onClose={() => setIsSuccessModalOpen(false)}
      />

      {isZenithInvoiceOpen && (
        <ZenithInvoice
          booking={booking}
          onClose={() => setIsZenithInvoiceOpen(false)}
        />
      )}
    </>
  );
};

export default BillGeneration;
