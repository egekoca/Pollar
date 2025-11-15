import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import { gsap } from "gsap";
import PillNav from "../components/PillNav";
import CreateVotePoolModal from "../components/CreateVotePoolModal";
import UserProfileDropdown from "../components/UserProfileDropdown";
import { getUserProfile, UserProfile } from "../utils/userProfile";
import { useBlockchainPolls } from "../utils/pollUtils";
import { NFT_COLLECTIONS, getUniqueCollectionTypes, getCollectionByType, getCollectionByName } from "../config/nftCollections";
import "../styles/theme.css";

const VotePoolPage = () => {
  const navigate = useNavigate();
  const logoRef = useRef<HTMLImageElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const [selectedCollectionType, setSelectedCollectionType] = useState<string | null>(null); // null = all polls, string = specific collection

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
  const { data: allPools = [], isLoading: isLoadingPools, refetch } = useBlockchainPolls();
  
  // Filter pools by selected collection
  // null = "All Polls" (shows all polls including public and NFT-required)
  // string = specific collection type (shows only polls for that collection)
  const pools = selectedCollectionType === null
    ? allPools // Show all polls when "All Polls" is selected
    : allPools.filter((pool) => pool.nft_collection_type === selectedCollectionType);
  
  // Get unique collection types from all polls
  const uniqueCollectionTypes = getUniqueCollectionTypes(allPools);

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

  // Get theme for selected collection
  const selectedCollection = selectedCollectionType 
    ? getCollectionByType(selectedCollectionType)
    : null;
  
  const theme = selectedCollection?.theme;
  // Always use dark background like other pages
  const defaultBackground = "linear-gradient(180deg, #000000 0%, #0a1128 50%, #000000 100%)";
  const backgroundGradient = defaultBackground; // Keep dark background, NFT theme only affects NFT images

  return (
    <div 
      style={{ 
        minHeight: "100vh", 
        background: backgroundGradient,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background NFT Images - Left and Right Sides */}
      {theme?.backgroundImages && theme.backgroundImages.length > 0 && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 0,
              pointerEvents: "none",
              overflow: "hidden",
            }}
          >
            {/* Left Side NFTs */}
            <div
              className="nft-side-left"
              style={{
                position: "absolute",
                left: "clamp(0.5rem, 2vw, 2rem)",
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                flexDirection: "column",
                gap: "clamp(1rem, 2vw, 2rem)",
              }}
            >
              {theme.backgroundImages.slice(0, 3).map((imageUrl, index) => (
                <div
                  key={`left-${index}`}
                  className="nft-card"
                  style={{
                    width: "clamp(80px, 12vw, 200px)",
                    height: "clamp(80px, 12vw, 200px)",
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderRadius: "16px",
                    filter: "blur(1.5px)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    transform: `rotate(${index * 3 - 3}deg)`,
                  }}
                />
              ))}
            </div>

            {/* Right Side NFTs */}
            <div
              className="nft-side-right"
              style={{
                position: "absolute",
                right: "clamp(0.5rem, 2vw, 2rem)",
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                flexDirection: "column",
                gap: "clamp(1rem, 2vw, 2rem)",
              }}
            >
              {theme.backgroundImages.slice(3, 6).map((imageUrl, index) => (
                <div
                  key={`right-${index}`}
                  className="nft-card"
                  style={{
                    width: "clamp(80px, 12vw, 200px)",
                    height: "clamp(80px, 12vw, 200px)",
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderRadius: "16px",
                    filter: "blur(1.5px)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    transform: `rotate(${index * -3 + 3}deg)`,
                  }}
                />
              ))}
            </div>
          </div>
          <style>{`
            @media (max-width: 1024px) {
              .nft-side-left,
              .nft-side-right {
                display: none !important;
              }
              .main-content-responsive {
                padding-left: clamp(1rem, 3vw, 2rem) !important;
                padding-right: clamp(1rem, 3vw, 2rem) !important;
              }
            }
            @media (min-width: 1025px) and (max-width: 1400px) {
              .nft-card {
                width: clamp(100px, 10vw, 150px) !important;
                height: clamp(100px, 10vw, 150px) !important;
              }
              .main-content-responsive {
                padding-left: clamp(1rem, calc(10vw + 2rem), calc(150px + 3rem)) !important;
                padding-right: clamp(1rem, calc(10vw + 2rem), calc(150px + 3rem)) !important;
              }
            }
            @media (min-width: 1401px) {
              .main-content-responsive {
                padding-left: clamp(2rem, calc(12vw + 2rem), calc(200px + 4rem)) !important;
                padding-right: clamp(2rem, calc(12vw + 2rem), calc(200px + 4rem)) !important;
              }
            }
          `}</style>
        </>
      )}
      
      <div style={{ position: "relative", zIndex: 1 }}>
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
      <main 
        className="main-content-responsive"
        style={{ 
          padding: "clamp(1rem, 3vw, 2rem)",
          paddingLeft: "clamp(1rem, calc(12vw + 2rem), calc(200px + 4rem))",
          paddingRight: "clamp(1rem, calc(12vw + 2rem), calc(200px + 4rem))",
          maxWidth: "1400px", 
          margin: "0 auto", 
          position: "relative",
          width: "100%",
          boxSizing: "border-box",
        }}
      >

        {/* İçerik - Mevcut yapı */}
        <div style={{ position: "relative", zIndex: 2 }}>
        
        {/* NFT Collection Filter Bar */}
        <div style={{ 
          marginBottom: "clamp(1.5rem, 3vw, 2rem)",
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          padding: "1rem",
          background: "rgba(59, 130, 246, 0.1)",
          borderRadius: "0.75rem",
          border: "1px solid rgba(59, 130, 246, 0.3)",
        }}>
          <button
            onClick={() => setSelectedCollectionType(null)}
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
          {uniqueCollectionTypes.map((collectionType) => {
            const collection = getCollectionByType(collectionType);
            return (
              <button
                key={collectionType}
                onClick={() => setSelectedCollectionType(collectionType)}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: selectedCollectionType === collectionType ? "var(--color-light-blue)" : "transparent",
                  color: selectedCollectionType === collectionType ? "#000000" : "var(--text-primary)",
                  border: "1.5px solid var(--color-light-blue)",
                  borderRadius: "0.5rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                {collection?.name || collectionType.split("::").pop() || "Unknown"}
              </button>
            );
          })}
        </div>
        
        <div style={{ marginBottom: "clamp(1.5rem, 3vw, 2rem)", textAlign: "center" }}>
          <h2 
            className="active-pools-animated-text"
            style={{ 
              fontSize: "clamp(2.5rem, 6vw, 4rem)", 
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
              <div className="vote-pool-card" style={{ cursor: "pointer", height: "100%" }}>
                {/* Pool Image */}
                <div
                  style={{
                    width: "100%",
                    height: "200px",
                    borderRadius: "0.5rem 0.5rem 0 0",
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
                <div style={{ padding: "0 1rem" }}>
                  <h3
                    style={{
                      fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)",
                      fontWeight: "700",
                      marginBottom: "0.5rem",
                      color: "#ffffff",
                    }}
                  >
                    {pool.name}
                  </h3>
                  <p
                    style={{
                      color: "#ffffff",
                      marginBottom: "1rem",
                      lineHeight: "1.6",
                      fontSize: "clamp(0.9rem, 1.5vw, 0.95rem)",
                      opacity: 0.9,
                    }}
                  >
                    {pool.description}
                  </p>

                  {/* Options Preview */}
                  <div style={{ marginBottom: "1rem" }}>
                    <div style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.6)", marginBottom: "0.5rem" }}>
                      Options:
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {pool.options.slice(0, 3).map((option) => (
                        <span
                          key={option.id}
                          style={{
                            padding: "0.4rem 0.9rem",
                            background: "transparent",
                            borderRadius: "9999px",
                            fontSize: "0.85rem",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            color: "rgba(255, 255, 255, 0.9)",
                          }}
                        >
                          {option.name}
                        </span>
                      ))}
                      {pool.options.length > 3 && (
                        <span
                          style={{
                            padding: "0.4rem 0.9rem",
                            background: "transparent",
                            borderRadius: "9999px",
                            fontSize: "0.85rem",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            color: "rgba(255, 255, 255, 0.9)",
                          }}
                        >
                          +{pool.options.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vote Statistics */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1rem",
                    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                    marginTop: "auto",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.6)" }}>Total Votes</div>
                    <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#60a5fa" }}>
                      {pool.totalVotes.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.6)" }}>Ends</div>
                    <div style={{ fontSize: "0.9rem", color: "#ffffff" }}>
                      {formatDate(pool.endTime)}
                    </div>
                  </div>
                </div>

                {/* Top Option */}
                {pool.options && pool.options.length > 0 && (
                <div
                  style={{
                    marginTop: "0",
                    padding: "0.75rem 1rem 1rem 1rem",
                    background: "transparent",
                    borderRadius: "0",
                  }}
                >
                  <div style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.6)", marginBottom: "0.25rem" }}>
                    Leading Option
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{ fontWeight: "600", color: "#ffffff" }}>
                      {pool.options[0].name}
                    </span>
                    <span style={{ color: "#60a5fa", fontWeight: "bold" }}>
                      {pool.options[0].percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: "0.5rem",
                      height: "6px",
                      background: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${pool.options[0].percentage}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)",
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
        </div>
      </main>

      {/* Create Vote Pool Modal */}
      <CreateVotePoolModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handlePollCreated}
      />
      </div>
    </div>
  );
};

export default VotePoolPage;

