import React from "react";
import { VotePool } from "../types/poll";
import { getCollectionByType } from "../config/nftCollections";
import { isPollActive } from "../utils/pollHelpers";

interface PollCardProps {
  pool: VotePool;
  formatCountdown: (endTime: string) => string;
  onClick: (pollId: string) => void;
}

/**
 * PollCard Component
 * Displays a single poll card with image, options, vote statistics, and collection badge
 */
const PollCard: React.FC<PollCardProps> = ({ pool, formatCountdown, onClick }) => {
  // Check if pool belongs to specific collections
  const poolCollection = pool.nft_collection_type 
    ? getCollectionByType(pool.nft_collection_type)
    : null;
  const isPopkins = poolCollection?.name === "Popkins";
  const isTallys = poolCollection?.name === "Tallys";
  const isPawtatoHeroes = poolCollection?.name === "Pawtato Heroes";
  const isSuiWorkshop = poolCollection?.name === "Sui Workshop";
  const isSuiTurkiye = poolCollection?.name === "SUI TURKIYE";
  
  // Check if poll is active
  const isActive = isPollActive(pool);
  
  // Get collection badge color
  const getBadgeColor = () => {
    if (isPopkins) return "rgba(255, 165, 0, 0.95)";
    if (isTallys) return "rgba(255, 20, 147, 0.95)";
    if (isPawtatoHeroes) return "rgba(132, 204, 22, 0.95)";
    if (isSuiWorkshop) return "rgba(33, 150, 243, 0.95)";
    if (isSuiTurkiye) return "rgba(220, 38, 38, 0.95)";
    return "rgba(139, 92, 246, 0.95)";
  };

  const getBadgeShadowColor = () => {
    if (isPopkins) return "rgba(255, 165, 0, 0.7)";
    if (isTallys) return "rgba(255, 20, 147, 0.7)";
    if (isPawtatoHeroes) return "rgba(132, 204, 22, 0.7)";
    if (isSuiWorkshop) return "rgba(33, 150, 243, 0.7)";
    if (isSuiTurkiye) return "rgba(220, 38, 38, 0.7)";
    return "rgba(139, 92, 246, 0.7)";
  };

  const getBadgeFoldColor = () => {
    if (isPopkins) return "rgba(255, 140, 0, 0.8)";
    if (isTallys) return "rgba(255, 0, 100, 0.8)";
    if (isPawtatoHeroes) return "rgba(101, 163, 13, 0.8)";
    if (isSuiWorkshop) return "rgba(25, 118, 210, 0.8)";
    if (isSuiTurkiye) return "rgba(153, 27, 27, 0.8)";
    return "rgba(124, 58, 237, 0.8)";
  };

  const getGlowColor = () => {
    if (isPopkins) return { primary: "rgba(255, 165, 0, 0.4)", secondary: "rgba(50, 205, 50, 0.3)" };
    if (isTallys) return { primary: "rgba(255, 20, 147, 0.4)", secondary: "rgba(255, 99, 71, 0.3)" };
    if (isPawtatoHeroes) return { primary: "rgba(132, 204, 22, 0.4)", secondary: "rgba(163, 230, 53, 0.3)" };
    if (isSuiWorkshop) return { primary: "rgba(79, 195, 247, 0.4)", secondary: "rgba(41, 182, 246, 0.3)" };
    if (isSuiTurkiye) return { primary: "rgba(220, 38, 38, 0.4)", secondary: "rgba(30, 58, 138, 0.3)" };
    return null;
  };

  const getBorderColor = () => {
    if (isPopkins) return "rgba(255, 165, 0, 0.5)";
    if (isTallys) return "rgba(255, 20, 147, 0.5)";
    if (isPawtatoHeroes) return "rgba(132, 204, 22, 0.5)";
    if (isSuiWorkshop) return "rgba(79, 195, 247, 0.5)";
    if (isSuiTurkiye) return "rgba(220, 38, 38, 0.5)";
    return "rgba(139, 92, 246, 0.5)";
  };

  const hasCollectionBadge = isPopkins || isTallys || isPawtatoHeroes || isSuiWorkshop || isSuiTurkiye;
  const glowColor = getGlowColor();

  return (
    <div
      onClick={() => onClick(pool.id)}
      style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
    >
      <div 
        className="vote-pool-card" 
        style={{ 
          cursor: "pointer", 
          height: "100%",
          minHeight: "420px",
          display: "flex", 
          flexDirection: "column",
          position: "relative",
          boxShadow: glowColor 
            ? `0 0 20px ${glowColor.primary}, 0 0 40px ${glowColor.secondary}`
            : undefined,
          border: glowColor
            ? `1px solid ${getBorderColor()}`
            : undefined,
        }}
      >
        {/* Active/Inactive Status Badge - Top Left */}
        <div
          style={{
            position: "absolute",
            top: "0.5rem",
            left: "0.5rem",
            zIndex: 10,
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: isActive ? "#22c55e" : "#ef4444",
            boxShadow: `0 0 8px ${isActive ? "#22c55e" : "#ef4444"}, 0 0 16px ${isActive ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)"}`,
            animation: isActive ? "pulse 2s ease-in-out infinite" : "none",
            border: `2px solid ${isActive ? "#16a34a" : "#dc2626"}`,
          }}
        />

        {/* NFT Collection Badge - Ribbon Style Top Right */}
        {hasCollectionBadge && (
          <div
            style={{
              position: "absolute",
              top: "0",
              right: "0",
              zIndex: 10,
              width: "clamp(55px, 7.5vw, 75px)",
              height: "clamp(55px, 7.5vw, 75px)",
              overflow: "hidden",
            }}
          >
            {/* Ribbon Corner Triangle */}
            <div
              style={{
                position: "absolute",
                top: "0",
                right: "0",
                width: "0",
                height: "0",
                borderStyle: "solid",
                borderWidth: `0 clamp(55px, 7.5vw, 75px) clamp(55px, 7.5vw, 75px) 0`,
                borderColor: `transparent ${getBadgeColor()} transparent transparent`,
                filter: `drop-shadow(0 2px 8px ${getBadgeShadowColor()})`,
              }}
            />
            {/* Ribbon Fold Shadow */}
            <div
              style={{
                position: "absolute",
                top: "0",
                right: "0",
                width: "0",
                height: "0",
                borderStyle: "solid",
                borderWidth: `0 clamp(40px, 5.5vw, 55px) clamp(40px, 5.5vw, 55px) 0`,
                borderColor: `transparent ${getBadgeFoldColor()} transparent transparent`,
                transform: "translate(4px, 4px)",
              }}
            />
          </div>
        )}

        {/* Pool Image - Full Width at Top */}
        <div
          style={{
            width: "100%",
            height: "140px",
            borderRadius: "0.5rem 0.5rem 0 0",
            overflow: "hidden",
            background: "var(--bg-secondary)",
            flexShrink: 0,
          }}
        >
          <img
            src={pool.image}
            alt={pool.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        {/* Content */}
        <div style={{ padding: "1rem", flex: "1", display: "flex", flexDirection: "column" }}>
          {/* Title and Description */}
          <div style={{ marginBottom: pool.options && pool.options.length > 2 ? "0.75rem" : "1rem" }}>
            <h3
              style={{
                fontSize: "clamp(1rem, 1.8vw, 1.25rem)",
                fontWeight: "700",
                marginBottom: "0.3rem",
                color: "#ffffff",
                lineHeight: "1.3",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {pool.name}
            </h3>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                lineHeight: "1.4",
                fontSize: "clamp(0.8rem, 1.2vw, 0.9rem)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {pool.description}
            </p>
          </div>

          {/* Options with Progress Bars */}
          {pool.options && pool.options.length >= 2 && (
            <div style={{ marginBottom: "1rem", flex: "1" }}>
              {pool.options.map((option, index) => {
                // Find highest percentage
                const maxPercentage = Math.max(...pool.options.map(opt => opt.percentage));
                const isHighest = option.percentage === maxPercentage;
                
                // Compact spacing for 3+ options
                const isCompact = pool.options.length > 2;
                const optionMarginBottom = isCompact ? "0.6rem" : "0.75rem";
                const fontSize = isCompact ? "0.85rem" : "0.95rem";
                const progressBarHeight = isCompact ? "6px" : "8px";
                const labelMarginBottom = isCompact ? "0.35rem" : "0.4rem";
                
                return (
                  <div key={index} style={{ marginBottom: index < pool.options.length - 1 ? optionMarginBottom : "0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: labelMarginBottom }}>
                      <span style={{ fontSize: fontSize, fontWeight: "500", color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: "1", marginRight: "0.5rem", lineHeight: "1.3" }}>
                        {option.name}
                      </span>
                      <span style={{ fontSize: fontSize, color: isHighest ? "#60a5fa" : "#ef4444", fontWeight: "bold", flexShrink: 0, lineHeight: "1.3" }}>
                        {option.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: progressBarHeight,
                        background: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${option.percentage}%`,
                          height: "100%",
                          background: isHighest 
                            ? "linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)"
                            : "linear-gradient(90deg, #dc2626 0%, #ef4444 100%)",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Single Option Fallback */}
          {pool.options && pool.options.length === 1 && (
            <div style={{ marginBottom: "1rem", flex: "1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: "500", color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: "1", marginRight: "0.5rem" }}>
                  {pool.options[0].name}
                </span>
                <span style={{ fontSize: "0.875rem", color: "#60a5fa", fontWeight: "bold", flexShrink: 0 }}>
                  {pool.options[0].percentage.toFixed(1)}%
                </span>
              </div>
              <div
                style={{
                  height: "8px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${pool.options[0].percentage}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          )}

          {/* Vote Statistics */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "0.75rem",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              marginTop: "auto",
              flexShrink: 0,
            }}
          >
            <div>
              <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.6)", marginBottom: "0.25rem" }}>Total Votes</div>
              <div style={{ fontSize: "1rem", fontWeight: "bold", color: "#60a5fa" }}>
                {pool.totalVotes.toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.6)", marginBottom: "0.25rem" }}>Ends In</div>
              <div style={{ fontSize: "0.85rem", color: "#ffffff", fontWeight: "600" }}>
                {formatCountdown(pool.endTime)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollCard;


