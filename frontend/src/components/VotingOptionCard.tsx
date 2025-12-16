import React from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { VoteOption } from "../types/poll";

interface VotingOptionCardProps {
  option: VoteOption;
  index: number;
  isSelected: boolean;
  isDisabled: boolean;
  isVoting: boolean;
  onVote: (index: number) => void;
  onError: (error: string) => void;
  maxPercentage: number;
  minPercentage: number;
}

/**
 * VotingOptionCard Component
 * Displays a single voting option card
 */
const VotingOptionCard: React.FC<VotingOptionCardProps> = ({
  option,
  index,
  isSelected,
  isDisabled,
  isVoting,
  onVote,
  onError,
  maxPercentage,
  minPercentage,
}) => {
  const account = useCurrentAccount();

  // Calculate percentage difference for color logic
  const percentageDiff = maxPercentage - option.percentage;
  const totalDiff = maxPercentage - minPercentage;
  
  // Color logic: açık ara öndeki yeşil, gerideki kırmızı, denkse turuncu
  let percentageColor = "#60a5fa"; // default blue
  if (totalDiff > 0) {
    const diffRatio = percentageDiff / totalDiff;
    if (diffRatio === 0) {
      // Açık ara öndeki
      percentageColor = "#10b981"; // green
    } else if (diffRatio > 0.3) {
      // Gerideki
      percentageColor = "#ef4444"; // red
    } else {
      // Denkse (yakın)
      percentageColor = "#f59e0b"; // orange/amber
    }
  }

  const handleClick = () => {
    if (isDisabled) {
      if (!account?.address) {
        onError("Please connect your wallet to vote");
      } else if (isVoting) {
        // Voting in progress, do nothing
      } else {
        onError("Voting is not available. The poll may have ended or you have already voted.");
      }
      return;
    }
    if (!isVoting) {
      onVote(index);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        padding: "1.25rem",
        background: isSelected 
          ? "linear-gradient(135deg, rgba(96, 165, 250, 0.28) 0%, rgba(59, 130, 246, 0.16) 100%)"
          : "rgba(15, 15, 15, 0.78)",
        border: isSelected
          ? "2px solid rgba(96, 165, 250, 0.6)"
          : "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "0.875rem",
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.6 : 1,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        boxShadow: isSelected 
          ? "0 4px 20px rgba(96, 165, 250, 0.3), 0 0 0 1px rgba(96, 165, 250, 0.2)"
          : "0 2px 8px rgba(0, 0, 0, 0.2)",
        flex: "1 1 0",
        minWidth: "200px",
        maxWidth: "none",
      }}
      onMouseEnter={(e) => {
        if (isDisabled) return;
        if (!isSelected) {
          e.currentTarget.style.borderColor = "rgba(96, 165, 250, 0.5)";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(96, 165, 250, 0.25)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)";
        }
      }}
    >
      {/* Selected Indicator */}
      {isSelected && (
        <div style={{
          position: "absolute",
          top: "0.75rem",
          right: "0.75rem",
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
          boxShadow: "0 0 10px rgba(96, 165, 250, 0.6)",
        }}>
          <span style={{ color: "#fff", fontSize: "0.875rem" }}>✓</span>
        </div>
      )}

      {/* Option Header with Image and Info */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", alignItems: "flex-start" }}>
        {option.image && (
          <div
            style={{
              width: "80px",
              height: "80px",
              minWidth: "80px",
              borderRadius: "0.75rem",
              overflow: "hidden",
              background: "var(--bg-secondary)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              flexShrink: 0,
            }}
          >
            <img
              src={option.image}
              alt={option.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={(e) => {
                if (!isDisabled) {
                  e.currentTarget.style.transform = "scale(1.1)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            />
          </div>
        )}
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem", gap: "1rem" }}>
            <h4
              style={{
                fontSize: "clamp(1.1rem, 2vw, 1.25rem)",
                fontWeight: "700",
                color: "var(--text-primary)",
                flex: 1,
                lineHeight: "1.3",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {option.name}
            </h4>
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "0.25rem",
              flexShrink: 0,
            }}>
              <span
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2rem)",
                  fontWeight: "800",
                  color: percentageColor,
                  lineHeight: "1",
                }}
              >
                {option.percentage.toFixed(1)}%
              </span>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {option.voteCount.toLocaleString()} {option.voteCount === 1 ? "vote" : "votes"}
              </div>
            </div>
          </div>
          
          {/* Enhanced Progress Bar */}
          <div
            style={{
              height: "10px",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "9999px",
              overflow: "hidden",
              position: "relative",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div
              style={{
                width: `${option.percentage}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${percentageColor} 0%, ${percentageColor}CC 100%)`,
                transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                borderRadius: "9999px",
                boxShadow: `0 0 8px ${percentageColor}40, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
                position: "relative",
              }}
            >
              {/* Shine effect */}
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "50%",
                background: "linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%)",
                borderRadius: "9999px",
              }} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Messages */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: "1.5rem" }}>
        <div style={{ flex: 1 }} />
        {!account?.address && (
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>
            Connect wallet to vote
          </div>
        )}
        {isVoting && isSelected && (
          <div style={{ 
            fontSize: "0.8rem", 
            color: "#60a5fa",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}>
            <div style={{
              width: "12px",
              height: "12px",
              border: "2px solid #60a5fa",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }} />
            Processing...
          </div>
        )}
      </div>
    </div>
  );
};

export default VotingOptionCard;

