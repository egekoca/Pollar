// Contract Configuration
// This file contains the deployed contract package ID and module name
// Environment variables are replaced at build time by Vite

// Vite automatically replaces import.meta.env.VITE_* at build time
// Direct property access ensures Vite can replace it properly
export const contractConfig = {
  // Vite replaces import.meta.env.VITE_PACKAGE_ID at build time
  packageId: (import.meta.env.VITE_PACKAGE_ID as string) || "",
  moduleName: "pollar",
  functionNames: {
    mintUser: "mint_user",
    mintPoll: "mint_poll",
  },
};

// Validate config on load
if (typeof window !== "undefined") {
  if (!contractConfig.packageId) {
    console.warn(
      "VITE_PACKAGE_ID is not set in environment variables. Please add it to .env file after deploying the contract."
    );
  }
}

