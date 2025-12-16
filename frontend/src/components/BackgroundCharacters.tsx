import React, { memo } from "react";

/**
 * BackgroundCharacters Component
 * Displays character images on left and right sides of the page (for "All Polls" view)
 * Memoized to prevent unnecessary re-renders
 */
const BackgroundCharacters: React.FC = memo(() => {
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {/* Left Side Characters */}
        <div
          className="character-side-left"
          style={{
            position: "absolute",
            left: "clamp(0.5rem, 2vw, 2rem)",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: "clamp(1rem, 2vw, 2rem)",
          }}
        >
          <img
            src="/pollarpng.png"
            alt="Pollar Character"
            className="character-card float-gentle-up"
            loading="eager"
            decoding="async"
            style={{
              width: "clamp(80px, 12vw, 200px)",
              height: "clamp(80px, 12vw, 200px)",
              objectFit: "contain",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              transform: "rotate(-3deg)",
              background: "rgba(0, 0, 0, 0.2)",
              display: "block",
            }}
            onError={(e) => {
              console.error("Failed to load pollarpng.png:", e);
            }}
          />
          <img
            src="/sealpng.png"
            alt="Seal Character"
            className="character-card float-gentle-down"
            loading="eager"
            decoding="async"
            style={{
              width: "clamp(80px, 12vw, 200px)",
              height: "clamp(80px, 12vw, 200px)",
              objectFit: "contain",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              transform: "rotate(3deg)",
              background: "rgba(0, 0, 0, 0.2)",
              display: "block",
            }}
            onError={(e) => {
              console.error("Failed to load sealpng.png:", e);
            }}
          />
        </div>

        {/* Right Side Characters */}
        <div
          className="character-side-right"
          style={{
            position: "absolute",
            right: "clamp(0.5rem, 2vw, 2rem)",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: "clamp(1rem, 2vw, 2rem)",
          }}
        >
          <img
            src="/walruspng.png"
            alt="Walrus Character"
            className="character-card float-gentle-up"
            loading="eager"
            decoding="async"
            style={{
              width: "clamp(80px, 12vw, 200px)",
              height: "clamp(80px, 12vw, 200px)",
              objectFit: "contain",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              transform: "rotate(3deg)",
              background: "rgba(0, 0, 0, 0.2)",
              display: "block",
            }}
            onError={(e) => {
              console.error("Failed to load walruspng.png:", e);
            }}
          />
          <img
            src="/friends.png"
            alt="Friends Character"
            className="character-card float-gentle-down"
            loading="eager"
            decoding="async"
            style={{
              width: "clamp(80px, 12vw, 200px)",
              height: "clamp(80px, 12vw, 200px)",
              objectFit: "contain",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              transform: "rotate(-3deg)",
              background: "rgba(0, 0, 0, 0.2)",
              display: "block",
            }}
            onError={(e) => {
              console.error("Failed to load friends.png:", e);
            }}
          />
        </div>
      </div>
      <style>{`
        @keyframes gentleFloatUp {
          0% { transform: translateY(-50%) rotate(0deg); }
          50% { transform: translateY(calc(-50% - 8px)) rotate(-1deg); }
          100% { transform: translateY(-50%) rotate(0deg); }
        }
        @keyframes gentleFloatDown {
          0% { transform: translateY(-50%) rotate(0deg); }
          50% { transform: translateY(calc(-50% + 8px)) rotate(1deg); }
          100% { transform: translateY(-50%) rotate(0deg); }
        }
        .float-gentle-up {
          animation: gentleFloatUp 10s ease-in-out infinite;
        }
        .float-gentle-down {
          animation: gentleFloatDown 11s ease-in-out infinite;
        }
        @media (max-width: 1024px) {
          .character-side-left,
          .character-side-right {
            display: none !important;
          }
        }
        @media (min-width: 1025px) and (max-width: 1400px) {
          .character-card {
            width: clamp(100px, 10vw, 150px) !important;
            height: clamp(100px, 10vw, 150px) !important;
          }
        }
      `}</style>
    </>
  );
});

BackgroundCharacters.displayName = "BackgroundCharacters";

export default BackgroundCharacters;


