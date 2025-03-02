import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Pencil,
  Trash2,
  PlusCircle,
  Building,
  User,
  CreditCard,
} from "lucide-react";
import {
  editBankAccount,
  fetchBankAccounts,
  createBankAccount,
  removeBankAccount,
} from "../../slices/BankAccountSlice";
import SuccessModal from "../../components/SuccessModal";
import DeleteModal from "../../components/DeleteModel";
import Loader from "../../components/Loaders/Loader";
import AddBankAccountModal from "../../privatePages/pages/BankAccounts/AddBankAccountModal";
import EditBankAccount from "../../privatePages/pages/BankAccounts/EditBankAccount";
import ViewBankAccount from "./BankAccounts/ViewBankAccount";
import { motion, AnimatePresence } from "framer-motion";
import "../pages/BankAccounts/BankAccountManager.css";

const BankAccountManager = () => {
  const dispatch = useDispatch();
  const {
    accounts = [],
    status,
    error,
  } = useSelector((state) => state.bankAccounts);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleView = (account) => {
    setSelectedAccount(account);
    setIsViewModalOpen(true);
  };

  const handleViewToEdit = (account) => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    setLoading(true);
    dispatch(fetchBankAccounts());
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [dispatch]);

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setSuccessModalOpen(true);
    setTimeout(() => {
      setSuccessModalOpen(false);
    }, 2000);
  };

  const handleDelete = (account) => {
    setAccountToDelete(account);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (accountToDelete) {
      try {
        await dispatch(removeBankAccount(accountToDelete.id)).unwrap();
        showSuccessMessage("Bank account deleted successfully!");
        setIsDeleteModalOpen(false);
        dispatch(fetchBankAccounts());
      } catch (error) {
        console.error("Error deleting account:", error);
      }
    }
  };

  const handleAddAccount = async (accountData) => {
    try {
      await dispatch(createBankAccount(accountData)).unwrap();
      showSuccessMessage("Bank account added successfully!");
      setIsAddModalOpen(false);
      dispatch(fetchBankAccounts());
    } catch (error) {
      console.error("Error adding account:", error);
    }
  };

  const handleEdit = (account) => {
    setSelectedAccount(account);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (accountData) => {
    try {
      await dispatch(
        editBankAccount({
          id: accountData.id,
          bankAccount: accountData,
        })
      ).unwrap();
      showSuccessMessage("Bank account updated successfully!");
      setIsEditModalOpen(false);
      setSelectedAccount(null);
      dispatch(fetchBankAccounts());
    } catch (error) {
      console.error("Error updating account:", error);
    }
  };

  if (status === "loading") return <Loader />;
  if (status === "failed") return <div>Error: {error}</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`bank-account-manager p-6 bg-white rounded-xl m-3 border ${
        successModalOpen ? "blur-background" : ""
      }`}
    >
      <div className="flex justify-between items-center mb-6  ">
        <h2 className="text-2xl font-semibold text-gray-800">Bank Accounts</h2>
        <Button
          variant="default"
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-700 hover:bg-blue-800 text-white rounded-full px-4 py-2"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add New Account
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(accounts) && accounts.length > 0 ? (
          accounts.map((account) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <Building className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {account.bankName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {account.accountType} Account
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    <span className="text-sm">{account.accountHolderName}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <CreditCard className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      •••• {account.accountNumber.slice(-4)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">Balance</p>
                    <p className="text-xl font-bold text-green-600">
                      ₹ {account.balance?.toLocaleString("en-IN") || "0.00"}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      className="p-2 rounded-full border border-gray-200 hover:bg-gray-50"
                      onClick={() => handleView(account)}
                    >
                      <Eye className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="outline"
                      className="p-2 rounded-full border border-gray-200 hover:bg-gray-50"
                      onClick={() => handleEdit(account)}
                    >
                      <Pencil className="h-4 w-4 text-amber-600" />
                    </Button>
                    <Button
                      variant="outline"
                      className="p-2 rounded-full border border-gray-200 hover:bg-gray-50"
                      onClick={() => handleDelete(account)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3">
                <p className="text-xs text-gray-500">ID: {account.id}</p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-xl p-8 text-center">
            <div className="flex flex-col items-center justify-center">
              <CreditCard className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500">No accounts found</p>
              <Button
                className="mt-4 bg-blue-700 hover:bg-blue-800 text-white"
                onClick={() => setIsAddModalOpen(true)}
              >
                Add Your First Account
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModalOpen}
        message={successMessage}
        onClose={() => setSuccessModalOpen(false)}
      />

      {/* Delete Modal */}
      <DeleteModal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setAccountToDelete(null);
        }}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this account? This action cannot be undone."
      />

      {/* Add Bank Account Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddBankAccountModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSubmit={handleAddAccount}
          />
        )}
      </AnimatePresence>

      {/* Edit Bank Account Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <EditBankAccount
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedAccount(null);
            }}
            onSubmit={handleEditSubmit}
            account={selectedAccount}
          />
        )}
      </AnimatePresence>

      {/* View Bank Account Modal */}
      <AnimatePresence>
        {isViewModalOpen && (
          <ViewBankAccount
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            onEditClick={(account) => {
              setIsViewModalOpen(false);
              setIsEditModalOpen(true);
            }}
            account={selectedAccount}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BankAccountManager;
