import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBankAccounts,
  fetchBankAccountTransactions,
  fetchAllTransactions,
} from "../../../slices/BankAccountSlice";

const BankAccountGraph = () => {
  const dispatch = useDispatch();
  const [isBankAccountDropdownOpen, setIsBankAccountDropdownOpen] =
    useState(false);
  const [selectedBankAccount, setSelectedBankAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const { accounts, allTransactions, status, error } = useSelector(
    (state) => state.bankAccounts
  );

  useEffect(() => {
    dispatch(fetchBankAccounts());
    dispatch(fetchAllTransactions()); // Fetch all transactions by default
  }, [dispatch]);

  useEffect(() => {
    if (selectedBankAccount) {
      dispatch(fetchBankAccountTransactions(selectedBankAccount.id))
        .unwrap()
        .then((data) => setTransactions(data))
        .catch((error) =>
          console.error("Failed to fetch transactions:", error)
        );
    } else {
      // Use all transactions if no bank account is selected
      setTransactions(allTransactions);
    }
  }, [selectedBankAccount, dispatch, allTransactions]);

  const toggleBankAccountDropdown = () => {
    setIsBankAccountDropdownOpen(!isBankAccountDropdownOpen);
  };

  const selectBankAccount = (account) => {
    setSelectedBankAccount(account);
    setIsBankAccountDropdownOpen(false);
  };

  const clearBankAccountSelection = () => {
    setSelectedBankAccount(null);
    setIsBankAccountDropdownOpen(false);
  };

  // Get transactions for the last three days
  const getLastThreeDaysTransactions = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const dayBeforeYesterday = new Date(today);
    dayBeforeYesterday.setDate(today.getDate() - 2);

    const formatDate = (date) => date.toISOString().split("T")[0];

    const todayTransactions = transactions.filter(
      (t) => formatDate(new Date(t.transactionDate)) === formatDate(today)
    );
    const yesterdayTransactions = transactions.filter(
      (t) => formatDate(new Date(t.transactionDate)) === formatDate(yesterday)
    );
    const dayBeforeYesterdayTransactions = transactions.filter(
      (t) =>
        formatDate(new Date(t.transactionDate)) ===
        formatDate(dayBeforeYesterday)
    );

    return [
      { day: "Today", transactions: todayTransactions },
      { day: "Yesterday", transactions: yesterdayTransactions },
      {
        day: "Day Before Yesterday",
        transactions: dayBeforeYesterdayTransactions,
      },
    ];
  };

  const lastThreeDaysData = getLastThreeDaysTransactions();

  // Calculate income (credit) and expense (debit) for each day
  const calculateIncomeAndExpense = (transactions) => {
    const income = transactions
      .filter((t) => t.transactionType === "CREDIT")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter((t) => t.transactionType === "DEBIT")
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense };
  };

  const data = lastThreeDaysData.map((dayData) => {
    const { income, expense } = calculateIncomeAndExpense(dayData.transactions);
    return {
      day: dayData.day,
      income,
      expense,
    };
  });

  const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
  const totalExpense = data.reduce((sum, item) => sum + item.expense, 0);
  const profit = totalIncome - totalExpense;
  const profitRate = ((profit / totalIncome) * 100).toFixed(1);

  const maxValue = Math.max(
    ...data.map((item) => Math.max(item.income, item.expense))
  );

  return (
    <div className="w-full max-w-md bg-white p-4 font-poppins mt-5">
      {/* Profit Section */}
      <div className="border-b pb-3">
        <div className="flex justify-between items-start mb-1">
          <div>
            <p className="text-gray-500 text-xs font-medium">Profit</p>
            <h2 className="text-sm font-bold text-gray-900">
              ₹{profit.toLocaleString()}
            </h2>
          </div>
          <div className="relative">
            <button
              onClick={toggleBankAccountDropdown}
              className="bg-gray-100 hover:bg-gray-200 transition-colors text-gray-800 text-xs px-2 py-1 rounded-md flex items-center"
            >
              <span>
                {selectedBankAccount
                  ? selectedBankAccount.accountHolderName
                  : "All Accounts"}
              </span>
              <ChevronDown size={12} className="ml-1" />
            </button>

            {isBankAccountDropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-md border border-gray-200 z-10">
                <ul className="py-1">
                  <li
                    className="px-2 py-1 text-xs hover:bg-gray-100 cursor-pointer"
                    onClick={clearBankAccountSelection}
                  >
                    All Accounts
                  </li>
                  {accounts.map((account) => (
                    <li
                      key={account.id}
                      className="px-2 py-1 text-xs hover:bg-gray-100 cursor-pointer"
                      onClick={() => selectBankAccount(account)}
                    >
                      {account.accountHolderName}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Income & Expense Section */}
      <div className="py-3 flex items-center justify-between border-b">
        <div className="flex-1 pr-3 border-r border-gray-200">
          <p className="text-gray-500 text-xs font-medium">Income</p>
          <p className="text-base font-bold text-emerald-500">
            ₹{totalIncome.toLocaleString()}
          </p>
        </div>
        <div className="flex-1 pl-3">
          <p className="text-gray-500 text-xs font-medium">Expense</p>
          <p className="text-base font-bold text-red-500">
            -₹{totalExpense.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Bar Chart Section */}
      <div className="py-3 space-y-2">
        {data.map((item) => {
          const { income, expense } = calculateIncomeAndExpense(
            lastThreeDaysData.find((d) => d.day === item.day).transactions
          );
          return (
            <div key={item.day} className="flex flex-col">
              <div className="flex items-center">
                <span className="w-24 text-xs text-gray-600 font-medium">
                  {item.day}
                </span>
                <div className="flex-1 relative">
                  {/* Income bar */}
                  <div
                    className="h-2 bg-emerald-500 rounded-md"
                    style={{ width: `${(income / maxValue) * 100}%` }}
                  ></div>

                  {/* Expense bar */}
                  <div
                    className="h-2 bg-red-400 rounded-md mt-1"
                    style={{ width: `${(expense / maxValue) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="pl-24 flex justify-between text-xs text-gray-500 mt-1">
                <span>₹{income.toLocaleString()}</span>
                <span>₹{expense.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend Section */}
      <div className="flex items-center justify-center mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center mr-4">
          <div className="w-2 h-2 bg-emerald-500 rounded-sm mr-1"></div>
          <span className="text-xs text-gray-600">Income</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-red-400 rounded-sm mr-1"></div>
          <span className="text-xs text-gray-600">Expense</span>
        </div>
      </div>
    </div>
  );
};

export default BankAccountGraph;
