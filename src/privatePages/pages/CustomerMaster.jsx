import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  Eye,
  Pencil,
  Trash2,
  PlusCircle,
  Download,
  Upload,
  ArrowUpDown,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  fetchCustomers,
  deleteCustomer,
  setSelectedCustomer,
  clearSelectedCustomer,
} from "../../slices/customerMasterSlice";
import ViewCustomerDetails from "../pages/CustomerMasterComp/ViewCustomerDetails";
import EditCustomerForm from "../pages/CustomerMasterComp/EditCustomerForm";
import SuccessModal from "../../components/SuccessModal";
import DeleteModal from "../../components/DeleteModel";
import CreateCustomer from "../pages/CustomerMasterComp/CreateCustomer";
import Pagination from "../pages/ExpenseComp/Pagination";

const CustomerMaster = () => {
  const dispatch = useDispatch();
  const {
    customers = [],
    status,
    error,
    selectedCustomer,
  } = useSelector((state) => state.customers);

  // State variables
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [selectedCustomers, setSelectedCustomers] = useState([]);

  // Pagination and Filtering States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Filtered and Sorted Customers
  const filteredCustomers = customers
    .filter(
      (customer) =>
        customer.companyName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        customer.companyEmail.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      const modifier = sortConfig.direction === "ascending" ? 1 : -1;
      return a[sortConfig.key] < b[sortConfig.key]
        ? -1 * modifier
        : a[sortConfig.key] > b[sortConfig.key]
        ? 1 * modifier
        : 0;
    });

  // Pagination Calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  // Export Data Function
  const exportData = (format) => {
    const fileName = `customers_${new Date().toISOString().split("T")[0]}`;

    try {
      switch (format) {
        case "csv": {
          const csv = Papa.unparse(filteredCustomers);
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `${fileName}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          showSuccessMessage(`Exported as ${fileName}.csv`);
          break;
        }
        case "excel": {
          const ws = XLSX.utils.json_to_sheet(filteredCustomers);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Customers");
          XLSX.writeFile(wb, `${fileName}.xlsx`);
          showSuccessMessage(`Exported as ${fileName}.xlsx`);
          break;
        }
        case "pdf": {
          const doc = new jsPDF();
          doc.text("Customers Report", 14, 10);
          const tableColumn = ["ID", "Company Name", "Email", "Contact Person"];
          const tableRows = filteredCustomers.map((customer) => [
            customer.id,
            customer.companyName,
            customer.companyEmail,
            customer.contactPersonName,
          ]);
          doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
          });
          doc.save(`${fileName}.pdf`);
          showSuccessMessage(`Exported as ${fileName}.pdf`);
          break;
        }
      }
    } catch (error) {
      console.error(`Export failed: ${error}`);
    }
  };

  // Sorting Handler
  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  };
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setSuccessModalOpen(true);
    setTimeout(() => {
      setSuccessModalOpen(false);
    }, 2000);
  };

  const handleAddNew = () => {
    dispatch(clearSelectedCustomer());
    setIsCreateModalOpen(true);
  };

  const handleView = (customer) => {
    dispatch(setSelectedCustomer(customer));
    setIsViewModalOpen(true);
  };

  const handleEdit = (customer) => {
    dispatch(setSelectedCustomer(customer));
    setIsEditModalOpen(true);
  };

  const handleDelete = (customer) => {
    setCustomerToDelete(customer);
    setIsDeleteModalOpen(true);
  };

  const handleEditSuccess = () => {
    showSuccessMessage(
      selectedCustomer
        ? "Customer updated successfully!"
        : "Customer added successfully!"
    );
    dispatch(fetchCustomers());
  };

  const handleCreateSuccess = () => {
    showSuccessMessage("Customer created successfully!");
    dispatch(fetchCustomers());
    setIsCreateModalOpen(false);
  };

  const confirmDelete = async () => {
    if (customerToDelete) {
      try {
        await dispatch(deleteCustomer(customerToDelete.id)).unwrap();
        showSuccessMessage("Customer deleted successfully!");
        setIsDeleteModalOpen(false);
        dispatch(fetchCustomers());
      } catch (error) {
        console.error("Error deleting customer:", error);
      }
    }
  };

  // Handle select all/deselect all
  const handleSelectAllToggle = (checked) => {
    if (checked) {
      setSelectedCustomers(customers.map((customer) => customer.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  // Handle single customer selection
  const handleSingleCustomerSelect = (customerId) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  // Handle multiple customer deletion
  const handleMultipleDelete = async () => {
    try {
      for (const customerId of selectedCustomers) {
        await dispatch(deleteCustomer(customerId)).unwrap();
      }
      showSuccessMessage(
        `${selectedCustomers.length} customer(s) deleted successfully!`
      );
      dispatch(fetchCustomers());
      setSelectedCustomers([]);
    } catch (error) {
      console.error("Error deleting customers:", error);
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "failed") {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-xl border m-3">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Customer Master</h2>
        <div className="flex items-center gap-4">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border rounded-md px-2 py-1 text-sm"
          />

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleSort("companyName")}>
                Company Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("companyEmail")}>
                Email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
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

          <Button
            className="bg-blue-700 hover:bg-blue-800 text-white rounded-full px-2 py-1 text-xs"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1" />
            Add New Customer
          </Button>
        </div>
      </div>
      {selectedCustomers.length > 0 && (
        <div className="bg-blue-50 p-4 mb-4 rounded-lg flex justify-between items-center">
          <span className="text-blue-800">
            {selectedCustomers.length} customer(s) selected
          </span>
          <Button
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 text-white" />
            Delete Selected
          </Button>
        </div>
      )}

      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead className="pl-6">
                <Checkbox
                  checked={
                    customers.length > 0 &&
                    selectedCustomers.length === customers.length
                  }
                  onCheckedChange={handleSelectAllToggle}
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Company Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(customers) && customers.length > 0 ? (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="pl-6">
                    <Checkbox
                      checked={selectedCustomers.includes(customer.id)}
                      onCheckedChange={() =>
                        handleSingleCustomerSelect(customer.id)
                      }
                    />
                  </TableCell>
                  <TableCell>{customer.id}</TableCell>
                  <TableCell>{customer.companyName}</TableCell>
                  <TableCell>{customer.companyEmail}</TableCell>
                  <TableCell>{customer.contactPersonName}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      className="mr-2"
                      onClick={() => handleView(customer)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="mr-2"
                      onClick={() => handleEdit(customer)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(customer)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No customers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ViewCustomerDetails
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onEditClick={() => {
          setIsViewModalOpen(false);
          setIsEditModalOpen(true);
        }}
      />

      <EditCustomerForm
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          dispatch(clearSelectedCustomer());
        }}
        onSuccess={handleEditSuccess}
      />

      <CreateCustomer
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <SuccessModal
        isOpen={successModalOpen}
        message={successMessage}
        onClose={() => setSuccessModalOpen(false)}
      />

      <DeleteModal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCustomerToDelete(null);
        }}
        onConfirm={
          selectedCustomers.length > 0 ? handleMultipleDelete : confirmDelete
        }
        message={
          selectedCustomers.length > 0
            ? `Are you sure you want to delete ${selectedCustomers.length} customer(s)?`
            : "Are you sure you want to delete this customer?"
        }
      />
      <Pagination
        totalItems={filteredCustomers.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default CustomerMaster;
