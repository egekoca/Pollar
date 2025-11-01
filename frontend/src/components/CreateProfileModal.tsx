import { useState, useEffect } from "react";
import "../styles/theme.css";

interface CreateProfileModalProps {
  isOpen: boolean;
  walletAddress: string;
  onClose: () => void;
  onSubmit: (username: string, avatarUrl: string) => void;
}

const CreateProfileModal = ({ isOpen, walletAddress, onClose, onSubmit }: CreateProfileModalProps) => {
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setUsername("");
      setAvatarUrl("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    if (!avatarUrl.trim()) {
      setError("Avatar URL is required");
      return;
    }

    onSubmit(username.trim(), avatarUrl.trim());
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: "clamp(1rem, 3vw, 2rem)",
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: "500px",
          width: "100%",
          background: "var(--bg-card)",
          padding: "clamp(1.25rem, 2.5vw, 1.5rem)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "clamp(1rem, 2vw, 1.5rem)" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 1.75rem)", fontWeight: "600", color: "var(--text-primary)" }}>
            Create Profile
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              color: "var(--text-secondary)",
              cursor: "pointer",
              padding: "0.5rem",
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "1rem",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "0.5rem",
              color: "#ef4444",
              marginBottom: "1.5rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Wallet Address (Read-only) */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "var(--text-primary)",
                fontWeight: "500",
              }}
            >
              Wallet Address
            </label>
            <input
              type="text"
              value={formatAddress(walletAddress)}
              disabled
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "0.5rem",
                color: "var(--text-muted)",
                fontSize: "1rem",
                cursor: "not-allowed",
              }}
            />
          </div>

          {/* Username */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "var(--text-primary)",
                fontWeight: "500",
              }}
            >
              Username *
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              minLength={3}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "0.5rem",
                color: "var(--text-primary)",
                fontSize: "1rem",
              }}
            />
          </div>

          {/* Avatar URL */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "var(--text-primary)",
                fontWeight: "500",
              }}
            >
              Avatar URL *
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "0.5rem",
                color: "var(--text-primary)",
                fontSize: "1rem",
              }}
            />
            {avatarUrl && (
              <div style={{ marginTop: "0.5rem" }}>
                <img
                  src={avatarUrl}
                  alt="Avatar preview"
                  style={{
                    width: "clamp(70px, 15vw, 80px)",
                    height: "clamp(70px, 15vw, 80px)",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid var(--border-color)",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
            <button type="submit" className="button button-primary">
              Create Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProfileModal;

