import { Link } from "react-router-dom";
import { useRef } from "react";
import { gsap } from "gsap";
import LottieAnimation from "../components/LottieAnimation";
import Lightning from "../components/Lightning";
import PillNav from "../components/PillNav";
import ElectricBorder from "../components/ElectricBorder";
import pollarWalkVideo from "/pollar-walk.mp4";
import "../styles/theme.css";

import "../styles/TechCards.css";
import walrusImg from "../assets/features/walrus.png";
import sealImg from "../assets/features/seal.png";
import googleImg from "../assets/features/google.png";
import suiImg from "../assets/features/sui.png";

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
      <header className="landing-header" style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000, background: "rgba(0, 0, 0, 0.3)", backdropFilter: "blur(10px)" }}>
        {/* Sol Taraf - Logo + Proje İsmi */}
        <Link to="#" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.75rem" }} onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
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
        <div className="landing-pill-nav-wrapper">
          <PillNav
            logo="/pollar-logo.png"
            logoAlt="Pollar Logo"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Pools', href: '/vote-pools' },
              { label: 'Pricing', href: '#pricing' },
            ]}
            activeHref="/"
            baseColor="transparent"
            pillColor="#ffffff"
            hoveredPillTextColor="#ffffff"
            pillTextColor="#000000"
            hoverCircleColor="#000000"
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
          padding: "0 2rem",
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 500px), 1fr))",
          gap: "4rem",
          alignItems: "center",
          height: "100vh", // Tam ekran yüksekliği
          minHeight: "100vh",
          position: "relative",
          paddingTop: "80px", // Header için içerik boşluğu, ama section tam ekran
        }}
      >
        {/* Lightning Background */}
        <div style={{ 
          position: "absolute", 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          zIndex: 0, 
          opacity: 1,
          // Kenarları yumuşatmak için maskeleme eklendi
          maskImage: "radial-gradient(circle at center, black 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(circle at center, black 40%, transparent 80%)" 
        }}>
          <Lightning hue={220} xOffset={0} speed={1} intensity={1.2} size={1} />
        </div>
        <div className="landing-hero-content" style={{ position: "relative", zIndex: 1 }}>
          <div
            className="pollar-animated-text"
            style={{
              fontFamily: "'Bevellier', sans-serif",
              fontSize: "clamp(4rem, 12vw, 7rem)",
              fontWeight: "700", // Fontshare'den çekilen ağırlıkla (700) eşleşmesi için düzeltildi
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
              transform: "translateY(-5rem)", // Keep this for desktop, overridden in CSS for mobile
            }}
          >
            POLLAR
          </div>
          <h2
            className="decentralized-animated-text"
            style={{
              fontFamily: "'Nunito', sans-serif", // Nunito fontu eklendi
              fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)",
              fontWeight: "800", // ExtraBold ağırlığı
              marginBottom: "1.5rem",
              lineHeight: "1.2",
              whiteSpace: "normal", // Changed from nowrap to avoid overflow on mobile
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
          className="landing-hero-video"
          style={{
            // Styles moved to CSS class .landing-hero-video
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
            <source src={pollarWalkVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </section>

      {/* Features Section */}
      <section
        style={{
          padding: "clamp(4rem, 10vw, 8rem) clamp(1rem, 3vw, 2rem)",
          background: "linear-gradient(180deg, #000000 0%, #0a1128 50%, #000000 100%)",
          // Daha yumuşak ve uzun bir geçiş için maskeleme güncellendi
          maskImage: "linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)"
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h3
            className="why-choose-animated-text"
            style={{
              fontFamily: "'Bevellier', sans-serif",
              textAlign: "center",
              fontSize: "clamp(2.5rem, 7vw, 5rem)", // Font boyutu büyütüldü
              marginBottom: "clamp(4rem, 8vw, 6rem)",
              fontWeight: "700",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
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

      {/* Tech Stack Section */}
      <section
        style={{
          padding: "clamp(4rem, 10vw, 6rem) clamp(1rem, 3vw, 2rem)",
          // Siyah ağırlıklı lacivert tema: Üst ve alt tamamen siyah, orta kısım çok koyu lacivert
          background: "linear-gradient(180deg, #000000 0%, #050a1f 50%, #000000 100%)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Background Glow */}
        <div 
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100%",
            height: "100%",
            background: "radial-gradient(circle at center, rgba(30, 58, 138, 0.15) 0%, transparent 70%)",
            zIndex: 0
          }}
        />

        {/* Lightning Lottie Animations - Left and Right Containers */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "clamp(1rem, 5vw, 5rem)",
          transform: "translateY(-50%)",
          width: "clamp(150px, 20vw, 300px)",
          height: "auto",
          zIndex: 0,
          opacity: 0.6,
          pointerEvents: "none"
        }}>
          <LottieAnimation path="/Lightning _Lottie_Animation.json" loop={true} />
        </div>

        <div style={{
          position: "absolute",
          top: "50%",
          right: "clamp(1rem, 5vw, 5rem)",
          transform: "translateY(-50%) scaleX(-1)", // Mirror the right side animation
          width: "clamp(150px, 20vw, 300px)",
          height: "auto",
          zIndex: 0,
          opacity: 0.6,
          pointerEvents: "none"
        }}>
          <LottieAnimation path="/Lightning _Lottie_Animation.json" loop={true} />
        </div>
        
        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <h3
            style={{
              fontFamily: "'Bevellier', sans-serif",
              textAlign: "center",
              fontSize: "clamp(3.5rem, 10vw, 6rem)", // Font boyutu büyütüldü
              marginBottom: "clamp(3rem, 6vw, 5rem)",
              fontWeight: "700",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              // Dinamik Gradient Animasyonu
              background: "linear-gradient(90deg, #1e3a8a 0%, #1d4ed8 25%, #3b82f6 50%, #60a5fa 75%, #1e3a8a 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "integrationsGradient 4s linear infinite",
            }}
          >
            INTEGRATIONS
          </h3>

          <div className="tech-stack-grid">
            {/* Walrus Integration */}
            <div className="tech-card walrus">
              <img 
                src={walrusImg}
                alt="Walrus Integration" 
                className="tech-card-bg-image"
              />
              <div className="tech-card-overlay"></div>
              
              <div className="tech-card-content">
                <div className="tech-card-title">
                  <span className="text-highlight-walrus">Walrus</span> Integration
                </div>
                <p className="tech-card-description">
                  Decentralized storage layer ensuring your voting data is permanently archived and censorship-resistant.
                </p>
              </div>
            </div>

            {/* Seal Integration */}
            <div className="tech-card seal">
              <img 
                src={sealImg}
                alt="Seal Integration" 
                className="tech-card-bg-image"
              />
              <div className="tech-card-overlay"></div>
              
              <div className="tech-card-content">
                <div className="tech-card-title">
                  <span className="text-highlight-seal">Seal</span> Integration
                </div>
                <p className="tech-card-description">
                  State-of-the-art privacy preservation using Mysten Seal to encrypt votes before they ever leave your device.
                </p>
              </div>
            </div>

            {/* zkLogin Integration */}
            <div className="tech-card zklogin">
              <img 
                src={googleImg}
                alt="zkLogin Integration" 
                className="tech-card-bg-image"
              />
              <div className="tech-card-overlay"></div>
              
              <div className="tech-card-content">
                <div className="tech-card-title">
                  <span style={{ color: '#4285F4' }}>z</span>
                  <span style={{ color: '#EA4335' }}>k</span>
                  <span style={{ color: '#FBBC05' }}>L</span>
                  <span style={{ color: '#4285F4' }}>o</span>
                  <span style={{ color: '#34A853' }}>g</span>
                  <span style={{ color: '#EA4335' }}>i</span>
                  <span style={{ color: '#4285F4' }}>n</span> Integration
                </div>
                <p className="tech-card-description">
                  Seamless onboarding with Google. No complex seed phrases needed, just secure and verifiable identity.
                </p>
              </div>
            </div>

            {/* Sui Blockchain */}
            <div className="tech-card sui">
              <img 
                src={suiImg}
                alt="Sui Blockchain" 
                className="tech-card-bg-image"
              />
              <div className="tech-card-overlay"></div>
              
              <div className="tech-card-content">
                <div className="tech-card-title">
                  <span className="text-highlight-sui">Sui</span> Blockchain
                </div>
                <p className="tech-card-description">
                  Built on the fastest layer-1 blockchain with parallel execution for instant vote confirmation and low fees.
                </p>
              </div>
            </div>
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
              fontFamily: "'Bevellier', sans-serif",
              textAlign: "center",
              fontSize: "clamp(2.5rem, 7vw, 5rem)", // Font boyutu büyütüldü
              marginBottom: "clamp(4rem, 8vw, 6rem)",
              fontWeight: "700",
              letterSpacing: "0.1em",
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
                    ✓ Create up to 5 General Polls
                  </li>
                  <li style={{ color: "var(--text-secondary)", marginBottom: "0.75rem", fontSize: "clamp(0.9rem, 1.6vw, 1rem)" }}>
                    ✓ Create 1 NFT-Gated Poll
                  </li>
                  <li style={{ color: "var(--text-secondary)", marginBottom: "0.75rem", fontSize: "clamp(0.9rem, 1.6vw, 1rem)" }}>
                    ✓ Vote on unlimited polls
                  </li>
                  <li style={{ color: "var(--text-secondary)", fontSize: "clamp(0.9rem, 1.6vw, 1rem)" }}>
                    ✓ Basic analytics
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
                    ✓ 20 General Polls / month
                  </li>
                  <li style={{ color: "var(--text-secondary)", marginBottom: "0.75rem", fontSize: "clamp(0.9rem, 1.6vw, 1rem)" }}>
                    ✓ 10 NFT-Gated Polls / month
                  </li>
                  <li style={{ color: "var(--text-secondary)", marginBottom: "0.75rem", fontSize: "clamp(0.9rem, 1.6vw, 1rem)" }}>
                    ✓ Advanced analytics
                  </li>
                  <li style={{ color: "var(--text-secondary)", marginBottom: "0.75rem", fontSize: "clamp(0.9rem, 1.6vw, 1rem)" }}>
                    ✓ Custom branding
                  </li>
                  <li style={{ color: "var(--text-secondary)", fontSize: "clamp(0.9rem, 1.6vw, 1rem)" }}>
                    ✓ Priority support
                  </li>
                </ul>
                <Link 
                  to="/vote-pools" 
                  className="hero-button-neon-yellow" // Sarı buton stili
                  style={{ 
                    fontSize: "clamp(0.9rem, 2vw, 1.1rem)", 
                    padding: "clamp(0.65rem, 1.8vw, 0.85rem) clamp(1.5rem, 3.5vw, 2.25rem)",
                    background: "transparent",
                    color: "#FFD700",
                    border: "1.5px solid #FFD700",
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
              color="#ec4899"
              speed={1}
              chaos={0.5}
              thickness={2}
              style={{ borderRadius: 16 }}
            >
              <div style={{ padding: "clamp(2rem, 4vw, 3rem)", textAlign: "center" }}>
                <h4 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", marginBottom: "1rem", color: "#ec4899" }}>
                  NFT Collection Owners
                </h4>
                <div style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: "bold", color: "#ffffff", marginBottom: "1rem" }}>
                  Special
                </div>
                <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "clamp(1rem, 1.8vw, 1.15rem)" }}>
                  Exclusive access for community members
                </p>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: "2rem", textAlign: "left" }}>
                  <li style={{ color: "var(--text-secondary)", marginBottom: "0.75rem", fontSize: "clamp(0.9rem, 1.6vw, 1rem)" }}>
                    ✓ Exclusive voting rights
                  </li>
                  <li style={{ color: "var(--text-secondary)", marginBottom: "0.75rem", fontSize: "clamp(0.9rem, 1.6vw, 1rem)" }}>
                    ✓ Create NFT-gated polls
                  </li>
                  <li style={{ color: "var(--text-secondary)", marginBottom: "0.75rem", fontSize: "clamp(0.9rem, 1.6vw, 1rem)" }}>
                    ✓ Community governance
                  </li>
                  <li style={{ color: "var(--text-secondary)", marginBottom: "0.75rem", fontSize: "clamp(0.9rem, 1.6vw, 1rem)" }}>
                    ✓ Premium support
                  </li>
                  <li style={{ color: "var(--text-secondary)", fontSize: "clamp(0.9rem, 1.6vw, 1rem)" }}>
                    ✓ Early access features
                  </li>
                </ul>
                <Link 
                  to="/vote-pools" 
                  className="hero-button-neon-pink"
                  style={{ 
                    fontSize: "clamp(0.9rem, 2vw, 1.1rem)", 
                    padding: "clamp(0.65rem, 1.8vw, 0.85rem) clamp(1.5rem, 3.5vw, 2.25rem)",
                    background: "transparent",
                    color: "#ec4899",
                    border: "1.5px solid #ec4899",
                    borderRadius: "0.5rem",
                    fontWeight: "600",
                    textDecoration: "none",
                    display: "inline-block",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                >
                  Contact Us
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
