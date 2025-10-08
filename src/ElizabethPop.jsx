import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAME = "Elizabeth";
const ROUND_SECONDS = 30; // fixed timer
const BUBBLE_COUNT = 7;

const EMOJIS = [
  "✨",
  "💛",
  "🌼",
  "🌞",
  "🌸",
  "🌟",
  "🫶",
  "🎈",
  "🎉",
  "💐",
  "🧃",
  "🍓",
  "🌈",
];
const COMPLIMENTS = [
  `${NAME}, your kindness is contagious.`,
  `Your smile could power a small city, ${NAME}.`,
  `Talking to you is like a breath of fresh air.`,
  `Your energy is infectious.`,
  `You’re a natural at whatever you do, ${NAME}.`,
  `I admire your confidence.`,
  `Your incredible in every way, ${NAME}.`,
  `Your jokes brighten up everyone's day.`,
  `You make everyone in the room wonder why its so hot, ${NAME}.`,
  `You make the days go by too fast (seriously stop doing that ).`,
  `You’re just worth it, ${NAME}.`,
  `You radiate warmth like sunshine, ${NAME}.`,
  `You make average moments feel like movie montages.`,
  `People feel better just because you exist.`,
  `You bring out the best in others, ${NAME}.`,
  `You make the ordinary feel magical.`,
  `You’re very impressive in so many ways`,
];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Timer that resets whenever resetKey changes (e.g., when a round starts)
function useTimer(running, seconds, resetKey, onEnd) {
  const [t, setT] = useState(seconds);

  useEffect(() => {
    if (!running) return;
    setT(seconds); // reset at start of round
    const id = setInterval(() => {
      setT((x) => {
        if (x <= 1) {
          clearInterval(id);
          onEnd?.();
          return 0;
        }
        return x - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, resetKey]); // reset when a new round starts

  return t;
}

function makeBubble() {
  return {
    id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
    xvw: rand(10, 90),
    size: rand(64, 110),
    drift: rand(-20, 20),
    duration: rand(5, 9),
    delay: rand(0, 2.5),
    emoji: pick(EMOJIS),
  };
}

export default function ElizabethPop() {
  const [running, setRunning] = useState(false);
  const [resetKey, setResetKey] = useState(0); // bump to reset timer
  const [score, setScore] = useState(0);
  const time = useTimer(running, ROUND_SECONDS, resetKey, () =>
    setRunning(false)
  );

  const [bubbles, setBubbles] = useState(() =>
    Array.from({ length: BUBBLE_COUNT }, () => makeBubble())
  );

  // compliments that fall downward
  const [fallingCompliments, setFallingCompliments] = useState([]);

  function start() {
    setScore(0);
    setRunning(true);
    setBubbles(Array.from({ length: BUBBLE_COUNT }, () => makeBubble()));
    setFallingCompliments([]);
    setResetKey((k) => k + 1); // triggers timer reset
  }

  function popBubble(idx) {
    if (!running) return;
    setScore((s) => s + 1);

    // spawn a padded falling compliment near the bubble's x
    const c = {
      id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
      text: pick(COMPLIMENTS),
      xvw: bubbles[idx].xvw + bubbles[idx].drift / 10,
    };
    setFallingCompliments((arr) => [...arr, c]);
    setTimeout(() => {
      setFallingCompliments((arr) => arr.filter((t) => t.id !== c.id));
    }, 1500);

    // replace only the clicked bubble
    setBubbles((bs) => {
      const copy = [...bs];
      copy[idx] = makeBubble();
      return copy;
    });
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6"
      style={{
        backgroundImage:
          "radial-gradient(1200px 500px at 20% -10%, rgba(255,238,170,.25), transparent)," +
          "radial-gradient(900px 500px at 120% 10%, rgba(187,230,255,.25), transparent)," +
          "linear-gradient(180deg, #ffffff, #f7fbff)",
      }}
    >
      <div className="w-full max-w-2xl">
        <div className="text-center mb-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {NAME}, Hope this can make you smile!
          </h1>
          <p className="text-slate-600 mt-1">
            Pop the bubbles for tiny compliments 🎈 - Yours, Santi ♡
          </p>
        </div>

        {/* Controls (fixed timer) */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="px-4 py-2 rounded-full bg-white border border-slate-200">
            ⏱️{" "}
            <span className="font-semibold">
              {String(time).padStart(2, "0")}s
            </span>
          </div>
          <div className="px-4 py-2 rounded-full bg-white border border-slate-200">
            🎯 <span className="font-semibold">{score}</span>
          </div>
          <button
            onClick={start}
            className="px-5 py-2 rounded-full bg-black text-white hover:bg-slate-900 cursor-pointer active:scale-[0.99] transition"
          >
            {running ? "Restart" : "Start"}
          </button>
        </div>

        {/* Playfield */}
        <div
          className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/70 backdrop-blur"
          style={{ height: 460 }}
        >
          {/* Rising bubbles */}
          {bubbles.map((b, i) => (
            <motion.button
              key={b.id}
              onClick={() => popBubble(i)}
              className="absolute flex items-center justify-center rounded-full select-none cursor-pointer"
              style={{
                left: `${b.xvw}vw`,
                width: b.size,
                height: b.size,
                transform: "translateX(-50%)",
                background: "linear-gradient(180deg,#ffffffee,#f3f7ffcc)",
                boxShadow: "0 8px 24px rgba(0,0,0,.08)",
                border: "1px solid rgba(15,23,42,.08)",
              }}
              initial={{ y: 420, opacity: 0, scale: 0.9 }}
              animate={{
                y: -80,
                x: `calc(-50% + ${b.drift}px)`,
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: b.duration,
                delay: b.delay,
                ease: "easeOut",
              }}
              whileTap={{ scale: 0.92 }}
            >
              <span className="text-2xl md:text-3xl">{b.emoji}</span>
            </motion.button>
          ))}

          {/* Falling compliment “bubbles” with extra padding */}
          <AnimatePresence>
            {fallingCompliments.map((c) => (
              <motion.div
                key={c.id}
                className="absolute left-1/2 -translate-x-1/2 bg-black text-white rounded-full text-base md:text-lg shadow-lg"
                style={{
                  left: `${c.xvw}vw`,
                  // ✅ guaranteed padding regardless of Tailwind scanning
                  padding: "16px 28px",
                }}
                initial={{ y: 20, opacity: 0, scale: 0.96 }}
                animate={{ y: 380, opacity: 1, scale: 1 }}
                exit={{ y: 440, opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              >
                {c.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {!running && (
          <p className="text-center text-slate-500 mt-3 text-sm">
            Press Start and try to beat your high score — each pop = 1
            compliment!
          </p>
        )}
      </div>
    </div>
  );
}
