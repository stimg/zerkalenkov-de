import { useEffect, useRef, useState } from 'react';

interface UseIntersectionOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

export function useIntersection(options?: UseIntersectionOptions) {
  const { freezeOnceVisible = false, ...observerOptions } = options || {};
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      const isElementIntersecting = entry?.isIntersecting ?? false;
      setIsIntersecting(isElementIntersecting);

      if (isElementIntersecting) {
        setHasIntersected(true);
        if (freezeOnceVisible) {
          observer.disconnect();
        }
      }
    }, observerOptions);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [freezeOnceVisible, observerOptions]);

  return { ref, isIntersecting, hasIntersected };
}
