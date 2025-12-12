import { supabase } from "./supabase";

export interface UserProfile {
  walletAddress: string;
  username: string;
  avatarUrl: string;
  email?: string;
  authMethod?: "wallet" | "google";
  userObjectId?: string; // Blockchain User object ID from mint_user
}

const STORAGE_KEY = "pollar_user_profiles";

export const getUserProfile = async (walletAddress: string): Promise<UserProfile | null> => {
  try {
    // Always try Supabase first (primary source)
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (!error && data) {
      const profile = {
        walletAddress: data.wallet_address,
        username: data.username,
        avatarUrl: data.avatar_url,
        email: data.email,
        authMethod: data.auth_method,
        userObjectId: data.user_object_id,
      };
      
      // Cache in localStorage for faster access
      const stored = localStorage.getItem(STORAGE_KEY);
      const profiles: Record<string, UserProfile> = stored ? JSON.parse(stored) : {};
      profiles[walletAddress] = profile;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
      
      return profile;
    }

    // If not found in database, check localStorage (for migration)
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const profiles: Record<string, UserProfile> = JSON.parse(stored);
      const profile = profiles[walletAddress];
      if (profile) {
        // Migrate to database
        await saveUserProfile(profile);
        return profile;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    // Fallback to localStorage only if database fails
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      const profiles: Record<string, UserProfile> = JSON.parse(stored);
      return profiles[walletAddress] || null;
    } catch {
      return null;
    }
  }
};

export const getUserProfileByEmail = async (email: string): Promise<UserProfile | null> => {
  try {
    // Try Supabase first
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (!error && data) {
      return {
        walletAddress: data.wallet_address,
        username: data.username,
        avatarUrl: data.avatar_url,
        email: data.email,
        authMethod: data.auth_method,
        userObjectId: data.user_object_id,
      };
    }

    // Fallback to localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const profiles: Record<string, UserProfile> = JSON.parse(stored);
    const profile = Object.values(profiles).find((p) => p.email === email);
    return profile || null;
  } catch (error) {
    console.error("Error getting user profile by email:", error);
    // Fallback to localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      const profiles: Record<string, UserProfile> = JSON.parse(stored);
      const profile = Object.values(profiles).find((p) => p.email === email);
      return profile || null;
    } catch {
      return null;
    }
  }
};

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  try {
    // Save to Supabase (primary storage)
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        wallet_address: profile.walletAddress,
        username: profile.username,
        avatar_url: profile.avatarUrl,
        email: profile.email,
        auth_method: profile.authMethod,
        user_object_id: profile.userObjectId,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'wallet_address'
      });

    if (error) {
      console.error("Error saving user profile to Supabase:", error);
      throw error;
    }

    // Cache in localStorage for faster access
    const stored = localStorage.getItem(STORAGE_KEY);
    const profiles: Record<string, UserProfile> = stored ? JSON.parse(stored) : {};
    profiles[profile.walletAddress] = profile;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error("Failed to save user profile:", error);
    // Still cache in localStorage even if database fails
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const profiles: Record<string, UserProfile> = stored ? JSON.parse(stored) : {};
      profiles[profile.walletAddress] = profile;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  }
};

export const hasProfile = async (walletAddress: string): Promise<boolean> => {
  const profile = await getUserProfile(walletAddress);
  return profile !== null;
};

export const hasProfileByEmail = async (email: string): Promise<boolean> => {
  const profile = await getUserProfileByEmail(email);
  return profile !== null;
};

