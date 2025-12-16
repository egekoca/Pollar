import React from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { PollStatus } from "../utils/pollHelpers";
import { getCollectionByType } from "../config/nftCollections";
import CollectionFilterButton from "./CollectionFilterButton";

interface VotePoolFiltersProps {
  selectedCollectionType: string | null;
  uniqueCollectionTypes: string[];
  selectedFilter: PollStatus;
  trWalTokenCount: number;
  onCollectionChange: (collectionType: string | null) => void;
  onFilterChange: (filter: PollStatus) => void;
  buyButton?: React.ReactNode;
}

/**
 * VotePoolFilters Component
 * Displays collection filter buttons, status filter, TR_WAL balance, and buy button
 */
const VotePoolFilters: React.FC<VotePoolFiltersProps> = ({
  selectedCollectionType,
  uniqueCollectionTypes,
  selectedFilter,
  trWalTokenCount,
  onCollectionChange,
  onFilterChange,
  buyButton,
}) => {
  const account = useCurrentAccount();
  const selectedCollection = selectedCollectionType 
    ? getCollectionByType(selectedCollectionType)
    : null;
  const isSuiTurkiye = selectedCollection?.name === "SUI TURKIYE";

  return (
    <>
      {/* NFT Collection Filter Bar */}
      <div style={{ 
        marginBottom: "clamp(1.5rem, 3vw, 2rem)",
        display: "flex",
        gap: "1rem",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
      }}>
        <button
          onClick={() => onCollectionChange(null)}
          style={{
            padding: "0.75rem 1.5rem",
            background: selectedCollectionType === null ? "var(--color-light-blue)" : "transparent",
            color: selectedCollectionType === null ? "#000000" : "var(--text-primary)",
            border: "1.5px solid var(--color-light-blue)",
            borderRadius: "0.5rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
        >
          All Polls
        </button>
        {uniqueCollectionTypes.map((collectionType) => (
          <CollectionFilterButton
            key={collectionType}
            collectionType={collectionType}
            isSelected={selectedCollectionType === collectionType}
            onClick={() => onCollectionChange(collectionType)}
          />
        ))}
      </div>

      {/* Status Filter and Additional Controls */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "1rem",
        marginBottom: "1rem",
        flexWrap: "wrap",
      }}>
        <select
          value={selectedFilter}
          onChange={(e) => onFilterChange(e.target.value as PollStatus)}
          style={{
            padding: "0.5rem 1rem",
            background: "transparent",
            color: "var(--text-primary)",
            border: "1.5px solid var(--color-light-blue)",
            borderRadius: "0.5rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease",
            fontSize: "clamp(0.75rem, 1.2vw, 0.875rem)",
            minWidth: "140px",
          }}
        >
          <option value="active">ACTIVE POLLS</option>
          <option value="upcoming">UPCOMING</option>
          <option value="ended">ENDED</option>
        </select>
        
        {/* TR_WAL Balance Display and Get TRWAL Button for SUI TURKIYE */}
        {isSuiTurkiye && account?.address && (
          <>
            <div
              style={{
                padding: "0.5rem 1rem",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "0.5rem",
                color: "#ffffff",
                fontSize: "clamp(0.75rem, 1.2vw, 0.9rem)",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                whiteSpace: "nowrap",
              }}
            >
              <span>TR_WAL:</span>
              <span style={{ color: "#dc2626", fontWeight: "700" }}>
                {trWalTokenCount > 0 ? trWalTokenCount.toLocaleString() : "0"}
              </span>
            </div>
            <a
              href="https://www.winterwalrus.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                padding: "0.5rem 1rem",
                background: "linear-gradient(135deg, rgba(220, 38, 38, 0.9), rgba(1, 7, 19, 0.9))",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "0.5rem",
                fontSize: "clamp(0.75rem, 1.2vw, 0.9rem)",
                fontWeight: "700",
                textDecoration: "none",
                whiteSpace: "nowrap",
                transition: "all 0.3s ease",
                boxShadow: "0 2px 8px rgba(220, 38, 38, 0.4)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(220, 38, 38, 1), rgba(1, 7, 19, 1))";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(220, 38, 38, 0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(220, 38, 38, 0.9), rgba(1, 7, 19, 0.9))";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(220, 38, 38, 0.4)";
              }}
            >
              Get TRWAL
            </a>
          </>
        )}
        {buyButton}
      </div>
    </>
  );
};

export default VotePoolFilters;

