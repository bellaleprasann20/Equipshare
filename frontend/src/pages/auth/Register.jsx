import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import ErrorMessage from "../../components/common/ErrorMessage";
import { useAuth } from "../../hooks/useAuth";

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
      const newUser = await register(payload);
      navigate(newUser.role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (err) {
      setApiError(err?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#161618] text-white">
      {/* Left Side: Branding & Hero Image */}
      <div className="relative hidden w-1/2 flex-col justify-between border-r border-[#2a2a2d] bg-[#1c1c1f] p-12 lg:flex">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-overlay"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541888081622-152e7284643b?q=80&w=2070&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#161618] via-[#161618]/60 to-transparent"></div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center bg-[#8b5cf6] font-display text-xl font-bold text-white shadow-md">
              E
            </span>
            <span className="font-display text-3xl font-bold tracking-tight text-white">
              EquipShare
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="mb-4 inline-block border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-3 py-1 text-xs font-semibold tracking-widest text-[#a78bfa] uppercase">
            Resource Optimization
          </div>
          <h2 className="mb-6 font-display text-4xl font-bold leading-tight text-white">
            Intelligent equipment allocation for modern sites.
          </h2>
          <p className="text-lg text-[#a1a1aa]">
            Join the centralized network to reduce idle time, track Equipment Efficiency (EEI), and eliminate unnecessary third-party rental costs.
          </p>
        </div>
      </div>

      {/* Right Side: Registration Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center bg-[#8b5cf6] font-display text-lg font-bold text-white">
              E
            </span>
            <span className="font-display text-2xl font-bold tracking-tight text-white">
              EquipShare
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">Create an account</h1>
            <p className="mt-2 text-sm text-[#a1a1aa]">
              Enter your details below to set up your workspace.
            </p>
          </div>

          {apiError && (
            <div className="mb-6 rounded-md border-l-4 border-red-500 bg-red-950/50 p-4 shadow-sm">
              <ErrorMessage message={apiError} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" style={{ colorScheme: 'dark' }}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input
                label="Full Name"
                name="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                error={errors.name}
                placeholder="John Doe"
                required
              />
              <Input
                label="Company Name"
                name="companyName"
                value={form.companyName}
                onChange={(e) => update("companyName", e.target.value)}
                error={errors.companyName}
                placeholder="Apex Builders"
                required
              />
            </div>

            <Input
              label="Work Email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              error={errors.email}
              placeholder="john@apexbuilders.com"
              required
            />
            
            <Select
              label="System Role"
              name="role"
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              options={ROLE_OPTIONS}
            />
            
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                error={errors.password}
                placeholder="••••••••"
                required
              />
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                error={errors.confirmPassword}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="mt-4">
              <Button 
                type="submit" 
                loading={loading} 
                fullWidth 
                className="bg-[#8b5cf6] hover:bg-[#7c3aed] border-none py-3 text-white transition-colors"
              >
                Create Account
              </Button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-[#a1a1aa]">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-[#a78bfa] transition-colors hover:text-[#c4b5fd] hover:underline">
              Log in to your workspace
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}