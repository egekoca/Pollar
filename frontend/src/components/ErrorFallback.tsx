import { Link } from "react-router-dom";
import "../styles/theme.css";

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  onReset: () => void;
}

/**
 * Error Fallback Component
 * Displays a user-friendly error message with options to retry or navigate home
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, errorInfo, onReset }) => {
  const isDevelopment = import.meta.env.DEV;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "linear-gradient(180deg, #000000 0%, #0a1128 50%, #000000 100%)",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* Error Icon */}
        <div
          style={{
            fontSize: "4rem",
            marginBottom: "1rem",
          }}
        >
          ⚠️
        </div>

        {/* Error Title */}
        <h1
          style={{
            fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
            fontWeight: "700",
            marginBottom: "1rem",
            color: "#ef4444",
          }}
        >
          Bir Hata Oluştu
        </h1>

        {/* Error Message */}
        <p
          style={{
            fontSize: "clamp(1rem, 2vw, 1.2rem)",
            marginBottom: "2rem",
            color: "rgba(255, 255, 255, 0.8)",
            lineHeight: "1.6",
          }}
        >
          Üzgünüz, beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.
        </p>

        {/* Error Details (Development Only) */}
        {isDevelopment && error && (
          <div
            style={{
              marginBottom: "2rem",
              padding: "1rem",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "0.5rem",
              textAlign: "left",
              fontSize: "0.875rem",
              maxHeight: "300px",
              overflow: "auto",
            }}
          >
            <div style={{ marginBottom: "0.5rem", fontWeight: "600", color: "#ef4444" }}>
              Hata Mesajı:
            </div>
            <div style={{ marginBottom: "1rem", fontFamily: "monospace", color: "#fca5a5" }}>
              {error.toString()}
            </div>
            {errorInfo && errorInfo.componentStack && (
              <>
                <div style={{ marginBottom: "0.5rem", fontWeight: "600", color: "#ef4444" }}>
                  Component Stack:
                </div>
                <pre
                  style={{
                    fontSize: "0.75rem",
                    color: "#fca5a5",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {errorInfo.componentStack}
                </pre>
              </>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={onReset}
            style={{
              padding: "0.75rem 1.5rem",
              background: "var(--color-light-blue)",
              color: "#000000",
              border: "none",
              borderRadius: "0.5rem",
              fontWeight: "600",
              fontSize: "1rem",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Tekrar Dene
          </button>

          <Link
            to="/"
            style={{
              padding: "0.75rem 1.5rem",
              background: "transparent",
              color: "#ffffff",
              border: "1.5px solid #ffffff",
              borderRadius: "0.5rem",
              fontWeight: "600",
              fontSize: "1rem",
              textDecoration: "none",
              display: "inline-block",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Ana Sayfaya Dön
          </Link>
        </div>

        {/* Help Text */}
        <p
          style={{
            marginTop: "2rem",
            fontSize: "0.875rem",
            color: "rgba(255, 255, 255, 0.6)",
          }}
        >
          Sorun devam ederse, lütfen{" "}
          <a
            href="mailto:support@pollar.app"
            style={{
              color: "var(--color-light-blue)",
              textDecoration: "underline",
            }}
          >
            destek ekibimizle
          </a>{" "}
          iletişime geçin.
        </p>
      </div>
    </div>
  );
};

export default ErrorFallback;


