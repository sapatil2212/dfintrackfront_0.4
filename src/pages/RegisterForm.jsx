import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  registerUser,
  loginCaretaker,
  checkEmailExists,
  validateSecurityKey,
} from "../services/UserService";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    accountType: "",
    name: "",
    email: "",
    securityKey: "",
    password: "",
    confirmPassword: "",
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStepOne = () => {
    const newErrors = {};
    if (!formData.accountType) {
      newErrors.accountType = "Please select an account type.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStepTwo = async () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "Please enter your name.";
    }

    if (!formData.email || formData.email.trim() === "") {
      newErrors.email = "Please enter your email.";
    } else {
      try {
        setIsLoading(true);
        const emailExists = await checkEmailExists(formData.email);
        if (emailExists) {
          newErrors.email = `User with email ${formData.email} already exists.`;
        }
      } catch (error) {
        toast.error("Error checking email. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    if (!formData.securityKey || formData.securityKey.trim() === "") {
      newErrors.securityKey = "Please enter the security key.";
    } else {
      try {
        setIsLoading(true);
        const isValidKey = await validateSecurityKey(formData.securityKey);
        if (!isValidKey) {
          newErrors.securityKey = "Invalid Security Key";
        }
      } catch (error) {
        toast.error("Error validating security key. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStepThree = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Please enter a password.";
    } else if (formData.password.length < 5 || formData.password.length > 15) {
      newErrors.password = "Password must be between 5 to 15 characters.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = validateStepOne();
        break;
      case 2:
        isValid = await validateStepTwo();
        break;
      case 3:
        isValid = validateStepThree();
        break;
      default:
        isValid = false;
    }

    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const stepOneValid = validateStepOne();
    const stepTwoValid = await validateStepTwo();
    const stepThreeValid = validateStepThree();

    if (!stepOneValid || !stepTwoValid || !stepThreeValid) {
      return;
    }

    setIsLoading(true);

    try {
      if (formData.accountType === "ADMIN") {
        await registerUser(formData);
      } else if (formData.accountType === "USER") {
        await loginCaretaker(formData);
      }

      toast.success("Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      const backendMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(backendMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (name, label, type = "text", showToggle = false) => {
    const inputProps = {
      type:
        type === "password"
          ? showToggle &&
            (name === "password" ? showPassword : showConfirmPassword)
            ? "text"
            : "password"
          : type,
      name,
      value: formData[name],
      onChange: handleChange,
      placeholder: `Enter your ${label.toLowerCase()}`,
      className: `mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-200 ${
        errors[name] ? "border-red-500" : "border-gray-300"
      }`,
    };

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <div className="relative">
          <input {...inputProps} />
          {showToggle && (
            <button
              type="button"
              onClick={() =>
                name === "password"
                  ? setShowPassword(!showPassword)
                  : setShowConfirmPassword(!showConfirmPassword)
              }
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition"
            >
              {(name === "password" ? showPassword : showConfirmPassword) ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>
          )}
        </div>
        {errors[name] && (
          <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
        )}
      </div>
    );
  };

  return (
    <div className="grid place-items-center min-h-screen bg-gradient-to-r from-blue-50 to-gray-50 font-['Poppins'] p-4">
      <ToastContainer position="top-right" autoClose={5000} />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 p-8 transform transition-all mt-10 sm:max-w-lg"
      >
        <h2 className="text-center text-3xl font-bold text-gray-800 mb-6 tracking-tight">
          {currentStep === 1 && "Sign up"}
          {currentStep === 2 && "Personal Information"}
          {currentStep === 3 && "Secure Your Account"}
        </h2>

        {currentStep === 1 && (
          <p className="text-center text-sm text-gray-500 mb-6">
            Let's get started on your new finance journey!
          </p>
        )}

        <div className="flex justify-center mb-8 space-x-2">
          {[1, 2, 3].map((step) => (
            <motion.div
              key={step}
              initial={{ scale: 0.8 }}
              animate={{
                scale: currentStep >= step ? 1 : 0.8,
                backgroundColor:
                  currentStep >= step
                    ? "rgb(59, 130, 246)"
                    : "rgb(209, 213, 219)",
              }}
              transition={{ duration: 0.3 }}
              className="h-3 w-3 rounded-full"
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type
              </label>
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-200 ${
                  errors.accountType ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select Account Type</option>
                <option value="USER">Accountant</option>

                <option value="ADMIN">Admin</option>
              </select>
              {errors.accountType && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.accountType}
                </p>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <>
              {renderInput("name", "Name")}
              {renderInput("email", "Email", "email")}
              {renderInput("securityKey", "Security Key", "password", true)}
            </>
          )}

          {currentStep === 3 && (
            <>
              {renderInput("password", "Password", "password", true)}
              {renderInput(
                "confirmPassword",
                "Confirm Password",
                "password",
                true
              )}
            </>
          )}

          <div className="flex justify-between items-center gap-x-4">
            {currentStep > 1 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleBack}
                className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
              >
                Back
              </motion.button>
            )}
            {currentStep < 3 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className={`w-full py-2 px-4 bg-blue-500 text-white rounded-md flex items-center justify-center transition ${
                  isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-600"
                }`}
              >
                {isLoading ? <FaSpinner className="animate-spin mr-2" /> : null}
                Next
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 px-4 bg-green-500 text-white rounded-md flex items-center justify-center transition ${
                  isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-green-600"
                }`}
              >
                {isLoading ? <FaSpinner className="animate-spin mr-2" /> : null}
                Register
              </motion.button>
            )}
          </div>
          <div className="text-center">
            <p className="mt-2 text-sm text-gray-600">
              Already Have an Account?{" "}
              <Link
                to="/login"
                className="text-blue-600 decoration-2 hover:underline font-medium"
              >
                Log in here
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
      <div className="text-center mt-4">
        <button
          onClick={() => navigate("/")}
          className="border border-gray-300 rounded-full text-gray-700 text-sm px-4 py-1 hover:bg-gray-100 transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;
