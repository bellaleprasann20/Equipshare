import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import ErrorMessage from "../../components/common/ErrorMessage";
import { useAuth } from "../../hooks/useAuth";

/**
 * Registration page. Calls useAuth().register(payload), which
 * hits authService -> POST /api/auth/register.
 *
 * Role options match the User model's expected roles — adjust
 * ROLE_OPTIONS if the backend supports more (e.g. site_engineer).
 */
const ROLE_OPTIONS = [
  { value: "manager", label: "Project Manager" },
  { value: "admin", label: "Fleet Admin" },
];

const initialState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "manager",
  companyName: "",
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = "Enter your name";
    if (!form.email) errs.email = "Enter your email";
    if (!form.password || form.password.length < 6)
      errs.password = "Password must be at least 6 characters";
    if (form.confirmPassword !== form.password) errs.confirmPassword = "Passwords do not match";
    if (!form.companyName) errs.companyName = "Enter your company name";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setApiError("");
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await register(payload);
      navigate("/dashboard");
    } catch (err) {
      setApiError(err?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-gray-900">Create an account</h1>
        <p className="mb-5 text-sm text-gray-500">Join EquipShare to share and allocate equipment</p>

        {apiError && (
          <div className="mb-4">
            <ErrorMessage message={apiError} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            name="name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            error={errors.name}
            required
          />
          <Input
            label="Company Name"
            name="companyName"
            value={form.companyName}
            onChange={(e) => update("companyName", e.target.value)}
            error={errors.companyName}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            error={errors.email}
            required
          />
          <Select
            label="Role"
            name="role"
            value={form.role}
            onChange={(e) => update("role", e.target.value)}
            options={ROLE_OPTIONS}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            error={errors.password}
            required
          />
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            error={errors.confirmPassword}
            required
          />

          <Button type="submit" loading={loading} fullWidth>
            Create Account
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
