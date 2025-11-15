// Enoki Configuration
// Get your API key from: https://portal.enoki.mystenlabs.com
// Get your Google Client ID from: https://console.cloud.google.com/
// Environment variables are replaced at build time by Vite

// Get the current origin for redirect URI
const getRedirectUri = () => {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/login`;
  }
  return "http://localhost:5173/login";
};

// Vite automatically replaces import.meta.env.VITE_* at build time
// Direct property access ensures Vite can replace it properly
export const enokiConfig = {
  apiKey: (import.meta.env.VITE_ENOKI_API_KEY as string) || "",
  network: "testnet" as const,
  providers: {
    google: {
      clientId: (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || "",
      redirectUri: getRedirectUri(),
    },
  },
};

// Validate config on load
if (typeof window !== "undefined") {
  if (!enokiConfig.apiKey) {
    console.warn("VITE_ENOKI_API_KEY is not set in environment variables");
  }
  if (!enokiConfig.providers.google.clientId) {
    console.warn("VITE_GOOGLE_CLIENT_ID is not set in environment variables");
  }
}

