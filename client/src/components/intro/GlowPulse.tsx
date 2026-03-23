import { motion } from "framer-motion";

interface GlowPulseProps {
  intensity: number; // 0–1, increases as icons merge
}

const GlowPulse = ({ intensity }: GlowPulseProps) => (
  <>
    {/* Main ambient glow */}
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: 500,
        height: 500,
        background: `radial-gradient(circle, hsla(4,100%,55%,${
          0.2 + intensity * 0.4
        }) 0%, hsla(4,100%,55%,${
          0.05 + intensity * 0.15
        }) 40%, transparent 70%)`,
        filter: `blur(${50 + intensity * 30}px)`,
      }}
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{
        opacity: [0, 0.8 + intensity * 0.2, 0.6 + intensity * 0.3],
        scale: [0.3, 1.1 + intensity * 0.3, 0.95 + intensity * 0.2],
      }}
      transition={{ duration: 2.2, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
    />

    {/* Secondary ring pulse */}
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: 300,
        height: 300,
        border: `2px solid hsla(4, 100%, 55%, ${0.1 + intensity * 0.2})`,
        boxShadow: `0 0 ${20 + intensity * 40}px hsla(4,100%,55%,${
          0.1 + intensity * 0.15
        })`,
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: [0, 0.5, 0],
        scale: [0.5, 2, 2.5],
      }}
      transition={{ duration: 2, delay: 1.8, ease: "easeOut" }}
    />
  </>
);

export default GlowPulse;
