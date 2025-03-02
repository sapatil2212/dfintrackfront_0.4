"use client";

import React, { useEffect, useState } from "react";
import {
  Wallet,
  MoreVertical,
  CreditCard,
  Receipt,
  Calendar,
  CircleChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ExpenseService from "../../services/ExpenseService";
import { useDispatch, useSelector } from "react-redux";
import RevenueChart from "./DashboardHomeComp/RevenueChart";
import ExpensesChart from "./DashboardHomeComp/ExpensesChart";
import BookingGraph from "./DashboardHomeComp/BookingGraph";
import BankAccountGraph from "./DashboardHomeComp/BankAccountGraph";
import {
  fetchBankAccounts,
  fetchAllTransactions,
  fetchBankAccountTransactions,
} from "../../slices/BankAccountSlice";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import AnalyticsDashboard from "./DashboardHomeComp/BookingGraph";

export default function DashboardMetrics() {
  const [bookings, setBookings] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString("default", { month: "short" });

  // Available months for filtering
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Generate previous 5 years (including current)
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Redux state for bank accounts and transactions
  const dispatch = useDispatch();
  const { accounts, transactions, allTransactions, status } = useSelector(
    (state) => state.bankAccounts
  );

  // Revenue card state
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [revenueMonth, setRevenueMonth] = useState(currentMonth);
  const [revenueYear, setRevenueYear] = useState(currentYear);
  const [displayRevenue, setDisplayRevenue] = useState(0);

  // Expense card state
  const [expenseMonth, setExpenseMonth] = useState(currentMonth);
  const [expenseYear, setExpenseYear] = useState(currentYear);

  // Booking chart state
  const [bookingMonth, setBookingMonth] = useState(currentMonth);
  const [bookingYear, setBookingYear] = useState(currentYear);

  // Monthly target state
  const [targetMonth, setTargetMonth] = useState(currentMonth);
  const [targetYear, setTargetYear] = useState(currentYear);

  // Growth percentage state
  const [revenueGrowthPercentage, setRevenueGrowthPercentage] = useState(0);
  const [expenseGrowthPercentage, setExpenseGrowthPercentage] = useState(0);

  // Helper function to calculate growth percentage
  const calculateGrowthPercentage = (currentValue, previousValue) => {
    if (previousValue === 0) {
      return 0; // Avoid division by zero
    }
    return ((currentValue - previousValue) / previousValue) * 100;
  };

  // Helper function to get previous month's data
  const getPreviousMonthData = (data, currentMonthIndex) => {
    const previousMonthIndex =
      currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
    return data[previousMonthIndex];
  };

  // Get the last 12 months
  const getLast12Months = () => {
    const months = [];
    const date = new Date();
    for (let i = 11; i >= 0; i--) {
      const tempDate = new Date(date);
      tempDate.setMonth(date.getMonth() - i);
      months.push(tempDate.toLocaleString("default", { month: "short" }));
    }
    return months;
  };

  // Calculate monthly revenue data
  const calculateMonthlyRevenue = () => {
    const last12Months = getLast12Months();
    const monthlyRevenue = Array(12).fill(0);

    allTransactions.forEach((transaction) => {
      if (transaction.transactionType === "CREDIT") {
        const transactionDate = new Date(
          transaction.transactionDate || transaction.date
        );
        const transactionMonth = transactionDate.toLocaleString("default", {
          month: "short",
        });

        const monthIndex = last12Months.indexOf(transactionMonth);
        if (monthIndex !== -1) {
          monthlyRevenue[monthIndex] += transaction.amount;
        }
      }
    });

    return last12Months.map((month, index) => ({
      name: month,
      revenue: monthlyRevenue[index],
    }));
  };

  const revenueData = calculateMonthlyRevenue();

  // Calculate monthly expenses data
  const calculateMonthlyExpenses = () => {
    const last12Months = getLast12Months();
    const monthlyExpenses = Array(12).fill(0);

    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);
      const expenseMonth = expenseDate.toLocaleString("default", {
        month: "short",
      });

      const monthIndex = last12Months.indexOf(expenseMonth);
      if (monthIndex !== -1) {
        monthlyExpenses[monthIndex] += expense.amount;
      }
    });

    return last12Months.map((month, index) => ({
      name: month,
      expenses: monthlyExpenses[index],
    }));
  };

  const expensesData = calculateMonthlyExpenses();

  // Calculate growth percentages
  useEffect(() => {
    if (!loading) {
      const currentMonthIndex = months.indexOf(revenueMonth);
      const currentRevenue = revenueData[currentMonthIndex]?.revenue || 0;
      const previousRevenue =
        getPreviousMonthData(revenueData, currentMonthIndex)?.revenue || 0;

      // Calculate revenue growth percentage
      const revenueGrowth = calculateGrowthPercentage(
        currentRevenue,
        previousRevenue
      );
      setRevenueGrowthPercentage(revenueGrowth);

      const currentExpense = expensesData[currentMonthIndex]?.expenses || 0;
      const previousExpense =
        getPreviousMonthData(expensesData, currentMonthIndex)?.expenses || 0;

      // Calculate expense growth percentage
      const expenseGrowth = calculateGrowthPercentage(
        currentExpense,
        previousExpense
      );
      setExpenseGrowthPercentage(expenseGrowth);
    }
  }, [revenueMonth, expenseMonth, loading, revenueData, expensesData]);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [dispatch]);

  const fetchData = async () => {
    try {
      // Fetch expenses data
      const expensesData = await ExpenseService.getExpenses();

      // Fetch bank accounts and transactions
      await dispatch(fetchBankAccounts());
      await dispatch(fetchAllTransactions());

      // Mock bookings data
      const bookingsData = [
        { month: "Jan", value: 45 },
        { month: "Feb", value: 55 },
        { month: "Mar", value: 60 },
        { month: "Apr", value: 50 },
        { month: "May", value: 65 },
        { month: "Jun", value: 75 },
      ];

      // Mock revenue data
      const revenueData = expensesData.map((expense) => ({
        id: expense.id,
        amount: expense.amount * 1.5,
        date: expense.date,
        month: new Date(expense.date).toLocaleString("default", {
          month: "short",
        }),
      }));

      setBookings(bookingsData);
      setExpenses(expensesData);
      setRevenue(revenueData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      // Initialize revenue display after data loading
      updateDisplayRevenue(null, revenueMonth, revenueYear);
    }
  };

  // Handle month selection for revenue card
  const handleRevenueMonthSelect = (month) => {
    setRevenueMonth(month);
    updateDisplayRevenue(selectedAccount, month, revenueYear);
  };

  // Handle year selection for revenue card
  const handleRevenueYearSelect = (year) => {
    setRevenueYear(year);
    updateDisplayRevenue(selectedAccount, revenueMonth, year);
  };

  // Handle month selection for expense card
  const handleExpenseMonthSelect = (month) => {
    setExpenseMonth(month);
  };

  // Handle year selection for expense card
  const handleExpenseYearSelect = (year) => {
    setExpenseYear(year);
  };

  // Handle month selection for booking chart
  const handleBookingMonthSelect = (month) => {
    setBookingMonth(month);
  };

  // Handle year selection for booking chart
  const handleBookingYearSelect = (year) => {
    setBookingYear(year);
  };

  // Handle month selection for monthly target card
  const handleTargetMonthSelect = (month) => {
    setTargetMonth(month);
  };

  // Handle year selection for monthly target card
  const handleTargetYearSelect = (year) => {
    setTargetYear(year);
  };

  // Update displayed revenue based on selected account, month, and year
  const updateDisplayRevenue = (account, month, year) => {
    // Get month number (0-based) from month name
    const monthIndex = months.indexOf(month);

    if (account) {
      // Filter transactions by account, month, and year
      const filteredTransactions = transactions.filter((transaction) => {
        const transactionDate = new Date(
          transaction.transactionDate || transaction.date
        );
        return (
          transaction.transactionType === "CREDIT" &&
          transactionDate.getMonth() === monthIndex &&
          transactionDate.getFullYear() === year
        );
      });

      const accountRevenue = filteredTransactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      );
      setDisplayRevenue(accountRevenue);
    } else {
      // Calculate total revenue for the selected month from all accounts
      const filteredTransactions = allTransactions.filter((transaction) => {
        const transactionDate = new Date(
          transaction.transactionDate || transaction.date
        );
        return (
          transaction.transactionType === "CREDIT" &&
          transactionDate.getMonth() === monthIndex &&
          transactionDate.getFullYear() === year
        );
      });

      const totalCreditAmount = filteredTransactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      );
      setDisplayRevenue(totalCreditAmount);
    }
  };

  // Update display revenue when transactions, selected account, month, or year changes
  useEffect(() => {
    if (!loading) {
      updateDisplayRevenue(selectedAccount, revenueMonth, revenueYear);
    }
  }, [
    selectedAccount,
    revenueMonth,
    revenueYear,
    transactions,
    allTransactions,
    loading,
  ]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Calculate total expenses for the expense card month and year
  const totalExpensesForMonth = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      const expenseMonthValue = expenseDate.toLocaleString("default", {
        month: "short",
      });
      return (
        expenseMonthValue === expenseMonth &&
        expenseDate.getFullYear() === expenseYear
      );
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate total expenses for the target card month and year
  const totalExpensesForTargetMonth = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      const expenseMonthValue = expenseDate.toLocaleString("default", {
        month: "short",
      });
      return (
        expenseMonthValue === targetMonth &&
        expenseDate.getFullYear() === targetYear
      );
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate revenue for target card
  const targetCardRevenue = (() => {
    if (selectedAccount) {
      const filteredTransactions = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        const transactionMonth = transactionDate.toLocaleString("default", {
          month: "short",
        });
        return (
          transaction.transactionType === "CREDIT" &&
          transactionMonth === targetMonth &&
          transactionDate.getFullYear() === targetYear
        );
      });
      return filteredTransactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      );
    } else {
      const filteredTransactions = allTransactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        const transactionMonth = transactionDate.toLocaleString("default", {
          month: "short",
        });
        return (
          transaction.transactionType === "CREDIT" &&
          transactionMonth === targetMonth &&
          transactionDate.getFullYear() === targetYear
        );
      });
      return filteredTransactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      );
    }
  })();

  // Find the maximum value for scaling the booking chart
  const maxValue = Math.max(...bookings.map((item) => item.value));

  // Determine revenue title
  const revenueTitle = selectedAccount
    ? `${selectedAccount.accountHolderName} - ${revenueMonth} ${revenueYear}`
    : `Total Revenue - ${revenueMonth} ${revenueYear}`;

  // Create calendar dropdown with month and year selection
  const CalendarDropdown = ({
    currentMonth,
    currentYear,
    onMonthSelect,
    onYearSelect,
  }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="text-slate-400 hover:text-slate-600 rounded-full p-1 hover:bg-slate-100 transition-colors">
          <Calendar className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white">
        <div className="px-2 py-1.5 flex justify-between items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-sm px-2 py-1 bg-slate-100 rounded hover:bg-slate-200 transition-colors flex items-center gap-1">
                <span>{currentYear}</span>
                <CircleChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="bg-white">
              <div className="max-h-40 overflow-y-auto">
                {availableYears.map((year) => (
                  <div
                    key={year}
                    onClick={() => onYearSelect(year)}
                    className={`px-2 py-1 text-sm cursor-pointer rounded hover:bg-slate-100 ${
                      currentYear === year ? "bg-slate-100 font-medium" : ""
                    }`}
                  >
                    {year}
                  </div>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <DropdownMenuSeparator />

        <div className="px-2 py-1">
          <div className="max-h-52 overflow-y-auto">
            {months.map((month) => (
              <div
                key={month}
                onClick={() => onMonthSelect(month)}
                className={`px-2 py-1 text-sm cursor-pointer rounded hover:bg-slate-100 ${
                  currentMonth === month ? "bg-slate-100 font-medium" : ""
                }`}
              >
                {month}
              </div>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {/* Total Revenue Card */}
      <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <div className="flex items-center">
            <Wallet className="h-5 w-5 text-emerald-500 mr-2" />
            <h3 className="font-semibold text-slate-800">{revenueTitle}</h3>
          </div>

          <div className="flex items-center space-x-2">
            {/* Calendar Dropdown for Revenue Card */}
            <CalendarDropdown
              currentMonth={revenueMonth}
              currentYear={revenueYear}
              onMonthSelect={handleRevenueMonthSelect}
              onYearSelect={handleRevenueYearSelect}
            />
          </div>
        </CardHeader>

        <CardContent className="pt-6 pb-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              ₹{displayRevenue.toFixed(2)}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`text-sm font-medium flex items-center px-2 py-1 rounded-full ${
                  revenueGrowthPercentage >= 0
                    ? "text-emerald-500 bg-emerald-50"
                    : "text-red-500 bg-red-50"
                }`}
              >
                {revenueGrowthPercentage >= 0 ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3 h-3 mr-1"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3 h-3 mr-1"
                  >
                    <path
                      fillRule="evenodd"
                      d="M1.22 5.222a.75.75 0 011.06 0L7 9.942l3.768-3.769a.75.75 0 011.113.058 20.908 20.908 0 013.813 7.254l1.574-2.727a.75.75 0 011.3.75l-2.475 4.286a.75.75 0 01-1.025.275l-4.287-2.475a.75.75 0 01.75-1.3l2.71 1.565a19.422 19.422 0 00-3.013-6.024L7.53 11.533a.75.75 0 01-1.06 0l-5.25-5.25a.75.75 0 010-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {revenueGrowthPercentage.toFixed(2)}%
              </span>
              <span className="text-xs text-slate-500">
                from previous month
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Card */}
      <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <div className="flex items-center">
            <Receipt className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="font-semibold text-slate-800">
              Expenses - {expenseMonth} {expenseYear}
            </h3>
          </div>

          <CalendarDropdown
            currentMonth={expenseMonth}
            currentYear={expenseYear}
            onMonthSelect={handleExpenseMonthSelect}
            onYearSelect={handleExpenseYearSelect}
          />
        </CardHeader>

        <CardContent className="pt-6 pb-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              ₹{totalExpensesForMonth.toFixed(2)}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`text-sm font-medium flex items-center px-2 py-1 rounded-full ${
                  expenseGrowthPercentage >= 0
                    ? "text-emerald-500 bg-emerald-50"
                    : "text-red-500 bg-red-50"
                }`}
              >
                {expenseGrowthPercentage >= 0 ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3 h-3 mr-1"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3 h-3 mr-1"
                  >
                    <path
                      fillRule="evenodd"
                      d="M1.22 5.222a.75.75 0 011.06 0L7 9.942l3.768-3.769a.75.75 0 011.113.058 20.908 20.908 0 013.813 7.254l1.574-2.727a.75.75 0 011.3.75l-2.475 4.286a.75.75 0 01-1.025.275l-4.287-2.475a.75.75 0 01.75-1.3l2.71 1.565a19.422 19.422 0 00-3.013-6.024L7.53 11.533a.75.75 0 01-1.06 0l-5.25-5.25a.75.75 0 010-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {expenseGrowthPercentage.toFixed(2)}%
              </span>
              <span className="text-xs text-slate-500">
                from previous month
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Target Card */}
      <Card className="overflow-hidden row-span-2 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="h-full flex flex-col gap-4">
          {/* Equal Height Container */}
          <div className="flex flex-col flex-grow gap-4 mt-5">
            {/* First Box (Revenue) */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200 flex-grow flex flex-col">
              <p>Revenue Insights</p>
              {/* Revenue Chart */}
              <div className="h-44 mt-2 flex-grow">
                <RevenueChart data={calculateMonthlyRevenue()} />
              </div>
            </div>

            {/* Second Box (Expenses) */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200 flex-grow flex flex-col">
              <p>Expense Insights</p>
              {/* Expenses Chart */}
              <div className="h-44 mt-2 flex-grow">
                <ExpensesChart data={expensesData} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Left Card - Bookings Chart */}
      <Card className="col-span-1 md:col-span-1 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="pb-6">
          <BankAccountGraph />
        </CardContent>
      </Card>

      {/* Right Card - Chart Controls */}
      <Card className="col-span-1 md:col-span-1 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="pb-6">
          <BookingGraph />
        </CardContent>
      </Card>
    </div>
  );
}
