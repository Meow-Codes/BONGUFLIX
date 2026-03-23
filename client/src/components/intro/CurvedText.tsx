import { motion } from "framer-motion";

interface CurvedTextProps {
  text: string;
  delay?: number;
}

/**
 * Renders text along a gentle upward arc (like Netflix's subtle curve).
 * Uses an SVG textPath on a quadratic bezier.
 */
const CurvedText = ({ text, delay = 1.6 }: CurvedTextProps) => {
  const width = 400;
  const height = 60;
  // Gentle U-curve (concave up — like Netflix)
  const d = `M 30,18 Q ${width / 2},${height - 6} ${width - 30},18`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className="mt-1"
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        className="max-w-[80vw]"
        style={{ overflow: "visible" }}
      >
        <defs>
          <path id="bongu-curve" d={d} fill="none" />
        </defs>
        <text
          fill="hsl(4 95% 46%)"
          fontSize="34"
          fontWeight="800"
          letterSpacing="12"
          fontFamily="'Bebas Neue', 'Impact', 'Arial Black', sans-serif"
          style={{
            filter: "drop-shadow(0 0 20px hsla(4,100%,55%,0.4))",
          }}
        >
          <textPath
            href="#bongu-curve"
            startOffset="50%"
            textAnchor="middle"
          >
            {text}
          </textPath>
        </text>
      </svg>
    </motion.div>
  );
};

export default CurvedText;
