import React from "react";
import huggingVideo from "/hugging.mp4";

interface SuccessModalProps {
  show: boolean;
  onClose: () => void;
}

/**
 * SuccessModal Component
 * Displays success message with video after voting
 */
const SuccessModal: React.FC<SuccessModalProps> = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          maxWidth: "90vw",
          maxHeight: "90vh",
          backgroundColor: "var(--bg-card)",
          borderRadius: "1rem",
          padding: "1rem",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "rgba(0, 0, 0, 0.5)",
            border: "none",
            borderRadius: "50%",
            width: "2.5rem",
            height: "2.5rem",
            color: "white",
            fontSize: "1.5rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0, 0, 0, 0.8)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(0, 0, 0, 0.5)";
          }}
        >
          ×
        </button>

        {/* Video */}
        <video
          src={huggingVideo}
          autoPlay
          loop
          muted
          style={{
            width: "100%",
            maxWidth: "800px",
            height: "auto",
            borderRadius: "0.5rem",
            display: "block",
          }}
        />
        
        {/* Success Message */}
        <div
          style={{
            textAlign: "center",
            marginTop: "1rem",
            color: "var(--text-primary)",
            fontSize: "1.25rem",
            fontWeight: "600",
          }}
        >
          Thank you for voting! 🎉
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;

