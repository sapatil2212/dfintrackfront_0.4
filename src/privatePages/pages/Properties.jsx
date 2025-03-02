"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProperties,
  updateProperty,
  addProperty,
  deleteProperty,
} from "../../slices/PropertySlice";
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
  Building,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SuccessModal from "../../components/SuccessModal";
import AddPropertyModal from "./PropertyComp/AddPropertyModal";
import EditPropertyModal from "./PropertyComp/EditProperty";
import ViewPropertyModal from "./PropertyComp/ViewProperty";
import DeleteModal from "../../components/DeleteModel";

const Properties = () => {
  const dispatch = useDispatch();
  const { properties, status, error } = useSelector(
    (state) => state.properties
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProperties());
    }
  }, [status, dispatch]);

  const handleAddProperty = async (propertyData) => {
    try {
      await dispatch(addProperty(propertyData)).unwrap();
      setSuccessMessage("Property added successfully!");
      setSuccessModalOpen(true);
      setIsAddModalOpen(false);
      dispatch(fetchProperties());
    } catch (error) {
      console.error("Failed to add property:", error);
    }
  };

  const handleEditProperty = async (propertyData) => {
    try {
      await dispatch(
        updateProperty({
          id: selectedProperty.id,
          propertyData: propertyData,
        })
      ).unwrap();
      setSuccessMessage("Property updated successfully!");
      setSuccessModalOpen(true);
      setIsEditModalOpen(false);
      setSelectedProperty(null);
      dispatch(fetchProperties());
    } catch (error) {
      console.error("Failed to update property:", error);
    }
  };

  const handleDelete = (property) => {
    setSelectedProperty(property);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedProperty) {
      try {
        await dispatch(deleteProperty(selectedProperty.id)).unwrap();
        setSuccessMessage("Property deleted successfully!");
        setSuccessModalOpen(true);
        setIsDeleteModalOpen(false);
        setSelectedProperty(null);
        dispatch(fetchProperties());
      } catch (error) {
        console.error("Failed to delete property:", error);
      }
    }
  };

  const filteredProperties = properties.filter(
    (property) =>
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (status === "failed") {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-xl border m-3">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <Building className="mr-2" /> Properties
        </h2>
        <div className="flex items-center space-x-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 pr-4 py-1  w-40 h-8  border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"
              size={12}
            />
          </div>

          {/* Add Property Button */}
          <Button
            variant="default"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-700 hover:bg-blue-800 text-white rounded-full px-3 py-1 text-xs flex items-center justify-center w-10 h-8
             sm:w-auto"
          >
            <PlusCircle className="w-3.5 h-3.5 sm:mr-1" />
            <span className="hidden sm:inline">Add Property</span>
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead className="pl-6">ID</TableHead>
              <TableHead className="pl-6">Property Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProperties.length > 0 ? (
              filteredProperties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell className="pl-6">{property.id}</TableCell>
                  <TableCell className="pl-6">{property.name}</TableCell>
                  <TableCell>{property.address}</TableCell>
                  <TableCell>{property.description}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="p-2"
                        onClick={() => {
                          setSelectedProperty(property);
                          setIsViewModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        className="p-2"
                        onClick={() => {
                          setSelectedProperty(property);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        className="p-2"
                        onClick={() => handleDelete(property)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No properties found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModalOpen}
        message={successMessage}
        onClose={() => setSuccessModalOpen(false)}
      />

      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddProperty}
      />

      {/* Edit Property Modal */}
      <EditPropertyModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProperty(null);
        }}
        onSubmit={handleEditProperty}
        property={selectedProperty}
      />

      {/* View Property Modal */}
      <ViewPropertyModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedProperty(null);
        }}
        onEdit={() => {
          setIsViewModalOpen(false);
          setIsEditModalOpen(true);
        }}
        property={selectedProperty}
      />

      <DeleteModal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedProperty(null);
        }}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this property? This action cannot be undone."
      />
    </div>
  );
};

export default Properties;
