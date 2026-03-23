import { motion } from "framer-motion";
import {
  Film,
  Clapperboard,
  Ticket,
  Tv,
  Wifi,
  Popcorn,
  Play,
  Star,
  Sparkles,
  Monitor,
  Radio,
  Drama,
} from "lucide-react";
import { type ReactNode } from "react";

const ICONS: { icon: ReactNode; delay: number }[] = [
  { icon: <Film size={33} />, delay: 0 },
  { icon: <Clapperboard size={31} />, delay: 0.1 },
  { icon: <Ticket size={29} />, delay: 0.2 },
  { icon: <Tv size={27} />, delay: 0.3 },
  { icon: <Wifi size={25} />, delay: 0.4 },
  { icon: <Popcorn size={23} />, delay: 0.5 },
  { icon: <Play size={21} />, delay: 0.6 },
  { icon: <Star size={19} />, delay: 0.7 },
  { icon: <Sparkles size={18} />, delay: 0.8 },
  { icon: <Monitor size={17} />, delay: 0.9 },
  { icon: <Radio size={16} />, delay: 1.0 },
  { icon: <Drama size={15} />, delay: 1.1 },
];

/**
 * Spiral from top-right corner down to centre.
 * Uses a logarithmic spiral offset so icons originate from upper-right.
 */
function spiralPoint(
  t: number, // 0→1, where 1 = start (outer, top-right), 0 = end (centre)
) {
  const theta = t * 4 * Math.PI;
  const a = 10;
  const b = 0.2;
  const r = a * Math.exp(b * theta);
  // Offset angle so t=1 points toward top-right (~-π/4)
  const angle = theta - Math.PI / 4;
  return {
    x: r * Math.cos(angle),
    y: -r * Math.sin(angle),
  };
}

interface SpiralIconsProps {
  onIconArrive?: (index: number) => void;
}

const SpiralIcons = ({ onIconArrive }: SpiralIconsProps) => {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
      {ICONS.map((item, i) => {
        const totalSteps = 40;
        const points = Array.from({ length: totalSteps + 1 }, (_, step) => {
          const t = 1 - step / totalSteps;
          return spiralPoint(t);
        });

        const scales = points.map((_, step) => 1 - step / totalSteps);

        return (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 text-[hsl(var(--bongu-glow))]"
            style={{ filter: "drop-shadow(0 0 6px hsla(4,100%,55%,0.6))" }}
            initial={{
              x: points[0].x,
              y: points[0].y,
              scale: scales[0],
              opacity: 0,
            }}
            animate={{
              x: points.map((p) => p.x),
              y: points.map((p) => p.y),
              scale: scales.map((s) => Math.max(s, 0)),
              opacity: [
                0,
                ...Array(totalSteps - 2).fill(1),
                0.6,
                0,
              ],
            }}
            transition={{
              duration: 1.5,
              delay: 0.2 + item.delay,
              ease: [0.16, 1, 0.3, 1],
              times: points.map((_, step) => step / totalSteps),
            }}
            onAnimationComplete={() => onIconArrive?.(i)}
          >
            {item.icon}
          </motion.div>
        );
      })}
    </div>
  );
};

export default SpiralIcons;
