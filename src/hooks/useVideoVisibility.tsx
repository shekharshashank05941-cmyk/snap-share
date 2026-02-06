import { useEffect, useRef, useState } from 'react';

/**
 * Hook that uses IntersectionObserver to determine if an element is visible.
 * Only one video should play at a time in the feed.
 */
export const useVideoVisibility = (threshold = 0.6) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
};
