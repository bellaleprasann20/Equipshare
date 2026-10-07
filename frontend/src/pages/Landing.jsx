import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  Construction,
  Truck,
  BarChart3,
  MapPin,
  ShieldCheck,
  Zap,
  Users,
  Clock3,
  CheckCircle2,
  HardHat,
  Building2,
  Activity,
} from "lucide-react";

const equipment = [
  {
    name: "Excavators",
    description: "Heavy excavation equipment ready for your next project.",
    image:
      "/images/equipment/Excavator.jpg",
    icon: Construction,
  },
  {
    name: "Loaders",
    description: "Reliable loaders for material handling and site operations.",
    image:
      "/images/equipment/Loader.jpg",
    icon: Truck,
  },
  {
    name: "Transport",
    description: "Move equipment and materials efficiently between sites.",
    image:
      "/images/equipment/Transport.jpg",
    icon: Truck,
  },
];

const stats = [
  {
    value: "500+",
    label: "Equipment Assets",
    icon: Construction,
  },
  {
    value: "94.8%",
    label: "Average Utilization",
    icon: Activity,
  },
  {
    value: "28%",
    label: "Idle Time Reduced",
    icon: Clock3,
  },
  {
    value: "24/7",
    label: "Platform Access",
    icon: Zap,
  },
];

const features = [
  {
    icon: BarChart3,
    title: "Smart Allocation",
    description:
      "Find the right equipment for every project using intelligent allocation recommendations.",
  },
  {
    icon: MapPin,
    title: "Equipment Visibility",
    description:
      "Know where your equipment is, where it is being used and what is available.",
  },
  {
    icon: ShieldCheck,
    title: "Centralized Management",
    description:
      "Manage equipment, teams, projects and utilization from one workspace.",
  },
];

const benefits = [
  "Reduce unnecessary rental costs",
  "Increase equipment utilization",
  "Track equipment availability",
  "Improve project coordination",
  "Monitor equipment efficiency",
  "Centralize fleet operations",
];

