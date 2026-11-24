"use client";

import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import {
  Store,
  Stethoscope,
  Users,
  HeartHandshake,
  Activity,
  Sparkles,
  RotateCw,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PlatformPulseAnimationProps {
  stats: {
    storesCount: number;
    doctorsCount: number;
    hostsCount: number;
    usersCount: number;
  };
}

export function PlatformPulseAnimation({ stats }: PlatformPulseAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pulseCount, setPulseCount] = useState(0);

  const triggerAnimation = () => {
    setPulseCount((prev) => prev + 1);

    // 1. Staggered node entrance/bounce
    try {
      animate(".ecosystem-card", {
        translateY: [25, 0],
        opacity: [0.7, 1],
        scale: [0.95, 1],
        delay: stagger(120),
        duration: 800,
      });

      // 2. Pulsing wave on the radar circle
      animate(".radar-pulse-ring", {
        scale: [0.9, 1.6],
        opacity: [0.8, 0],
        duration: 1800,
        delay: stagger(400),
        loop: 2,
      });

      // 3. Energy waveform pulse
      animate(".energy-wave-path", {
        opacity: [0.2, 0.7, 0.2],
        duration: 2000,
        loop: true,
      });
    } catch (e) {
      // Fallback
    }
  };

  useEffect(() => {
    triggerAnimation();

    // Continuous subtle background floating animation
    let floatAnimation: any;
    try {
      floatAnimation = animate(".floating-badge", {
        translateY: [-3, 3],
        loop: true,
        duration: 2200,
        delay: stagger(250),
      });
    } catch (e) {}

    return () => {
      if (floatAnimation && typeof floatAnimation.pause === "function") {
        floatAnimation.pause();
      }
    };
  }, []);

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    try {
      animate(e.currentTarget, {
        scale: [1, 1.05, 1],
        duration: 400,
      });
    } catch (e) {}
  };

  const nodes = [
    {
      id: "stores",
      title: "Active Stores",
      count: stats.storesCount,
      unit: "Syrian Pet Stores",
      icon: Store,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      badge: "Marketplace Live",
    },
    {
      id: "vets",
      title: "Veterinary Clinics",
      count: stats.doctorsCount,
      unit: "Verified Doctors",
      icon: Stethoscope,
      color: "text-blue",
      bgColor: "bg-blue/10",
      borderColor: "border-blue/20",
      badge: "Slots Synced",
    },
    {
      id: "hosts",
      title: "Host Caregivers",
      count: stats.hostsCount,
      unit: "Home & Barn Boarding",
      icon: Users,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      badge: "Boarding Ready",
    },
    {
      id: "owners",
      title: "Pet Community",
      count: stats.usersCount,
      unit: "Registered Owners",
      icon: HeartHandshake,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/20",
      badge: "Active Ecosystem",
    },
  ];

  const liveFeeds = [
    {
      time: "Just now",
      text: "Dr. Zaid Khouri updated available clinic slots in Damascus (Shaalan)",
      category: "VET",
      color: "text-blue bg-blue/10",
    },
    {
      time: "2 mins ago",
      text: "Nasser Al-Homsi confirmed temporary cat boarding reservation (Mezzeh)",
      category: "HOST",
      color: "text-emerald-600 bg-emerald-500/10",
    },
    {
      time: "15 mins ago",
      text: "Happy Paws Store inventory synchronized with COD delivery option",
      category: "STORE",
      color: "text-amber-600 bg-amber-500/10",
    },
    {
      time: "1 hour ago",
      text: "Pet owner registered Milo (Golden Retriever) with complete health passport",
      category: "OWNER",
      color: "text-rose-600 bg-rose-500/10",
    },
  ];

  return (
    <div
      ref={containerRef}
      className="bg-card border border-card-border rounded-3xl p-6 lg:p-8 shadow-xs space-y-7 relative overflow-hidden"
    >
      {/* Decorative background energy waves */}
      <svg
        className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-20 dark:opacity-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="energy-wave-path"
          d="M0,80 Q250,20 500,80 T1000,80 T1500,80"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="energy-wave-path"
          d="M0,160 Q300,100 600,160 T1200,160"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border pb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="w-10 h-10 rounded-2xl bg-yellow/20 flex items-center justify-center text-navy dark:text-yellow">
              <Activity className="w-5 h-5 animate-pulse" />
            </span>
            <span className="radar-pulse-ring absolute w-10 h-10 rounded-2xl border-2 border-yellow pointer-events-none" />
            <span className="radar-pulse-ring absolute w-10 h-10 rounded-2xl border-2 border-amber-500 pointer-events-none" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-foreground tracking-tight">
                Rafeeq Ecosystem Live Pulse
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                LIVE
              </span>
            </div>
            <p className="text-xs text-muted">
              Interactive real-time platform telemetry powered by anime.js
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>All Services Operational</span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={triggerAnimation}
            className="gap-1.5 text-xs font-bold"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Re-animate Pulse</span>
          </Button>
        </div>
      </div>

      {/* 4 Interactive Animated Nodes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {nodes.map((node) => {
          const Icon = node.icon;
          return (
            <div
              key={node.id}
              onClick={handleCardClick}
              className={`ecosystem-card p-5 rounded-2xl border ${node.borderColor} ${node.bgColor} bg-card hover:shadow-md transition-shadow cursor-pointer select-none space-y-3 relative group`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${node.bgColor} ${node.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="floating-badge px-2 py-0.5 rounded-md text-[10px] font-bold bg-card border border-card-border text-foreground shadow-2xs">
                  {node.badge}
                </span>
              </div>

              <div>
                <div className="text-2xl font-black text-foreground font-mono flex items-baseline gap-1">
                  <span
                    className="counter-value"
                    data-target={node.count}
                  >
                    {node.count}
                  </span>
                  <span className="text-xs text-muted font-normal">units</span>
                </div>
                <h4 className="text-xs font-bold text-foreground mt-0.5">
                  {node.title}
                </h4>
                <p className="text-[11px] text-muted">{node.unit}</p>
              </div>

              <div className="pt-2 border-t border-card-border/40 flex items-center justify-between text-[10px] text-muted">
                <span>Network Node</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-time Activity Telemetry Feed */}
      <div className="bg-cream/30 dark:bg-card-border/20 border border-card-border/60 rounded-2xl p-5 space-y-3.5 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow" />
            <span className="text-xs font-bold text-foreground tracking-wide uppercase">
              Recent Platform Telemetry
            </span>
          </div>
          <span className="text-[11px] font-mono text-muted">
            Damascus Time (GMT+3)
          </span>
        </div>

        <div className="divide-y divide-card-border/40">
          {liveFeeds.map((feed, i) => (
            <div
              key={i}
              className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-black uppercase ${feed.color}`}
                >
                  {feed.category}
                </span>
                <span className="font-semibold text-foreground/90">
                  {feed.text}
                </span>
              </div>
              <span className="text-[11px] text-muted font-mono shrink-0">
                {feed.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
