import { SealClient, SessionKey } from "@mysten/seal";
import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { contractConfig } from "../config/contractConfig";

/**
 * Seal client oluşturur
 * Not: SealClient için key server konfigürasyonları gerekli
 * Bu değerler environment variable'dan alınmalı veya Seal'in key server'larından alınmalı
 */
// SealClient'i cache'le (her seferinde yeni oluşturmayı önlemek için)
let cachedSealClient: SealClient | null = null;
let cachedClientId: string | null = null;

export async function createSealClient(client: SuiClient): Promise<SealClient> {
  // Aynı client için cache'lenmiş SealClient'i kullan
  const clientId = (client as any).url || "default";
  if (cachedSealClient && cachedClientId === clientId) {
    return cachedSealClient;
  }

  // SealClient için serverConfigs gerekli
  let serverConfigs: Array<{ objectId: string; weight: number; apiKeyName?: string; apiKey?: string }> = [];
  
  try {
    const envConfig = import.meta.env.VITE_SEAL_SERVER_CONFIGS;
    if (envConfig) {
      serverConfigs = JSON.parse(envConfig) as Array<{ objectId: string; weight: number; apiKeyName?: string; apiKey?: string }>;
      console.log("✅ Seal serverConfigs loaded:", serverConfigs);
      
      // Key server object ID'lerini kontrol et
      for (const config of serverConfigs) {
        console.log(`🔍 Key server config: objectId=${config.objectId}, weight=${config.weight}`);
      }
    } else {
      console.warn("⚠️ VITE_SEAL_SERVER_CONFIGS not found in environment variables.");
    }
  } catch (error) {
    console.error("❌ Failed to parse VITE_SEAL_SERVER_CONFIGS:", error);
    console.warn("⚠️ Using empty serverConfigs. Seal encryption/decryption may not work properly.");
  }

  if (serverConfigs.length === 0) {
    console.warn("⚠️ Seal serverConfigs is empty. Seal encryption/decryption may not work properly.");
    console.warn("Please configure VITE_SEAL_SERVER_CONFIGS in your .env file with Seal key server configurations.");
  }

  try {
    console.log("🔧 Creating SealClient with config:", {
      serverConfigsCount: serverConfigs.length,
      verifyKeyServers: false,
      timeout: 30000,
    });

    // Key server object ID'lerini kontrol et
    for (const config of serverConfigs) {
      console.log(`🔍 Verifying key server object: ${config.objectId}`);
      try {
        const obj = await client.getObject({
          id: config.objectId,
          options: { showType: true, showContent: false },
        });
        
        if (obj.data) {
          console.log(`✅ Key server object found:`, {
            objectId: config.objectId,
            type: obj.data.type,
            version: obj.data.version,
          });
          
          // KeyServer object'i olmalı, package değil
          if (obj.data.type?.includes("package")) {
            console.warn(`⚠️ Warning: Object ${config.objectId} is a package, not a KeyServer object. This may cause issues.`);
          }
        } else {
          console.warn(`⚠️ Key server object not found: ${config.objectId}`);
        }
      } catch (checkError) {
        console.warn(`⚠️ Failed to check key server object ${config.objectId}:`, checkError);
      }
    }

    const sealClient = new SealClient({
      suiClient: client as any, // SealCompatibleClient tipine uyumlu olmalı
      serverConfigs: serverConfigs,
      verifyKeyServers: false, // Test için key server doğrulamasını atla (production'da true olmalı)
      timeout: 30000, // 30 saniye timeout
    });

    console.log("✅ SealClient created successfully");

    // Cache'le
    cachedSealClient = sealClient;
    cachedClientId = clientId;
    
    return sealClient;
  } catch (error: any) {
    console.error("❌ Failed to create SealClient:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    
    // Eğer key server fetch hatası ise, daha açıklayıcı bir mesaj ver
    if (error?.message?.includes("Invalid typed array length") || error?.message?.includes("BCS") || error?.message?.includes("readBytes")) {
      throw new Error(
        `SealClient initialization failed. The key server object ID might be invalid. ` +
        `Please verify that the object ID in VITE_SEAL_SERVER_CONFIGS is a valid Seal KeyServer object (not a package ID). ` +
        `For testnet, you may need to get the correct KeyServer object ID from Seal documentation or Discord. ` +
        `Original error: ${error?.message}`
      );
    }
    
    throw new Error(`Failed to create SealClient: ${error?.message || "Unknown error"}`);
  }
}

/**
 * Oy verisini şifreler
 * @param voteData - Şifrelenecek oy verisi (örn: { optionIndex: 2 })
 * @param pollId - Poll'un object ID'si (Seal'de id olarak kullanılır)
 * @param client - Sui client
 * @returns Şifrelenmiş veri (base64 string)
 * 
 * Not: Seal'de encrypt sırasında SessionKey gerekmez.
 * Decrypt için SessionKey decrypt sırasında oluşturulur.
 */
export async function encryptVote(
  voteData: { optionIndex: number; optionId: string },
  pollId: string,
  client: SuiClient
): Promise<string> {
  if (!contractConfig.packageId) {
    throw new Error("Package ID not configured");
  }

  const sealClient = await createSealClient(client);

  // Vote verisini JSON string'e çevir
  const voteJson = JSON.stringify(voteData);

  console.log("🔐 Encrypting vote:", { voteData, pollId, packageId: contractConfig.packageId });

  try {
    // Şifrele
    // Seal encrypt API'si: threshold, packageId, id, data gerekiyor
    // threshold: kaç key server'ın onaylaması gerektiği (t-out-of-n)
    // threshold değeri, serverConfigs'teki minimum weight'e eşit veya küçük olmalı
    const encryptedResult = await sealClient.encrypt({
      threshold: 1, // Minimum threshold - serverConfigs'teki weight'lere göre ayarlanabilir
      packageId: contractConfig.packageId,
      id: pollId, // Object ID (Poll ID'si)
      data: new TextEncoder().encode(voteJson),
    });

    console.log("✅ Vote encrypted successfully");

    // encryptedResult.encryptedObject döner
    // key de döner ama bu backup için, decrypt için SessionKey gerekiyor
    const encrypted = encryptedResult.encryptedObject;

    // Base64'e çevir (depolama için)
    return Buffer.from(encrypted).toString("base64");
  } catch (error: any) {
    console.error("❌ Seal encryption error:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    throw new Error(`Seal encryption failed: ${error?.message || "Unknown error"}`);
  }
}

/**
 * Şifreli oyu çözer (zaman kilidi kontrolü ile)
 * @param encryptedVoteBase64 - Şifrelenmiş oy (base64 string)
 * @param pollId - Poll'un object ID'si (Seal'de id olarak kullanılır)
 * @param pollObjectId - Poll object referansı (Move'da &Poll)
 * @param client - Sui client
 * @param executeTransaction - Transaction execute fonksiyonu (PTB ile)
 * @param userAddress - Kullanıcı adresi (SessionKey oluşturmak için)
 * @param signPersonalMessage - Kullanıcı imzası fonksiyonu (SessionKey için)
 * @returns Çözülmüş oy verisi
 */
export async function decryptVote(
  encryptedVoteBase64: string,
  pollId: string,
  pollObjectId: string,
  client: SuiClient,
  executeTransaction: (tx: Transaction) => Promise<any>,
  userAddress: string,
  signPersonalMessage: (message: Uint8Array) => Promise<{ signature: string }>
): Promise<{ optionIndex: number; optionId: string }> {
  if (!contractConfig.packageId) {
    throw new Error("Package ID not configured");
  }

  const sealClient = await createSealClient(client);

  console.log("🔓 Starting decrypt process:", { pollId, pollObjectId, userAddress });

  // Base64'ten binary'ye çevir
  const encryptedData = Buffer.from(encryptedVoteBase64, "base64");

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

  // Transaction'ı bytes'a çevir (Seal decrypt için gerekli)
  const txBytes = await tx.build({ client });

  // SessionKey oluştur (Seal dokümantasyonuna göre)
  // SessionKey, decrypt için gerekli ve kullanıcı imzası ile oluşturulmalı
  console.log("🔑 Creating SessionKey...");
  const sessionKey = await SessionKey.create({
    address: userAddress,
    packageId: contractConfig.packageId,
    ttlMin: 60, // 60 dakika geçerlilik
    suiClient: client as any,
  });

  // Kullanıcıdan imza al
  console.log("✍️ Requesting user signature for SessionKey...");
  const message = sessionKey.getPersonalMessage();
  const { signature } = await signPersonalMessage(message);
  await sessionKey.setPersonalMessageSignature(signature);
  console.log("✅ SessionKey created and signed");

  // Transaction'ı execute et (zaman kilidi kontrolü için)
  // Bu başarısız olursa (oylama süresi dolmamışsa), hata fırlatır
  console.log("⏳ Executing seal_approve_timelock transaction...");
  await executeTransaction(tx);
  console.log("✅ Timelock check passed");

  // Şifre çözme (seal_approve_timelock başarılı olduysa)
  console.log("🔓 Decrypting vote data...");
  const decrypted = await sealClient.decrypt({
    data: encryptedData,
    sessionKey: sessionKey,
    txBytes: txBytes,
  });

  // JSON'dan parse et
  const voteJson = new TextDecoder().decode(decrypted);
  const voteData = JSON.parse(voteJson) as { optionIndex: number; optionId: string };
  console.log("✅ Vote decrypted successfully:", voteData);
  return voteData;
}

/**
 * Birden fazla şifreli oyu çözer (zaman kilidi kontrolü ile)
 * @param encryptedVotes - Şifrelenmiş oylar dizisi (base64 string'ler)
 * @param pollId - Poll'un object ID'si
 * @param pollObjectId - Poll object referansı
 * @param client - Sui client
 * @param executeTransaction - Transaction execute fonksiyonu
 * @param userAddress - Kullanıcı adresi (SessionKey için)
 * @param signPersonalMessage - Kullanıcı imzası fonksiyonu
 * @returns Çözülmüş oylar dizisi (hata durumunda null)
 */
export async function decryptVotes(
  encryptedVotes: string[],
  pollId: string,
  pollObjectId: string,
  client: SuiClient,
  executeTransaction: (tx: Transaction) => Promise<any>,
  userAddress: string,
  signPersonalMessage: (message: Uint8Array) => Promise<{ signature: string }>
): Promise<Array<{ optionIndex: number; optionId: string } | null>> {
  const results: Array<{ optionIndex: number; optionId: string } | null> = [];

  for (const encryptedVote of encryptedVotes) {
    try {
      const decrypted = await decryptVote(
        encryptedVote,
        pollId,
        pollObjectId,
        client,
        executeTransaction,
        userAddress,
        signPersonalMessage
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

