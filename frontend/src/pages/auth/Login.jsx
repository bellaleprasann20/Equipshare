import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import ErrorMessage from "../../components/common/ErrorMessage";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const loggedInUser = await login(form.email, form.password);
      navigate(loggedInUser.role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#161618] text-white">
      {/* Left Side: Branding & Hero Image */}
      <div className="relative hidden w-1/2 flex-col justify-between border-r border-[#2a2a2d] bg-[#1c1c1f] p-12 lg:flex">
        {/* Dark construction themed background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-overlay"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504307651254-35680f356f58?q=80&w=2070&auto=format&fit=crop')" }}
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
            Secure Access
          </div>
          <h2 className="mb-6 font-display text-4xl font-bold leading-tight text-white">
            Manage your fleet and projects efficiently.
          </h2>
          <p className="text-lg text-[#a1a1aa]">
            Log in to view intelligent allocation recommendations, monitor real-time equipment efficiency, and track utilization analytics across all your sites.
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          
          {/* Mobile Logo Header */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center bg-[#8b5cf6] font-display text-lg font-bold text-white">
              E
            </span>
            <span className="font-display text-2xl font-bold tracking-tight text-white">
              EquipShare
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back</h1>
            <p className="mt-2 text-sm text-[#a1a1aa]">
              Enter your credentials to access your workspace.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-md border-l-4 border-red-500 bg-red-950/50 p-4 shadow-sm">
              <ErrorMessage message={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" style={{ colorScheme: 'dark' }}>
            <Input
              label="Work Email"
              name="email"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
            
            <div>
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
              />
              <div className="mt-2 flex justify-end">
                <a href="#" className="text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <div className="mt-4">
              <Button 
                type="submit" 
                loading={loading} 
                fullWidth 
                className="bg-[#8b5cf6] hover:bg-[#7c3aed] border-none py-3 text-white transition-colors"
              >
                Log In
              </Button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-[#a1a1aa]">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-[#a78bfa] transition-colors hover:text-[#c4b5fd] hover:underline">
              Register a new workspace
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}