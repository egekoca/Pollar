import React from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { VotePool } from "../types/poll";
import { getCollectionByType } from "../config/nftCollections";
import { getTitleForCollection, getTitleGradientForCollection, isGraffitiStyledTitle, getGraffitiInnerGradient } from "../utils/pollHelpers";
import PollCard from "./PollCard";
import pollarWalkVideo from "/pollar-walk.mp4";

interface VotePoolContentProps {
  selectedCollectionType: string | null;
  isLoading: boolean;
  pools: VotePool[];
  formatCountdown: (endTime: string) => string;
  onPollClick: (pollId: string) => void;
  onCreateVotePool: () => void;
  userProfile: any;
}

/**
 * VotePoolContent Component
 * Displays title, loading state, empty state, and poll grid
 */
const VotePoolContent: React.FC<VotePoolContentProps> = ({
  selectedCollectionType,
  isLoading,
  pools,
  formatCountdown,
  onPollClick,
  onCreateVotePool,
  userProfile,
}) => {
  const account = useCurrentAccount();
  const selectedCollection = selectedCollectionType 
    ? getCollectionByType(selectedCollectionType)
    : null;

  // Get title and gradient using helper functions
  const title = getTitleForCollection(selectedCollectionType);
  const gradient = getTitleGradientForCollection(selectedCollectionType);
  const isGraffitiStyled = isGraffitiStyledTitle(selectedCollectionType);
  const graffitiInnerGradient = getGraffitiInnerGradient(selectedCollectionType);

  return (
    <div style={{ position: "relative", zIndex: 2 }}>
      {/* Title Section */}
      <div style={{ marginBottom: "clamp(1.5rem, 3vw, 2rem)", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
          <h2 
            className="active-pools-animated-text"
            style={{ 
              marginBottom: "0",
              fontWeight: "900",
              textTransform: "uppercase",
              ...(isGraffitiStyled ? {
                fontFamily: '"Titan One", cursive',
                fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
                letterSpacing: "0.02em",
                backgroundImage: graffitiInnerGradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "transparent",
                WebkitTextStroke: "clamp(1.5px, 0.4vw, 3px) #000000",
                paintOrder: "stroke fill",
                filter: "drop-shadow(0 4px 0 rgba(0,0,0,0.2))",
                animation: "none",
                lineHeight: "1.1",
                padding: "0.2em 0 0.3em 0"
              } : {
                fontFamily: "'Bevellier', sans-serif",
                fontWeight: "700",
                letterSpacing: "0.1em",
                fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                backgroundImage: gradient,
                backgroundSize: "300% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "transparent",
                animation: "smoothFlowingGradient 5s ease-in-out infinite",
              }),
              display: "block",
              width: "100%",
              whiteSpace: "normal",
              wordBreak: "break-word",
              textAlign: "center",
            }}
          >
            {title}
          </h2>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "center", 
          minHeight: "60vh",
          gap: "1.5rem"
        }}>
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: "clamp(200px, 30vw, 400px)",
              height: "auto",
              maxWidth: "100%",
            }}
          >
            <source src={pollarWalkVideo} type="video/mp4" />
          </video>
          <p style={{ 
            color: "var(--text-muted)", 
            fontSize: "clamp(1rem, 2vw, 1.2rem)",
            fontWeight: "500"
          }}>
            Loading polls...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && pools.length === 0 && (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ 
            color: selectedCollection?.name === "SUI TURKIYE" ? "#ffffff" : ((selectedCollection?.name === "Popkins" || selectedCollection?.name === "Tallys" || selectedCollection?.name === "Pawtato Heroes") ? "rgba(0, 0, 0, 0.85)" : "var(--text-muted)"), 
            fontSize: "1.1rem", 
            marginBottom: "1rem",
            fontWeight: (selectedCollection?.name === "Popkins" || selectedCollection?.name === "Tallys" || selectedCollection?.name === "Pawtato Heroes" || selectedCollection?.name === "SUI TURKIYE") ? "600" : "normal"
          }}>
            No polls found. Create the first poll!
          </p>
          {account && userProfile && (
            <button 
              onClick={onCreateVotePool} 
              className="button button-primary"
              style={(selectedCollection?.name === "Popkins" || selectedCollection?.name === "Tallys" || selectedCollection?.name === "Pawtato Heroes" || selectedCollection?.name === "SUI TURKIYE") ? {
                backgroundColor: "#000000",
                color: "#ffffff",
                fontWeight: "700",
                boxShadow: "0 4px 14px rgba(0,0,0,0.3)"
              } : undefined}
            >
              Create First Poll
            </button>
          )}
        </div>
      )}

      {/* Vote Pool Grid */}
      {!isLoading && pools.length > 0 && (
        <div
          className="poll-grid-responsive"
          style={{
            display: "grid",
            gap: "clamp(1rem, 2vw, 1.5rem)",
            maxWidth: "100%",
            width: "100%",
          }}
        >
          {pools.map((pool) => (
            <PollCard
              key={pool.id}
              pool={pool}
              formatCountdown={formatCountdown}
              onClick={onPollClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VotePoolContent;


