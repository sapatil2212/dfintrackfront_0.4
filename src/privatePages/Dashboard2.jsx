import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Sidebar from "../privatePages/privateComponents/Sidebar";
import DashboardHome from "../privatePages/pages/DashboardHome";
import Revenue from "../privatePages/pages/Revenue";
import Expenses from "../privatePages/pages/Expenses";
import Properties from "../privatePages/pages/Properties";
import ManageUser from "../privatePages/pages/ManageUser";
import Settings from "../privatePages/pages/Settings";
import Bookings from "../privatePages/pages/Booking";
import CustomerMaster from "../privatePages/pages/CustomerMaster";
import PrivateHeader from "../privatePages/privateComponents/privateHeader";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "../slices/UserSlices";
import BankAccounts from "./pages/BankAccounts";

const INACTIVITY_TIMEOUT = 600000;

const Dashboard2 = () => {
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const isAuthenticated =
    localStorage.getItem("isAuthenticated") === "true" &&
    user &&
    localStorage.getItem("sessionExpired") !== "true";

  useEffect(() => {
    // If session is already expired, show modal
    if (localStorage.getItem("sessionExpired") === "true") {
      setShowInactivityModal(true);
      setIsTimerPaused(true);
      return;
    }

    let inactivityTimer;

    const resetTimer = () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }

      if (!isTimerPaused) {
        inactivityTimer = setTimeout(() => {
          localStorage.setItem("sessionExpired", "true");
          setShowInactivityModal(true);
          setIsTimerPaused(true);
        }, INACTIVITY_TIMEOUT);
      }
    };

    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      document.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, [isTimerPaused]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("refreshToken");
    localStorage.setItem("sessionExpired", "true");

    dispatch(logOut());
    setShowInactivityModal(false);

    navigate("/login", {
      state: {
        inactivityLogout: true,
        message: "Session expired due to inactivity",
      },
    });
  };

  const handleLoginNow = () => {
    // Remove session-related data
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("sessionExpired");

    // Redirect to login page
    navigate("/login", {
      state: {
        immediateLogin: true,
        message: "Please log in again to continue.",
      },
    });
  };

  // Show expired session modal but don't redirect automatically
  if (localStorage.getItem("sessionExpired") === "true") {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md text-center relative z-50">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Session Expired
          </h3>
          <p className="text-gray-600 mb-8">
            Your session has expired due to inactivity. Please log in again to
            continue.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleLoginNow}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 font-semibold"
            >
              Log in Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen overflow-hidden relative font-poppins">
      <Sidebar userRole={user.accountType} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PrivateHeader />
        <main className="flex-1 overflow-y-auto bg-lightBlue p-6">
          <Routes>
            <Route path="/" element={<Navigate to="home" />} />
            <Route path="home" element={<DashboardHome />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="settings" element={<Settings />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="properties" element={<Properties />} />
            <Route path="ManageUser" element={<ManageUser />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="customer-master" element={<CustomerMaster />} />
            <Route path="bankAccounts" element={<BankAccounts />} />
            <Route path="*" element={<Navigate to="home" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard2;
