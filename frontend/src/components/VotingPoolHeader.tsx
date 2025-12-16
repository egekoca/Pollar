import React from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { VotePool } from "../types/poll";
import { calculateTrWalVotePower } from "../utils/blockchain";
import { formatDate } from "../utils/pollHelpers";

interface VotingPoolHeaderProps {
  localPool: VotePool;
  hasVoted: boolean;
  error: string;
  pollRequiresNft: boolean;
  isSuiTurkiyePoll: boolean;
  userNfts: Array<{ objectId: string; type: string }>;
  trWalTokenCount: number;
  formatCountdown: (endTime: string) => string;
}

/**
 * VotingPoolHeader Component
 * Displays poll header with image, title, description, stats, and status messages
 */
const VotingPoolHeader: React.FC<VotingPoolHeaderProps> = ({
  localPool,
  hasVoted,
  error,
  pollRequiresNft,
  isSuiTurkiyePoll,
  userNfts,
  trWalTokenCount,
  formatCountdown,
}) => {
  const navigate = useNavigate();
  const account = useCurrentAccount();

  return (
    <div style={{ marginBottom: "clamp(1.5rem, 3vw, 2rem)" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          gap: "clamp(1rem, 3vw, 2rem)",
          marginBottom: "clamp(1.5rem, 3vw, 2rem)",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "450px",
            aspectRatio: "4/3",
            borderRadius: "1rem",
            overflow: "hidden",
            background: "var(--bg-secondary)",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={localPool.image}
            alt={localPool.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            <h2
              style={{
                fontSize: "clamp(1.4rem, 3.2vw, 2.4rem)",
                fontWeight: "700",
                margin: 0,
                color: "var(--text-primary)",
                flex: 1,
                lineHeight: "1.2",
                wordBreak: "break-word",
              }}
            >
              {localPool.name}
            </h2>
            <button
              onClick={() => {
                navigate("/vote-pools");
              }}
              style={{
                background: "transparent",
                border: "1px solid var(--border-color)",
                borderRadius: "0.5rem",
                padding: "0.5rem 1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "var(--text-primary)",
                fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-secondary)";
                e.currentTarget.style.borderColor = "var(--color-light-blue)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "var(--border-color)";
              }}
            >
              <span>←</span>
              <span>Back</span>
            </button>
          </div>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "clamp(1rem, 2vw, 1.1rem)",
              lineHeight: "1.8",
              marginBottom: "1.5rem",
            }}
          >
            {localPool.description}
          </p>
          
          {/* Voting Status and Info Messages */}
          {hasVoted && account?.address && (
            <div
              style={{
                padding: "0.75rem 1rem",
                background: "rgba(0, 0, 0, 0.85)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(251, 191, 36, 0.5)",
                borderRadius: "0.5rem",
                color: "#fbbf24",
                fontSize: "0.875rem",
                marginBottom: "1rem",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
              }}
            >
              You have already voted in this poll. Thank you!
            </div>
          )}
          {error && (
            <div
              style={{
                padding: "0.75rem 1rem",
                background: "rgba(0, 0, 0, 0.85)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(239, 68, 68, 0.5)",
                borderRadius: "0.5rem",
                color: "#ef4444",
                fontSize: "0.875rem",
                marginBottom: "1rem",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
              }}
            >
              {error}
            </div>
          )}
          
          {/* NFT/Token info (if poll requires NFT) */}
          {pollRequiresNft && account?.address && (
            <>
              {isSuiTurkiyePoll ? (
                trWalTokenCount === 0 ? (
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      background: "rgba(0, 0, 0, 0.85)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(239, 68, 68, 0.5)",
                      borderRadius: "0.5rem",
                      color: "#ef4444",
                      fontSize: "0.875rem",
                      marginBottom: "1rem",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    You don't own any TR_WAL tokens. You cannot vote in this poll.
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      background: "rgba(15, 23, 42, 0.6)",
                      border: "1px solid rgba(148, 163, 184, 0.3)",
                      borderRadius: "0.5rem",
                      color: "var(--text-primary)",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                    }}
                  >
                    TR_WAL tokens: <span style={{ color: "#dc2626" }}>{trWalTokenCount}</span> | Vote power: <span style={{ color: "#34d399" }}>{calculateTrWalVotePower(trWalTokenCount)}</span>
                  </div>
                )
              ) : (
                userNfts.length === 0 ? (
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      background: "rgba(0, 0, 0, 0.85)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(239, 68, 68, 0.5)",
                      borderRadius: "0.5rem",
                      color: "#ef4444",
                      fontSize: "0.875rem",
                      marginBottom: "1rem",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    You don't own any NFTs from this collection. You cannot vote in this poll.
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      background: "rgba(15, 23, 42, 0.6)",
                      border: "1px solid rgba(148, 163, 184, 0.3)",
                      borderRadius: "0.5rem",
                      color: "var(--text-primary)",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                    }}
                  >
                    Vote power in this poll:{" "}
                    <span style={{ color: "#34d399" }}>{userNfts.length * userNfts.length}</span>
                  </div>
                )
              )}
            </>
          )}
          
          <div style={{ display: "flex", gap: "clamp(1rem, 3vw, 2rem)", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "clamp(0.75rem, 1.5vw, 0.85rem)", color: "#ffffff", marginBottom: "0.25rem" }}>
                Total Votes
              </div>
              <div style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)", fontWeight: "bold", color: "var(--color-light-blue)" }}>
                {localPool.totalVotes.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "clamp(0.75rem, 1.5vw, 0.85rem)", color: "#ffffff", marginBottom: "0.25rem" }}>
                Starts
              </div>
              <div style={{ fontSize: "clamp(0.9rem, 1.8vw, 1rem)", color: "var(--text-secondary)" }}>
                {formatDate(localPool.startTime)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "clamp(0.75rem, 1.5vw, 0.85rem)", color: "#ffffff", marginBottom: "0.25rem" }}>
                Ends In
              </div>
              <div style={{ fontSize: "clamp(0.9rem, 1.8vw, 1rem)", color: "var(--text-secondary)", fontWeight: "600" }}>
                {formatCountdown(localPool.endTime)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingPoolHeader;

