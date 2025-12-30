import { useState, useEffect, useRef } from 'react';

const IntroVideo = ({ onComplete }) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Prevent scrolling while intro is playing
    document.body.style.overflow = 'hidden';
    
    const playVideo = async () => {
      if (videoRef.current) {
        try {
          await videoRef.current.play();
        } catch (err) {
          console.log("Autoplay with sound blocked, showing play button");
          setShowPlayButton(true);
        }
      }
    };

    if (isVideoLoaded) {
      playVideo();
    }

    return () => {
      // Re-enable scrolling when component unmounts
      document.body.style.overflow = 'unset';
    };
  }, [isVideoLoaded]);

  const handleCreateInteraction = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setShowPlayButton(false);
    }
  };

  const handleVideoEnded = () => {
    // Add a small delay for smoother transition
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        playsInline
        className="w-full h-full object-cover"
        onEnded={handleVideoEnded}
        onLoadedData={() => setIsVideoLoaded(true)}
      >
        <source src="/assets/intro.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Play button for browsers blocking autoplay with sound */}
      {showPlayButton && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 backdrop-blur-sm">
          <button
            onClick={handleCreateInteraction}
            className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-full transition-all duration-300 hover:scale-105"
          >
            <div className="absolute inset-0 border-2 border-white rounded-full"></div>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <span className="relative text-white font-bold tracking-[0.2em] text-lg uppercase pl-1">
              Enter Site
            </span>
          </button>
        </div>
      )}

      {/* Skip button allows users to bypass if they want */}
      <button 
        onClick={onComplete}
        className="absolute bottom-8 right-8 text-white/50 hover:text-white text-sm px-4 py-2 border border-white/30 rounded-full hover:bg-white/10 transition-all duration-300 z-50 uppercase tracking-widest"
      >
        Skip Intro
      </button>

      {/* Loading state backup */}
      {!isVideoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="w-12 h-12 border-t-2 border-white rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default IntroVideo;
