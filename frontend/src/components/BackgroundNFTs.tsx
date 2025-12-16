import React from "react";
import { NFTCollection } from "../config/nftCollections";

interface BackgroundNFTsProps {
  theme: NFTCollection["theme"];
  collectionName?: string;
}

/**
 * BackgroundNFTs Component
 * Displays NFT images on left and right sides of the page (for collection-specific views)
 */
const BackgroundNFTs: React.FC<BackgroundNFTsProps> = ({ theme, collectionName }) => {
  if (!theme?.backgroundImages || theme.backgroundImages.length === 0) {
    return null;
  }

  // Popkins, Tallys, Pawtato Heroes için 3'erli, diğerleri için 2'şerli
  const isThreePerSide = collectionName === "Popkins" || 
                         collectionName === "Tallys" || 
                         collectionName === "Pawtato Heroes";
  const leftCount = isThreePerSide ? 3 : 2;
  const rightStart = isThreePerSide ? 3 : 2;
  const rightEnd = isThreePerSide ? 6 : 4;

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
        {/* Left Side NFTs */}
        <div
          className="nft-side-left"
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
          {theme.backgroundImages.slice(0, leftCount).map((imageUrl, index) => (
            <img
              key={`left-${index}`}
              src={imageUrl}
              alt={`NFT ${index + 1}`}
              className="nft-card"
              style={{
                width: "clamp(80px, 12vw, 200px)",
                height: "clamp(80px, 12vw, 200px)",
                objectFit: "cover",
                borderRadius: "16px",
                filter: "blur(0.25px)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transform: `rotate(${index * 3 - 3}deg)`,
                background: "rgba(0, 0, 0, 0.2)",
              }}
            />
          ))}
        </div>

        {/* Right Side NFTs */}
        <div
          className="nft-side-right"
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
          {theme.backgroundImages.slice(rightStart, rightEnd).map((imageUrl, index) => (
            <img
              key={`right-${index}`}
              src={imageUrl}
              alt={`NFT ${rightStart + index + 1}`}
              className="nft-card"
              style={{
                width: "clamp(80px, 12vw, 200px)",
                height: "clamp(80px, 12vw, 200px)",
                objectFit: "cover",
                borderRadius: "16px",
                filter: "blur(0.25px)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transform: `rotate(${index * -3 + 3}deg)`,
                background: "rgba(0, 0, 0, 0.2)",
              }}
            />
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .nft-side-left,
          .nft-side-right {
            display: none !important;
          }
          .main-content-responsive {
            padding-left: clamp(1rem, 3vw, 2rem) !important;
            padding-right: clamp(1rem, 3vw, 2rem) !important;
          }
        }
        @media (min-width: 1025px) and (max-width: 1400px) {
          .nft-card {
            width: clamp(100px, 10vw, 150px) !important;
            height: clamp(100px, 10vw, 150px) !important;
          }
          .main-content-responsive {
            padding-left: clamp(1rem, calc(10vw + 2rem), calc(150px + 3rem)) !important;
            padding-right: clamp(1rem, calc(10vw + 2rem), calc(150px + 3rem)) !important;
          }
        }
        @media (min-width: 1401px) {
          .main-content-responsive {
            padding-left: clamp(2rem, calc(12vw + 2rem), calc(200px + 4rem)) !important;
            padding-right: clamp(2rem, calc(12vw + 2rem), calc(200px + 4rem)) !important;
          }
        }
      `}</style>
    </>
  );
};

export default BackgroundNFTs;


