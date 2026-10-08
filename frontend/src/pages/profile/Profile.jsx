import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  User,
  Mail,
  Building2,
  ShieldCheck,
  BriefcaseBusiness,
  Pencil,
  Save,
  X,
  ArrowLeft,
  KeyRound,
  Bell,
  CheckCircle2,
  Activity,
} from "lucide-react";

export default function Profile() {
  const { user } = useAuth();

  const [profileMeta, setProfileMeta] = useState({
    phone: "",
    location: "",
    bio: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [saved, setSaved] = useState(false);

  /*
   * Keep extra profile information separate from authenticated
   * account information.
   *
   * Authenticated fields:
   * - name
   * - email
   * - companyName
   * - role
   *
   * Local profile fields:
   * - phone
   * - location
   * - bio
   */
  const profileStorageKey = user
    ? `equipshare_profile_meta_${user._id || user.id}`
    : null;

  /*
   * Load local profile information for the currently logged-in user.
   */
  useEffect(() => {
    if (!profileStorageKey) {
      setProfileMeta({
        phone: "",
        location: "",
        bio: "",
      });
      return;
    }

    try {
      const storedProfile = localStorage.getItem(profileStorageKey);

      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);

        setProfileMeta({
          phone: parsedProfile.phone || "",
          location: parsedProfile.location || "",
          bio: parsedProfile.bio || "",
        });
      } else {
        setProfileMeta({
          phone: "",
          location: "",
          bio: "",
        });
      }
    } catch {
      setProfileMeta({
        phone: "",
        location: "",
        bio: "",
      });
    }
  }, [profileStorageKey]);

  /*
   * Convert backend role into a user-friendly label.
   */
  const displayRole = useMemo(() => {
    if (user?.role === "admin") {
      return "Administrator";
    }

    if (user?.role === "manager") {
      return "Project Manager";
    }

    return "User";
  }, [user?.role]);

  /*
   * Generate initials from the real logged-in user's name.
   *
   * Example:
   * Prasann Bellale -> PB
   * Prasann -> P
   */
  const initials = useMemo(() => {
    return (
      user?.name
        ?.trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join("") || "U"
    );
  }, [user?.name]);

  /*
   * Update local-only profile information.
   */
  const updateMetaField = (field, value) => {
    setProfileMeta((current) => ({
      ...current,
      [field]: value,
    }));

    setSaved(false);
  };

  /*
   * Save phone, location and bio locally.
   *
   * Name, email, company and role are intentionally not saved here
   * because those values come from the authenticated backend user.
   */
  const handleSave = () => {
    if (profileStorageKey) {
      localStorage.setItem(
        profileStorageKey,
        JSON.stringify(profileMeta)
      );
    }

    setEditMode(false);
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  /*
   * Cancel local profile changes.
   */
  const handleCancel = () => {
    if (!profileStorageKey) {
      setEditMode(false);
      return;
    }

    try {
      const storedProfile = localStorage.getItem(profileStorageKey);

      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);

        setProfileMeta({
          phone: parsedProfile.phone || "",
          location: parsedProfile.location || "",
          bio: parsedProfile.bio || "",
        });
      } else {
        setProfileMeta({
          phone: "",
          location: "",
          bio: "",
        });
      }
    } catch {
      setProfileMeta({
        phone: "",
        location: "",
        bio: "",
      });
    }

    setEditMode(false);
    setSaved(false);
  };

  /*
   * Safety fallback while authentication is loading
   * or no user is available.
   */
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#161618] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#8b5cf6] border-t-transparent" />

          <p className="text-sm text-zinc-400">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#161618] text-white">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-[#8b5cf6]/10 blur-[140px]" />

        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-600/5 blur-[140px]" />
      </div>

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="relative z-10 border-b border-[#2a2a2d] bg-[#1c1c1f]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo */}

          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center bg-[#8b5cf6] text-xl font-bold text-white shadow-[0_0_25px_rgba(139,92,246,0.2)]">
              E
            </span>

            <div>
              <span className="block text-xl font-bold tracking-tight">
                EquipShare
              </span>

              <span className="hidden text-[9px] uppercase tracking-[0.25em] text-zinc-500 sm:block">
                Equipment Intelligence
              </span>
            </div>
          </Link>

          {/* Back */}

          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />

            <span className="hidden sm:block">
              Back to Dashboard
            </span>
          </Link>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Page heading */}

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a78bfa]">
            Account Settings
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Manage your EquipShare account and workspace information.
          </p>
        </div>

        {/* =================================================
            SAVED NOTIFICATION
        ================================================== */}

        {saved && (
          <div className="mb-6 flex items-center gap-3 border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            <CheckCircle2 className="h-4 w-4" />

            Profile changes saved successfully.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* =================================================
              PROFILE CARD
          ================================================== */}

          <section className="h-fit overflow-hidden border border-[#2a2a2d] bg-[#1c1c1f]">
            {/* Purple header */}

            <div className="relative h-28 overflow-hidden bg-gradient-to-br from-[#8b5cf6]/30 via-[#8b5cf6]/10 to-transparent">
              <div className="absolute -right-10 -top-20 h-48 w-48 rounded-full border border-[#8b5cf6]/20" />

              <div className="absolute -bottom-16 -left-10 h-36 w-36 rounded-full border border-[#a78bfa]/10" />
            </div>

            {/* Avatar */}

            <div className="relative px-6 pb-6">
              <div className="-mt-12 flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-[#1c1c1f] bg-[#8b5cf6] text-3xl font-bold text-white shadow-xl">
                {initials}
              </div>

              <div className="mt-5">
                <h2 className="text-xl font-bold text-white">
                  {user.name || "Your Name"}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {displayRole}
                </p>
              </div>

              <div className="mt-5 space-y-3 border-t border-[#2a2a2d] pt-5">
                {/* Email */}

                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 shrink-0 text-[#a78bfa]" />

                  <span className="truncate text-zinc-400">
                    {user.email || "No email"}
                  </span>
                </div>

                {/* Company */}

                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="h-4 w-4 shrink-0 text-[#a78bfa]" />

                  <span className="truncate text-zinc-400">
                    {user.companyName || "No company"}
                  </span>
                </div>

                {/* Role */}

                <div className="flex items-center gap-3 text-sm">
                  <BriefcaseBusiness className="h-4 w-4 shrink-0 text-[#a78bfa]" />

                  <span className="text-zinc-400">
                    {displayRole}
                  </span>
                </div>
              </div>

              {/* Account status */}

              <div className="mt-6 flex items-center justify-between border border-green-500/20 bg-green-500/5 px-3 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />

                  <span className="text-xs font-medium text-zinc-300">
                    Account Active
                  </span>
                </div>

                <ShieldCheck className="h-4 w-4 text-green-400" />
              </div>
            </div>
          </section>

          {/* =================================================
              PROFILE DETAILS
          ================================================== */}

          <div className="space-y-6">
            {/* =================================================
                PERSONAL INFORMATION
            ================================================== */}

            <section className="border border-[#2a2a2d] bg-[#1c1c1f]">
              <div className="flex items-center justify-between border-b border-[#2a2a2d] px-6 py-5">
                <div>
                  <h2 className="font-semibold text-white">
                    Personal Information
                  </h2>

                  <p className="mt-1 text-xs text-zinc-500">
                    Your account and workspace information.
                  </p>
                </div>

                {!editMode ? (
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-2 border border-[#2a2a2d] bg-[#161618] px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:border-[#8b5cf6]/40 hover:text-white"
                  >
                    <Pencil className="h-3.5 w-3.5" />

                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex items-center gap-2 border border-[#2a2a2d] bg-[#161618] px-4 py-2 text-xs font-semibold text-zinc-400 transition hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />

                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleSave}
                      className="flex items-center gap-2 bg-[#8b5cf6] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#7c3aed]"
                    >
                      <Save className="h-3.5 w-3.5" />

                      Save
                    </button>
                  </div>
                )}
              </div>

              <div className="grid gap-5 p-6 md:grid-cols-2">
                {/* =================================================
                    NAME
                ================================================== */}

                <ProfileField
                  label="Full Name"
                  icon={User}
                  value={user.name || ""}
                  editing={false}
                  placeholder="Your full name"
                />

                {/* =================================================
                    EMAIL
                ================================================== */}

                <ProfileField
                  label="Work Email"
                  icon={Mail}
                  value={user.email || ""}
                  editing={false}
                  placeholder="you@company.com"
                  type="email"
                />

                {/* =================================================
                    COMPANY
                ================================================== */}

                <ProfileField
                  label="Company Name"
                  icon={Building2}
                  value={user.companyName || ""}
                  editing={false}
                  placeholder="Your company"
                />

                {/* =================================================
                    ROLE
                ================================================== */}

                <ProfileField
                  label="System Role"
                  icon={BriefcaseBusiness}
                  value={displayRole}
                  editing={false}
                  placeholder="Project Manager"
                />

                {/* =================================================
                    PHONE
                ================================================== */}

                <ProfileField
                  label="Phone Number"
                  icon={Activity}
                  value={profileMeta.phone}
                  editing={editMode}
                  onChange={(value) =>
                    updateMetaField("phone", value)
                  }
                  placeholder="+91 XXXXX XXXXX"
                />

                {/* =================================================
                    LOCATION
                ================================================== */}

                <ProfileField
                  label="Location"
                  icon={Building2}
                  value={profileMeta.location}
                  editing={editMode}
                  onChange={(value) =>
                    updateMetaField("location", value)
                  }
                  placeholder="Bengaluru, Karnataka"
                />

                {/* =================================================
                    BIO
                ================================================== */}

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-semibold text-zinc-400">
                    About
                  </label>

                  {editMode ? (
                    <textarea
                      value={profileMeta.bio}
                      onChange={(e) =>
                        updateMetaField("bio", e.target.value)
                      }
                      rows={4}
                      placeholder="Tell us about yourself..."
                      className="w-full resize-none border border-[#2a2a2d] bg-[#161618] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-[#8b5cf6]/60"
                    />
                  ) : (
                    <div className="border border-[#2a2a2d] bg-[#161618] px-4 py-3 text-sm leading-6 text-zinc-400">
                      {profileMeta.bio || "No bio added yet."}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* =================================================
                SECURITY
            ================================================== */}

            <section className="border border-[#2a2a2d] bg-[#1c1c1f]">
              <div className="border-b border-[#2a2a2d] px-6 py-5">
                <h2 className="font-semibold text-white">
                  Security
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                  Manage your account security settings.
                </p>
              </div>

              <div className="divide-y divide-[#2a2a2d]">
                {/* Password */}

                <div className="flex items-center justify-between gap-4 px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center bg-[#8b5cf6]/10">
                      <KeyRound className="h-5 w-5 text-[#a78bfa]" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        Password
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        Last updated recently
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="border border-[#2a2a2d] px-4 py-2 text-xs font-semibold text-zinc-400 transition hover:border-[#8b5cf6]/40 hover:text-white"
                  >
                    Change Password
                  </button>
                </div>

                {/* Verification */}

                <div className="flex items-center justify-between gap-4 px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center bg-green-500/10">
                      <ShieldCheck className="h-5 w-5 text-green-400" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        Account Verification
                      </p>

                      <p className="mt-1 text-xs text-green-400">
                        Your account is verified
                      </p>
                    </div>
                  </div>

                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                </div>
              </div>
            </section>

            {/* =================================================
                NOTIFICATIONS
            ================================================== */}

            <section className="border border-[#2a2a2d] bg-[#1c1c1f]">
              <div className="border-b border-[#2a2a2d] px-6 py-5">
                <h2 className="font-semibold text-white">
                  Notifications
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                  Control how EquipShare communicates with you.
                </p>
              </div>

              <div className="space-y-5 p-6">
                <NotificationItem
                  icon={Bell}
                  title="Equipment Updates"
                  description="Receive updates about equipment availability."
                  defaultChecked
                />

                <NotificationItem
                  icon={Activity}
                  title="Project Activity"
                  description="Get notified when project equipment changes."
                  defaultChecked
                />

                <NotificationItem
                  icon={ShieldCheck}
                  title="Security Alerts"
                  description="Important notifications about your account."
                  defaultChecked
                />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

/* =============================================================
   PROFILE FIELD
============================================================= */

function ProfileField({
  label,
  icon: Icon,
  value,
  editing,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-zinc-400">
        {label}
      </label>

      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

        {editing ? (
          <input
            type={type}
            value={value || ""}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            className="w-full border border-[#2a2a2d] bg-[#161618] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-[#8b5cf6]/60"
          />
        ) : (
          <div className="w-full border border-[#2a2a2d] bg-[#161618] py-3 pl-10 pr-4 text-sm text-zinc-300">
            {value || (
              <span className="text-zinc-700">
                Not provided
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* =============================================================
   NOTIFICATION ITEM
============================================================= */

function NotificationItem({
  icon: Icon,
  title,
  description,
  defaultChecked,
}) {
  const [enabled, setEnabled] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between gap-5">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center bg-[#8b5cf6]/10">
          <Icon className="h-4 w-4 text-[#a78bfa]" />
        </div>

        <div>
          <p className="text-sm font-semibold text-white">
            {title}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setEnabled((current) => !current)}
        aria-label={
          enabled
            ? `Disable ${title}`
            : `Enable ${title}`
        }
        className={
          enabled
            ? "relative h-6 w-11 rounded-full bg-[#8b5cf6] transition"
            : "relative h-6 w-11 rounded-full bg-zinc-700 transition"
        }
      >
        <span
          className={
            enabled
              ? "absolute right-1 top-1 h-4 w-4 rounded-full bg-white transition"
              : "absolute left-1 top-1 h-4 w-4 rounded-full bg-zinc-400 transition"
          }
        />
      </button>
    </div>
  );
}