export default function Landing() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#161618] text-white">
      {/* =========================================================
          NAVBAR
      ========================================================== */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-[#161618]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center bg-[#8b5cf6] font-bold text-white shadow-[0_0_25px_rgba(139,92,246,0.25)]">
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

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#solutions"
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              Solutions
            </a>

            <a
              href="#equipment"
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              Equipment
            </a>

            <a
              href="#visibility"
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              Visibility
            </a>

            <a
              href="#about"
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              About
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden px-4 py-2 text-sm font-medium text-zinc-300 transition hover:text-white sm:block"
            >
              Log in
            </Link>

            <Link
              to="/register"
              className="flex items-center gap-2 bg-[#8b5cf6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7c3aed]"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================
          HERO
      ========================================================== */}
      <section className="relative min-h-screen overflow-hidden pt-20">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1504307651254-35680f356f58?q=80&w=2200&auto=format&fit=crop')",
          }}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#161618]/70 via-[#161618]/80 to-[#161618]" />

        {/* Purple glow */}
        <motion.div
          className="absolute left-1/2 top-40 h-96 w-96 -translate-x-1/2 rounded-full bg-[#8b5cf6]/15 blur-[130px]"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Blueprint grid */}
        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl flex-col items-center justify-center px-6 py-20 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-7 flex items-center gap-2 border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#c4b5fd]"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#8b5cf6]" />
            Intelligent Equipment Sharing
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="max-w-5xl text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-8xl"
          >
            SHARE EQUIPMENT.
            <br />
            <span className="text-[#a78bfa]">BUILD SMARTER.</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-7 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg"
          >
            EquipShare brings equipment, projects and teams together in one
            intelligent platform. Find available equipment, optimize
            utilization and reduce unnecessary rental costs.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              to="/register"
              className="group flex items-center justify-center gap-2 bg-[#8b5cf6] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#7c3aed]"
            >
              Start Sharing
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>

            <a
              href="#equipment"
              className="flex items-center justify-center gap-2 border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              Explore Equipment
              <ChevronRight className="h-4 w-4" />
            </a>
          </motion.div>

          {/* Hero dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 70 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.45 }}
            className="relative mt-20 w-full max-w-5xl"
          >
            {/* glow */}
            <div className="absolute -inset-10 rounded-[40px] bg-[#8b5cf6]/10 blur-3xl" />

            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#1c1c1f]/90 text-left shadow-2xl backdrop-blur-xl">
              {/* Dashboard header */}
              <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
                <div>
                  <p className="text-xs font-bold text-white">
                    Equipment Overview
                  </p>
                  <p className="mt-1 text-[10px] text-zinc-500">
                    Live fleet allocation
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-green-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  System Online
                </div>
              </div>

              {/* Dashboard body */}
              <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
                {[
                  ["24", "Active Equipment"],
                  ["08", "Available"],
                  ["94.8%", "Utilization"],
                  ["28%", "Idle Reduced"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="border border-white/5 bg-[#161618] p-4"
                  >
                    <p className="text-2xl font-bold text-white">{value}</p>
                    <p className="mt-1 text-[10px] text-zinc-500">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Equipment rows */}
              <div className="grid gap-2 px-4 pb-4">
                {["CAT 320 Excavator", "JCB 3DX Backhoe", "Tata 407 Transport"].map(
                  (item, index) => (
                    <div
                      key={item}
                      className="flex items-center justify-between border border-white/5 bg-[#161618] px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center bg-[#8b5cf6]/10">
                          <Construction className="h-4 w-4 text-[#a78bfa]" />
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-white">
                            {item}
                          </p>

                          <p className="text-[9px] text-zinc-500">
                            Project {index + 1} • Bengaluru Site
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <span className="text-[9px] text-zinc-400">
                          Available
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================
          STATS
      ========================================================== */}
      <section className="border-y border-white/5 bg-[#1c1c1f]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/5 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-7 sm:p-10"
              >
                <Icon className="mb-5 h-5 w-5 text-[#a78bfa]" />

                <p className="text-3xl font-black text-white sm:text-4xl">
                  {stat.value}
                </p>

                <p className="mt-2 text-xs uppercase tracking-wider text-zinc-500">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* =========================================================
          SMARTER WAY
      ========================================================== */}
      <section id="solutions" className="relative py-28 sm:py-36">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#a78bfa]">
                The EquipShare Advantage
              </span>

              <h2 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
                A smarter way
                <br />
                <span className="text-zinc-500">to build.</span>
              </h2>

              <p className="mt-6 max-w-md leading-7 text-zinc-400">
                Stop searching through spreadsheets and disconnected systems.
                EquipShare gives your entire team a single place to manage
                equipment and projects.
              </p>

              <Link
                to="/register"
                className="mt-8 inline-flex items-center gap-2 border-b border-[#8b5cf6] pb-2 text-sm font-semibold text-white"
              >
                Build with EquipShare
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    className="group border border-white/10 bg-[#1c1c1f] p-6 transition hover:-translate-y-1 hover:border-[#8b5cf6]/40"
                  >
                    <div className="mb-8 flex h-11 w-11 items-center justify-center bg-[#8b5cf6]/10">
                      <Icon className="h-5 w-5 text-[#a78bfa]" />
                    </div>

                    <h3 className="text-lg font-bold text-white">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-zinc-500">
                      {feature.description}
                    </p>

                    <div className="mt-8 h-px w-8 bg-[#8b5cf6] transition-all group-hover:w-full" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          EQUIPMENT
      ========================================================== */}
      <section id="equipment" className="bg-[#1c1c1f] py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#a78bfa]">
                Equipment Network
              </span>

              <h2 className="mt-4 text-4xl font-black sm:text-5xl">
                EquipmentShare
                <br />
                <span className="text-zinc-500">solutions.</span>
              </h2>
            </div>

            <p className="max-w-md text-sm leading-6 text-zinc-500">
              Connect your available equipment with projects that need it.
              Every asset becomes more useful when your team can see it.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {equipment.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="group overflow-hidden border border-white/10 bg-[#161618]"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-105 group-hover:opacity-90"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#161618] via-transparent to-transparent" />

                    <div className="absolute bottom-5 left-5 flex h-10 w-10 items-center justify-center bg-[#8b5cf6]">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold">{item.name}</h3>

                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                      {item.description}
                    </p>

                    <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#a78bfa]">
                      Explore equipment
                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          VISIBILITY
      ========================================================== */}
      <section id="visibility" className="relative overflow-hidden py-28">
        <div className="absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[#8b5cf6]/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#a78bfa]">
                Complete Visibility
              </span>

              <h2 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
                Know where your
                <br />
                <span className="text-[#a78bfa]">equipment is.</span>
              </h2>

              <p className="mt-6 max-w-lg leading-7 text-zinc-400">
                Get a clear picture of your fleet, projects and equipment
                availability without switching between multiple tools.
              </p>

              <div className="mt-8 space-y-4">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-3 text-sm text-zinc-300"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#a78bfa]" />
                    {benefit}
                  </div>
                ))}
              </div>

              <Link
                to="/register"
                className="mt-9 inline-flex items-center gap-2 bg-[#8b5cf6] px-6 py-3 text-sm font-bold transition hover:bg-[#7c3aed]"
              >
                Start Managing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Dashboard visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-5 rounded-3xl bg-[#8b5cf6]/10 blur-2xl" />

              <div className="relative overflow-hidden border border-white/10 bg-[#1c1c1f] p-5 shadow-2xl">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">Project Visibility</p>
                    <p className="text-[10px] text-zinc-500">
                      Current equipment distribution
                    </p>
                  </div>

                  <MapPin className="h-5 w-5 text-[#a78bfa]" />
                </div>

                <div
                  className="relative h-72 overflow-hidden border border-white/5 bg-[#161618]"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(139,92,246,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.08) 1px, transparent 1px)",
                    backgroundSize: "35px 35px",
                  }}
                >
                  {/* Map lines */}
                  <div className="absolute left-10 top-20 h-px w-72 rotate-12 bg-[#8b5cf6]/20" />
                  <div className="absolute left-20 top-40 h-px w-80 -rotate-12 bg-[#8b5cf6]/20" />
                  <div className="absolute left-32 top-10 h-64 w-px rotate-12 bg-[#8b5cf6]/10" />

                  {/* Pins */}
                  {[
                    { left: "25%", top: "35%", name: "Site A" },
                    { left: "65%", top: "25%", name: "Site B" },
                    { left: "52%", top: "68%", name: "Site C" },
                  ].map((pin) => (
                    <motion.div
                      key={pin.name}
                      className="absolute"
                      style={{
                        left: pin.left,
                        top: pin.top,
                      }}
                      animate={{
                        y: [0, -6, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                      }}
                    >
                      <div className="relative">
                        <span className="absolute -inset-2 animate-ping rounded-full bg-[#8b5cf6]/20" />

                        <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-[#8b5cf6]/50 bg-[#8b5cf6]/20">
                          <MapPin className="h-4 w-4 text-[#a78bfa]" />
                        </div>

                        <div className="absolute left-10 top-1 whitespace-nowrap rounded bg-[#161618] px-2 py-1 text-[8px] text-zinc-300">
                          {pin.name}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  <div className="absolute bottom-4 left-4 border border-white/5 bg-[#18181b]/90 px-3 py-2 backdrop-blur">
                    <p className="text-[8px] uppercase tracking-wider text-zinc-500">
                      Active sites
                    </p>
                    <p className="mt-1 text-lg font-bold text-white">12</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================
          BUILT FOR EVERYONE
      ========================================================== */}
      <section id="about" className="bg-[#1c1c1f] py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#a78bfa]">
              One Platform
            </span>

            <h2 className="mt-4 text-4xl font-black sm:text-5xl">
              Solutions built to power
              <br />
              your entire jobsite.
            </h2>

            <p className="mt-5 text-sm leading-6 text-zinc-500">
              From fleet administrators to project managers, EquipShare keeps
              everyone connected.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Building2,
                title: "Fleet Admins",
                text: "Manage assets, availability, utilization and fleet performance.",
              },
              {
                icon: HardHat,
                title: "Project Managers",
                text: "Find the right equipment and keep projects moving.",
              },
              {
                icon: Users,
                title: "Construction Teams",
                text: "Collaborate with one centralized equipment workspace.",
              },
            ].map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-white/10 bg-[#161618] p-8"
                >
                  <div className="flex h-12 w-12 items-center justify-center bg-[#8b5cf6]/10">
                    <Icon className="h-5 w-5 text-[#a78bfa]" />
                  </div>

                  <h3 className="mt-7 text-xl font-bold">{item.title}</h3>

                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    {item.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          CTA
      ========================================================== */}
      <section className="relative overflow-hidden py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/10 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <span className="inline-flex items-center gap-2 border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#c4b5fd]">
            <Zap className="h-3.5 w-3.5" />
            Start Building Smarter
          </span>

          <h2 className="mt-7 text-4xl font-black sm:text-6xl">
            Your equipment.
            <br />
            <span className="text-[#a78bfa]">One intelligent network.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-zinc-500">
            Join EquipShare and take control of your equipment, projects and
            utilization from one powerful platform.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 bg-[#8b5cf6] px-7 py-3.5 text-sm font-bold transition hover:bg-[#7c3aed]"
            >
              Create Your Workspace
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 border border-white/10 px-7 py-3.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================== */}
      <footer className="border-t border-white/10 bg-[#111113]">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center bg-[#8b5cf6] font-bold">
                  E
                </span>

                <span className="text-xl font-bold">EquipShare</span>
              </Link>

              <p className="mt-5 max-w-sm text-sm leading-6 text-zinc-600">
                Intelligent equipment sharing and fleet management for modern
                construction teams.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Platform
              </h4>

              <div className="mt-5 space-y-3 text-sm text-zinc-600">
                <a className="block transition hover:text-white" href="#solutions">
                  Solutions
                </a>
                <a className="block transition hover:text-white" href="#equipment">
                  Equipment
                </a>
                <a className="block transition hover:text-white" href="#visibility">
                  Visibility
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Account
              </h4>

              <div className="mt-5 space-y-3 text-sm text-zinc-600">
                <Link
                  className="block transition hover:text-white"
                  to="/login"
                >
                  Log in
                </Link>

                <Link
                  className="block transition hover:text-white"
                  to="/register"
                >
                  Create account
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col justify-between gap-4 border-t border-white/5 pt-6 text-[10px] uppercase tracking-wider text-zinc-700 sm:flex-row">
            <span>© 2026 EquipShare. All rights reserved.</span>
            <span>Equipment Intelligence Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}