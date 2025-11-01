export interface UserProfile {
  walletAddress: string;
  username: string;
  avatarUrl: string;
}

const STORAGE_KEY = "pollar_user_profiles";

export const getUserProfile = (walletAddress: string): UserProfile | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const profiles: Record<string, UserProfile> = JSON.parse(stored);
    return profiles[walletAddress] || null;
  } catch {
    return null;
  }
};

export const saveUserProfile = (profile: UserProfile): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const profiles: Record<string, UserProfile> = stored ? JSON.parse(stored) : {};
    profiles[profile.walletAddress] = profile;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error("Failed to save user profile:", error);
  }
};

export const hasProfile = (walletAddress: string): boolean => {
  return getUserProfile(walletAddress) !== null;
};

