import { motion } from "framer-motion";

const CinematicRays = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Rotating light rays */}
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={`ray-${i}`}
        className="absolute top-1/2 left-1/2 origin-center"
        style={{
          width: "220vw",
          height: `${1.5 + Math.random() * 2.5}px`,
          background: `linear-gradient(90deg, transparent, hsla(4, 100%, 55%, ${
            0.06 + Math.random() * 0.1
          }), transparent)`,
          rotate: `${i * 30 + Math.random() * 8}deg`,
          x: "-50%",
          y: "-50%",
        }}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{
          opacity: [0, 0.8, 0.5, 0],
          scaleX: [0, 1.3, 1, 0.4],
        }}
        transition={{
          duration: 2.8,
          delay: 0.4 + i * 0.06,
          ease: [0.16, 1, 0.3, 1],
        }}
      />
    ))}

    {/* Horizontal film-strip flicker lines */}
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={`flicker-${i}`}
        className="absolute left-0 right-0"
        style={{
          top: `${15 + i * 18}%`,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent 10%, hsla(0,0%,100%,0.04) 30%, hsla(0,0%,100%,0.06) 50%, hsla(0,0%,100%,0.04) 70%, transparent 90%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.6, 0.3, 0] }}
        transition={{
          duration: 2,
          delay: 0.8 + i * 0.15,
          ease: "easeInOut",
        }}
      />
    ))}

    {/* Particle dust */}
    {[...Array(20)].map((_, i) => {
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      return (
        <motion.div
          key={`dust-${i}`}
          className="absolute rounded-full"
          style={{
            width: 2 + Math.random() * 3,
            height: 2 + Math.random() * 3,
            left: `${startX}%`,
            top: `${startY}%`,
            background: `hsla(4, 100%, ${60 + Math.random() * 30}%, ${
              0.3 + Math.random() * 0.4
            })`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0, 1.5, 0],
            y: [0, -30 - Math.random() * 40],
          }}
          transition={{
            duration: 1.5 + Math.random(),
            delay: 0.6 + Math.random() * 1.5,
            ease: "easeOut",
          }}
        />
      );
    })}
  </div>
);

export default CinematicRays;
