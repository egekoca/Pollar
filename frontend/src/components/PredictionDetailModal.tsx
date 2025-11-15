import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { PredictionMarket } from "../data/predictionMarketData";
import "../styles/theme.css";

interface PredictionDetailModalProps {
  prediction: PredictionMarket;
  optionId: string;
  isOpen: boolean;
  onClose: () => void;
}

const PredictionDetailModal = ({ prediction, optionId, isOpen, onClose }: PredictionDetailModalProps) => {
  const [investmentAmount, setInvestmentAmount] = useState(10);
  const [sliderValue, setSliderValue] = useState(10);
  const modalRef = useRef<HTMLDivElement>(null);

  const selectedOption = prediction.options.find((opt) => opt.id === optionId);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "power3.out" }
      );
    }
  }, [isOpen]);

  if (!selectedOption) return null;

  // Kazanç hesaplama: Yatırım / (Olasılık / 100)
  const calculatePotentialWin = (amount: number, probability: number): number => {
    if (probability === 0) return 0;
    const totalReturn = amount / (probability / 100);
    return totalReturn - amount; // Net kazanç
  };

  const potentialWin = calculatePotentialWin(investmentAmount, selectedOption.probability);
  const totalReturn = investmentAmount + potentialWin;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setSliderValue(value);
    setInvestmentAmount(Math.round(value));
  };

  const handleAmountChange = (delta: number) => {
    const newAmount = Math.max(1, Math.min(10000, investmentAmount + delta));
    setInvestmentAmount(newAmount);
    setSliderValue(newAmount);
  };

  const handleBuy = () => {
    // TODO: Web3 entegrasyonu eklenecek
    console.log("Buy:", {
      predictionId: prediction.id,
      optionId: optionId,
      amount: investmentAmount,
      potentialWin: potentialWin,
    });
    alert(`Buy order placed: $${investmentAmount} on "${selectedOption.label}"`);
    onClose();
  };

  if (!isOpen) return null;

  const optionColor = selectedOption.color || "#3b82f6";
  const sliderPercentage = ((sliderValue - 1) / (1000 - 1)) * 100;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.9)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="prediction-detail-modal"
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
          borderRadius: "1.5rem",
          maxWidth: "550px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          border: `1px solid ${optionColor}40`,
          boxShadow: `0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px ${optionColor}20`,
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Effect */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: `linear-gradient(90deg, transparent, ${optionColor}, transparent)`,
            opacity: 0.6,
          }}
        />

        {/* Header */}
        <div
          style={{
            padding: "1.75rem 1.75rem 1.25rem 1.75rem",
            borderBottom: `1px solid ${optionColor}20`,
            position: "relative",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
            <div style={{ flex: 1 }}>
              {/* Title */}
              <h3
                style={{
                  fontSize: "clamp(1.15rem, 2.5vw, 1.35rem)",
                  fontWeight: "700",
                  color: "var(--text-primary)",
                  marginBottom: "0.75rem",
                  lineHeight: "1.3",
                }}
              >
                {prediction.title}
              </h3>
              {/* Selected Option */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  background: `${optionColor}15`,
                  borderRadius: "0.5rem",
                  border: `1px solid ${optionColor}40`,
                }}
              >
                <span
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    color: optionColor,
                  }}
                >
                  {selectedOption.label}
                </span>
                <span
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: "700",
                    color: optionColor,
                    opacity: 0.8,
                  }}
                >
                  {selectedOption.probability}%
                </span>
              </div>
            </div>
            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "0.5rem",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-secondary)",
                cursor: "pointer",
                fontSize: "1.5rem",
                lineHeight: "1",
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "1.75rem" }}>
          {/* Investment Amount Section */}
          <div style={{ marginBottom: "2rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "1.25rem",
                color: "var(--text-primary)",
                fontWeight: "600",
                fontSize: "0.95rem",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              Investment Amount
            </label>

            {/* Amount Display and Controls */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "1.75rem",
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <span
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: "800",
                    color: "var(--text-primary)",
                    letterSpacing: "-0.5px",
                  }}
                >
                  ${investmentAmount}
                </span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => handleAmountChange(-1)}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "0.5rem",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "var(--text-primary)",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = optionColor;
                      e.currentTarget.style.background = `${optionColor}20`;
                      e.currentTarget.style.color = optionColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                      e.currentTarget.style.color = "var(--text-primary)";
                    }}
                  >
                    -1
                  </button>
                  <button
                    onClick={() => handleAmountChange(10)}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "0.5rem",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "var(--text-primary)",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = optionColor;
                      e.currentTarget.style.background = `${optionColor}20`;
                      e.currentTarget.style.color = optionColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                      e.currentTarget.style.color = "var(--text-primary)";
                    }}
                  >
                    +10
                  </button>
                </div>
              </div>
            </div>

            {/* Slider - Daha Belirgin ve Teknolojik */}
            <div style={{ marginBottom: "1rem", position: "relative" }}>
              <div
                style={{
                  position: "relative",
                  height: "12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "6px",
                  overflow: "hidden",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                {/* Filled Bar */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: "100%",
                    width: `${sliderPercentage}%`,
                    background: `linear-gradient(90deg, ${optionColor} 0%, ${optionColor}dd 100%)`,
                    borderRadius: "6px",
                    boxShadow: `0 0 10px ${optionColor}60`,
                    transition: "width 0.2s ease",
                  }}
                />
                {/* Glow Effect on Bar */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: "100%",
                    width: `${sliderPercentage}%`,
                    background: `linear-gradient(90deg, transparent, ${optionColor}40, transparent)`,
                    borderRadius: "6px",
                    transition: "width 0.2s ease",
                  }}
                />
              </div>
              <input
                type="range"
                min="1"
                max="1000"
                step="1"
                value={sliderValue}
                onChange={handleSliderChange}
                style={{
                  position: "absolute",
                  top: "0",
                  left: "0",
                  width: "100%",
                  height: "12px",
                  opacity: 0,
                  cursor: "pointer",
                  zIndex: 10,
                }}
              />
              <style>{`
                input[type="range"]::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  background: ${optionColor};
                  cursor: pointer;
                  border: 3px solid #0a0a0a;
                  box-shadow: 0 0 0 2px ${optionColor}80, 0 4px 12px rgba(0, 0, 0, 0.5), 0 0 20px ${optionColor}60;
                  transition: all 0.2s ease;
                }
                input[type="range"]::-webkit-slider-thumb:hover {
                  transform: scale(1.15);
                  box-shadow: 0 0 0 2px ${optionColor}, 0 6px 16px rgba(0, 0, 0, 0.6), 0 0 30px ${optionColor}80;
                }
                input[type="range"]::-moz-range-thumb {
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  background: ${optionColor};
                  cursor: pointer;
                  border: 3px solid #0a0a0a;
                  box-shadow: 0 0 0 2px ${optionColor}80, 0 4px 12px rgba(0, 0, 0, 0.5), 0 0 20px ${optionColor}60;
                  transition: all 0.2s ease;
                }
                input[type="range"]::-moz-range-thumb:hover {
                  transform: scale(1.15);
                  box-shadow: 0 0 0 2px ${optionColor}, 0 6px 16px rgba(0, 0, 0, 0.6), 0 0 30px ${optionColor}80;
                }
              `}</style>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "0.75rem",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  fontWeight: "500",
                }}
              >
                <span>$1</span>
                <span>$1000</span>
              </div>
            </div>
          </div>

          {/* Potential Win Section - Modern Box */}
          <div
            style={{
              padding: "1.5rem",
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.05) 100%)",
              borderRadius: "1rem",
              marginBottom: "2rem",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Subtle glow effect */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "1px",
                background: `linear-gradient(90deg, transparent, ${optionColor}40, transparent)`,
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.75rem",
              }}
            >
              <span
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                }}
              >
                Potential Win
              </span>
              <span
                style={{
                  fontSize: "1.75rem",
                  fontWeight: "800",
                  background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  letterSpacing: "-0.5px",
                }}
              >
                ${potentialWin.toFixed(2)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.9rem",
                color: "var(--text-muted)",
                fontWeight: "500",
              }}
            >
              <span>Total Return</span>
              <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>${totalReturn.toFixed(2)}</span>
            </div>
          </div>

          {/* Buy Button - Modern ve Şık */}
          <button
            onClick={handleBuy}
            style={{
              width: "100%",
              padding: "1.25rem",
              background: `linear-gradient(135deg, ${optionColor} 0%, ${optionColor}dd 100%)`,
              color: "#ffffff",
              border: "none",
              borderRadius: "1rem",
              fontSize: "1.1rem",
              fontWeight: "800",
              cursor: "pointer",
              transition: "all 0.3s ease",
              textTransform: "uppercase",
              letterSpacing: "1px",
              position: "relative",
              overflow: "hidden",
              boxShadow: `0 4px 20px ${optionColor}40, 0 0 30px ${optionColor}20`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 8px 30px ${optionColor}60, 0 0 40px ${optionColor}40`;
              const shine = e.currentTarget.querySelector(".shine-effect") as HTMLElement;
              if (shine) {
                shine.style.left = "100%";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = `0 4px 20px ${optionColor}40, 0 0 30px ${optionColor}20`;
              const shine = e.currentTarget.querySelector(".shine-effect") as HTMLElement;
              if (shine) {
                shine.style.left = "-100%";
              }
            }}
          >
            {/* Shine effect */}
            <div
              className="shine-effect"
              style={{
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                transition: "left 0.5s ease",
                pointerEvents: "none",
              }}
            />
            <span style={{ position: "relative", zIndex: 1 }}>Buy Yes</span>
          </button>

          {/* Info Text */}
          <p
            style={{
              marginTop: "1rem",
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              textAlign: "center",
              fontWeight: "500",
            }}
          >
            To win <span style={{ color: "#10b981", fontWeight: "700" }}>${totalReturn.toFixed(2)}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PredictionDetailModal;
