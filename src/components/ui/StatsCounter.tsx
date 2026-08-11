import React, { useEffect, useState } from 'react';
import { useInView } from 'framer-motion';

interface StatsCounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  label: string;
}

export const StatsCounter: React.FC<StatsCounterProps> = ({
  end,
  suffix = '',
  prefix = '',
  duration = 2000,
  label
}) => {
  const [count, setCount] = useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const updateCounter = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);

      // Ease out quad formula
      const easedProgress = 1 - (1 - percentage) * (1 - percentage);
      setCount(Math.floor(easedProgress * end));

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(updateCounter);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(updateCounter);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration]);

  return (
    <div ref={ref} className="text-center p-6 bg-[#111827]/60 border border-gray-800 rounded-xl glass-card">
      <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-white font-display mb-2">
        {prefix}{count.toLocaleString('id-ID')}{suffix}
      </div>
      <div className="text-xs sm:text-sm font-semibold tracking-wider text-gray-400 uppercase">
        {label}
      </div>
    </div>
  );
};
