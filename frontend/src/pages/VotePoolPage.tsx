import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import { gsap } from "gsap";
import PillNav from "../components/PillNav";
import CreateVotePoolModal from "../components/CreateVotePoolModal";
import UserProfileDropdown from "../components/UserProfileDropdown";
import { getUserProfile, UserProfile } from "../utils/userProfile";
import { useBlockchainPolls } from "../utils/pollUtils";
import { NFT_COLLECTIONS, getUniqueCollectionTypes, getCollectionByType } from "../config/nftCollections";
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
  const uniqueCollectionTypesFromPolls = getUniqueCollectionTypes(allPools);
  
  // Show all defined NFT collections, not just ones with existing polls
  // This ensures all collection buttons are visible even if no polls exist yet
  const allCollectionTypes = NFT_COLLECTIONS.map(col => col.type);
  const uniqueCollectionTypesUnsorted = Array.from(new Set([...uniqueCollectionTypesFromPolls, ...allCollectionTypes]));
  
  // Sort collections in desired order: Hero, Sui Workshop, Popkins, Tallys, Pawtato Heroes
  const collectionOrder = [
    "0xc6726b1b8f40ed882c5d7b7bb2e6fec36a4f19017dd9354268068473de37464e::hero::Hero", // Hero
    "0xe7a8f41cd0edef5431cf713dc6446f0bd80e394cba191741aa40ae5bd5d72326::simple_nft::SimpleNFT", // Sui Workshop
    "0xb908f3c6fea6865d32e2048c520cdfe3b5c5bbcebb658117c41bad70f52b7ccc::popkins_nft::Popkins", // Popkins
    "0x75888defd3f392d276643932ae204cd85337a5b8f04335f9f912b6291149f423::nft::Tally", // Tallys
    "0x0000000000000000000000000000000000000000000000000000000000000000::pawtato_heroes::PawtatoHero", // Pawtato Heroes
  ];
  
  const uniqueCollectionTypes = uniqueCollectionTypesUnsorted.sort((a, b) => {
    const indexA = collectionOrder.indexOf(a);
    const indexB = collectionOrder.indexOf(b);
    // If both are in the order list, sort by their position
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    // If only one is in the order list, prioritize it
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    // If neither is in the order list, maintain original order
    return 0;
  });

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

  const handlePollClick = (pollId: string) => {
    navigate(`/voting/${pollId}`);
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
      {/* Background Character Images - Left and Right Sides (For All Polls and Hero) */}
      {(!selectedCollectionType || selectedCollectionType === "0xc6726b1b8f40ed882c5d7b7bb2e6fec36a4f19017dd9354268068473de37464e::hero::Hero") && (
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
          {/* Left Side Characters */}
          <div
            className="character-side-left"
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
            <img
              src="/pollarpng.png"
              alt="Pollar Character"
              className="character-card"
              style={{
                width: "clamp(80px, 12vw, 200px)",
                height: "clamp(80px, 12vw, 200px)",
                objectFit: "contain",
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transform: "rotate(-3deg)",
                background: "rgba(0, 0, 0, 0.2)",
              }}
            />
            <img
              src="/sealpng.png"
              alt="Seal Character"
              className="character-card"
              style={{
                width: "clamp(80px, 12vw, 200px)",
                height: "clamp(80px, 12vw, 200px)",
                objectFit: "contain",
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transform: "rotate(3deg)",
                background: "rgba(0, 0, 0, 0.2)",
              }}
            />
          </div>

          {/* Right Side Characters */}
          <div
            className="character-side-right"
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
            <img
              src="/walruspng.png"
              alt="Walrus Character"
              className="character-card"
              style={{
                width: "clamp(80px, 12vw, 200px)",
                height: "clamp(80px, 12vw, 200px)",
                objectFit: "contain",
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transform: "rotate(3deg)",
                background: "rgba(0, 0, 0, 0.2)",
              }}
            />
            <img
              src="/friends.png"
              alt="Friends Character"
              className="character-card"
              style={{
                width: "clamp(80px, 12vw, 200px)",
                height: "clamp(80px, 12vw, 200px)",
                objectFit: "contain",
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transform: "rotate(-3deg)",
                background: "rgba(0, 0, 0, 0.2)",
              }}
            />
          </div>
        </div>
      )}

      {/* Background NFT Images - Left and Right Sides (Only for Popkins and Tallys) */}
      {theme?.backgroundImages && theme.backgroundImages.length > 0 && (
        <>
          {(() => {
            // Popkins, Tallys, Pawtato Heroes için 3'erli, diğerleri için 2'şerli
            const isThreePerSide = selectedCollection?.name === "Popkins" || 
                                   selectedCollection?.name === "Tallys" || 
                                   selectedCollection?.name === "Pawtato Heroes";
            const leftCount = isThreePerSide ? 3 : 2;
            const rightStart = isThreePerSide ? 3 : 2;
            const rightEnd = isThreePerSide ? 6 : 4;
            
            return (
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
                  {theme.backgroundImages.slice(0, leftCount).map((imageUrl, index) => (
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
                        filter: "blur(0.7px)",
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
                  {theme.backgroundImages.slice(rightStart, rightEnd).map((imageUrl, index) => (
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
                        filter: "blur(0.7px)",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        transform: `rotate(${index * -3 + 3}deg)`,
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })()}
          <style>{`
            @media (max-width: 1024px) {
              .nft-side-left,
              .nft-side-right,
              .character-side-left,
              .character-side-right {
                display: none !important;
              }
              .main-content-responsive {
                padding-left: clamp(1rem, 3vw, 2rem) !important;
                padding-right: clamp(1rem, 3vw, 2rem) !important;
              }
            }
            @media (min-width: 1025px) and (max-width: 1400px) {
              .nft-card,
              .character-card {
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
            const isPopkins = collection?.name === "Popkins";
            const isTallys = collection?.name === "Tallys";
            const isPawtatoHeroes = collection?.name === "Pawtato Heroes";
            const isHero = collection?.name === "Hero";
            const isSuiWorkshop = collection?.name === "Sui Workshop";
            const hasImage = isPopkins || isTallys || isPawtatoHeroes || isSuiWorkshop;
            const isSelected = selectedCollectionType === collectionType;
            return (
              <button
                key={collectionType}
                onClick={() => setSelectedCollectionType(collectionType)}
          style={{
                  padding: hasImage ? "0" : "0.75rem 1.5rem",
                  background: hasImage ? "transparent" : (isSelected ? "var(--color-light-blue)" : "transparent"),
                  color: hasImage ? "transparent" : (isSelected ? "#000000" : "var(--text-primary)"),
                  border: hasImage ? "none" : "1.5px solid var(--color-light-blue)",
                  borderRadius: hasImage ? "1rem" : "0.5rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: hasImage && isSelected ? 1 : (hasImage ? 0.7 : 1),
                  transform: hasImage && isSelected ? "scale(1.05)" : "scale(1)",
                  boxShadow: (hasImage || isHero) && isSelected 
                    ? (isPopkins 
                        ? "0 0 15px rgba(255, 165, 0, 0.6), 0 0 30px rgba(255, 140, 0, 0.4)"
                        : isTallys
                        ? "0 0 15px rgba(255, 20, 147, 0.6), 0 0 30px rgba(255, 105, 180, 0.4)"
                        : isPawtatoHeroes
                        ? "0 0 15px rgba(132, 204, 22, 0.6), 0 0 30px rgba(163, 230, 53, 0.4)"
                        : isHero
                        ? "0 0 15px rgba(139, 92, 246, 0.6), 0 0 30px rgba(167, 139, 250, 0.4)"
                        : isSuiWorkshop
                        ? "0 0 15px rgba(79, 195, 247, 0.6), 0 0 30px rgba(41, 182, 246, 0.4)"
                        : "none")
                    : "none",
                }}
              >
                {isPopkins ? (
                  <img 
                    src="/popkins.png" 
                    alt="Popkins" 
                    style={{
                      height: "clamp(2rem, 4vw, 3rem)",
                      width: "auto",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                ) : isTallys ? (
                  <img 
                    src="/tallys.png" 
                    alt="Tallys" 
                    style={{
                      height: "clamp(2rem, 4vw, 3rem)",
                      width: "auto",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                ) : isPawtatoHeroes ? (
                  <img 
                    src="/PawtatoHeroes.png" 
                    alt="Pawtato Heroes" 
                    style={{
                      height: "clamp(2.5rem, 5vw, 3.5rem)",
                      width: "auto",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                ) : isSuiWorkshop ? (
                  <img 
                    src="/suilogo.jpg" 
                    alt="Sui Workshop" 
                    style={{
                      height: "clamp(2rem, 4vw, 3rem)",
                      width: "auto",
                      objectFit: "contain",
                      display: "block",
                      borderRadius: "1rem",
                    }}
                  />
                ) : (
                  collection?.name || collectionType.split("::").pop() || "Unknown"
                )}
              </button>
            );
          })}
        </div>

        <div style={{ marginBottom: "clamp(1.5rem, 3vw, 2rem)", textAlign: "center" }}>
          {(() => {
            // Determine title and gradient based on selected collection
            let title = "ACTIVE VOTE POOLS";
            let gradient = "linear-gradient(90deg, #1e3a8a 0%, #2563eb 15%, #3b82f6 30%, #60a5fa 45%, #87ceeb 60%, #bae6fd 75%, #ffffff 90%, #bae6fd 100%)";
            
            if (selectedCollectionType) {
              const collection = getCollectionByType(selectedCollectionType);
              if (collection) {
                if (collection.name === "Popkins") {
                  title = "POPKINS VOTE POLLS";
                  gradient = "linear-gradient(90deg, #10b981 0%, #34d399 15%, #fbbf24 30%, #f59e0b 45%, #f97316 60%, #ec4899 75%, #f472b6 90%, #10b981 100%)"; // Green → Orange → Pink (buton gradyanı gibi)
                } else if (collection.name === "Tallys") {
                  title = "TALLYS VOTE POLLS";
                  gradient = "linear-gradient(90deg, #ec4899 0%, #f472b6 20%, #fb7185 40%, #ef4444 60%, #dc2626 80%, #991b1b 100%)"; // Pink to Red
                } else if (collection.name === "Pawtato Heroes") {
                  title = "PAWTATO HEROES VOTE POLLS";
                  gradient = "linear-gradient(90deg, #10b981 0%, #22c55e 20%, #84cc16 40%, #f59e0b 60%, #f97316 80%, #dc2626 100%)"; // Green → Orange → Red (buton gradyanı gibi)
                } else if (collection.name === "Hero") {
                  title = "HERO VOTE POLLS";
                  gradient = "linear-gradient(90deg, #8b5cf6 0%, #a78bfa 20%, #c084fc 40%, #d8b4fe 60%, #e9d5ff 80%, #f3e8ff 100%)"; // Purple gradient
                } else if (collection.name === "Sui Workshop") {
                  title = "SUI WORKSHOP VOTE POLLS";
                  gradient = "linear-gradient(90deg, #0277bd 0%, #0288d1 20%, #03a9f4 40%, #29b6f6 60%, #4fc3f7 80%, #81d4fa 100%)"; // Blue gradient
                }
              }
            }
            
            return (
              <>
                <h2 
                  className="active-pools-animated-text"
                  style={{ 
                    fontSize: "clamp(1.75rem, 4.5vw, 3rem)", 
                    marginBottom: "0.5rem",
                    fontWeight: "900",
                    textTransform: "uppercase",
                    backgroundImage: gradient,
                    backgroundSize: "300% auto",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    color: "transparent",
                    animation: "smoothFlowingGradient 5s ease-in-out infinite",
                    display: "block",
                    width: "100%",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {title}
                </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "clamp(1rem, 2vw, 1.1rem)", marginBottom: "1rem" }}>
            Participate in ongoing polls and make your voice heard
          </p>
          {selectedCollectionType && (() => {
            const collection = getCollectionByType(selectedCollectionType);
            if (collection && collection.tradeportUrl) {
              return (
                <a
                  href={collection.tradeportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    padding: "0.75rem 1.5rem",
                    background: collection.name === "Popkins" 
                      ? "linear-gradient(135deg, rgba(255, 165, 0, 0.8), rgba(50, 205, 50, 0.8))"
                      : collection.name === "Tallys"
                      ? "linear-gradient(135deg, rgba(255, 20, 147, 0.8), rgba(255, 99, 71, 0.8))"
                      : collection.name === "Pawtato Heroes"
                      ? "linear-gradient(135deg, rgba(132, 204, 22, 0.8), rgba(163, 230, 53, 0.8))"
                      : "var(--color-light-blue)",
                    color: "#000000",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontWeight: "700",
                    fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
                    cursor: "pointer",
                    textDecoration: "none",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
                    marginTop: "0.5rem",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.3)";
                  }}
                >
                  Buy {collection.name}
                </a>
              );
            }
            return null;
          })()}
              </>
            );
          })()}
        </div>

        {/* Loading State */}
        {isLoadingPools && (
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center", 
            minHeight: "60vh",
            gap: "1.5rem"
          }}>
            <video
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: "clamp(200px, 30vw, 400px)",
                height: "auto",
                maxWidth: "100%",
              }}
            >
              <source src="/pollar-walk.mp4" type="video/mp4" />
            </video>
            <p style={{ 
              color: "var(--text-muted)", 
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              fontWeight: "500"
            }}>
            Loading polls...
            </p>
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
          className="poll-grid-responsive"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "clamp(1rem, 2vw, 1.5rem)",
            maxWidth: "100%",
          }}
        >
          {pools.map((pool) => {
            // Check if pool belongs to Popkins or Tallys
            const poolCollection = pool.nft_collection_type 
              ? getCollectionByType(pool.nft_collection_type)
              : null;
            const isPopkins = poolCollection?.name === "Popkins";
            const isTallys = poolCollection?.name === "Tallys";
            const isPawtatoHeroes = poolCollection?.name === "Pawtato Heroes";
            const isHero = poolCollection?.name === "Hero";
            const isSuiWorkshop = poolCollection?.name === "Sui Workshop";
            
            // Check if poll is active
            const now = new Date();
            const startDate = new Date(pool.startTime);
            const endDate = new Date(pool.endTime);
            const isActive = now >= startDate && now <= endDate;
            
            // Glow colors based on collection
            const glowColor = isPopkins 
              ? "rgba(255, 165, 0, 0.3), rgba(50, 205, 50, 0.3)" // Orange-Green for Popkins
              : isTallys
              ? "rgba(255, 20, 147, 0.3), rgba(255, 99, 71, 0.3)" // Pink-Red for Tallys
              : isPawtatoHeroes
              ? "rgba(132, 204, 22, 0.3), rgba(163, 230, 53, 0.3)" // Lime green for Pawtato Heroes
              : isHero
              ? "rgba(139, 92, 246, 0.3), rgba(167, 139, 250, 0.3)" // Purple for Hero
              : isSuiWorkshop
              ? "rgba(79, 195, 247, 0.3), rgba(41, 182, 246, 0.3)" // Blue for Sui Workshop
              : "transparent";
            
            return (
            <div
              key={pool.id}
              onClick={() => handlePollClick(pool.id)}
              style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
            >
              <div 
                className="vote-pool-card" 
                style={{ 
                  cursor: "pointer", 
                  height: "100%", 
                  display: "flex", 
                  flexDirection: "column",
                  position: "relative",
                  boxShadow: glowColor !== "transparent" 
                    ? `0 0 20px ${isPopkins ? "rgba(255, 165, 0, 0.4)" : isTallys ? "rgba(255, 20, 147, 0.4)" : isPawtatoHeroes ? "rgba(132, 204, 22, 0.4)" : isHero ? "rgba(139, 92, 246, 0.4)" : isSuiWorkshop ? "rgba(79, 195, 247, 0.4)" : "rgba(139, 92, 246, 0.4)"}, 0 0 40px ${isPopkins ? "rgba(50, 205, 50, 0.3)" : isTallys ? "rgba(255, 99, 71, 0.3)" : isPawtatoHeroes ? "rgba(163, 230, 53, 0.3)" : isHero ? "rgba(167, 139, 250, 0.3)" : isSuiWorkshop ? "rgba(41, 182, 246, 0.3)" : "rgba(167, 139, 250, 0.3)"}`
                    : undefined,
                  border: glowColor !== "transparent"
                    ? `1px solid ${isPopkins ? "rgba(255, 165, 0, 0.5)" : isTallys ? "rgba(255, 20, 147, 0.5)" : isPawtatoHeroes ? "rgba(132, 204, 22, 0.5)" : isHero ? "rgba(139, 92, 246, 0.5)" : isSuiWorkshop ? "rgba(79, 195, 247, 0.5)" : "rgba(139, 92, 246, 0.5)"}`
                    : undefined,
                }}
              >
                {/* Active/Inactive Status Badge - Top Left (Just Dot) */}
                <div
                  style={{
                    position: "absolute",
                    top: "0.5rem",
                    left: "0.5rem",
                    zIndex: 10,
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: isActive ? "#22c55e" : "#ef4444",
                    boxShadow: `0 0 8px ${isActive ? "#22c55e" : "#ef4444"}, 0 0 16px ${isActive ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)"}`,
                    animation: isActive ? "pulse 2s ease-in-out infinite" : "none",
                    border: `2px solid ${isActive ? "#16a34a" : "#dc2626"}`,
                  }}
                />

                {/* NFT Collection Badge - Ribbon Style Top Right */}
                {(isPopkins || isTallys || isPawtatoHeroes || isHero || isSuiWorkshop) && (
                  <div
                    style={{
                      position: "absolute",
                      top: "0",
                      right: "0",
                      zIndex: 10,
                      width: "clamp(55px, 7.5vw, 75px)",
                      height: "clamp(55px, 7.5vw, 75px)",
                      overflow: "hidden",
                    }}
                  >
                    {/* Ribbon Corner Triangle */}
                    <div
                      style={{
                        position: "absolute",
                        top: "0",
                        right: "0",
                        width: "0",
                        height: "0",
                        borderStyle: "solid",
                        borderWidth: `0 clamp(55px, 7.5vw, 75px) clamp(55px, 7.5vw, 75px) 0`,
                        borderColor: `transparent ${isPopkins ? "rgba(255, 165, 0, 0.95)" : isTallys ? "rgba(255, 20, 147, 0.95)" : isPawtatoHeroes ? "rgba(132, 204, 22, 0.95)" : isHero ? "rgba(139, 92, 246, 0.95)" : isSuiWorkshop ? "rgba(33, 150, 243, 0.95)" : "rgba(139, 92, 246, 0.95)"} transparent transparent`,
                        filter: `drop-shadow(0 2px 8px ${isPopkins ? "rgba(255, 165, 0, 0.7)" : isTallys ? "rgba(255, 20, 147, 0.7)" : isPawtatoHeroes ? "rgba(132, 204, 22, 0.7)" : isHero ? "rgba(139, 92, 246, 0.7)" : isSuiWorkshop ? "rgba(33, 150, 243, 0.7)" : "rgba(139, 92, 246, 0.7)"})`,
                      }}
                    />
                    {/* Ribbon Fold Shadow */}
                    <div
                      style={{
                        position: "absolute",
                        top: "0",
                        right: "0",
                        width: "0",
                        height: "0",
                        borderStyle: "solid",
                        borderWidth: `0 clamp(40px, 5.5vw, 55px) clamp(40px, 5.5vw, 55px) 0`,
                        borderColor: `transparent ${isPopkins ? "rgba(255, 140, 0, 0.8)" : isTallys ? "rgba(255, 0, 100, 0.8)" : isPawtatoHeroes ? "rgba(101, 163, 13, 0.8)" : isHero ? "rgba(124, 58, 237, 0.8)" : isSuiWorkshop ? "rgba(25, 118, 210, 0.8)" : "rgba(124, 58, 237, 0.8)"} transparent transparent`,
                        transform: "translate(4px, 4px)",
                      }}
                    />
                    {/* Image Container - Centered on Ribbon, Larger and More to Top Right */}
                    {!isHero && !isSuiWorkshop && (
                      <div
                        style={{
                          position: "absolute",
                          top: "clamp(6px, 1vw, 10px)",
                          right: "clamp(6px, 1vw, 10px)",
                          width: "clamp(50px, 7.5vw, 70px)",
                          height: "clamp(50px, 7.5vw, 70px)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 11,
                          transform: "rotate(45deg)",
                        }}
                      >
                        <img
                          src={isPopkins ? "/popkins.png" : isTallys ? "/tallys.png" : isPawtatoHeroes ? "/PawtatoHeroes.png" : "/popkins.png"}
                          alt={poolCollection?.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            filter: "drop-shadow(0 2px 6px rgba(0, 0, 0, 0.6))",
                            transform: "rotate(-45deg)",
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Pool Image - Full Width at Top */}
                <div
                  style={{
                    width: "100%",
                    height: "140px",
                    borderRadius: "0.5rem 0.5rem 0 0",
                    overflow: "hidden",
                    background: "var(--bg-secondary)",
                    flexShrink: 0,
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

                {/* Content */}
                <div style={{ padding: "1rem", flex: "1", display: "flex", flexDirection: "column" }}>
                  {/* Title and Description */}
                  <div style={{ marginBottom: "1rem" }}>
                  <h3
                    style={{
                        fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
                      fontWeight: "700",
                        marginBottom: "0.25rem",
                      color: "#ffffff",
                        lineHeight: "1.3",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                  >
                    {pool.name}
                  </h3>
                  <p
                    style={{
                        color: "rgba(255, 255, 255, 0.7)",
                        lineHeight: "1.4",
                        fontSize: "clamp(0.8rem, 1.2vw, 0.85rem)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                  >
                    {pool.description}
                  </p>
                  </div>

                {/* Options with Progress Bars */}
                {pool.options && pool.options.length >= 2 && (
                  <div style={{ marginBottom: "1rem", flex: "1" }}>
                    {/* First Option */}
                    <div style={{ marginBottom: "0.75rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                        <span style={{ fontSize: "0.875rem", fontWeight: "500", color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: "1", marginRight: "0.5rem" }}>
                          {pool.options[0].name}
                        </span>
                        <span style={{ fontSize: "0.875rem", color: "#60a5fa", fontWeight: "bold", flexShrink: 0 }}>
                          {pool.options[0].percentage.toFixed(1)}%
                        </span>
                    </div>
                      <div
                          style={{
                          height: "8px",
                          background: "rgba(255, 255, 255, 0.1)",
                          borderRadius: "4px",
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

                    {/* Second Option */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                        <span style={{ fontSize: "0.875rem", fontWeight: "500", color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: "1", marginRight: "0.5rem" }}>
                          {pool.options[1].name}
                        </span>
                        <span style={{ fontSize: "0.875rem", color: pool.options[1].percentage > pool.options[0].percentage ? "#60a5fa" : "#ef4444", fontWeight: "bold", flexShrink: 0 }}>
                          {pool.options[1].percentage.toFixed(1)}%
                        </span>
                      </div>
                <div
                  style={{
                          height: "8px",
                          background: "rgba(255, 255, 255, 0.1)",
                          borderRadius: "4px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${pool.options[1].percentage}%`,
                            height: "100%",
                            background: pool.options[1].percentage > pool.options[0].percentage 
                              ? "linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)"
                              : "linear-gradient(90deg, #dc2626 0%, #ef4444 100%)",
                            transition: "width 0.3s ease",
                          }}
                        />
                  </div>
                    </div>
                  </div>
                )}

                {/* Single Option Fallback */}
                {pool.options && pool.options.length === 1 && (
                  <div style={{ marginBottom: "1rem", flex: "1" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: "500", color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: "1", marginRight: "0.5rem" }}>
                      {pool.options[0].name}
                    </span>
                      <span style={{ fontSize: "0.875rem", color: "#60a5fa", fontWeight: "bold", flexShrink: 0 }}>
                      {pool.options[0].percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div
                    style={{
                        height: "8px",
                      background: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "4px",
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

                  {/* Vote Statistics */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "0.75rem",
                      borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                      marginTop: "auto",
                      flexShrink: 0,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.6)", marginBottom: "0.25rem" }}>Total Votes</div>
                      <div style={{ fontSize: "1rem", fontWeight: "bold", color: "#60a5fa" }}>
                        {pool.totalVotes.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.6)", marginBottom: "0.25rem" }}>Ends</div>
                      <div style={{ fontSize: "0.85rem", color: "#ffffff" }}>
                        {formatDate(pool.endTime)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
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


