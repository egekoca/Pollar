import { useWallets, useConnectWallet } from "@mysten/dapp-kit";
import "../styles/theme.css";

const GoogleSignInButton = ({ onSignIn }: { onSignIn?: () => void }) => {
  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();

  const handleGoogleSignIn = async () => {
    try {
      // Find Enoki wallet
      const enokiWallet = wallets.find((wallet) => {
        const name = wallet.name.toLowerCase();
        return name.includes("enoki") || 
               name.includes("google") ||
               name.includes("zklogin") ||
               name.includes("zk login");
      });
      
      if (!enokiWallet) {
        console.error("Enoki wallet not found. Available wallets:", wallets.map(w => w.name));
        return;
      }

      console.log("Found Enoki wallet:", enokiWallet.name);

      // If wallet already connected, just connect it to dapp-kit
      if (enokiWallet.accounts.length > 0) {
        console.log("Enoki wallet already connected, connecting to dapp-kit");
        connect({ wallet: enokiWallet });
        if (onSignIn) onSignIn();
        return;
      }

      // Connect to Enoki wallet (will trigger Google OAuth flow)
      if (enokiWallet.features && enokiWallet.features["standard:connect"]) {
        console.log("Connecting to Enoki wallet (will open Google sign-in)...");
        await enokiWallet.features["standard:connect"].connect();
        
        // After OAuth flow, connect wallet to dapp-kit
        // This will make useCurrentAccount() detect the account
        console.log("OAuth complete, connecting wallet to dapp-kit");
        connect({ wallet: enokiWallet });
        
        if (onSignIn) {
          onSignIn();
        }
      } else {
        console.error("Enoki wallet does not support standard:connect");
      }
    } catch (error: any) {
      console.error("Failed to sign in with Google:", error);
      
      // Handle specific error cases
      const errorMessage = error?.message || String(error);
      
      if (errorMessage.includes("Popup closed") || errorMessage.includes("popup_closed")) {
        // User closed the popup - this is normal behavior, don't show an alert
        console.log("User closed the Google sign-in popup");
        return;
      }
      
      if (errorMessage.includes("redirect_uri_mismatch")) {
        alert(
          "OAuth configuration error: Redirect URI mismatch.\n\n" +
          "Please check your Google Cloud Console settings:\n" +
          "1. Go to APIs & Services > Credentials\n" +
          "2. Click on your OAuth 2.0 Client ID\n" +
          "3. Add these to Authorized redirect URIs:\n" +
          "   - http://localhost:5173/login\n" +
          "   - http://localhost:5173/login/\n" +
          "   - http://localhost:5173\n" +
          "4. Save and wait a few minutes for changes to take effect"
        );
        return;
      }
      
      if (errorMessage.includes("access_denied") || errorMessage.includes("user_cancelled")) {
        // User denied access - this is normal behavior
        console.log("User denied Google sign-in access");
        return;
      }
      
      // For other errors, show a helpful message
      console.error("Google sign-in error details:", {
        message: errorMessage,
        name: error?.name,
        stack: error?.stack,
      });
      
      alert(
        "Failed to sign in with Google.\n\n" +
        "Common issues:\n" +
        "1. Popup blocker may be enabled - please allow popups for this site\n" +
        "2. Google OAuth settings may need to be updated\n" +
        "3. Please check the browser console for more details"
      );
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="button button-secondary"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        padding: "1rem",
        width: "100%",
        fontSize: "1rem",
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      Sign in with Google
    </button>
  );
};

export default GoogleSignInButton;

