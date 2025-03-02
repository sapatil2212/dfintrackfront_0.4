import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { format, parseISO } from "date-fns";

const BookingDetailsModal = ({ booking, onClose }) => {
  if (!booking) return null;

  const formatBookingDateTime = (dateTimeString) => {
    try {
      const dateTime = parseISO(dateTimeString);
      return format(dateTime, "MMM d, yyyy 'at' h:mm a");
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateTimeString;
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      // Get day as number
      const day = date.getDate();

      // Get month as uppercase abbreviated name
      const month = date
        .toLocaleString("en-US", { month: "short" })
        .toUpperCase();

      // Get full year
      const year = date.getFullYear();

      // Combine in desired format
      return `${day} ${month} ${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };
  return (
    <Card className="bg-white shadow-sm border border-gray-100">
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Grid Layout for Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Column 1 */}
            <div className="space-y-2">
              {/* Booking Type */}
              <div>
                <Label className="text-xs text-gray-600">Booking Type</Label>
                <div className="mt-1 text-sm">{booking.bookingType}</div>
              </div>

              {/* Property */}
              <div>
                <Label className="text-xs text-gray-600">Property</Label>
                <div className="mt-1 text-sm">{booking.property?.name}</div>
              </div>

              {/* Guest Name */}
              <div>
                <Label className="text-xs text-gray-600">Guest Name</Label>
                <div className="mt-1 text-sm">{booking.guestName}</div>
              </div>

              {/* Phone Number */}
              <div>
                <Label className="text-xs text-gray-600">Phone Number</Label>
                <div className="mt-1 text-sm">{booking.phoneNumber}</div>
              </div>

              {/* Email */}
              <div>
                <Label className="text-xs text-gray-600">Email Address</Label>
                <div className="mt-1 text-sm">{booking.email}</div>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Booking No.</Label>
                <div className="mt-1 text-sm">{booking.bookingNumber}</div>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-2">
              {/* Check-In Date */}
              <div>
                <Label className="text-xs text-gray-600">Check-In Date</Label>
                <div className="mt-1 text-sm">
                  {booking?.checkInDate
                    ? formatDate(booking.checkInDate)
                    : "Not specified"}
                </div>
              </div>

              {/* Booking Amount */}
              <div>
                <Label className="text-xs text-gray-600">Booking Amount</Label>
                <div className="mt-1 text-sm">{booking.bookingAmount}</div>
              </div>

              {/* Number of Rooms */}
              <div>
                <Label className="text-xs text-gray-600">Number of Rooms</Label>
                <div className="mt-1 text-sm">{booking.numberOfRooms}</div>
              </div>

              {/* Occupancy Type */}
              <div>
                <Label className="text-xs text-gray-600">Occupancy Type</Label>
                <div className="mt-1 text-sm">{booking.occupancyType}</div>
              </div>

              {/* Custom Occupancy (if applicable) */}
              {booking.occupancyType === "CUSTOM" && (
                <div>
                  <Label className="text-xs text-gray-600">
                    Custom Occupancy
                  </Label>
                  <div className="mt-1 text-sm">{booking.customOccupancy}</div>
                </div>
              )}

              {/* Booking Status */}
              <div>
                <Label className="text-xs text-gray-600">Booking Status</Label>
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

              {/* Booking Date */}
              <div>
                <Label className="text-xs text-gray-600">
                  Booking Date & Time
                </Label>
                <div className="mt-1 text-sm">
                  {booking?.bookingDateTime
                    ? formatBookingDateTime(booking.bookingDateTime)
                    : "Not specified"}
                </div>
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-2">
              {/* Check-Out Date */}
              <div>
                <Label className="text-xs text-gray-600">Check-Out Date</Label>
                <div className="mt-1 text-sm">
                  {booking?.checkOutDate
                    ? formatDate(booking.checkOutDate)
                    : "Not specified"}
                </div>
              </div>

              {/* Advance Amount */}
              <div>
                <Label className="text-xs text-gray-600">Advance Amount</Label>
                <div className="mt-1 text-sm">{booking.advanceAmount}</div>
              </div>

              {/* Bank Account */}
              <div>
                <Label className="text-xs text-gray-600">Bank Account</Label>
                <div className="mt-1 text-sm">
                  {booking.bankAccount?.accountHolderName}
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <Label className="text-xs text-gray-600">Payment Mode</Label>
                <div className="mt-1 text-sm">{booking.paymentMode}</div>
              </div>

              {/* Billing Type */}
              <div>
                <Label className="text-xs text-gray-600">Billing Type</Label>
                <div className="mt-1 text-sm">{booking.billingType}</div>
              </div>
            </div>
          </div>

          {/* Close Button 
          <div className="flex justify-end mt-4">
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-2 text-xs rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>*/}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingDetailsModal;
