import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CarouselProps {
  images: string[];
  alt?: string;
  className?: string;
}

interface MediaItemProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onAnimationEnd?: () => void;
}

const VIDEO_EXTENSIONS = ['.m4v', '.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];

function isVideo(src: string): boolean {
  const lowerSrc = src.toLowerCase();
  return VIDEO_EXTENSIONS.some(ext => lowerSrc.endsWith(ext));
}

function MediaItem({ src, alt, className, style, onAnimationEnd }: MediaItemProps) {
  if (isVideo(src)) {
    return (
      <video
        src={src}
        className={className}
        style={style}
        controls
        autoPlay
        loop
        muted
        playsInline
        onAnimationEnd={onAnimationEnd as React.AnimationEventHandler<HTMLVideoElement>}
        aria-label={alt}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onAnimationEnd={onAnimationEnd as React.AnimationEventHandler<HTMLImageElement>}
    />
  );
}

export function Carousel({ images, alt = 'Carousel image', className }: CarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

  const isTransitioning = nextImageIndex !== null;

  const handlePrevImage = () => {
    if (images.length > 0 && !isTransitioning) {
      const newIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
      setNextImageIndex(newIndex);
      setSlideDirection('right');
    }
  };

  const handleNextImage = () => {
    if (images.length > 0 && !isTransitioning) {
      const newIndex = currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;
      setNextImageIndex(newIndex);
      setSlideDirection('left');
    }
  };

  const handleDotClick = (index: number) => {
    if (!isTransitioning && index !== currentImageIndex) {
      setNextImageIndex(index);
      setSlideDirection(index > currentImageIndex ? 'left' : 'right');
    }
  };

  const handleAnimationEnd = () => {
    if (nextImageIndex !== null) {
      setCurrentImageIndex(nextImageIndex);
      setNextImageIndex(null);
      setSlideDirection(null);
    }
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div
      className={cn("relative group overflow-hidden rounded-lg", className)}
      style={{
        perspective: '1200px',
        WebkitPerspective: '1200px'
      }}
    >
      <div
        className="aspect-video relative"
        style={{
          transformStyle: 'preserve-3d',
          WebkitTransformStyle: 'preserve-3d'
        }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center m-10"
          style={{
            transformStyle: 'preserve-3d',
            WebkitTransformStyle: 'preserve-3d'
          }}
        >
          {/* Current/Outgoing media */}
          <MediaItem
            key={`current-${currentImageIndex}`}
            src={images[currentImageIndex]!}
            alt={`${alt} - Media ${currentImageIndex + 1}`}
            className="absolute w-full h-full object-contain"
            style={{
              animation: isTransitioning && slideDirection
                ? `slideOutTo${slideDirection === 'left' ? 'Left' : 'Right'} 0.6s ease-out both`
                : 'none',
              animationFillMode: 'both',
              transformStyle: 'preserve-3d',
              WebkitTransformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'perspective(1200px) rotateY(0deg) translate3d(0, 0, 0)',
              opacity: 1,
              willChange: 'transform, opacity',
              zIndex: 1
            }}
          />

          {/* Next/Incoming media - only during transition */}
          {isTransitioning && nextImageIndex !== null && (
            <MediaItem
              key={`next-${nextImageIndex}`}
              src={images[nextImageIndex]!}
              alt={`${alt} - Media ${nextImageIndex + 1}`}
              className="absolute w-full h-full object-contain"
              style={{
                animation: slideDirection
                  ? `slideIn${slideDirection === 'left' ? 'FromRight' : 'FromLeft'} 0.6s ease-out both`
                  : 'none',
                animationFillMode: 'both',
                transformStyle: 'preserve-3d',
                WebkitTransformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                willChange: 'transform, opacity',
                zIndex: 2
              }}
              onAnimationEnd={handleAnimationEnd}
            />
          )}
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
