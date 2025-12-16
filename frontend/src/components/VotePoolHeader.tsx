import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRef, useMemo } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { gsap } from "gsap";
import PillNav from "./PillNav";
import UserProfileDropdown from "./UserProfileDropdown";
import { UserProfile } from "../utils/userProfile";
import { ANIMATION_DURATION, Z_INDEX } from "../constants/appConstants";

interface VotePoolHeaderProps {
  userProfile: UserProfile | null;
  onCreateVotePool: () => void;
  onLogout: () => void;
}

/**
 * VotePoolHeader Component
 * Displays the header with logo, navigation, create button, and user profile
 */
const VotePoolHeader: React.FC<VotePoolHeaderProps> = ({
  userProfile,
  onCreateVotePool,
  onLogout,
}) => {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const logoRef = useRef<HTMLImageElement>(null);

  const handleLogoHover = () => {
    if (logoRef.current) {
      gsap.to(logoRef.current, {
        rotate: 360,
        duration: ANIMATION_DURATION.NORMAL,
        ease: "power3.easeOut",
      });
    }
  };

  return (
    <header
      style={{
        padding: "clamp(0.35rem, 0.7vw, 0.5rem) clamp(1rem, 2.5vw, 1.5rem)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
        position: "fixed",
        width: "100%",
        boxSizing: "border-box",
        top: 0,
        left: 0,
        zIndex: Z_INDEX.HEADER,
        backdropFilter: "blur(10px)",
        background: "rgba(0, 0, 0, 0.05)",
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
            width: "clamp(40px, 6vw, 50px)", 
            height: "clamp(40px, 6vw, 50px)",
            borderRadius: "8px",
            cursor: "pointer",
          }} 
        />
        <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: "700", color: "var(--text-primary)", fontFamily: "'Bevellier', sans-serif" }}>
          POLLAR
        </h1>
      </Link>

      {/* Orta - PillNav */}
      <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", zIndex: Z_INDEX.NAVIGATION }}>
        <PillNav
          logo="/pollar-logo.png"
          logoAlt="Pollar Logo"
          items={useMemo(() => [
            { label: 'Home', href: '/' },
            { label: 'Pools', href: '/vote-pools' },
            { label: 'Pricing', href: '/#pricing' },
          ], [])}
          activeHref="/vote-pools"
          baseColor="transparent"
          pillColor="#ffffff"
          hoveredPillTextColor="#ffffff"
          pillTextColor="#000000"
          hoverCircleColor="#000000"
        />
      </div>

      {/* Sağ Taraf - Create Vote Pool Butonu ve Profil */}
      <div style={{ display: "flex", alignItems: "center", gap: "clamp(0.5rem, 1.5vw, 1rem)", flexWrap: "wrap" }}>
        {account && userProfile ? (
          <>
            <button 
              onClick={onCreateVotePool} 
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
            <UserProfileDropdown profile={userProfile} onLogout={onLogout} />
          </>
        ) : (
          <button onClick={() => navigate("/login")} className="button button-primary">
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
};

export default VotePoolHeader;


