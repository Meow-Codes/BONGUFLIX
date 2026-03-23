import { useState, useEffect, useCallback, type ReactNode, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SpiralIcons from "./intro/SpiralIcons";
import CinematicRays from "./intro/CinematicRays";
import GlowPulse from "./intro/GlowPulse";
import CurvedText from "./intro/CurvedText";
import Tagline from "./intro/Tagline";
import "@fontsource/bebas-neue";

interface BonguFlixIntroProps {
  onComplete?: () => void;
  children?: ReactNode;
  sessionKey?: string;
}

const BonguFlixIntro = ({
  onComplete,
  children,
  sessionKey = "bonguflix-played",
}: BonguFlixIntroProps) => {
  const [phase, setPhase] = useState<"check" | "playing" | "done">("check");
  const [glowIntensity, setGlowIntensity] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(sessionKey)) {
      setPhase("done");
      return;
    }
    setPhase("playing");
  }, [sessionKey]);

  const handleComplete = useCallback(() => {
    sessionStorage.setItem(sessionKey, "1");
    setPhase("done");
    onComplete?.();
  }, [sessionKey, onComplete]);

  // Longer animation: ~4.6s total
  useEffect(() => {
    if (phase === "playing") {
      const timer = setTimeout(handleComplete, 4800);
      return () => clearTimeout(timer);
    }
  }, [phase, handleComplete]);

  const handleIconArrive = useCallback((index: number) => {
    setGlowIntensity((prev) => Math.min(1, prev + 0.08));
  }, []);

  if (phase === "check") return null;

  return (
    <AnimatePresence mode="wait">
      {phase === "playing" ? (
        <motion.div
          key="bonguflix-intro"
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: "hsl(0 0% 4%)" }}
          exit={{ opacity: 0, filter: "blur(8px)", scale: 1.02 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Cinematic rays & particles */}
          <CinematicRays />

          {/* Ambient glow that intensifies */}
          <GlowPulse intensity={glowIntensity} />

          {/* Spiral icons converging into B */}
          <SpiralIcons onIconArrive={handleIconArrive} />

          {/* Main logo group */}
          <motion.div className="relative flex flex-col items-center z-20">
            {/* The B */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.5, rotateY: -50 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{
                duration: 1.4,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ perspective: 1000 }}
            >
              <motion.span
                className="block font-black select-none"
                style={{
                  fontSize: "clamp(8rem, 24vw, 16rem)",
                  lineHeight: 0.85,
                  color: "hsl(4 95% 46%)",
                  textShadow: `
                    0 0 40px hsla(4,100%,55%,0.6),
                    0 0 80px hsla(4,100%,55%,0.3),
                    0 0 120px hsla(4,100%,55%,0.15),
                    0 0 200px hsla(4,100%,55%,0.08),
                    0 4px 16px hsla(0,0%,0%,0.9)
                  `,
                  fontFamily:
                    "Bebas Neue"
                }}
                animate={{
                  textShadow: [
                    `0 0 40px hsla(4,100%,55%,0.6), 0 0 80px hsla(4,100%,55%,0.3), 0 0 120px hsla(4,100%,55%,0.15), 0 0 200px hsla(4,100%,55%,0.08), 0 4px 16px hsla(0,0%,0%,0.9)`,
                    `0 0 60px hsla(4,100%,55%,0.9), 0 0 120px hsla(4,100%,55%,0.5), 0 0 180px hsla(4,100%,55%,0.3), 0 0 300px hsla(4,100%,55%,0.15), 0 4px 16px hsla(0,0%,0%,0.9)`,
                    `0 0 40px hsla(4,100%,55%,0.6), 0 0 80px hsla(4,100%,55%,0.3), 0 0 120px hsla(4,100%,55%,0.15), 0 0 200px hsla(4,100%,55%,0.08), 0 4px 16px hsla(0,0%,0%,0.9)`,
                  ],
                }}
                transition={{
                  duration: 2,
                  delay: 1.5,
                  ease: "easeInOut",
                }}
              >
                B
              </motion.span>

              {/* Light sweep */}
              <motion.div
                className="absolute inset-0 pointer-events-none overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.8, delay: 0.7 }}
              >
                <motion.div
                  style={{
                    position: "absolute",
                    top: 0,
                    width: "25%",
                    height: "100%",
                    background:
                      "linear-gradient(90deg, transparent, hsla(0,0%,100%,0.3), transparent)",
                    filter: "blur(10px)",
                  }}
                  initial={{ left: "-30%" }}
                  animate={{ left: "130%" }}
                  transition={{
                    duration: 1.4,
                    delay: 0.7,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              </motion.div>

              {/* Second sweep (faster, subtler) */}
              <motion.div
                className="absolute inset-0 pointer-events-none overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.6, 0] }}
                transition={{ duration: 1.2, delay: 1.8 }}
              >
                <motion.div
                  style={{
                    position: "absolute",
                    top: 0,
                    width: "15%",
                    height: "100%",
                    background:
                      "linear-gradient(90deg, transparent, hsla(4,100%,70%,0.2), transparent)",
                    filter: "blur(6px)",
                  }}
                  initial={{ left: "-20%" }}
                  animate={{ left: "120%" }}
                  transition={{
                    duration: 0.9,
                    delay: 1.8,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              </motion.div>

              {/* Reflection */}
              <div
                className="absolute left-0 right-0 pointer-events-none select-none"
                style={{
                  top: "100%",
                  transform: "scaleY(-1)",
                  opacity: 0.1,
                  maskImage:
                    "linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)",
                  height: "50%",
                  overflow: "hidden",
                }}
              >
                <span
                  className="block font-black"
                  style={{
                    fontSize: "clamp(8rem, 24vw, 16rem)",
                    lineHeight: 0.85,
                    color: "hsl(4 95% 46%)",
                    fontFamily:
                      "'Bebas Neue', 'Impact', 'Arial Black', sans-serif",
                  }}
                >
                  B
                </span>
              </div>
            </motion.div>

            {/* Curved BONGUFLIX text */}
            <CurvedText text="BONGUFLIX" delay={1.5} />

            {/* Tagline */}
            <Tagline />
          </motion.div>

          {/* Shockwave ring at icon convergence moment */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 80,
              height: 80,
              border: "1px solid hsla(4, 100%, 55%, 0.4)",
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.6, 0],
              scale: [0, 4, 6],
            }}
            transition={{ duration: 1.2, delay: 2.0, ease: "easeOut" }}
          />

          {/* Vignette overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 40%, hsla(0,0%,0%,0.6) 100%)",
            }}
          />

          {/* Final fade out */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundColor: "hsl(0 0% 4%)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 3.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </motion.div>
      ) : (
        <motion.div
          key="bonguflix-content"
          initial={{ opacity: 0, filter: "blur(6px)", scale: 0.98 }}
          animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BonguFlixIntro;
