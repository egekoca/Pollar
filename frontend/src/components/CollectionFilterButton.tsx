import React from "react";
import { getCollectionByType } from "../config/nftCollections";

interface CollectionFilterButtonProps {
  collectionType: string;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * CollectionFilterButton Component
 * Displays a collection filter button with image or text based on collection type
 */
const CollectionFilterButton: React.FC<CollectionFilterButtonProps> = ({
  collectionType,
  isSelected,
  onClick,
}) => {
  const collection = getCollectionByType(collectionType);
  const isPopkins = collection?.name === "Popkins";
  const isTallys = collection?.name === "Tallys";
  const isPawtatoHeroes = collection?.name === "Pawtato Heroes";
  const isSuiWorkshop = collection?.name === "Sui Workshop";
  const isSuiTurkiye = collection?.name === "SUI TURKIYE";
  const hasImage = isPopkins || isTallys || isPawtatoHeroes || isSuiWorkshop || isSuiTurkiye;

  const getBoxShadow = () => {
    if (!hasImage || !isSelected) return "none";
    if (isPopkins) return "0 0 15px rgba(255, 165, 0, 0.6), 0 0 30px rgba(255, 140, 0, 0.4)";
    if (isTallys) return "0 0 15px rgba(255, 20, 147, 0.6), 0 0 30px rgba(255, 105, 180, 0.4)";
    if (isPawtatoHeroes) return "0 0 15px rgba(132, 204, 22, 0.6), 0 0 30px rgba(163, 230, 53, 0.4)";
    if (isSuiWorkshop) return "0 0 15px rgba(79, 195, 247, 0.6), 0 0 30px rgba(41, 182, 246, 0.4)";
    if (isSuiTurkiye) return "0 0 15px rgba(220, 38, 38, 0.6), 0 0 30px rgba(30, 58, 138, 0.4)";
    return "none";
  };

  const renderContent = () => {
    if (isPopkins) {
      return (
        <img 
          src="/popkins.png" 
          alt="Popkins" 
          style={{
            height: "clamp(2rem, 4vw, 3rem)",
            width: "auto",
            objectFit: "contain",
            display: "block",
          }}
        />
      );
    }
    if (isTallys) {
      return (
        <img 
          src="/tallys.png" 
          alt="Tallys" 
          style={{
            height: "clamp(2rem, 4vw, 3rem)",
            width: "auto",
            objectFit: "contain",
            display: "block",
          }}
        />
      );
    }
    if (isPawtatoHeroes) {
      return (
        <img 
          src="/PawtatoHeroes.png" 
          alt="Pawtato Heroes" 
          style={{
            height: "clamp(2.5rem, 5vw, 3.5rem)",
            width: "auto",
            objectFit: "contain",
            display: "block",
          }}
        />
      );
    }
    if (isSuiWorkshop) {
      return (
        <img 
          src="/suilogo.jpg" 
          alt="Sui Workshop" 
          style={{
            height: "clamp(2rem, 4vw, 3rem)",
            width: "auto",
            objectFit: "contain",
            display: "block",
            borderRadius: "1rem",
          }}
        />
      );
    }
    if (isSuiTurkiye) {
      return (
        <img 
          src="/suitrbutton.png" 
          alt="SUI TURKIYE" 
          style={{
            height: "clamp(2rem, 4vw, 3rem)",
            width: "auto",
            objectFit: "contain",
            display: "block",
          }}
        />
      );
    }
    return collection?.name || collectionType.split("::").pop() || "Unknown";
  };

  return (
    <button
      onClick={onClick}
      style={{
        padding: hasImage ? "0" : "0.75rem 1.5rem",
        background: hasImage ? "transparent" : (isSelected ? "var(--color-light-blue)" : "transparent"),
        color: hasImage ? "transparent" : (isSelected ? "#000000" : "var(--text-primary)"),
        border: hasImage ? "none" : "1.5px solid var(--color-light-blue)",
        borderRadius: hasImage ? "1rem" : "0.5rem",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: hasImage && isSelected ? 1 : (hasImage ? 0.7 : 1),
        transform: hasImage && isSelected ? "scale(1.05)" : "scale(1)",
        maxWidth: isSuiTurkiye ? "clamp(120px, 15vw, 180px)" : "none",
        boxShadow: getBoxShadow(),
      }}
    >
      {renderContent()}
    </button>
  );
};

export default CollectionFilterButton;


