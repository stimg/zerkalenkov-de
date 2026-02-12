import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CarouselProps {
  images: string[];
  alt?: string;
  className?: string;
}

export function Carousel({ images, alt = 'Carousel image', className }: CarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

  const handlePrevImage = () => {
    if (images.length > 0) {
      setSlideDirection('right');
      setCurrentImageIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (images.length > 0) {
      setSlideDirection('left');
      setCurrentImageIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleDotClick = (index: number) => {
    setSlideDirection(index > currentImageIndex ? 'left' : 'right');
    setCurrentImageIndex(index);
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className={cn("relative group overflow-hidden rounded-lg", className)}>
      <div className="aspect-video relative">
        <div className="absolute inset-0 flex items-center justify-center m-10">
          <img
            key={currentImageIndex}
            src={images[currentImageIndex]}
            alt={`${alt} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-contain transition-all duration-500"
            style={{
              animation: slideDirection
                ? `slideIn${slideDirection === 'left' ? 'FromRight' : 'FromLeft'} 0.5s ease-out`
                : 'none'
            }}
            onAnimationEnd={() => setSlideDirection(null)}
          />
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={handlePrevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentImageIndex
                    ? "bg-gray-800 dark:bg-white w-8"
                    : "bg-gray-400 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-400"
                )}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
