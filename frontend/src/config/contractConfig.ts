// Contract Configuration
// This file contains the deployed contract package ID and module name
// You need to update PACKAGE_ID after deploying the contract

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

export const contractConfig = {
  // Update this with your deployed package ID
  // After deploying: sui client publish --gas-budget 10000000
  // Then copy the package ID from the output
  packageId: getEnvVar("VITE_PACKAGE_ID") || "",
  moduleName: "pollar",
  functionNames: {
    mintUser: "mint_user",
    mintPoll: "mint_poll",
    mintUserVote: "mint_user_vote",
    sealApproveTimelock: "seal_approve_timelock",
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

