import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Button } from "../../../components/ui/button";
import { createCustomer } from "../../../slices/customerMasterSlice";

const FloatingLabelInput = ({ label, error, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setHasValue(!!props.value);
  }, [props.value]);

  return (
    <div className="relative mb-4">
      <input
        {...props}
        ref={inputRef}
        className={`peer w-full px-3 py-2 text-sm border rounded-md outline-none transition-all ${
          error ? "border-red-500" : "border-gray-300"
        } focus:border-blue-500`}
        placeholder=" "
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => {
          setHasValue(e.target.value !== "");
          props.onChange(e);
        }}
      />
      <label
        className={`absolute left-3 transition-all duration-200 ${
          isFocused || hasValue
            ? "-top-2.5 text-xs bg-white px-1 text-blue-500"
            : "top-2 text-sm text-gray-500"
        }`}
        onClick={() => inputRef.current.focus()}
      >
        {label}
      </label>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

const CreateCustomer = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    companyName: "",
    companyEmail: "",
    contactPersonName: "",
    companyContactNumber: "",
    companyAlternateContactNumber: "",
    companyAddress: "",
    gstNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [showGstFormat, setShowGstFormat] = useState(false);
  const [backendError, setBackendError] = useState(null);

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "companyName":
        newErrors.companyName =
          value.trim().length < 2
            ? "Company name must be at least 2 characters long"
            : "";
        break;

      case "companyEmail":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        newErrors.companyEmail = !emailRegex.test(value)
          ? "Invalid email format"
          : "";
        break;

      case "companyContactNumber":
        const phoneRegex = /^[6-9]\d{9}$/;
        newErrors.companyContactNumber = !phoneRegex.test(value)
          ? "Invalid phone number (10 digits, starts with 6-9)"
          : "";
        break;

      case "gstNumber":
        const gstRegex =
          /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;

        if (value && !gstRegex.test(value)) {
          newErrors.gstNumber = "Invalid GST Number format";
          setShowGstFormat(true);
        } else {
          newErrors.gstNumber = "";
          setShowGstFormat(false);
        }
        break;
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateField(name, value);

    if (backendError) {
      setBackendError(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setBackendError(null);

    const updatedFormData = {
      ...formData,
      gstNumber: formData.gstNumber.trim() === "" ? "NA" : formData.gstNumber,
    };

    if (!updatedFormData.companyEmail) {
      setBackendError("Email cannot be empty");
      return;
    }

    const isValid = validateField("companyEmail", updatedFormData.companyEmail);

    if (isValid) {
      dispatch(createCustomer(updatedFormData))
        .unwrap()
        .then(() => {
          onSuccess();
          onClose();
        })
        .catch((error) => {
          if (error.response) {
            const errorMessage = error.response.data;
            if (
              error.response.status === 409 &&
              errorMessage === "Email already exists"
            ) {
              setErrors((prev) => ({
                ...prev,
                companyEmail: "Email already exists",
              }));
            } else if (
              error.response.status === 400 &&
              errorMessage === "Invalid GST Number format"
            ) {
              setErrors((prev) => ({
                ...prev,
                gstNumber: "Invalid GST Number format",
              }));
              setShowGstFormat(true);
            } else {
              setBackendError(errorMessage || "An unexpected error occurred");
            }
          } else {
            setBackendError("Email Id/ GST Number already exist!");
          }
        });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md z-50 shadow-xl">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Create Customer
        </h2>

        {backendError && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {backendError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FloatingLabelInput
              label="Company Name"
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              error={errors.companyName}
            />
            <FloatingLabelInput
              label="Company Email"
              type="email"
              id="companyEmail"
              name="companyEmail"
              value={formData.companyEmail}
              onChange={handleChange}
              error={errors.companyEmail}
            />
            <FloatingLabelInput
              label="Contact Person Name"
              type="text"
              id="contactPersonName"
              name="contactPersonName"
              value={formData.contactPersonName}
              onChange={handleChange}
            />
            <FloatingLabelInput
              label="Contact Number"
              type="tel"
              id="companyContactNumber"
              name="companyContactNumber"
              value={formData.companyContactNumber}
              onChange={handleChange}
              error={errors.companyContactNumber}
            />
            <FloatingLabelInput
              label="Alternate Number"
              type="tel"
              id="companyAlternateContactNumber"
              name="companyAlternateContactNumber"
              value={formData.companyAlternateContactNumber}
              onChange={handleChange}
            />
            <FloatingLabelInput
              label="GST Number"
              type="text"
              id="gstNumber"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
              error={errors.gstNumber}
            />
          </div>

          {showGstFormat && (
            <div className="mt-2 p-3 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-600 leading-relaxed">
                <span className="font-semibold">GST Number Format:</span>
                <br />• First 2 digits: State code (01-37)
                <br />• Next 5 characters: PAN number (uppercase)
                <br />• Next 4 digits: Entity number
                <br />• Next character: Alphabet (Z by default)
                <br />• Next 2 characters: Alphanumeric
                <br />• Last character: Checksum (alphabet)
              </p>
            </div>
          )}

          <FloatingLabelInput
            label="Company Address"
            type="text"
            id="companyAddress"
            name="companyAddress"
            value={formData.companyAddress}
            onChange={handleChange}
          />

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-4 py-2 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
            >
              Create Customer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCustomer;
