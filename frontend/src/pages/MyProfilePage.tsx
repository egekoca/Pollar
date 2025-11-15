import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useCurrentAccount, useDisconnectWallet, useSuiClient } from "@mysten/dapp-kit";
import { getUserProfile, saveUserProfile, UserProfile } from "../utils/userProfile";
import { getAllPolls } from "../utils/blockchain";
import PillNav from "../components/PillNav";
import UserProfileDropdown from "../components/UserProfileDropdown";
import { gsap } from "gsap";
import "../styles/theme.css";

const MyProfilePage = () => {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutate: disconnect } = useDisconnectWallet();
  const logoRef = useRef<HTMLImageElement>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState("");
  const [myPools, setMyPools] = useState<Array<{
    pollId: string;
    name: string;
    description: string;
    image_url: string;
    start_date: string;
    end_date: string;
  }>>([]);
  const [isLoadingPools, setIsLoadingPools] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleLogoHover = () => {
    if (logoRef.current) {
      gsap.to(logoRef.current, {
        rotate: 360,
        duration: 0.6,
        ease: "power3.easeOut",
      });
    }
  };

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

    // Kullanıcının oluşturduğu poll'ları yükle
    const loadMyPools = async () => {
      setIsLoadingPools(true);
      try {
        const allPolls = await getAllPolls(client);
        // Sadece bu kullanıcının oluşturduğu poll'ları filtrele
        const userPools = allPolls.filter(
          (poll) => poll.creator.toLowerCase() === account.address.toLowerCase()
        );
        setMyPools(userPools);
      } catch (error) {
        console.error("Error loading my pools:", error);
      } finally {
        setIsLoadingPools(false);
      }
    };

    loadMyPools();
  }, [account, navigate, client]);

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
    setIsEditing(false);
    navigate("/vote-pools");
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const handleCopyAddress = async () => {
    if (!account?.address) return;
    try {
      await navigator.clipboard.writeText(account.address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  if (!profile || !account) {
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Header */}
      <header
        style={{
          padding: "clamp(0.35rem, 0.7vw, 0.5rem) clamp(1rem, 2.5vw, 1.5rem)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          position: "relative",
        }}
      >
        {/* Sol Taraf - Logo + Proje İsmi */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <img 
            ref={logoRef}
            src="/pollar-logo.png" 
            alt="Pollar Logo" 
            onMouseEnter={handleLogoHover}
            style={{
              width: "clamp(32px, 5vw, 40px)", 
              height: "clamp(32px, 5vw, 40px)",
              borderRadius: "8px",
              cursor: "pointer",
            }} 
          />
          <h1 style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)", fontWeight: "700", color: "var(--text-primary)" }}>
            POLLAR
          </h1>
        </Link>

        {/* Orta - PillNav */}
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", zIndex: 100 }}>
          <PillNav
            logo="/pollar-logo.png"
            logoAlt="Pollar Logo"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Pools', href: '/vote-pools' },
              { label: 'Prediction Market', href: '/prediction-market' },
              { label: 'Pricing', href: '/#pricing' },
            ]}
            activeHref="/my-profile"
            baseColor="#000000"
            pillColor="#ffffff"
            hoveredPillTextColor="#ffffff"
            pillTextColor="#000000"
          />
        </div>

        {/* Sağ Taraf - Profil */}
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(0.5rem, 1.5vw, 1rem)", flexWrap: "wrap" }}>
          {account && profile ? (
            <UserProfileDropdown profile={profile} onLogout={handleLogout} />
          ) : (
            <button onClick={() => navigate("/login")} className="button button-primary">
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ 
        padding: "clamp(1rem, 3vw, 2rem)", 
        maxWidth: "1400px", 
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))",
        gap: "clamp(1.5rem, 3vw, 2.5rem)",
        alignItems: "start",
      }}>
        {/* Left Column - My Profile */}
        <div>
          <div style={{ marginBottom: "clamp(1.5rem, 3vw, 2rem)" }}>
            <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", marginBottom: "0.5rem", color: "var(--text-primary)" }}>
              My Profile
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "clamp(1rem, 2vw, 1.1rem)" }}>
              Manage your profile information
            </p>
          </div>

        <div 
          className="card"
          style={{
            background: "linear-gradient(135deg, rgba(30, 58, 138, 0.1) 0%, rgba(27, 27, 27, 0.95) 100%)",
            border: "1px solid rgba(96, 165, 250, 0.2)",
            borderRadius: "1rem",
            padding: "2rem",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}
        >
          {error && (
            <div
              style={{
                padding: "1rem",
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                borderRadius: "0.75rem",
                color: "#ef4444",
                marginBottom: "1.5rem",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </div>
          )}

          {/* Avatar Section */}
          <div style={{ textAlign: "center", marginBottom: "clamp(2rem, 4vw, 2.5rem)" }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              {isEditing ? (
                <img
                  src={avatarUrl || profile.avatarUrl}
                  alt="Avatar"
                  style={{
                    width: "clamp(120px, 25vw, 140px)",
                    height: "clamp(120px, 25vw, 140px)",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "4px solid #60a5fa",
                    boxShadow: "0 0 30px rgba(96, 165, 250, 0.5), 0 8px 24px rgba(0, 0, 0, 0.4)",
                    marginBottom: "1rem",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = profile.avatarUrl;
                  }}
                />
              ) : (
                <img
                  src={profile.avatarUrl}
                  alt={profile.username}
                  style={{
                    width: "clamp(120px, 25vw, 140px)",
                    height: "clamp(120px, 25vw, 140px)",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "4px solid #60a5fa",
                    boxShadow: "0 0 30px rgba(96, 165, 250, 0.5), 0 8px 24px rgba(0, 0, 0, 0.4)",
                    marginBottom: "1rem",
                  }}
                />
              )}
            </div>
            {!isEditing && (
              <h3 style={{ 
                fontSize: "clamp(1.5rem, 3vw, 2rem)", 
                fontWeight: "700", 
                color: "#ffffff",
                marginTop: "0.5rem",
                background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                {profile.username}
              </h3>
            )}
          </div>

          {/* Wallet Address (Read-only with Copy) */}
          <div style={{ marginBottom: "1.75rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.75rem",
                color: "rgba(255, 255, 255, 0.9)",
                fontWeight: "600",
                fontSize: "0.9rem",
                letterSpacing: "0.5px",
              }}
            >
              Wallet Address
            </label>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <input
                type="text"
                value={formatAddress(account.address)}
                disabled
                style={{
                  flex: "1",
                  padding: "0.875rem 1rem",
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(96, 165, 250, 0.3)",
                  borderRadius: "0.75rem",
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "0.95rem",
                  fontFamily: "monospace",
                  cursor: "not-allowed",
                  transition: "all 0.2s ease",
                }}
              />
              <button
                onClick={handleCopyAddress}
                style={{
                  padding: "0.875rem 1.25rem",
                  background: copiedAddress 
                    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" 
                    : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "0.75rem",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                  boxShadow: copiedAddress 
                    ? "0 4px 12px rgba(16, 185, 129, 0.4)" 
                    : "0 4px 12px rgba(59, 130, 246, 0.3)",
                }}
                onMouseEnter={(e) => {
                  if (!copiedAddress) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(59, 130, 246, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!copiedAddress) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
                  }
                }}
              >
                {copiedAddress ? "✓ Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Username */}
          <div style={{ marginBottom: "1.75rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.75rem",
                color: "rgba(255, 255, 255, 0.9)",
                fontWeight: "600",
                fontSize: "0.9rem",
                letterSpacing: "0.5px",
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
                  padding: "0.875rem 1rem",
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(96, 165, 250, 0.3)",
                  borderRadius: "0.75rem",
                  color: "#ffffff",
                  fontSize: "0.95rem",
                  transition: "all 0.2s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(96, 165, 250, 0.6)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(96, 165, 250, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(96, 165, 250, 0.3)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            ) : (
              <div
                style={{
                  padding: "0.875rem 1rem",
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(96, 165, 250, 0.2)",
                  borderRadius: "0.75rem",
                  color: "rgba(255, 255, 255, 0.9)",
                  fontSize: "0.95rem",
                }}
              >
                {profile.username}
              </div>
            )}
          </div>

          {/* Avatar URL */}
          <div style={{ marginBottom: "1.75rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.75rem",
                color: "rgba(255, 255, 255, 0.9)",
                fontWeight: "600",
                fontSize: "0.9rem",
                letterSpacing: "0.5px",
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
                  padding: "0.875rem 1rem",
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(96, 165, 250, 0.3)",
                  borderRadius: "0.75rem",
                  color: "#ffffff",
                  fontSize: "0.95rem",
                  transition: "all 0.2s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(96, 165, 250, 0.6)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(96, 165, 250, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(96, 165, 250, 0.3)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            ) : (
              <div
                style={{
                  padding: "0.875rem 1rem",
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(96, 165, 250, 0.2)",
                  borderRadius: "0.75rem",
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: "0.9rem",
                  wordBreak: "break-all",
                }}
              >
                {profile.avatarUrl}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "2.5rem", paddingTop: "2rem", borderTop: "1px solid rgba(96, 165, 250, 0.2)" }}>
            {isEditing ? (
              <>
                <button 
                  onClick={handleCancel} 
                  style={{
                    padding: "0.875rem 1.75rem",
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "rgba(255, 255, 255, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "0.75rem",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  style={{
                    padding: "0.875rem 1.75rem",
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "0.75rem",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(59, 130, 246, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
                  }}
                >
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleLogout}
                  style={{
                    padding: "0.875rem 1.75rem",
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "#ef4444",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "0.75rem",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
                    e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                    e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)";
                  }}
                >
                  Log out
                </button>
                <button 
                  onClick={() => setIsEditing(true)}
                  style={{
                    padding: "0.875rem 1.75rem",
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "0.75rem",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(59, 130, 246, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
                  }}
                >
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>
        </div>

        {/* Right Column - My Pools */}
        <div>
          <div style={{ marginBottom: "clamp(1.5rem, 3vw, 2rem)" }}>
            <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", marginBottom: "0.5rem", color: "var(--text-primary)" }}>
              My Pools
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "clamp(1rem, 2vw, 1.1rem)" }}>
              Polls you've created
            </p>
          </div>
          
          {isLoadingPools ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
              Loading your pools...
            </div>
          ) : myPools.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
                You haven't created any polls yet.
              </p>
              <button 
                onClick={() => navigate("/vote-pools")} 
                className="button button-primary" 
                style={{ marginTop: "1rem", display: "inline-block" }}
              >
                Create Your First Poll
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
                gap: "1rem",
              }}
            >
              {myPools.map((pool) => (
                <Link
                  key={pool.pollId}
                  to={`/voting/${pool.pollId}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    className="card"
                    style={{
                      cursor: "pointer",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Poll Image */}
                    <div
                      style={{
                        width: "100%",
                        height: "150px",
                        borderRadius: "0.5rem 0.5rem 0 0",
                        overflow: "hidden",
                        background: "var(--bg-secondary)",
                      }}
                    >
                      <img
                        src={pool.image_url}
                        alt={pool.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>

                    {/* Poll Info */}
                    <div style={{ padding: "1rem", flex: "1", display: "flex", flexDirection: "column" }}>
                      <h3
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: "600",
                          marginBottom: "0.5rem",
                          color: "var(--text-primary)",
                        }}
                      >
                        {pool.name}
                      </h3>
                      
                      {pool.description && (
                        <p
                          style={{
                            fontSize: "0.875rem",
                            color: "var(--text-muted)",
                            marginBottom: "0",
                            lineHeight: "1.5",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {pool.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyProfilePage;

