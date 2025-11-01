import { SealClient } from "@mysten/seal";
import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { contractConfig } from "../config/contractConfig";

/**
 * Seal client oluşturur
 */
export function createSealClient(client: SuiClient): SealClient {
  return new SealClient({
    network: client,
  });
}

/**
 * Oy verisini şifreler
 * @param voteData - Şifrelenecek oy verisi (örn: { optionIndex: 2 })
 * @param pollId - Poll'un object ID'si
 * @param client - Sui client
 * @returns Şifrelenmiş veri (base64 string)
 */
export async function encryptVote(
  voteData: { optionIndex: number; optionId: string },
  pollId: string,
  client: SuiClient
): Promise<string> {
  if (!contractConfig.packageId) {
    throw new Error("Package ID not configured");
  }

  const sealClient = createSealClient(client);

  // Access policy: Poll'un package ID'si ve object ID'si
  const accessPolicy = {
    packageId: contractConfig.packageId,
    objectId: pollId,
  };

  // Vote verisini JSON string'e çevir
  const voteJson = JSON.stringify(voteData);

  // Şifrele
  const encrypted = await sealClient.encrypt({
    policy: accessPolicy,
    data: new TextEncoder().encode(voteJson),
  });

  // Base64'e çevir (depolama için)
  return Buffer.from(encrypted).toString("base64");
}

/**
 * Şifreli oyu çözer (zaman kilidi kontrolü ile)
 * @param encryptedVoteBase64 - Şifrelenmiş oy (base64 string)
 * @param pollId - Poll'un object ID'si
 * @param pollObjectId - Poll object referansı (Move'da &Poll)
 * @param client - Sui client
 * @param executeTransaction - Transaction execute fonksiyonu (PTB ile)
 * @returns Çözülmüş oy verisi
 */
export async function decryptVote(
  encryptedVoteBase64: string,
  pollId: string,
  pollObjectId: string,
  client: SuiClient,
  executeTransaction: (tx: Transaction) => Promise<any>
): Promise<{ optionIndex: number; optionId: string }> {
  if (!contractConfig.packageId) {
    throw new Error("Package ID not configured");
  }

  const sealClient = createSealClient(client);

  // Base64'ten binary'ye çevir
  const encryptedData = Buffer.from(encryptedVoteBase64, "base64");

  // Access policy
  const accessPolicy = {
    packageId: contractConfig.packageId,
    objectId: pollId,
  };

  // Transaction oluştur - seal_approve_timelock çağrısı ile
  const tx = new Transaction();

  // seal_approve_timelock çağrısı - zaman kilidi kontrolü için
  tx.moveCall({
    target: `${contractConfig.packageId}::${contractConfig.moduleName}::seal_approve_timelock`,
    arguments: [
      tx.object(pollObjectId), // &Poll referansı
      tx.object("0x6"), // Clock sistemi objesi
    ],
  });

  // Transaction'ı execute et (zaman kilidi kontrolü için)
  // Bu başarısız olursa (oylama süresi dolmamışsa), hata fırlatır
  await executeTransaction(tx);

  // Şifre çözme (seal_approve_timelock başarılı olduysa)
  const decrypted = await sealClient.decrypt({
    policy: accessPolicy,
    data: encryptedData,
  });

  // JSON'dan parse et
  const voteJson = new TextDecoder().decode(decrypted);
  return JSON.parse(voteJson) as { optionIndex: number; optionId: string };
}

/**
 * Birden fazla şifreli oyu çözer (zaman kilidi kontrolü ile)
 * @param encryptedVotes - Şifrelenmiş oylar dizisi
 * @param pollId - Poll'un object ID'si
 * @param pollObjectId - Poll object referansı
 * @param client - Sui client
 * @param executeTransaction - Transaction execute fonksiyonu
 * @returns Çözülmüş oylar dizisi (hata durumunda null)
 */
export async function decryptVotes(
  encryptedVotes: string[],
  pollId: string,
  pollObjectId: string,
  client: SuiClient,
  executeTransaction: (tx: Transaction) => Promise<any>
): Promise<Array<{ optionIndex: number; optionId: string } | null>> {
  const results: Array<{ optionIndex: number; optionId: string } | null> = [];

  for (const encryptedVote of encryptedVotes) {
    try {
      const decrypted = await decryptVote(
        encryptedVote,
        pollId,
        pollObjectId,
        client,
        executeTransaction
      );
      results.push(decrypted);
    } catch (error) {
      console.error("Failed to decrypt vote:", error);
      // Hata durumunda null ekle (zaman kilidi veya başka bir hata)
      results.push(null);
    }
  }

  return results;
}

