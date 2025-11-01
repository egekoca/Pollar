import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import { getUserProfile, saveUserProfile, UserProfile } from "../utils/userProfile";
import "../styles/theme.css";

const MyProfilePage = () => {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!account?.address) {
      navigate("/vote-pools");
      return;
    }

    const userProfile = getUserProfile(account.address);
    if (!userProfile) {
      navigate("/vote-pools");
      return;
    }

    setProfile(userProfile);
    setUsername(userProfile.username);
    setAvatarUrl(userProfile.avatarUrl);
  }, [account, navigate]);

  const handleSave = () => {
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

    if (!account?.address) return;

    const updatedProfile: UserProfile = {
      walletAddress: account.address,
      username: username.trim(),
      avatarUrl: avatarUrl.trim(),
    };

    saveUserProfile(updatedProfile);
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (profile) {
      setUsername(profile.username);
      setAvatarUrl(profile.avatarUrl);
    }
    setIsEditing(false);
    setError("");
  };

  const handleLogout = () => {
    disconnect();
    navigate("/vote-pools");
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  if (!profile || !account) {
    return null;
  }

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
        <Link to="/vote-pools" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
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
          <h1 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--text-primary)" }}>
            Pollar
          </h1>
        </Link>
        <button onClick={() => navigate("/vote-pools")} className="button button-secondary">
          Back to Pools
        </button>
      </header>

      {/* Main Content */}
      <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "2.5rem", marginBottom: "0.5rem", color: "var(--text-primary)" }}>
            My Profile
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
            Manage your profile information
          </p>
        </div>

        <div className="card">
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

          {/* Avatar Section */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            {isEditing ? (
              <div>
                <img
                  src={avatarUrl || profile.avatarUrl}
                  alt="Avatar"
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid var(--color-light-blue)",
                    marginBottom: "1rem",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = profile.avatarUrl;
                  }}
                />
              </div>
            ) : (
              <img
                src={profile.avatarUrl}
                alt={profile.username}
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid var(--color-light-blue)",
                  marginBottom: "1rem",
                }}
              />
            )}
            {!isEditing && (
              <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--text-primary)" }}>
                {profile.username}
              </h3>
            )}
          </div>

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
              value={formatAddress(account.address)}
              disabled
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "0.5rem",
                color: "var(--text-muted)",
                fontSize: "1rem",
                fontFamily: "monospace",
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
              Username
            </label>
            {isEditing ? (
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
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
            ) : (
              <div
                style={{
                  padding: "0.75rem",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "0.5rem",
                  color: "var(--text-primary)",
                  fontSize: "1rem",
                }}
              >
                {profile.username}
              </div>
            )}
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
              Avatar URL
            </label>
            {isEditing ? (
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
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
            ) : (
              <div
                style={{
                  padding: "0.75rem",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "0.5rem",
                  color: "var(--text-muted)",
                  fontSize: "0.9rem",
                  wordBreak: "break-all",
                }}
              >
                {profile.avatarUrl}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "2rem" }}>
            {isEditing ? (
              <>
                <button onClick={handleCancel} className="button button-secondary">
                  Cancel
                </button>
                <button onClick={handleSave} className="button button-primary">
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button onClick={handleLogout} className="button button-secondary" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                  Log out
                </button>
                <button onClick={() => setIsEditing(true)} className="button button-primary">
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyProfilePage;

