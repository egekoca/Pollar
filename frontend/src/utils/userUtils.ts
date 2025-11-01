import { SuiClient } from "@mysten/sui/client";
import { contractConfig } from "../config/contractConfig";

/**
 * Kullanıcının User object ID'sini bulur (UserMinted event'lerinden)
 */
export async function findUserObjectId(
  client: SuiClient,
  userAddress: string
): Promise<string | null> {
  try {
    if (!contractConfig.packageId) {
      return null;
    }

    // UserMinted event'lerini query et
    const events = await client.queryEvents({
      query: {
        MoveEventType: `${contractConfig.packageId}::${contractConfig.moduleName}::UserMinted`,
      },
      limit: 100,
      order: "descending",
    });

    // Bu address'e ait User'ı bul
    for (const event of events.data) {
      if (event.parsedJson) {
        const userMinted = event.parsedJson as { user: string; owner: string };
        if (userMinted.owner === userAddress) {
          return userMinted.user;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error finding User object:", error);
    return null;
  }
}

