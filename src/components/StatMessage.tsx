import { useEffect, useState } from 'react';

interface StatMessageProps {
  icon: string;
  text: string;
  duration?: number;
}

export function StatMessage({ icon, text, duration = 2500 }: StatMessageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setShouldRender(false), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-40 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className="bg-white shadow-lg rounded-full px-6 py-3 flex items-center gap-3 border border-gray-100">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm font-semibold text-gray-700">{text}</span>
      </div>
    </div>
  );
}
