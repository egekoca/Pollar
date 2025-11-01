import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import { gsap } from "gsap";
import PillNav from "../components/PillNav";
import CreateVotePoolModal from "../components/CreateVotePoolModal";
import UserProfileDropdown from "../components/UserProfileDropdown";
import { getUserProfile, UserProfile } from "../utils/userProfile";
import { useBlockchainPolls } from "../utils/pollUtils";
import "../styles/theme.css";

const VotePoolPage = () => {
  const navigate = useNavigate();
  const logoRef = useRef<HTMLImageElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();

  const handleLogoHover = () => {
    if (logoRef.current) {
      gsap.to(logoRef.current, {
        rotate: 360,
        duration: 0.6,
        ease: "power3.easeOut",
      });
    }
  };
  
  // Blockchain'den poll'ları oku
  const { data: pools = [], isLoading: isLoadingPools, refetch } = useBlockchainPolls();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleCreateVotePool = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (account?.address) {
      const profile = getUserProfile(account.address);
      if (profile) {
        setUserProfile(profile);
      } else {
        // No profile, redirect to create profile page
        navigate("/create-profile");
      }
    } else {
      setUserProfile(null);
    }
  }, [account?.address, navigate]);

  const handlePollCreated = () => {
    // Poll oluşturulduktan sonra blockchain'den yeniden yükle
    refetch();
  };


  const handleLogout = () => {
    disconnect();
    setUserProfile(null);
  };

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
              { label: 'Pricing', href: '/#pricing' },
            ]}
            activeHref="/vote-pools"
            baseColor="#000000"
            pillColor="#ffffff"
            hoveredPillTextColor="#ffffff"
            pillTextColor="#000000"
          />
        </div>

        {/* Sağ Taraf - Create Vote Pool Butonu ve Profil */}
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(0.5rem, 1.5vw, 1rem)", flexWrap: "wrap" }}>
          {account && userProfile ? (
            <>
              <button 
                onClick={handleCreateVotePool} 
                className="create-vote-pool-neon-white"
                style={{ 
                  fontSize: "clamp(0.8rem, 1.4vw, 0.95rem)", 
                  padding: "clamp(0.5rem, 1.2vw, 0.65rem) clamp(1rem, 2vw, 1.25rem)",
                  background: "transparent",
                  color: "#ffffff",
                  border: "1.5px solid #ffffff",
                  borderRadius: "0.5rem",
                  fontWeight: "600",
                  textDecoration: "none",
                  display: "inline-block",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
              >
                Create Vote Pool
              </button>
              <UserProfileDropdown profile={userProfile} onLogout={handleLogout} />
            </>
          ) : (
            <button onClick={() => navigate("/login")} className="button button-primary">
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: "clamp(1rem, 3vw, 2rem)", maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ marginBottom: "clamp(1.5rem, 3vw, 2rem)", textAlign: "center" }}>
          <h2 
            className="active-pools-animated-text"
            style={{ 
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)", 
              marginBottom: "0.5rem",
              fontWeight: "900",
              textTransform: "uppercase",
              background: "linear-gradient(90deg, #1e3a8a 0%, #2563eb 15%, #3b82f6 30%, #60a5fa 45%, #87ceeb 60%, #bae6fd 75%, #ffffff 90%, #bae6fd 100%)",
              backgroundSize: "300% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "smoothFlowingGradient 5s ease-in-out infinite",
            }}
          >
            ACTIVE VOTE POOLS
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "clamp(1rem, 2vw, 1.1rem)" }}>
            Participate in ongoing polls and make your voice heard
          </p>
        </div>

        {/* Loading State */}
        {isLoadingPools && (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
            Loading polls...
          </div>
        )}

        {/* Empty State */}
        {!isLoadingPools && pools.length === 0 && (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", marginBottom: "1rem" }}>
              No polls found. Create the first poll!
            </p>
            {account && userProfile && (
              <button onClick={handleCreateVotePool} className="button button-primary">
                Create First Poll
              </button>
            )}
          </div>
        )}

        {/* Vote Pool Grid */}
        {!isLoadingPools && pools.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
            gap: "clamp(1rem, 3vw, 2rem)",
          }}
        >
          {pools.map((pool) => (
            <Link
              key={pool.id}
              to={`/voting/${pool.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="card" style={{ cursor: "pointer", height: "100%" }}>
                {/* Pool Image */}
                <div
                  style={{
                    width: "100%",
                    height: "200px",
                    borderRadius: "0.5rem",
                    marginBottom: "1rem",
                    overflow: "hidden",
                    background: "var(--bg-secondary)",
                  }}
                >
                  <img
                    src={pool.image}
                    alt={pool.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>

                {/* Pool Info */}
                <h3
                  style={{
                    fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)",
                    fontWeight: "600",
                    marginBottom: "0.75rem",
                    color: "var(--text-primary)",
                  }}
                >
                  {pool.name}
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    marginBottom: "1rem",
                    lineHeight: "1.6",
                    fontSize: "clamp(0.9rem, 1.5vw, 0.95rem)",
                  }}
                >
                  {pool.description}
                </p>

                {/* Options Preview */}
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                    Options:
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {pool.options.slice(0, 3).map((option) => (
                      <span
                        key={option.id}
                        style={{
                          padding: "0.25rem 0.75rem",
                          background: "var(--bg-secondary)",
                          borderRadius: "1rem",
                          fontSize: "0.85rem",
                          border: "1px solid var(--border-color)",
                        }}
                      >
                        {option.name}
                      </span>
                    ))}
                    {pool.options.length > 3 && (
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          background: "var(--bg-secondary)",
                          borderRadius: "1rem",
                          fontSize: "0.85rem",
                          border: "1px solid var(--border-color)",
                        }}
                      >
                        +{pool.options.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Vote Statistics */}
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
                  <div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Total Votes</div>
                    <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: "var(--color-light-blue)" }}>
                      {pool.totalVotes.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Ends</div>
                    <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                      {formatDate(pool.endTime)}
                    </div>
                  </div>
                </div>

                {/* Top Option */}
                {pool.options && pool.options.length > 0 && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "0.75rem",
                    background: "var(--bg-secondary)",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                    Leading Option
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                      {pool.options[0].name}
                    </span>
                    <span style={{ color: "var(--color-light-blue)", fontWeight: "bold" }}>
                      {pool.options[0].percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: "0.5rem",
                      height: "6px",
                      background: "var(--bg-primary)",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${pool.options[0].percentage}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, var(--color-navy) 0%, var(--color-light-blue) 100%)",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>
                )}
              </div>
            </Link>
          ))}
        </div>
        )}

      </main>

      {/* Create Vote Pool Modal */}
      <CreateVotePoolModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handlePollCreated}
      />

    </div>
  );
};

export default VotePoolPage;

