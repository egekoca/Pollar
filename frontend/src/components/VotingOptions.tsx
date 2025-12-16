import React from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { VotePool } from "../types/poll";
import VotingOptionCard from "./VotingOptionCard";

interface VotingOptionsProps {
  localPool: VotePool;
  selectedOption: number | null;
  isVoting: boolean;
  hasVoted: boolean;
  isPollEnded?: boolean;
  onVote: (index: number) => void;
  onError: (error: string) => void;
}

/**
 * VotingOptions Component
 * Displays all voting options in a horizontal layout
 */
const VotingOptions: React.FC<VotingOptionsProps> = ({
  localPool,
  selectedOption,
  isVoting,
  hasVoted,
  isPollEnded = false,
  onVote,
  onError,
}) => {
  const account = useCurrentAccount();

  // Calculate max and min percentages for color logic
  const maxPercentage = Math.max(...localPool.options.map(opt => opt.percentage));
  const minPercentage = Math.min(...localPool.options.map(opt => opt.percentage));

  return (
    <div style={{ marginBottom: "clamp(2rem, 4vw, 3rem)" }}>
      <div style={{ 
        display: "flex", 
        flexDirection: "row", 
        gap: "clamp(1rem, 2vw, 1.5rem)",
        flexWrap: "nowrap",
        justifyContent: "center",
        marginBottom: "clamp(2rem, 4vw, 3rem)",
        overflowX: "auto",
      }}>
        {!account?.address && (
          <div
            style={{
              padding: "1rem",
              background: "rgba(59, 130, 246, 0.1)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              borderRadius: "0.5rem",
              color: "var(--color-light-blue)",
              fontSize: "0.9rem",
              width: "100%",
              marginBottom: "1rem",
            }}
          >
            Please connect your wallet to vote. You can view details and results.
          </div>
        )}
        {isPollEnded && (
          <div
            style={{
              padding: "1rem",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "0.5rem",
              color: "#ef4444",
              fontSize: "0.9rem",
              width: "100%",
              marginBottom: "1rem",
              textAlign: "center",
              fontWeight: "600",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            This poll has ended. Voting is no longer available.
          </div>
        )}
        {localPool.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isDisabled = !account?.address || isVoting || hasVoted || isPollEnded;

          return (
            <VotingOptionCard
              key={option.id}
              option={option}
              index={index}
              isSelected={isSelected}
              isDisabled={isDisabled}
              isVoting={isVoting}
              onVote={onVote}
              onError={onError}
              maxPercentage={maxPercentage}
              minPercentage={minPercentage}
            />
          );
        })}
      </div>
    </div>
  );
};

export default VotingOptions;

