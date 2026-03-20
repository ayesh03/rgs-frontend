import React, { useEffect, useState, useRef } from "react";
import { Box } from "@mui/material";
import { motion, useAnimationControls, useMotionValue } from "framer-motion";

const TRACK_WIDTH = 430;

// ─ Smoke puff 
const SmokePuff = ({ delay, flipped }) => (
  <motion.div
    style={{
      position: "absolute",
      top: -10,
      left: flipped ? "auto" : 6,
      right: flipped ? 6 : "auto",
      width: 8,
      height: 5,
      borderRadius: "50%",
      background: "rgba(255,255,255,0.9)",
      pointerEvents: "none",
    }}
    animate={{
      y: [-2, -16],
      x: flipped ? [0, 4] : [0, -4],
      opacity: [0.9, 0],
      scale: [0.6, 1.8],
    }}
    transition={{
      duration: 0.9,
      delay,
      repeat: Infinity,
      repeatDelay: 0.4,
      ease: "easeOut",
    }}
  />
);

// ─ Wheel 
const Wheel = ({ x, flipped }) => (
  <motion.div
    style={{
      position: "absolute",
      bottom: -4,
      left: x,
      width: 9,
      height: 9,
      borderRadius: "50%",
      border: "1.5px solid #4dabf7",
      background: "#1a2235",
    }}
    animate={{ rotate: flipped ? [0, -360] : [0, 360] }}
    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
  />
);

// ─ Loco 
const Loco = ({ flipped }) => (
  <Box
    sx={{
      position: "relative",
      width: 30,
      height: 16,
      background: "linear-gradient(135deg,#1565c0,#0d47a1)",
      borderRadius: flipped ? "6px 3px 2px 2px" : "3px 6px 2px 2px",
      border: "1px solid #4dabf7",
      boxShadow: "0 0 6px rgba(77,171,247,0.6)",
      flexShrink: 0,
    }}
  >
    <Box sx={{
      position: "absolute", top: 2,
      left: flipped ? 4 : "auto",
      right: flipped ? "auto" : 4,
      width: 7, height: 6,
      bgcolor: "#90caf9", borderRadius: 0.5, opacity: 0.8
    }} />
    <Box sx={{
      position: "absolute", top: -5,
      left: flipped ? "auto" : 4,
      right: flipped ? 4 : "auto",
      width: 4, height: 6,
      bgcolor: "#1565c0",
      borderRadius: "2px 2px 0 0",
      border: "1px solid #4dabf7"
    }} />
    <SmokePuff delay={0} flipped={flipped} />
    <SmokePuff delay={0.3} flipped={flipped} />
    <Wheel x={3} flipped={flipped} />
    <Wheel x={16} flipped={flipped} />
  </Box>
);

// ─ Buggy 
const Buggy = ({ flipped }) => (
  <Box
    sx={{
      position: "relative",
      width: 22,
      height: 12,
      background: "linear-gradient(135deg,#0d2952,#0a1e3d)",
      borderRadius: "2px 2px 1px 1px",
      border: "1px solid rgba(77,171,247,0.45)",
      flexShrink: 0,
    }}
  >
    <Box sx={{ position: "absolute", top: 2, left: 3, width: 5, height: 4, bgcolor: "#1e3a5f", borderRadius: 0.5 }} />
    <Box sx={{ position: "absolute", top: 2, right: 3, width: 5, height: 4, bgcolor: "#1e3a5f", borderRadius: 0.5 }} />
    <Wheel x={2} flipped={flipped} />
    <Wheel x={13} flipped={flipped} />
  </Box>
);

// ─ Coupler 
const Coupler = () => (
  <Box sx={{ width: 4, height: 2, bgcolor: "#4dabf7", alignSelf: "flex-end", mb: "5px", borderRadius: 1, flexShrink: 0 }} />
);
// ─ Sinal light
const SignalLight = ({ x, isGreen }) => (
  <Box sx={{ position: "absolute", bottom: 3, left: x, display: "flex", flexDirection: "column", alignItems: "center" }}>
    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: isGreen ? "#00e676" : "#f44336", boxShadow: isGreen ? "0 0 6px #00e676" : "0 0 6px #f44336", transition: "all 0.3s" }} />
    <Box sx={{ width: 2, height: 16, bgcolor: "#4dabf7" }} />
  </Box>
);


// ─ Track 
const Track = ({ width }) => (
  <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3 }}>
    <Box sx={{ position: "absolute", bottom: 1, left: 0, right: 0, height: 1, bgcolor: "rgba(77,171,247,0.3)" }} />
    {Array.from({ length: Math.ceil(width / 10) }).map((_, i) => (
      <Box key={i} sx={{
        position: "absolute", bottom: 0,
        left: i * 10, width: 6, height: 3,
        bgcolor: "rgba(77,171,247,0.15)", borderRadius: 0.3,
      }} />
    ))}
  </Box>
);

