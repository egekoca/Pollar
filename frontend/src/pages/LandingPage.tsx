import { Link } from "react-router-dom";
import { useRef } from "react";
import { gsap } from "gsap";
import Lightning from "../components/Lightning";
import PillNav from "../components/PillNav";
import "../styles/theme.css";

const LandingPage = () => {
  const logoRef = useRef<HTMLImageElement>(null);

  const handleLogoHover = () => {
    if (logoRef.current) {
      gsap.to(logoRef.current, {
        rotate: 360,
        duration: 0.6,
        ease: "power3.easeOut",
      });
    }
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
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
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
        </div>

        {/* Orta - PillNav */}
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", zIndex: 100 }}>
          <PillNav
            logo="/pollar-logo.png"
            logoAlt="Pollar Logo"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Pools', href: '/vote-pools' },
              { label: 'Profile', href: '/my-profile' },
            ]}
            activeHref="/"
            baseColor="#000000"
            pillColor="#ffffff"
            hoveredPillTextColor="#ffffff"
            pillTextColor="#000000"
          />
        </div>

        {/* Sağ Taraf - Go Voting Butonu */}
        <Link 
          to="/vote-pools" 
          className="button button-primary go-voting-button" 
          style={{ 
            fontSize: "clamp(0.9rem, 1.8vw, 1rem)",
            transition: "all 0.3s ease",
            position: "relative",
            overflow: "hidden",
          }}
        >
          Go Voting
        </Link>
      </header>

      {/* Hero Section */}
      <section
        className="hero-section"
        style={{
          padding: "4rem 2rem",
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 500px), 1fr))",
          gap: "4rem",
          alignItems: "center",
          minHeight: "calc(100vh - 80px)",
          position: "relative",
        }}
      >
        {/* Lightning Background */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, opacity: 1 }}>
          <Lightning hue={220} xOffset={0} speed={1} intensity={1.2} size={1} />
        </div>
        <div style={{ position: "relative", zIndex: 1, transform: "translateX(-10rem)" }}>
          <div
            className="pollar-animated-text"
            style={{
              fontSize: "clamp(4rem, 12vw, 7rem)",
              fontWeight: "900",
              marginBottom: "1rem",
              lineHeight: "1",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              background: "linear-gradient(90deg, #1e3a8a 0%, #2563eb 15%, #3b82f6 30%, #60a5fa 45%, #87ceeb 60%, #bae6fd 75%, #ffffff 90%, #bae6fd 100%)",
              backgroundSize: "300% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "smoothFlowingGradient 5s ease-in-out infinite",
              transform: "translateY(-5rem)",
            }}
          >
            POLLAR
          </div>
          <h2
            className="decentralized-animated-text"
            style={{
              fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)",
              fontWeight: "800",
              marginBottom: "1.5rem",
              lineHeight: "1.2",
              whiteSpace: "nowrap",
              background: "linear-gradient(90deg, #1e3a8a 0%, #2563eb 15%, #3b82f6 30%, #60a5fa 45%, #87ceeb 60%, #bae6fd 75%, #ffffff 90%, #bae6fd 100%)",
              backgroundSize: "300% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "smoothFlowingGradient 5s ease-in-out infinite",
            }}
          >
            Decentralized Voting System
          </h2>
          <p
            className="hero-description"
            style={{
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              color: "var(--text-secondary)",
              marginBottom: "2rem",
              lineHeight: "1.8",
            }}
          >
            From trust to truth, redefining how we vote.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link to="/vote-pools" className="button button-primary" style={{ fontSize: "clamp(0.9rem, 2vw, 1.1rem)", padding: "clamp(0.75rem, 2vw, 1rem) clamp(1.25rem, 3vw, 2rem)" }}>
              Start Voting
            </Link>
            <Link 
              to="/vote-pools" 
              className="hero-button-neon-white"
              style={{ 
                fontSize: "clamp(0.9rem, 2vw, 1.1rem)", 
                padding: "clamp(0.65rem, 1.8vw, 0.85rem) clamp(1.5rem, 3.5vw, 2.25rem)",
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
              Explore Polls
            </Link>
          </div>
        </div>
        <div
          className="hero-video-container"
          style={{
            position: "relative",
            borderRadius: "1rem",
            overflow: "hidden",
            height: "clamp(250px, 50vw, 450px)",
            width: "100%",
            zIndex: 1,
            boxShadow: "0 10px 40px rgba(59, 130, 246, 0.3)",
            border: "2px solid rgba(59, 130, 246, 0.2)",
            transform: "translate(11rem, -3rem)",
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "1rem",
            }}
          >
            <source src="/pollar-walk.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </section>

      {/* Features Section */}
      <section
        style={{
          padding: "clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)",
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border-color)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h3
            style={{
              textAlign: "center",
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              marginBottom: "clamp(2rem, 4vw, 3rem)",
              color: "var(--text-primary)",
            }}
          >
            Why Choose Pollar?
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
              gap: "clamp(1rem, 3vw, 2rem)",
            }}
          >
            <div className="card">
              <h4 style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)", marginBottom: "1rem", color: "var(--color-light-blue)" }}>
                Decentralized
              </h4>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.8", fontSize: "clamp(0.9rem, 1.8vw, 1rem)" }}>
                Built on blockchain technology for maximum transparency and security. Every vote is
                immutable and verifiable.
              </p>
            </div>
            <div className="card">
              <h4 style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)", marginBottom: "1rem", color: "var(--color-light-blue)" }}>
                Real-time Results
              </h4>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.8", fontSize: "clamp(0.9rem, 1.8vw, 1rem)" }}>
                Watch results update in real-time as votes are cast. Track voting trends with
                interactive charts and graphs.
              </p>
            </div>
            <div className="card">
              <h4 style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)", marginBottom: "1rem", color: "var(--color-light-blue)" }}>
                Easy to Use
              </h4>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.8", fontSize: "clamp(0.9rem, 1.8vw, 1rem)" }}>
                Create polls in seconds. No complicated setup or technical knowledge required.
                Start voting immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        style={{
          padding: "clamp(2rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem)",
          textAlign: "center",
          borderTop: "1px solid var(--border-color)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <p style={{ color: "var(--text-muted)", marginBottom: "clamp(1.5rem, 3vw, 2rem)", fontSize: "clamp(0.75rem, 1.5vw, 0.9rem)" }}>
            TRUSTED BY THOUSANDS OF USERS WORLDWIDE
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "clamp(2rem, 5vw, 4rem)",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: "bold", color: "var(--color-light-blue)" }}>
                10K+
              </div>
              <div style={{ color: "var(--text-muted)", marginTop: "0.5rem", fontSize: "clamp(0.85rem, 1.5vw, 1rem)" }}>Active Users</div>
            </div>
            <div>
              <div style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: "bold", color: "var(--color-light-blue)" }}>
                50K+
              </div>
              <div style={{ color: "var(--text-muted)", marginTop: "0.5rem", fontSize: "clamp(0.85rem, 1.5vw, 1rem)" }}>Vote Pools</div>
            </div>
            <div>
              <div style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: "bold", color: "var(--color-light-blue)" }}>
                500K+
              </div>
              <div style={{ color: "var(--text-muted)", marginTop: "0.5rem", fontSize: "clamp(0.85rem, 1.5vw, 1rem)" }}>Total Votes</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

