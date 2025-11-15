import { PredictionMarket } from "../data/predictionMarketData";
import "../styles/theme.css";

interface PredictionCardProps {
  prediction: PredictionMarket;
  onClick: (prediction: PredictionMarket, optionId: string) => void;
}

const PredictionCard = ({ prediction, onClick }: PredictionCardProps) => {
  return (
    <div
      className="prediction-card"
      style={{
        background: "var(--bg-card)",
        borderRadius: "1rem",
        border: "1px solid var(--border-color)",
        overflow: "hidden",
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "1.25rem",
      }}
    >
      {/* Header - Profile Image and Title */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "1.25rem" }}>
        {/* Profile Image */}
        {prediction.profileImageUrl && (
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: 0,
              background: "var(--bg-secondary)",
              border: "2px solid var(--border-color)",
            }}
          >
            <img
              src={prediction.profileImageUrl}
              alt={prediction.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        )}

        {/* Title */}
        <h3
          style={{
            fontSize: "clamp(1rem, 2vw, 1.15rem)",
            fontWeight: "700",
            color: "var(--text-primary)",
            lineHeight: "1.3",
            flex: 1,
            margin: 0,
          }}
        >
          {prediction.title}
        </h3>

        {/* Status Badge */}
        {prediction.status === "live" && (
          <span
            style={{
              background: "#ef4444",
              color: "#ffffff",
              padding: "0.25rem 0.5rem",
              borderRadius: "9999px",
              fontSize: "0.65rem",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              flexShrink: 0,
            }}
          >
            LIVE
          </span>
        )}
      </div>

      {/* Options - Tıklanabilir Seçenekler */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.25rem" }}>
        {prediction.options.map((option) => (
          <div
            key={option.id}
            onClick={(e) => {
              e.stopPropagation();
              onClick(prediction, option.id);
            }}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.75rem 1rem",
              background: "var(--bg-secondary)",
              borderRadius: "0.5rem",
              border: "1px solid var(--border-color)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = option.color || "var(--color-light-blue)";
              e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-color)";
              e.currentTarget.style.background = "var(--bg-secondary)";
            }}
          >
            <span
              style={{
                fontSize: "0.9rem",
                color: "var(--text-primary)",
                fontWeight: "500",
                flex: 1,
              }}
            >
              {option.label}
            </span>
            <span
              style={{
                fontSize: "0.95rem",
                fontWeight: "700",
                color: option.color || "var(--color-light-blue)",
                minWidth: "45px",
                textAlign: "right",
              }}
            >
              {option.probability}%
            </span>
          </div>
        ))}
      </div>

      {/* Footer - Volume and Icons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "1rem",
          borderTop: "1px solid var(--border-color)",
          marginTop: "auto",
        }}
      >
        {/* Volume with Refresh Icon */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {prediction.volume && (
            <>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500" }}>
                {prediction.volume}
              </span>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: "0.25rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                  borderRadius: "0.25rem",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--color-light-blue)";
                  e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-muted)";
                  e.currentTarget.style.background = "none";
                }}
                title="Refresh"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Action Icons - Gift and Bookmark */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {/* Gift Icon */}
          <button
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              borderRadius: "0.375rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--color-light-blue)";
              e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.background = "none";
            }}
            title="Share"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
          </button>

          {/* Bookmark Icon */}
          <button
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              borderRadius: "0.375rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--color-light-blue)";
              e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.background = "none";
            }}
            title="Bookmark"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;
