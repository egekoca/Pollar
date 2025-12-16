import React, { RefObject } from "react";
import { Link, useNavigate } from "react-router-dom";
import PillNav from "./PillNav";

interface VotingHeaderProps {
  logoRef: RefObject<HTMLImageElement>;
  handleLogoHover: () => void;
  pollId: string | undefined;
}

/**
 * VotingHeader Component
 * Header section with logo, navigation, and back button
 */
const VotingHeader: React.FC<VotingHeaderProps> = ({ logoRef, handleLogoHover, pollId }) => {
  const navigate = useNavigate();

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
        zIndex: 1000,
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
      <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", zIndex: 100 }}>
        <PillNav
          logo="/pollar-logo.png"
          logoAlt="Pollar Logo"
          items={[
            { label: 'Home', href: '/' },
            { label: 'Pools', href: '/vote-pools' },
            { label: 'Pricing', href: '/#pricing' },
          ]}
          activeHref={pollId ? `/voting/${pollId}` : undefined}
          baseColor="transparent"
          pillColor="#ffffff"
          hoveredPillTextColor="#ffffff"
          pillTextColor="#000000"
          hoverCircleColor="#000000"
        />
      </div>

      {/* Sağ Taraf - Back to Pools Butonu */}
      <button
        onClick={() => navigate("/vote-pools")}
        style={{ 
          textDecoration: "none",
          display: "inline-block",
          transition: "all 0.3s ease",
          cursor: "pointer",
          lineHeight: "0",
          borderRadius: "0.5rem",
          overflow: "hidden",
          border: "none",
          background: "transparent",
          padding: "0",
        }}
      >
        <img 
          src="/back-to-pools.png" 
          alt="Back to Pools" 
          style={{
            width: "clamp(90px, 12vw, 140px)",
            height: "auto",
            objectFit: "cover",
            display: "block",
            borderRadius: "0.5rem",
          }}
        />
      </button>
    </header>
  );
};

export default VotingHeader;

