import { useEffect } from "react";
import { registerEnokiWallets } from "@mysten/enoki";
import { useSuiClient } from "@mysten/dapp-kit";
import { enokiConfig } from "../config/enokiConfig";

// Global flag to prevent multiple registrations
let isEnokiRegistered = false;

export function EnokiWallets() {
  const suiClient = useSuiClient();

  useEffect(() => {
    // Prevent multiple registrations across component re-renders
    if (isEnokiRegistered) {
      return;
    }

    // Wait for SuiClient to be available
    if (!suiClient) {
      console.warn("SuiClient not available yet, waiting...");
      return;
    }

    // Check if config values are properly set
    const apiKey = enokiConfig.apiKey?.trim();
    const clientId = enokiConfig.providers?.google?.clientId?.trim();

    if (!apiKey || apiKey === "" || apiKey === "your_enoki_api_key_here") {
      console.warn("Enoki API key not configured. Please set VITE_ENOKI_API_KEY in .env file");
      return;
    }

    if (!clientId || clientId === "" || clientId === "your_google_client_id_here") {
      console.warn("Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in .env file");
      return;
    }

    try {
      // Get the redirect URI - use current page origin + /login
      const redirectUri = typeof window !== "undefined" 
        ? `${window.location.origin}/login`
        : "http://localhost:5173/login";

      // Ensure all parameters are defined and properly structured
      // registerEnokiWallets expects an object with apiKey, client, network, and providers
      const config = {
        apiKey: apiKey,
        client: suiClient,
        network: enokiConfig.network || "testnet",
        providers: {
          google: {
            clientId: clientId,
            redirectUri: redirectUri,
          },
        },
      };

      console.log("Enoki redirect URI:", redirectUri);

      // Validate config structure before registration
      if (typeof config.apiKey !== "string" || config.apiKey.length === 0) {
        console.error("Invalid apiKey:", config.apiKey);
        return;
      }

      if (!config.client) {
        console.error("Invalid client:", config.client);
        return;
      }

      if (typeof config.network !== "string" || config.network.length === 0) {
        console.error("Invalid network:", config.network);
        return;
      }

      if (!config.providers || !config.providers.google || typeof config.providers.google.clientId !== "string" || config.providers.google.clientId.length === 0) {
        console.error("Invalid providers.google.clientId:", config.providers);
        return;
      }

      console.log("Registering Enoki wallets with config:", {
        apiKey: "***",
        network: config.network,
        client: "SuiClient instance",
        providers: {
          google: {
            clientId: config.providers.google.clientId.substring(0, 20) + "...",
            redirectUri: config.providers.google.redirectUri,
          },
        },
      });

      // Call registerEnokiWallets - this should register wallets globally
      registerEnokiWallets(config);
      isEnokiRegistered = true;
      console.log("Enoki wallets registered successfully");
    } catch (error) {
      console.error("Failed to register Enoki wallets:", error);
      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      } else {
        console.error("Unknown error type:", typeof error, error);
      }
    }
  }, [suiClient]);

  return null;
}

