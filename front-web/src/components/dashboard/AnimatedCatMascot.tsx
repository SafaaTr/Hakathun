"use client";

import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { Heart, Sparkles, Fish, Moon, Sun, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function AnimatedCatMascot() {
  const [mood, setMood] = useState<"happy" | "playful" | "sleepy" | "eating">("happy");
  const [speech, setSpeech] = useState("Meow! Welcome to Rafeeq Platform~ 🐾");
  const [hearts, setHearts] = useState<{ id: number; left: number }[]>([]);

  // Setup initial looping cat animations
  useEffect(() => {
    // 1. Tail swing loop
    try {
      animate(".cat-tail", {
        rotate: [-25, 25],
        duration: 900,
        direction: "alternate",
        loop: true,
        ease: "inOutSine",
      });

      // 2. Ear twitching
      animate(".cat-ear-left", {
        rotate: [-6, 6],
        duration: 1400,
        direction: "alternate",
        loop: true,
        ease: "inOutSine",
      });

      animate(".cat-ear-right", {
        rotate: [6, -6],
        duration: 1600,
        direction: "alternate",
        loop: true,
        ease: "inOutSine",
      });

      // 3. Subtle breathing body animation
      animate(".cat-body-group", {
        scaleY: [1, 1.03],
        translateY: [0, -2],
        duration: 1800,
        direction: "alternate",
        loop: true,
        ease: "inOutQuad",
      });

      // 4. Yarn ball rolling
      animate(".yarn-ball-group", {
        translateX: [-40, 40],
        rotate: [-180, 180],
        duration: 2400,
        direction: "alternate",
        loop: true,
        ease: "inOutSine",
      });

      // 5. Paw reaching for yarn
      animate(".cat-play-paw", {
        translateY: [0, -12, 0],
        rotate: [0, -15, 0],
        duration: 1200,
        direction: "alternate",
        loop: true,
        ease: "inOutQuad",
      });
    } catch (e) {}
  }, []);

  // Action: Pet the cat
  const handlePetCat = () => {
    setMood("happy");
    setSpeech("Purr... purr... Rafeeq loves pets! 💖");

    // Spawn floating heart bubbles
    const newHearts = Array.from({ length: 4 }).map((_, i) => ({
      id: Date.now() + i,
      left: 30 + Math.random() * 40,
    }));
    setHearts(newHearts);

    try {
      animate(".cat-head-group", {
        translateY: [0, 8, 0],
        scale: [1, 1.06, 1],
        duration: 600,
        ease: "outElastic(1, .6)",
      });

      animate(".floating-heart", {
        translateY: [0, -60],
        opacity: [1, 0],
        scale: [0.8, 1.4],
        delay: stagger(100),
        duration: 1200,
      });
    } catch (e) {}
  };

  // Action: Play with yarn
  const handlePlayYarn = () => {
    setMood("playful");
    setSpeech("Catching the yarn ball! Wheeee! 🧶🐾");

    try {
      animate(".yarn-ball-group", {
        translateX: [-70, 70],
        rotate: [-360, 360],
        duration: 900,
        direction: "alternate",
        loop: 3,
        ease: "inOutQuad",
      });

      animate(".cat-play-paw", {
        translateY: [-20, 5, -20],
        rotate: [-30, 10, -30],
        duration: 450,
        loop: 4,
        ease: "inOutSine",
      });

      animate(".cat-whole", {
        translateY: [0, -15, 0],
        duration: 500,
        ease: "outBounce",
      });
    } catch (e) {}
  };

  // Action: Feed fish treat
  const handleFeedCat = () => {
    setMood("eating");
    setSpeech("Yum yum! Fresh tuna treat! Delicious~ 🐟✨");

    try {
      animate(".fish-treat", {
        translateY: [-40, 20],
        opacity: [1, 0],
        scale: [1.2, 0.4],
        duration: 900,
        ease: "inBack",
      });

      animate(".cat-mouth", {
        scaleY: [1, 1.8, 1],
        duration: 300,
        loop: 4,
        ease: "inOutQuad",
      });
    } catch (e) {}
  };

  // Action: Sleepy nap mode
  const handleNapMode = () => {
    setMood("sleepy");
    setSpeech("Zzz... taking a cozy cat nap in the sun... 💤😴");

    try {
      animate(".cat-eye-open", {
        scaleY: [1, 0.1],
        duration: 600,
        ease: "outQuad",
      });

      animate(".sleepy-zzz", {
        translateY: [0, -40],
        opacity: [0, 1, 0],
        scale: [0.5, 1.2],
        duration: 1800,
        loop: true,
        delay: stagger(500),
      });
    } catch (e) {}
  };

  return (
    <div className="bg-card border border-card-border rounded-3xl p-6 lg:p-8 shadow-xs space-y-6 relative overflow-hidden select-none">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-400/10 dark:bg-yellow/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner / Speech Bubble */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border pb-5 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐱</span>
            <h3 className="text-xl font-extrabold text-foreground tracking-tight">
              Meet Rafeeq (رفيق) — The Platform Mascot
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-yellow/20 text-navy dark:text-yellow text-xs font-bold border border-yellow/40">
              Interactive Mascot
            </span>
          </div>
          <p className="text-xs text-muted">
            Animated with <span className="font-mono font-bold text-amber-500">anime.js</span> · Click on the cat or use the playful buttons below!
          </p>
        </div>

        {/* Dynamic Speech Bubble */}
        <div className="relative bg-cream dark:bg-card-border/40 border border-card-border px-4 py-2.5 rounded-2xl max-w-sm text-xs font-bold text-foreground flex items-center gap-2 shadow-xs">
          <Sparkles className="w-4 h-4 text-yellow shrink-0 animate-spin" />
          <span>{speech}</span>
        </div>
      </div>

      {/* Center Stage: The Animated Cat Illustration */}
      <div className="relative flex flex-col items-center justify-center py-6 min-h-[320px] relative z-10">
        {/* Floating Heart Bubbles */}
        {hearts.map((h) => (
          <div
            key={h.id}
            style={{ left: `${h.left}%` }}
            className="floating-heart absolute top-12 text-rose-500 text-2xl pointer-events-none z-20"
          >
            ❤️
          </div>
        ))}

        {/* Sleepy Zzz floating letters */}
        {mood === "sleepy" && (
          <div className="absolute top-8 right-1/3 flex flex-col gap-1 text-blue font-black font-mono pointer-events-none z-20">
            <span className="sleepy-zzz text-xl">Z</span>
            <span className="sleepy-zzz text-base ml-2">z</span>
            <span className="sleepy-zzz text-xs ml-4">z...</span>
          </div>
        )}

        {/* Dropping Fish Treat */}
        {mood === "eating" && (
          <div className="fish-treat absolute top-10 text-3xl pointer-events-none z-20">
            🐟
          </div>
        )}

        {/* The SVG Cat */}
        <div
          onClick={handlePetCat}
          className="cat-whole cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] relative"
          title="Click to pet Rafeeq!"
        >
          <svg
            width="340"
            height="260"
            viewBox="0 0 340 260"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-lg"
          >
            {/* Soft Shadow on Floor */}
            <ellipse cx="170" cy="245" rx="120" ry="12" fill="currentColor" className="text-black/10 dark:text-black/30" />

            {/* Cozy Cushion/Mat */}
            <ellipse cx="170" cy="240" rx="110" ry="14" fill="#F8BD00" fillOpacity="0.25" stroke="#F8BD00" strokeWidth="2" strokeDasharray="4 4" />

            {/* WAGGING TAIL (Animated via anime.js .cat-tail) */}
            <g
              className="cat-tail"
              style={{ transformOrigin: "260px 210px" }}
            >
              <path
                d="M255 210 C290 205, 310 160, 285 125 C275 110, 260 115, 265 130 C272 150, 270 185, 245 205"
                fill="#FFB020"
                stroke="#D97706"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* White tail tip */}
              <circle cx="280" cy="122" r="9" fill="#FFFBEB" stroke="#D97706" strokeWidth="2" />
            </g>

            {/* CAT BODY (Breathing Animation .cat-body-group) */}
            <g className="cat-body-group" style={{ transformOrigin: "170px 210px" }}>
              {/* Main Body */}
              <ellipse
                cx="170"
                cy="185"
                rx="65"
                ry="50"
                fill="#FFB020"
                stroke="#D97706"
                strokeWidth="4"
              />

              {/* White Belly Patch */}
              <ellipse
                cx="170"
                cy="192"
                rx="38"
                ry="32"
                fill="#FFFBEB"
              />

              {/* Back Legs Paws */}
              <ellipse cx="115" cy="225" rx="18" ry="12" fill="#FFB020" stroke="#D97706" strokeWidth="3" />
              <ellipse cx="225" cy="225" rx="18" ry="12" fill="#FFB020" stroke="#D97706" strokeWidth="3" />

              {/* Left Front Paw (Resting) */}
              <g>
                <rect x="140" y="215" width="22" height="24" rx="11" fill="#FFFBEB" stroke="#D97706" strokeWidth="3" />
                <line x1="147" y1="228" x2="147" y2="236" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
                <line x1="155" y1="228" x2="155" y2="236" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* Right Front Paw (Animated Playing Paw .cat-play-paw) */}
              <g
                className="cat-play-paw"
                style={{ transformOrigin: "185px 210px" }}
              >
                <rect x="178" y="212" width="22" height="24" rx="11" fill="#FFFBEB" stroke="#D97706" strokeWidth="3" />
                <line x1="185" y1="225" x2="185" y2="233" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
                <line x1="193" y1="225" x2="193" y2="233" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
              </g>
            </g>

            {/* CAT HEAD GROUP (.cat-head-group) */}
            <g className="cat-head-group" style={{ transformOrigin: "170px 115px" }}>
              {/* Left Ear (Animated .cat-ear-left) */}
              <g
                className="cat-ear-left"
                style={{ transformOrigin: "128px 85px" }}
              >
                <polygon
                  points="115,85 130,35 155,75"
                  fill="#FFB020"
                  stroke="#D97706"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
                <polygon
                  points="122,80 132,45 148,74"
                  fill="#FDA4AF"
                />
              </g>

              {/* Right Ear (Animated .cat-ear-right) */}
              <g
                className="cat-ear-right"
                style={{ transformOrigin: "212px 85px" }}
              >
                <polygon
                  points="185,75 210,35 225,85"
                  fill="#FFB020"
                  stroke="#D97706"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
                <polygon
                  points="192,74 208,45 218,80"
                  fill="#FDA4AF"
                />
              </g>

              {/* Head Circle */}
              <circle
                cx="170"
                cy="115"
                r="52"
                fill="#FFB020"
                stroke="#D97706"
                strokeWidth="4"
              />

              {/* Tabby Forehead Stripes */}
              <path d="M170 70 L170 85" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />
              <path d="M160 74 L163 86" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />
              <path d="M180 74 L177 86" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />

              {/* White Face Muzzle */}
              <ellipse cx="170" cy="132" rx="28" ry="18" fill="#FFFBEB" />

              {/* EYES */}
              {mood === "sleepy" ? (
                /* Sleeping curved eyes */
                <g>
                  <path d="M142 115 Q150 122 158 115" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                  <path d="M182 115 Q190 122 198 115" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                </g>
              ) : (
                /* Big expressive animated eyes */
                <g className="cat-eye-open">
                  {/* Left Eye */}
                  <ellipse cx="150" cy="112" rx="9" ry="11" fill="#0F172A" />
                  <circle cx="147" cy="109" r="4" fill="white" />
                  <circle cx="153" cy="115" r="1.5" fill="white" />

                  {/* Right Eye */}
                  <ellipse cx="190" cy="112" rx="9" ry="11" fill="#0F172A" />
                  <circle cx="187" cy="109" r="4" fill="white" />
                  <circle cx="193" cy="115" r="1.5" fill="white" />
                </g>
              )}

              {/* Pink Nose */}
              <polygon points="166,126 174,126 170,131" fill="#F43F5E" />

              {/* Cute Cat Mouth */}
              <path
                className="cat-mouth"
                d="M164 133 C164 138, 170 138, 170 133 C170 138, 176 138, 176 133"
                stroke="#78350F"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* Cheek Blushes */}
              <circle cx="136" cy="126" r="6" fill="#FDA4AF" fillOpacity="0.6" />
              <circle cx="204" cy="126" r="6" fill="#FDA4AF" fillOpacity="0.6" />

              {/* Left Whiskers */}
              <line x1="140" y1="128" x2="108" y2="124" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
              <line x1="140" y1="133" x2="105" y2="134" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
              <line x1="140" y1="138" x2="110" y2="144" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />

              {/* Right Whiskers */}
              <line x1="200" y1="128" x2="232" y2="124" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
              <line x1="200" y1="133" x2="235" y2="134" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
              <line x1="200" y1="138" x2="230" y2="144" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />

              {/* Cute Collar with Golden Bell */}
              <path d="M142 162 Q170 172 198 162" stroke="#EF4444" strokeWidth="6" strokeLinecap="round" fill="none" />
              <circle cx="170" cy="168" r="6" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
              <circle cx="170" cy="169" r="1.5" fill="#78350F" />
            </g>

            {/* ROLLING YARN BALL (.yarn-ball-group animated via anime.js) */}
            <g
              className="yarn-ball-group cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handlePlayYarn();
              }}
              style={{ transformOrigin: "250px 225px" }}
            >
              {/* Unraveled yarn string on floor */}
              <path
                d="M198 226 Q215 235 235 228"
                stroke="#EC4899"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              {/* Ball */}
              <circle cx="250" cy="225" r="16" fill="#EC4899" stroke="#BE185D" strokeWidth="3" />
              {/* Yarn wraps pattern */}
              <path d="M240 216 Q252 225 242 234" stroke="#FDF2F8" strokeWidth="2" fill="none" />
              <path d="M246 212 Q258 224 250 238" stroke="#FDF2F8" strokeWidth="2" fill="none" />
              <path d="M236 225 Q250 220 264 225" stroke="#FDF2F8" strokeWidth="2" fill="none" />
            </g>
          </svg>
        </div>

        <p className="text-xs text-muted/80 mt-2 font-medium">
          Click on Rafeeq to give him head scratches! 👆
        </p>
      </div>

      {/* Interactive Controls Bar */}
      <div className="pt-4 border-t border-card-border flex flex-wrap items-center justify-center gap-3 relative z-10">
        <Button
          variant={mood === "happy" ? "primary" : "secondary"}
          size="sm"
          onClick={handlePetCat}
          className="gap-2 font-bold shadow-xs text-xs"
        >
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
          <span>Pet Rafeeq</span>
        </Button>

        <Button
          variant={mood === "playful" ? "primary" : "secondary"}
          size="sm"
          onClick={handlePlayYarn}
          className="gap-2 font-bold shadow-xs text-xs"
        >
          <Play className="w-3.5 h-3.5 text-yellow" />
          <span>Play with Yarn 🧶</span>
        </Button>

        <Button
          variant={mood === "eating" ? "primary" : "secondary"}
          size="sm"
          onClick={handleFeedCat}
          className="gap-2 font-bold shadow-xs text-xs"
        >
          <Fish className="w-3.5 h-3.5 text-blue" />
          <span>Treat Snack 🐟</span>
        </Button>

        <Button
          variant={mood === "sleepy" ? "primary" : "secondary"}
          size="sm"
          onClick={handleNapMode}
          className="gap-2 font-bold shadow-xs text-xs"
        >
          <Moon className="w-3.5 h-3.5 text-indigo-400" />
          <span>Cat Nap 💤</span>
        </Button>
      </div>
    </div>
  );
}
