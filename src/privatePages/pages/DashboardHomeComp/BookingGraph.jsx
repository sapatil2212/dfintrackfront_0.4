"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import {
  setBookings,
  setLoading,
  setError,
} from "../../../slices/BookingSlice";
import bookingService from "../../../services/BookingService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const BookingGraph = () => {
  const dispatch = useDispatch();

  // Fetch bookings from the Redux store
  const bookings = useSelector((state) => state.bookings.bookings || []);
  const loading = useSelector((state) => state.bookings.loading);
  const error = useSelector((state) => state.bookings.error);

  useEffect(() => {
    // Fetch all bookings when the component mounts
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

    fetchBookings();
  }, [dispatch]);

  // Process data to get recent 5 bookings
  const recentBookings = bookings
    .slice(-5) // Get the last 5 bookings
    .map((booking) => ({
      id: booking.id, // Booking ID
      guestName: booking.guestName || "N/A", // Guest Name
      status: booking.bookingStatus || "N/A", // Booking Status
    }));

  return (
    <div className="h-full w-full mt-4">
      {" "}
      {/* Added mt-4 for spacing from top */}
      <Card className="h-full w-full border-0">
        {" "}
        {/* Removed shadow and border */}
        <CardContent className="p-6 h-full">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground">
                  Recent Bookings
                </span>
              </div>
            </div>
          </div>
          <div className="h-[calc(100%-48px)] w-full overflow-auto rounded-lg border border-gray-200 p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-gray-500">Loading...</p>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-red-500">Error: {error}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Guest Name</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{booking.id}</TableCell>
                        <TableCell>{booking.guestName}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              booking.status === "PROFORMA"
                                ? "bg-yellow-50 text-yellow-700"
                                : booking.status === "CONFIRMED"
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4">
                        No recent bookings found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingGraph;
