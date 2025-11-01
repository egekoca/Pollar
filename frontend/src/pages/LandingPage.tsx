import { Link } from "react-router-dom";
import { useRef } from "react";
import { gsap } from "gsap";
import Lightning from "../components/Lightning";
import PillNav from "../components/PillNav";
import ElectricBorder from "../components/ElectricBorder";
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
        <Link to="#" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.75rem" }} onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
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
              { label: 'Pricing', href: '#pricing' },
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
          className="go-voting-button-neon" 
          style={{ 
            textDecoration: "none",
            display: "inline-block",
            transition: "all 0.3s ease",
            cursor: "pointer",
            lineHeight: "0",
            borderRadius: "0.5rem",
            overflow: "hidden",
          }}
        >
          <img 
            src="/go-vote.png" 
            alt="Go Vote" 
            style={{
              width: "clamp(90px, 12vw, 140px)",
              height: "auto",
              objectFit: "cover",
              display: "block",
              borderRadius: "0.5rem",
            }}
          />
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
            <Link 
              to="/vote-pools" 
              className="hero-button-neon-blue"
              style={{ 
                fontSize: "clamp(0.9rem, 2vw, 1.1rem)", 
                padding: "clamp(0.65rem, 1.8vw, 0.85rem) clamp(1.5rem, 3.5vw, 2.25rem)",
                background: "transparent",
                color: "#60a5fa",
                border: "1.5px solid #60a5fa",
                borderRadius: "0.5rem",
                fontWeight: "600",
                textDecoration: "none",
                display: "inline-block",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
            >
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
          padding: "clamp(4rem, 10vw, 8rem) clamp(1rem, 3vw, 2rem)",
          background: "linear-gradient(180deg, #000000 0%, #0a1128 50%, #000000 100%)",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h3
            className="why-choose-animated-text"
            style={{
              textAlign: "center",
              fontSize: "clamp(2rem, 6vw, 4rem)",
              marginBottom: "clamp(4rem, 8vw, 6rem)",
              fontWeight: "900",
              background: "linear-gradient(90deg, #1e3a8a 0%, #2563eb 15%, #3b82f6 30%, #60a5fa 45%, #87ceeb 60%, #bae6fd 75%, #ffffff 90%, #bae6fd 100%)",
              backgroundSize: "300% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "smoothFlowingGradient 5s ease-in-out infinite",
            }}
          >
            Why Choose Pollar?
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 350px), 1fr))",
              gap: "clamp(2rem, 4vw, 3rem)",
            }}
          >
            <ElectricBorder
              color="#3b82f6"
              speed={1}
              chaos={0.5}
              thickness={2}
              style={{ borderRadius: 16 }}
            >
              <div style={{ padding: "clamp(1.5rem, 3vw, 2rem)" }}>
                <h4 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", marginBottom: "1rem", color: "#60a5fa" }}>
                  Decentralized
                </h4>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.8", fontSize: "clamp(1rem, 1.8vw, 1.15rem)" }}>
                  Built on blockchain technology for maximum transparency and security. Every vote is
                  immutable and verifiable.
                </p>
              </div>
            </ElectricBorder>
            <ElectricBorder
              color="#3b82f6"
              speed={1}
              chaos={0.5}
              thickness={2}
              style={{ borderRadius: 16 }}
            >
              <div style={{ padding: "clamp(1.5rem, 3vw, 2rem)" }}>
                <h4 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", marginBottom: "1rem", color: "#60a5fa" }}>
                  Real time Results
                </h4>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.8", fontSize: "clamp(1rem, 1.8vw, 1.15rem)" }}>
                  Watch results update in real-time as votes are cast. Track voting trends with
                  interactive charts and graphs.
                </p>
              </div>
            </ElectricBorder>
            <ElectricBorder
              color="#3b82f6"
              speed={1}
              chaos={0.5}
              thickness={2}
              style={{ borderRadius: 16 }}
            >
              <div style={{ padding: "clamp(1.5rem, 3vw, 2rem)" }}>
                <h4 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", marginBottom: "1rem", color: "#60a5fa" }}>
                  Easy to Use
                </h4>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.8", fontSize: "clamp(1rem, 1.8vw, 1.15rem)" }}>
                  Create polls in seconds. No complicated setup or technical knowledge required.
                  Start voting immediately.
                </p>
              </div>
            </ElectricBorder>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        style={{
          padding: "clamp(4rem, 10vw, 8rem) clamp(1rem, 3vw, 2rem)",
          background: "linear-gradient(180deg, #000000 0%, #0a1128 50%, #000000 100%)",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h3
            className="pricing-animated-text"
            style={{
              textAlign: "center",
              fontSize: "clamp(2rem, 6vw, 4rem)",
              marginBottom: "clamp(4rem, 8vw, 6rem)",
              fontWeight: "900",
              background: "linear-gradient(90deg, #1e3a8a 0%, #2563eb 15%, #3b82f6 30%, #60a5fa 45%, #87ceeb 60%, #bae6fd 75%, #ffffff 90%, #bae6fd 100%)",
              backgroundSize: "300% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "smoothFlowingGradient 5s ease-in-out infinite",
            }}
          >
            PRICING
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
              gap: "clamp(2rem, 4vw, 3rem)",
            }}
          >
            <ElectricBorder
              color="#3b82f6"
              speed={1}
              chaos={0.5}
              thickness={2}
              style={{ borderRadius: 16 }}
            >
              <div style={{ padding: "clamp(2rem, 4vw, 3rem)", textAlign: "center" }}>
                <h4 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", marginBottom: "1rem", color: "#60a5fa" }}>
                  Free
                </h4>
                <div style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: "bold", color: "#ffffff", marginBottom: "1rem" }}>
                  $0
                </div>
                <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "clamp(1rem, 1.8vw, 1.15rem)" }}>
                  Perfect for getting started
                </p>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: "2rem", textAlign: "left" }}>
                  <li style={{ color: "var(--text-secondary)", marginBottom: "0.75rem", fontSize: "clamp(0.9rem, 1.6vw, 1rem)" }}>
                    ✓ Create up to 5 polls
                  </li>
                  <li style={{ color: "var(--text-secondary)", marginBottom: "0.75rem", fontSize: "clamp(0.9rem, 1.6vw, 1rem)" }}>
                    ✓ Vote on unlimited polls
                  </li>
                  <li style={{ color: "var(--text-secondary)", marginBottom: "0.75rem", fontSize: "clamp(0.9rem, 1.6vw, 1rem)" }}>
                    ✓ Basic analytics
                  </li>
                  <li style={{ color: "var(--text-secondary)", fontSize: "clamp(0.9rem, 1.6vw, 1rem)" }}>
                    ✓ Community support
                  </li>
                </ul>
                <Link 
                  to="/vote-pools" 
                  className="hero-button-neon-blue"
                  style={{ 
                    fontSize: "clamp(0.9rem, 2vw, 1.1rem)", 
                    padding: "clamp(0.65rem, 1.8vw, 0.85rem) clamp(1.5rem, 3.5vw, 2.25rem)",
                    background: "transparent",
                    color: "#60a5fa",
                    border: "1.5px solid #60a5fa",
                    borderRadius: "0.5rem",
                    fontWeight: "600",
                    textDecoration: "none",
                    display: "inline-block",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                >
                  Get Started
                </Link>
              </div>
            </ElectricBorder>
            <ElectricBorder
              color="#FFD700"
              speed={1}
              chaos={0.5}
              thickness={2}
              style={{ borderRadius: 16 }}
            >
              <div style={{ padding: "clamp(2rem, 4vw, 3rem)", textAlign: "center" }}>
                <h4 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", marginBottom: "1rem", color: "#FFD700" }}>
                  Pro
                </h4>
                <div style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: "bold", color: "#ffffff", marginBottom: "1rem" }}>
                  $9.99
                  <span style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)", fontWeight: "normal", color: "var(--text-secondary)" }}>/month</span>
                </div>
                <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "clamp(1rem, 1.8vw, 1.15rem)" }}>
                  For power users and organizations
                </p>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: "2rem", textAlign: "left" }}>
                  <li style={{ color: "var(--text-secondary)", marginBottom: "0.75rem", fontSize: "clamp(0.9rem, 1.6vw, 1rem)" }}>
                    ✓ Unlimited polls
                  </li>
                  <li style={{ color: "var(--text-secondary)", marginBottom: "0.75rem", fontSize: "clamp(0.9rem, 1.6vw, 1rem)" }}>
                    ✓ Advanced analytics
                  </li>
                  <li style={{ color: "var(--text-secondary)", marginBottom: "0.75rem", fontSize: "clamp(0.9rem, 1.6vw, 1rem)" }}>
                    ✓ Custom branding
                  </li>
                  <li style={{ color: "var(--text-secondary)", marginBottom: "0.75rem", fontSize: "clamp(0.9rem, 1.6vw, 1rem)" }}>
                    ✓ Priority support
                  </li>
                  <li style={{ color: "var(--text-secondary)", fontSize: "clamp(0.9rem, 1.6vw, 1rem)" }}>
                    ✓ API access
                  </li>
                </ul>
                <Link 
                  to="/vote-pools" 
                  className="hero-button-neon-blue"
                  style={{ 
                    fontSize: "clamp(0.9rem, 2vw, 1.1rem)", 
                    padding: "clamp(0.65rem, 1.8vw, 0.85rem) clamp(1.5rem, 3.5vw, 2.25rem)",
                    background: "transparent",
                    color: "#60a5fa",
                    border: "1.5px solid #60a5fa",
                    borderRadius: "0.5rem",
                    fontWeight: "600",
                    textDecoration: "none",
                    display: "inline-block",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                >
                  Upgrade Now
                </Link>
              </div>
            </ElectricBorder>
            <ElectricBorder
              color="#3b82f6"
              speed={1}
              chaos={0.5}
              thickness={2}
              style={{ borderRadius: 16 }}
            >
              <div style={{ padding: "clamp(2rem, 4vw, 3rem)", textAlign: "center" }}>
                <h4 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", marginBottom: "1rem", color: "#60a5fa" }}>
                  Enterprise
                </h4>
                <div style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: "bold", color: "#ffffff", marginBottom: "1rem" }}>
                  Custom
                </div>
                <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "clamp(1rem, 1.8vw, 1.15rem)" }}>
                  Tailored solutions for large teams
                </p>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: "2rem", textAlign: "left" }}>
                  <li style={{ color: "var(--text-secondary)", marginBottom: "0.75rem", fontSize: "clamp(0.9rem, 1.6vw, 1rem)" }}>
                    ✓ Everything in Pro
                  </li>
                  <li style={{ color: "var(--text-secondary)", marginBottom: "0.75rem", fontSize: "clamp(0.9rem, 1.6vw, 1rem)" }}>
                    ✓ Dedicated support
                  </li>
                  <li style={{ color: "var(--text-secondary)", marginBottom: "0.75rem", fontSize: "clamp(0.9rem, 1.6vw, 1rem)" }}>
                    ✓ Custom integrations
                  </li>
                  <li style={{ color: "var(--text-secondary)", marginBottom: "0.75rem", fontSize: "clamp(0.9rem, 1.6vw, 1rem)" }}>
                    ✓ SLA guarantee
                  </li>
                  <li style={{ color: "var(--text-secondary)", fontSize: "clamp(0.9rem, 1.6vw, 1rem)" }}>
                    ✓ On-premise deployment
                  </li>
                </ul>
                <Link 
                  to="/vote-pools" 
                  className="hero-button-neon-blue"
                  style={{ 
                    fontSize: "clamp(0.9rem, 2vw, 1.1rem)", 
                    padding: "clamp(0.65rem, 1.8vw, 0.85rem) clamp(1.5rem, 3.5vw, 2.25rem)",
                    background: "transparent",
                    color: "#60a5fa",
                    border: "1.5px solid #60a5fa",
                    borderRadius: "0.5rem",
                    fontWeight: "600",
                    textDecoration: "none",
                    display: "inline-block",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                >
                  Contact Sales
                </Link>
              </div>
            </ElectricBorder>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        style={{
          padding: "clamp(2rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem)",
          textAlign: "center",
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

