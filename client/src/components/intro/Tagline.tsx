import { motion } from "framer-motion";

const Tagline = () => (
  <motion.p
    className="select-none text-center"
    style={{
      fontSize: "clamp(0.75rem, 2.2vw, 1.1rem)",
      color: "hsl(0 0% 50%)",
      letterSpacing: "0.18em",
      fontFamily: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif",
    }}
    initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    transition={{ duration: 0.8, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
  >
    BINGE IT. LIVE IT. BONGU IT.
  </motion.p>
);

export default Tagline;
