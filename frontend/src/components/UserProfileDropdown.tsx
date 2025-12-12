import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserProfile } from "../utils/userProfile";
import "../styles/theme.css";

const ADMIN_ADDRESS = "0x0ba252d960dede1ad8b3cc8a297130cacd581b7d745cf45ae7fe5897ca7a09bb";

interface UserProfileDropdownProps {
  profile: UserProfile;
  onLogout: () => void;
}

const UserProfileDropdown = ({ profile, onLogout }: UserProfileDropdownProps) => {
  const isAdmin = profile.walletAddress.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          borderRadius: "50%",
        }}
      >
        <img
          src={profile.avatarUrl}
          alt={profile.username}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid var(--color-light-blue)",
          }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 0.5rem)",
            right: 0,
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "0.5rem",
            minWidth: "180px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "1rem",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <div style={{ fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.25rem" }}>
              {profile.username}
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                fontFamily: "monospace",
              }}
            >
              {`${profile.walletAddress.slice(0, 6)}...${profile.walletAddress.slice(-4)}`}
            </div>
          </div>

          <Link
            to="/my-profile"
            style={{
              display: "block",
              padding: "0.75rem 1rem",
              color: "var(--text-primary)",
              textDecoration: "none",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-secondary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
            onClick={() => setIsOpen(false)}
          >
            My Profile
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              style={{
                display: "block",
                padding: "0.75rem 1rem",
                color: "var(--text-primary)",
                textDecoration: "none",
                transition: "background 0.2s ease",
                borderTop: "1px solid var(--border-color)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-secondary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
              onClick={() => setIsOpen(false)}
            >
              Admin Panel
            </Link>
          )}

          <button
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              background: "none",
              border: "none",
              borderTop: "1px solid var(--border-color)",
              color: "var(--text-primary)",
              textAlign: "left",
              cursor: "pointer",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-secondary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;

