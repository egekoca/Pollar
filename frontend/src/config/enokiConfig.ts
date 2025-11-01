// Enoki Configuration
// Get your API key from: https://portal.enoki.mystenlabs.com
// Get your Google Client ID from: https://console.cloud.google.com/

const getEnvVar = (key: string): string => {
  try {
    const value = import.meta.env[key];
    if (value && typeof value === "string") {
      return value.trim();
    }
    return "";
  } catch {
    return "";
  }
};

// Get the current origin for redirect URI
const getRedirectUri = () => {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/login`;
  }
  return "http://localhost:5173/login";
};

export const enokiConfig = {
  apiKey: getEnvVar("VITE_ENOKI_API_KEY"),
  network: "testnet" as const,
  providers: {
    google: {
      clientId: getEnvVar("VITE_GOOGLE_CLIENT_ID"),
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

