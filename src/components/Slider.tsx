import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
const BACKEND = import.meta.env.VITE_BACKEND_URL;
interface Slide {
  id: number;
  image: string; // фонове фото
}

interface SliderProps {
  slides: Slide[];
}

export function Slider({ slides }: SliderProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides || slides.length === 0) return null;

  return (
    <div 
      className="relative w-full slider-custom mx-auto rounded-2xl overflow-hidden bg-black/10"
      style={{ aspectRatio: '3 / 2' }} // співвідношення 1.5:1
    >
      <AnimatePresence>
        {slides.map((slide, i) =>
          i === current && (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/5"
            >
              <img
                src={`${BACKEND}${slide.image}`}
                alt=""
                className="max-w-full max-h-full object-contain rounded-xl shadow-md"
              />
            </motion.div>
          )
        )}
      </AnimatePresence>

      {/* Dots навігація */}
      <div className="absolute bottom-3 w-full flex justify-center gap-2 z-10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              idx === current ? "bg-purple-600 scale-125" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );

}