// ─ Main 
export default function Animatedtrain({ width = TRACK_WIDTH }) {
  const controls = useAnimationControls();
  const [flipped, setFlipped] = useState(false);
  const [paused, setPaused] = useState(false);

  const pausedRef = useRef(false);       // true when paused
  const flippedRef = useRef(false);      // current direction
  const xVal = useMotionValue(0);        // live x position tracker

  const trainWidth = 30 + 6 * 26;       // ~186px total train length
  const startX = -trainWidth;
  const endX = width + 4;
  const totalDist = endX - startX;      // full track distance
  const SPEED = totalDist / 3.5;        // px per second
  const signalX = width / 2 + 40;
  const [signalGreen, setSignalGreen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const runLoop = async () => {
      while (!cancelled) {
        // ── LEFT → RIGHT ──
        if (pausedRef.current || cancelled) break;
        flippedRef.current = false;
        setFlipped(false);
        controls.set({ x: startX });
        xVal.set(startX);
        await controls.start({ x: endX, transition: { duration: 3.5, ease: "linear" } });
        if (cancelled || pausedRef.current) break;
        await new Promise((r) => setTimeout(r, 350));
        if (cancelled || pausedRef.current) break;

        // ── RIGHT → LEFT ──
        if (pausedRef.current || cancelled) break;
        flippedRef.current = true;
        setFlipped(true);
        controls.set({ x: endX });
        xVal.set(endX);
        await controls.start({ x: startX, transition: { duration: 3.5, ease: "linear" } });
        if (cancelled || pausedRef.current) break;
        await new Promise((r) => setTimeout(r, 350));
        if (cancelled || pausedRef.current) break;
      }
    };

    runLoop();
    return () => { cancelled = true; };
  }, [controls, startX, endX]);

  // ── click: pause / resume from exact position 
  const handleClick = async () => {
    if (pausedRef.current) {
      // RESUME from exact current position
      pausedRef.current = false;
      setPaused(false);

      const dest = flippedRef.current ? startX : endX;
      const current = xVal.get();
      const remaining = Math.abs(dest - current) / SPEED; // seconds left

      // animate to destination from current position
      await controls.start({
        x: dest,
        transition: { duration: remaining, ease: "linear" },
      });

      // after reaching destination, continue the normal loop
      if (!pausedRef.current) {
        // small pause then flip and continue
        await new Promise((r) => setTimeout(r, 350));
        if (pausedRef.current) return;

        // flip direction and loop forever
        const loop = async () => {
          while (!pausedRef.current) {
            flippedRef.current = !flippedRef.current;
            setFlipped(flippedRef.current);
            const nextDest = flippedRef.current ? startX : endX;
            controls.set({ x: flippedRef.current ? endX : startX });
            xVal.set(flippedRef.current ? endX : startX);
            await controls.start({ x: nextDest, transition: { duration: 3.5, ease: "linear" } });
            if (pausedRef.current) break;
            await new Promise((r) => setTimeout(r, 350));
          }
        };
        loop();
      }
    } else {
      // PAUSE — save current x position
      pausedRef.current = true;
      setPaused(true);
      xVal.set(xVal.get());
      controls.stop();
    }
  };

  return (
    <Box
      onClick={handleClick}
      // title={paused ? "Click to resume" : "Click to pause"}
      sx={{
        position: "relative",
        width,
        height: 36,
        overflow: "hidden",
        alignSelf: "center",
        flexShrink: 0,
        cursor: "pointer",
      }}
    >
      <Track width={width} />
      <SignalLight x={signalX} isGreen={signalGreen} />

      <motion.div
        animate={controls}
        onUpdate={(latest) => {
          xVal.set(latest.x);
          const trainFront = flippedRef.current ? latest.x : latest.x + trainWidth;
          setSignalGreen(trainFront > signalX - 40 && trainFront < signalX + 40);
        }}
        style={{
          position: "absolute",
          bottom: 3,
          display: "flex",
          alignItems: "flex-end",
          gap: 0,
          overflow: "visible",
        }}
      >
        {!flipped ? (
          <>
            <Buggy flipped={false} /><Coupler />
            <Buggy flipped={false} /><Coupler />
            <Buggy flipped={false} /><Coupler />
            <Buggy flipped={false} /><Coupler />
            <Buggy flipped={false} /><Coupler />
            <Loco flipped={false} />
          </>
        ) : (
          <>
            <Loco flipped={true} />
            <Coupler /><Buggy flipped={true} />
            <Coupler /><Buggy flipped={true} />
            <Coupler /><Buggy flipped={true} />
            <Coupler /><Buggy flipped={true} />
            <Coupler /><Buggy flipped={true} />
          </>
        )}
      </motion.div>

      {/* {paused && (
        <Box sx={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          fontSize: "10px", color: "rgba(77,171,247,0.8)",
          pointerEvents: "none", userSelect: "none",
        }}>
          ▶
        </Box>
      )} */}
    </Box>
  );
}