import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCurrentAccount, useWallets } from "@mysten/dapp-kit";
import { getUserProfile, saveUserProfile, UserProfile } from "../utils/userProfile";
import "../styles/theme.css";

const CreateProfilePage = () => {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const wallets = useWallets();
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If no wallet connected, redirect to login
    if (!account?.address) {
      navigate("/login");
      return;
    }

    // If profile already exists, redirect to vote pools
    const existingProfile = getUserProfile(account.address);
    if (existingProfile) {
      navigate("/vote-pools");
    }
  }, [account, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!account?.address) {
      setError("Wallet not connected");
      setIsSubmitting(false);
      return;
    }

    if (!username.trim()) {
      setError("Username is required");
      setIsSubmitting(false);
      return;
    }

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters");
      setIsSubmitting(false);
      return;
    }

    if (!avatarUrl.trim()) {
      setError("Avatar URL is required");
      setIsSubmitting(false);
      return;
    }

    // Check if this is an Enoki wallet
    const enokiWallet = wallets.find((wallet) =>
      wallet.accounts.some(
        (acc) => acc.address === account.address && wallet.name.toLowerCase().includes("enoki")
      )
    );

    const newProfile: UserProfile = {
      walletAddress: account.address,
      username: username.trim(),
      avatarUrl: avatarUrl.trim(),
      authMethod: enokiWallet ? "google" : "wallet",
    };

    try {
      saveUserProfile(newProfile);
      // Redirect to vote pools after profile creation
      navigate("/vote-pools");
    } catch (error) {
      console.error("Failed to create profile:", error);
      setError("Failed to create profile. Please try again.");
      setIsSubmitting(false);
    }
  };

  // No longer needed, we show full address now
  // const formatAddress = (address: string) => {
  //   return `${address.slice(0, 8)}...${address.slice(-8)}`;
  // };

  if (!account?.address) {
    return null;
  }

  const isEnokiWallet = wallets.some((wallet) =>
    wallet.accounts.some(
      (acc) => acc.address === account.address && wallet.name.toLowerCase().includes("enoki")
    )
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Header */}
      <header
        style={{
          padding: "1.5rem 2rem",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          to="/"
          style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, var(--color-navy) 0%, var(--color-light-blue) 100%)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "var(--color-white)",
            }}
          >
            P
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--text-primary)" }}>Pollar</h1>
        </Link>
      </header>

      {/* Main Content */}
      <main
        style={{
          padding: "4rem 2rem",
          maxWidth: "600px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ width: "100%" }}>
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: "700",
              marginBottom: "0.5rem",
              color: "var(--text-primary)",
              textAlign: "center",
            }}
          >
            Create Your Profile
          </h2>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "1.1rem",
              marginBottom: "3rem",
              textAlign: "center",
            }}
          >
            Complete your profile to start voting on decentralized polls
          </p>

          <div className="card" style={{ width: "100%" }}>
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
                  Wallet Address {isEnokiWallet && "(zkLogin)"}
                </label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input
                    type="text"
                    value={account.address}
                    readOnly
                    style={{
                      flex: "1",
                      padding: "0.75rem",
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "0.5rem",
                      color: "var(--text-primary)",
                      fontSize: "0.9rem",
                      fontFamily: "monospace",
                      cursor: "text",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(account.address);
                      const btn = document.activeElement as HTMLElement;
                      const originalText = btn.textContent;
                      btn.textContent = "Copied!";
                      setTimeout(() => {
                        if (btn) btn.textContent = originalText;
                      }, 2000);
                    }}
                    style={{
                      padding: "0.75rem 1rem",
                      background: "var(--color-navy)",
                      color: "var(--color-white)",
                      border: "none",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--color-light-blue)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "var(--color-navy)";
                    }}
                  >
                    Copy
                  </button>
                </div>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    marginTop: "0.5rem",
                    marginBottom: 0,
                  }}
                >
                  {isEnokiWallet
                    ? "Your zkLogin wallet address has been automatically created. This address is tied to your Google account."
                    : "Your wallet address is automatically detected from your connected wallet."}
                </p>
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
                  <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
                    <img
                      src={avatarUrl}
                      alt="Avatar preview"
                      style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "3px solid var(--color-light-blue)",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="button button-primary"
                style={{
                  width: "100%",
                  padding: "1rem",
                  fontSize: "1.1rem",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                }}
              >
                {isSubmitting ? "Creating Profile..." : "Create Profile"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateProfilePage;

