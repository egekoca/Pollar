import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

interface LottieAnimationProps {
  path: string;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
}

const LottieAnimation = ({ path, className, loop = true, autoplay = true }: LottieAnimationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<any>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Destroy existing animation if any
      if (animationRef.current) {
        animationRef.current.destroy();
      }

      try {
        animationRef.current = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: loop,
          autoplay: autoplay,
          path: path, // Load from URL/path
        });
      } catch (error) {
        console.error('Error loading Lottie animation:', error);
      }
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
      }
    };
  }, [path, loop, autoplay]);

  return <div ref={containerRef} className={className} />;
};

export default LottieAnimation;

