import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import PillNav from "../components/PillNav";
import PredictionCard from "../components/PredictionCard";
import PredictionDetailModal from "../components/PredictionDetailModal";
import { mockPredictionMarkets, PredictionMarket } from "../data/predictionMarketData";
import "../styles/theme.css";

const PredictionMarketPage = () => {
  const logoRef = useRef<HTMLImageElement>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionMarket | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogoHover = () => {
    if (logoRef.current) {
      gsap.to(logoRef.current, {
        rotate: 360,
        duration: 0.6,
        ease: "power3.easeOut",
      });
    }
  };

  const handleOptionClick = (prediction: PredictionMarket, optionId: string) => {
    setSelectedPrediction(prediction);
    setSelectedOptionId(optionId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPrediction(null);
    setSelectedOptionId(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #000000 0%, #0a1128 50%, #000000 100%)" }}>
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
              { label: "Home", href: "/" },
              { label: "Pools", href: "/vote-pools" },
              { label: "Prediction Market", href: "/prediction-market" },
              { label: "Pricing", href: "/#pricing" },
            ]}
            activeHref="/prediction-market"
            baseColor="#000000"
            pillColor="#ffffff"
            hoveredPillTextColor="#ffffff"
            pillTextColor="#000000"
          />
        </div>

        {/* Sağ Taraf - Boş (şimdilik) */}
        <div style={{ width: "clamp(90px, 12vw, 140px)" }}></div>
      </header>

      {/* Main Content */}
      <main style={{ padding: "clamp(1rem, 3vw, 2rem)", maxWidth: "1400px", margin: "0 auto", position: "relative" }}>
        {/* Page Title */}
        <div style={{ marginBottom: "clamp(1.5rem, 3vw, 2rem)", textAlign: "center" }}>
          <h2
            className="prediction-market-title"
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
            PREDICTION MARKET
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "clamp(1rem, 2vw, 1.1rem)" }}>
            Predict the future and earn rewards
          </p>
        </div>

        {/* Prediction Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 350px), 1fr))",
            gap: "clamp(1rem, 3vw, 2rem)",
          }}
        >
          {mockPredictionMarkets.map((prediction) => (
            <PredictionCard key={prediction.id} prediction={prediction} onClick={handleOptionClick} />
          ))}
        </div>
      </main>

      {/* Detail Modal */}
      {isModalOpen && selectedPrediction && selectedOptionId && (
        <PredictionDetailModal
          prediction={selectedPrediction}
          optionId={selectedOptionId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default PredictionMarketPage;

