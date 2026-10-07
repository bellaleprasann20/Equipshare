import React from "react";
import { motion } from "framer-motion";
import {
  Truck,
  Construction,
  HardHat,
  Zap,
  ArrowRight,
  Activity,
} from "lucide-react";

const equipment = [
  {
    name: "CAT 320",
    type: "Excavator",
    icon: Construction,
    eei: "98",
    status: "Available",
    position: "left-8 top-20",
  },
  {
    name: "JCB 3DX",
    type: "Backhoe Loader",
    icon: Construction,
    eei: "91",
    status: "In Use",
    position: "right-6 top-36",
  },
  {
    name: "Tata 407",
    type: "Transport",
    icon: Truck,
    eei: "87",
    status: "Available",
    position: "left-16 bottom-20",
  },
];

function AnimatedHeroGraphics() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {/* Background glow */}
      <motion.div
        className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-[#8b5cf6]/20 blur-[120px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-blue-600/10 blur-[130px]"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Blueprint grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Connection rings */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#8b5cf6]/10"
        animate={{ rotate: 360 }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <motion.div
        className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#8b5cf6]/15"
        animate={{ rotate: -360 }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Connection lines */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 800 800"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M170 190 C300 250, 320 340, 400 400"
          fill="none"
          stroke="rgba(139,92,246,0.25)"
          strokeWidth="1"
          strokeDasharray="6 8"
          animate={{
            strokeDashoffset: [0, -100],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.path
          d="M630 300 C520 330, 500 370, 400 400"
          fill="none"
          stroke="rgba(139,92,246,0.25)"
          strokeWidth="1"
          strokeDasharray="6 8"
          animate={{
            strokeDashoffset: [0, -100],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.path
          d="M210 620 C300 540, 350 480, 400 400"
          fill="none"
          stroke="rgba(139,92,246,0.25)"
          strokeWidth="1"
          strokeDasharray="6 8"
          animate={{
            strokeDashoffset: [0, -100],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </svg>

      {/* Equipment cards */}
      {equipment.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={item.name}
            className={
              "absolute " +
              item.position +
              " z-30 w-48 rounded-2xl border border-white/10 bg-[#18181b]/90 p-3 shadow-2xl backdrop-blur-xl"
            }
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: [0, -8, 0],
            }}
            transition={{
              opacity: {
                duration: 0.7,
                delay: index * 0.2,
              },
              y: {
                duration: 4 + index,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#8b5cf6]/30 bg-[#8b5cf6]/10">
                <Icon className="h-5 w-5 text-[#a78bfa]" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-white">
                  {item.name}
                </p>

                <p className="truncate text-[10px] text-zinc-500">
                  {item.type}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2">
              <div className="flex items-center gap-1.5">
                <span
                  className={
                    item.status === "Available"
                      ? "h-1.5 w-1.5 rounded-full bg-green-500"
                      : "h-1.5 w-1.5 rounded-full bg-yellow-500"
                  }
                />

                <span className="text-[9px] text-zinc-400">
                  {item.status}
                </span>
              </div>

              <span className="font-mono text-[10px] font-bold text-[#a78bfa]">
                {item.eei} EEI
              </span>
            </div>
          </motion.div>
        );
      })}

      {/* Center system */}
      <motion.div
        className="absolute left-1/2 top-1/2 z-40 flex h-44 w-44 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
        animate={{
          scale: [1, 1.03, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-[#8b5cf6]/10 blur-2xl" />

        {/* Rotating ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-[#8b5cf6]/30"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.div
          className="absolute inset-3 rounded-full border border-dashed border-[#a78bfa]/20"
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Center card */}
        <div className="relative flex h-32 w-32 flex-col items-center justify-center rounded-full border border-[#8b5cf6]/40 bg-[#18181b]/95 shadow-[0_0_60px_rgba(139,92,246,0.18)] backdrop-blur-xl">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#8b5cf6]/15">
            <Zap className="h-5 w-5 text-[#a78bfa]" />
          </div>

          <p className="text-[11px] font-bold tracking-[0.2em] text-white">
            EQUIPSHARE
          </p>

          <p className="mt-1 text-[8px] uppercase tracking-wider text-zinc-500">
            Allocation Engine
          </p>
        </div>
      </motion.div>

      {/* Live allocation panel */}
      <motion.div
        className="absolute bottom-10 right-10 z-50 w-56 rounded-2xl border border-[#8b5cf6]/20 bg-[#18181b]/95 p-4 shadow-2xl backdrop-blur-xl"
        initial={{
          opacity: 0,
          x: 30,
        }}
        animate={{
          opacity: 1,
          x: [0, 5, 0],
        }}
        transition={{
          opacity: {
            duration: 0.8,
            delay: 0.8,
          },
          x: {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
              <Activity className="h-4 w-4 text-green-400" />
            </div>

            <div>
              <p className="text-[10px] font-bold text-white">
                Live Allocation
              </p>

              <p className="text-[8px] text-zinc-500">
                System monitoring
              </p>
            </div>
          </div>

          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-zinc-500">
              Active equipment
            </span>

            <span className="text-[10px] font-bold text-white">
              24
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[9px] text-zinc-500">
              Utilization
            </span>

            <span className="text-[10px] font-bold text-[#a78bfa]">
              94.8%
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <motion.div
              className="h-full rounded-full bg-[#8b5cf6]"
              initial={{ width: "0%" }}
              animate={{ width: "94.8%" }}
              transition={{
                duration: 1.5,
                delay: 1,
                ease: "easeOut",
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Optimization notification */}
      <motion.div
        className="absolute bottom-32 left-8 z-50 flex items-center gap-3 rounded-xl border border-green-500/20 bg-[#18181b]/95 p-3 shadow-2xl backdrop-blur-xl"
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: [0, -5, 0],
        }}
        transition={{
          opacity: {
            duration: 0.8,
            delay: 1.2,
          },
          y: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
          <HardHat className="h-4 w-4 text-green-400" />
        </div>

        <div>
          <p className="text-[10px] font-bold text-white">
            Project Optimized
          </p>

          <p className="text-[8px] text-zinc-500">
            Idle time reduced by 28%
          </p>
        </div>

        <ArrowRight className="h-3 w-3 text-green-400" />
      </motion.div>

      {/* Floating data points */}
      <motion.div
        className="absolute left-[42%] top-[24%] h-1.5 w-1.5 rounded-full bg-[#a78bfa]"
        animate={{
          y: [0, 25, 0],
          opacity: [0.3, 1, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute right-[35%] top-[60%] h-1 w-1 rounded-full bg-blue-400"
        animate={{
          y: [0, -20, 0],
          opacity: [0.2, 1, 0.2],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

export default AnimatedHeroGraphics;