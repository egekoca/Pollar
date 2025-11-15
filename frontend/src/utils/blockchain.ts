import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { SealClient } from "@mysten/seal";
import { contractConfig } from "../config/contractConfig";
import { SEAL_KEY_SERVERS, SEAL_THRESHOLD } from "../config/sealConfig";

/**
 * PollRegistry'yi bulmak için package'dan shared object'leri query eder
 */
export async function findPollRegistry(client: SuiClient): Promise<string | null> {
  try {
    const packageId = contractConfig.packageId;
    if (!packageId) {
      console.error("Package ID not configured");
      return null;
    }

    const pollRegistryType = `${packageId}::${contractConfig.moduleName}::PollRegistry`;
    
    // Shared object'leri query et
    // Not: SuiClient'ın queryObjects method'u olmayabilir, bu yüzden alternatif yöntem kullanıyoruz
    try {
      // Try using getObjectsByType or similar method if available
      // For now, we'll rely on environment variable or event querying
      const clientAny = client as any;
      if (clientAny.queryObjects) {
        const objects = await clientAny.queryObjects({
          filter: {
            StructType: pollRegistryType,
          },
          options: {
            showOwner: true,
            showContent: false,
          },
        });

        if (objects.data && objects.data.length > 0) {
          const objectId = objects.data[0].data?.objectId;
          if (objectId) {
            console.log("Found PollRegistry:", objectId);
            return objectId;
          }
        }
      }
    } catch (queryError) {
      console.warn("queryObjects failed, trying alternative method:", queryError);
    }

    // Alternatif yöntem: Package publish event'lerinden bul
    // Veya en son PollMinted event'inden PollRegistry'yi çıkar
    // Ancak daha basit bir yol: Kullanıcıdan PollRegistry ID'sini env'den al
    // Şimdilik null döndür, kullanıcı env'ye ekleyebilir
    
    console.warn("PollRegistry not found via query. You may need to add VITE_POLL_REGISTRY_ID to .env");
    
    // Environment variable'dan almayı dene
    const envRegistryId = import.meta.env.VITE_POLL_REGISTRY_ID;
    if (envRegistryId) {
      return envRegistryId;
    }
    
    return null;
  } catch (error) {
    console.error("Error finding PollRegistry:", error);
    return null;
  }
}

/**
 * Blockchain'den tüm Poll'ları okur (PollMinted event'lerinden)
 */
export async function getAllPolls(client: SuiClient): Promise<
  Array<{
    pollId: string;
    owner: string;
    creator: string; // Address of the poll creator
    name: string;
    description: string;
    image_url: string;
    start_date: string;
    end_date: string;
    nft_collection_type: string; // NFT collection type (empty string = no NFT required)
    options: Array<{
      id: string;
      name: string;
      image_url: string;
    }>;
  }>
> {
  try {
    const packageId = contractConfig.packageId;
    if (!packageId) {
      return [];
    }

    // PollMinted event'lerini query et
    const events = await client.queryEvents({
      query: {
        MoveEventType: `${packageId}::${contractConfig.moduleName}::PollMinted`,
      },
      limit: 100,
      order: "descending",
    });

    const polls: Array<{
      pollId: string;
      owner: string;
      creator: string;
      name: string;
      description: string;
      image_url: string;
      start_date: string;
      end_date: string;
      nft_collection_type: string;
      options: Array<{ id: string; name: string; image_url: string }>;
    }> = [];

    // Her event'ten poll ID'sini al ve poll object'ini oku
    for (const event of events.data) {
      if (event.parsedJson) {
        const pollMinted = event.parsedJson as { poll: string; owner: string };
        const pollId = pollMinted.poll;

        try {
          // Poll object'ini oku
          const pollObject = await client.getObject({
            id: pollId,
            options: {
              showContent: true,
              showOwner: true,
            },
          });

          if (pollObject.data?.content && "fields" in pollObject.data.content) {
            const fields = pollObject.data.content.fields as any;
            const pollOptions: Array<{ id: string; name: string; image_url: string }> = [];

            // Options'ları oku
            // Move'da options: vector<PollOption> - her PollOption ayrı bir object olabilir veya embedded olabilir
            if (fields.options && Array.isArray(fields.options)) {
              for (const optionRef of fields.options) {
                if (optionRef) {
                  // Eğer option bir object referansıysa (ID içeriyorsa)
                  if (typeof optionRef === "object") {
                    // Object referansı olabilir veya embedded struct olabilir
                    if ("fields" in optionRef) {
                      // Embedded struct
                      const optionFields = optionRef.fields as any;
                      pollOptions.push({
                        id: optionFields.id?.id || optionFields.id || "",
                        name: optionFields.name || "",
                        image_url: optionFields.image_url || "",
                      });
                    } else if ("ObjectOwner" in optionRef || typeof optionRef === "string") {
                      // Object ID - option'ı ayrıca okumamız gerekebilir
                      const optionId = typeof optionRef === "string" ? optionRef : (optionRef as any).ObjectOwner;
                      // Şimdilik ID'yi kullan, sonra object'i okuyabiliriz
                      pollOptions.push({
                        id: optionId || "",
                        name: "", // Sonra doldurulacak
                        image_url: "",
                      });
                    }
                  }
                }
              }
            }

            polls.push({
              pollId,
              owner: pollMinted.owner,
              creator: fields.creator || pollMinted.owner, // Creator field, fallback to owner
              name: fields.name || "",
              description: fields.description || "",
              image_url: fields.image_url || "",
              start_date: fields.start_date || "",
              end_date: fields.end_date || "",
              nft_collection_type: fields.nft_collection_type || "",
              options: pollOptions,
            });
          }
        } catch (error) {
          console.error(`Error reading poll ${pollId}:`, error);
        }
      }
    }

    return polls;
  } catch (error) {
    console.error("Error getting all polls:", error);
    return [];
  }
}

/**
 * Belirli bir Poll'u ID'den okur
 */
export async function getPollById(
  client: SuiClient,
  pollId: string
): Promise<{
  pollId: string;
  owner: string;
  creator: string; // Address of the poll creator
  name: string;
  description: string;
  image_url: string;
  start_date: string;
  end_date: string;
  nft_collection_type: string; // NFT collection type (empty string = no NFT required)
  options: Array<{
    id: string;
    name: string;
    image_url: string;
  }>;
} | null> {
  try {
    const pollObject = await client.getObject({
      id: pollId,
      options: {
        showContent: true,
        showOwner: true,
      },
    });

    if (pollObject.data?.content && "fields" in pollObject.data.content) {
      const fields = pollObject.data.content.fields as any;
      const pollOptions: Array<{ id: string; name: string; image_url: string }> = [];

      // Options'ları oku
      if (fields.options && Array.isArray(fields.options)) {
        for (const optionRef of fields.options) {
          if (optionRef && typeof optionRef === "object" && "fields" in optionRef) {
            const optionFields = optionRef.fields as any;
            pollOptions.push({
              id: optionFields.id?.id || "",
              name: optionFields.name || "",
              image_url: optionFields.image_url || "",
            });
          }
        }
      }

      const owner = pollObject.data.owner
        ? typeof pollObject.data.owner === "string"
          ? pollObject.data.owner
          : "AddressOwner" in pollObject.data.owner
          ? pollObject.data.owner.AddressOwner
          : ""
        : "";

      return {
        pollId,
        owner,
        creator: fields.creator || owner, // Creator field, fallback to owner
        name: fields.name || "",
        description: fields.description || "",
        image_url: fields.image_url || "",
        start_date: fields.start_date || "",
        end_date: fields.end_date || "",
        nft_collection_type: fields.nft_collection_type || "",
        options: pollOptions,
      };
    }

    return null;
  } catch (error) {
    console.error(`Error reading poll ${pollId}:`, error);
    return null;
  }
}

/**
 * PollRegistry'den VoteRegistry ID'sini bulur (dynamic field ile)
 */
export async function findVoteRegistryByPollId(
  client: SuiClient,
  pollId: string
): Promise<string | null> {
  try {
    const packageId = contractConfig.packageId;
    if (!packageId) {
      console.error("Package ID not configured");
      return null;
    }

    // Önce PollRegistry'yi bul
    const pollRegistryId = await findPollRegistry(client);
    if (!pollRegistryId) {
      console.error("PollRegistry not found");
      return null;
    }

    console.log(`Looking for VoteRegistry for poll ${pollId} in PollRegistry ${pollRegistryId}`);

    // Dynamic field'ları query et - Sui'nin doğru API'si
    try {
      // SuiClient.getDynamicFields kullan
      const dynamicFields = await client.getDynamicFields({
        parentId: pollRegistryId,
      });

      console.log(`🔍 Found ${dynamicFields.data.length} dynamic fields in PollRegistry`);

      // Her dynamic field'ı kontrol et
      for (const field of dynamicFields.data) {
        // name bir object olabilir, ID'yi çıkar
        let fieldName: string | null = null;
        
        if (typeof field.name === "string") {
          fieldName = field.name;
        } else if (field.name && typeof field.name === "object") {
          // Dynamic field name bir struct olabilir (ID type)
          if ("value" in field.name) {
            fieldName = String(field.name.value);
          } else if ("fields" in field.name) {
            // ID field'ı olabilir: { fields: { id: { id: "0x..." } } }
            const nameFields = (field.name as any).fields;
            if (nameFields?.id) {
              fieldName = typeof nameFields.id === "string" 
                ? nameFields.id 
                : (nameFields.id.id || null);
            }
          }
        }

        console.log(`  Field name: ${fieldName}, Poll ID: ${pollId}, Match: ${fieldName === pollId}`);

        // Poll ID ile eşleşiyor mu kontrol et
        if (fieldName === pollId) {
          console.log(`✅ Found matching field for poll ${pollId}`);
          
          // Önce field.objectId'yi dene (Sui'de bu genellikle dynamic field value'su)
          if (field.objectId) {
            console.log(`  Trying field.objectId: ${field.objectId}`);
            try {
              const testRegistry = await client.getObject({
                id: field.objectId,
                options: { showContent: true },
              });
              
              if (testRegistry.data?.content && "fields" in testRegistry.data.content) {
                const testFields = (testRegistry.data.content as any).fields;
                
                // VoteRegistry kontrolü: poll_id, option_votes, usersVoted field'ları var mı?
                if (testFields.poll_id || testFields.option_votes || testFields.usersVoted) {
                  console.log(`  ✅ Confirmed VoteRegistry: ${field.objectId}`);
                  return field.objectId;
                } else {
                  console.log(`  ⚠️ Object is not a VoteRegistry, checking dynamic field object...`);
                }
              }
            } catch (testError: any) {
              console.log(`  ⚠️ Error checking field.objectId: ${testError.message}`);
            }
          }
          
          // Dynamic field object'ini oku (value field'ından VoteRegistry ID'sini al)
          try {
            const dynamicFieldObject = await client.getDynamicFieldObject({
              parentId: pollRegistryId,
              name: field.name,
            });

            if (dynamicFieldObject.data) {
              console.log(`  Dynamic field object type: ${dynamicFieldObject.data.type}`);
              
              // Dynamic field object'inin content'ini kontrol et
              if (dynamicFieldObject.data.content && "fields" in dynamicFieldObject.data.content) {
                const fields = (dynamicFieldObject.data.content as any).fields;
                console.log(`  Dynamic field fields:`, Object.keys(fields));
                
                // Value field'ında VoteRegistry ID'si var (Move'da df::add ile eklenen)
                if (fields.value) {
                  let voteRegistryId: string | null = null;
                  
                  // Value bir ID object olabilir
                  if (typeof fields.value === "string") {
                    voteRegistryId = fields.value;
                  } else if (fields.value && typeof fields.value === "object") {
                    // ID object yapısı: { id: "0x..." } veya { fields: { id: { id: "0x..." } } }
                    if (fields.value.id) {
                      voteRegistryId = typeof fields.value.id === "string" 
                        ? fields.value.id 
                        : (fields.value.id.id || null);
                    } else if (fields.value.fields?.id) {
                      voteRegistryId = typeof fields.value.fields.id === "string"
                        ? fields.value.fields.id
                        : (fields.value.fields.id.id || null);
                    }
                  }
                  
                  if (voteRegistryId) {
                    console.log(`  ✅ Found VoteRegistry ID from value field: ${voteRegistryId}`);
                    // Doğrulama: Bu gerçekten VoteRegistry mi?
                    try {
                      const verifyRegistry = await client.getObject({
                        id: voteRegistryId,
                        options: { showContent: true },
                      });
                      if (verifyRegistry.data?.content && "fields" in verifyRegistry.data.content) {
                        const verifyFields = (verifyRegistry.data.content as any).fields;
                        if (verifyFields.poll_id || verifyFields.option_votes || verifyFields.usersVoted) {
                          return voteRegistryId;
                        }
                      }
                    } catch {
                      // Devam et
                    }
                  }
                }
              }
            }
          } catch (readError: any) {
            console.error(`  ❌ Error reading dynamic field object:`, readError.message);
          }
        }
      }
      
      console.warn(`⚠️ No matching dynamic field found for poll ${pollId}`);
    } catch (queryError: any) {
      console.error("❌ getDynamicFields failed:", queryError);
      console.error("Error details:", queryError.message);
    }

    // Alternatif: Direct getDynamicFieldObject denemesi (eğer ID'yi name olarak kullanabiliyorsak)
    try {
      // Poll ID'yi name olarak kullanmayı dene
      const dynamicFieldObject = await client.getDynamicFieldObject({
        parentId: pollRegistryId,
        name: {
          type: "0x2::object::ID",
          value: pollId,
        },
      });

      if (dynamicFieldObject.data?.content && "fields" in dynamicFieldObject.data.content) {
        const fields = (dynamicFieldObject.data.content as any).fields;
        const voteRegistryId = fields.value?.id || dynamicFieldObject.data.objectId;
        if (voteRegistryId) {
          console.log(`Found VoteRegistry via direct lookup: ${voteRegistryId}`);
          return voteRegistryId;
        }
      }
    } catch (directError) {
      // Bu yöntem çalışmazsa normal, başka yöntemler denenecek
      console.log("Direct lookup failed, this is normal:", directError);
    }

    console.warn(`VoteRegistry not found for poll ${pollId} in PollRegistry ${pollRegistryId}`);
    return null;
  } catch (error: any) {
    console.error("Error finding VoteRegistry:", error);
    console.error("Error message:", error?.message);
    return null;
  }
}

/**
 * VoteRegistry'den oy bilgilerini okur
 */
export async function getVoteRegistry(
  client: SuiClient,
  voteRegistryId: string
): Promise<{
  poll_id: string;
  usersVoted: string[];
  option_votes: number[];
  encrypted_votes?: Array<{
    encrypted_data: string; // Hex string olarak şifreli veri
    voter: string;
  }>;
  is_sealed?: boolean;
} | null> {
  try {
    const voteRegistry = await client.getObject({
      id: voteRegistryId,
      options: {
        showContent: true,
      },
    });

    if (!voteRegistry.data?.content || !("fields" in voteRegistry.data.content)) {
      console.error("VoteRegistry content not found or invalid");
      return null;
    }

    const fields = (voteRegistry.data.content as any).fields;
    console.log("VoteRegistry fields:", fields);

    // poll_id bir ID object olabilir, ID'yi çıkar
    let pollId = "";
    if (fields.poll_id) {
      if (typeof fields.poll_id === "string") {
        pollId = fields.poll_id;
      } else if (fields.poll_id.id) {
        pollId = typeof fields.poll_id.id === "string" 
          ? fields.poll_id.id 
          : (fields.poll_id.id.id || "");
      } else if (fields.poll_id.fields?.id) {
        pollId = typeof fields.poll_id.fields.id === "string"
          ? fields.poll_id.fields.id
          : (fields.poll_id.fields.id.id || "");
      }
    }

    // usersVoted bir vector<address> - Sui'de genellikle array olarak gelir
    let usersVoted: string[] = [];
    if (fields.usersVoted) {
      if (Array.isArray(fields.usersVoted)) {
        usersVoted = fields.usersVoted.map((addr: any) => {
          if (typeof addr === "string") {
            return addr;
          }
          // Address object olabilir
          return addr || "";
        }).filter((addr: string) => addr.length > 0);
      }
    }

    // option_votes bir vector<u64> - Sui'de genellikle array olarak gelir
    let option_votes: number[] = [];
    if (fields.option_votes) {
      if (Array.isArray(fields.option_votes)) {
        option_votes = fields.option_votes.map((vote: any) => {
          if (typeof vote === "number") {
            return vote;
          }
          if (typeof vote === "string") {
            return parseInt(vote, 10) || 0;
          }
          return 0;
        });
      }
    }

    // encrypted_votes bir vector<EncryptedVote> - Seal şifreli oylar
    let encrypted_votes: Array<{ encrypted_data: string; voter: string }> = [];
    if (fields.encrypted_votes) {
      if (Array.isArray(fields.encrypted_votes)) {
        encrypted_votes = fields.encrypted_votes.map((encryptedVote: any) => {
          let encryptedData = "";
          let voter = "";
          
          // encrypted_data bir vector<u8> - hex string'e çevir
          if (encryptedVote.encrypted_data) {
            if (Array.isArray(encryptedVote.encrypted_data)) {
              // Byte array'i hex string'e çevir
              encryptedData = "0x" + encryptedVote.encrypted_data
                .map((byte: number) => byte.toString(16).padStart(2, "0"))
                .join("");
            } else if (typeof encryptedVote.encrypted_data === "string") {
              encryptedData = encryptedVote.encrypted_data;
            }
          }
          
          // voter bir address
          if (encryptedVote.voter) {
            voter = typeof encryptedVote.voter === "string" 
              ? encryptedVote.voter 
              : (encryptedVote.voter.fields?.value || "");
          }
          
          return { encrypted_data: encryptedData, voter };
        });
      }
    }

    // is_sealed bir bool - poll'un şifreli olup olmadığını gösterir
    const is_sealed = fields.is_sealed === true || fields.is_sealed === "true";

    console.log("Parsed VoteRegistry:", {
      poll_id: pollId,
      usersVoted,
      option_votes,
      encrypted_votes: encrypted_votes.length > 0 ? `${encrypted_votes.length} encrypted votes` : "none",
      is_sealed,
    });

    return {
      poll_id: pollId,
      usersVoted,
      option_votes,
      encrypted_votes: encrypted_votes.length > 0 ? encrypted_votes : undefined,
      is_sealed,
    };
  } catch (error) {
    console.error("Error reading VoteRegistry:", error);
    return null;
  }
}

/**
 * Transaction'ın Seal ile şifreli oy verme işlemi olup olmadığını kontrol eder
 */
export async function checkIfTransactionIsSealed(
  client: SuiClient,
  transactionDigest: string
): Promise<{
  isSealed: boolean;
  functionName?: string;
  voteRegistryId?: string;
  encryptedDataLength?: number;
}> {
  try {
    const tx = await client.getTransactionBlock({
      digest: transactionDigest,
      options: {
        showInput: true,
        showEffects: true,
        showEvents: true,
      },
    });

    // Transaction'daki Move call'ları kontrol et
    const txData = tx.transaction?.data;
    if (txData && "transactions" in txData) {
      const transactions = (txData as any).transactions || [];
      for (const txn of transactions) {
        if (txn.kind === "MoveCall") {
          const moveCall = txn as any;
          const functionName = moveCall.target?.split("::").pop();
          
          // Seal ile şifreli oy verme fonksiyonlarını kontrol et
          if (functionName === "vote_sealed" || functionName === "vote_sealed_with_nft") {
            // encrypted_data argument'ını bul
            const args = moveCall.arguments || [];
            let encryptedDataLength = 0;
            let voteRegistryId: string | undefined;
            
            // Inputs'u kontrol et
            const inputs = (txData as any).inputs || [];
            for (const arg of args) {
              if (arg.kind === "Input") {
                const inputIndex = arg.index;
                if (inputs[inputIndex]) {
                  const input = inputs[inputIndex];
                  // encrypted_data bir vector<u8> olmalı
                  if (input.type === "pure" && Array.isArray(input.value)) {
                    encryptedDataLength = input.value.length;
                  }
                  // VoteRegistry ID'sini bul (object type)
                  if (input.type === "object" && input.objectId) {
                    voteRegistryId = input.objectId;
                  }
                }
              }
            }
            
            return {
              isSealed: true,
              functionName,
              voteRegistryId,
              encryptedDataLength,
            };
          }
        }
      }
    }

    return { isSealed: false };
  } catch (error) {
    console.error("Error checking transaction:", error);
    return { isSealed: false };
  }
}

/**
 * Seal client'ı initialize eder
 */
export function createSealClient(client: SuiClient): SealClient {
  return new SealClient({
    suiClient: client as any, // Type compatibility workaround
    serverConfigs: SEAL_KEY_SERVERS.map((id) => ({
      objectId: id,
      weight: 1,
    })),
    verifyKeyServers: false, // Performance için false, production'da true yapılabilir
  });
}

/**
 * Seal ile şifreli oy verme fonksiyonu - vote_sealed(poll, encrypted_data, voteRegistry) çağırır
 */
export async function createSealedVoteTransaction(
  client: SuiClient,
  pollId: string,
  optionIndex: number,
  voteRegistryId: string
): Promise<Transaction> {
  const sealClient = createSealClient(client);
  
  // Poll ID'yi identity olarak kullan (bytes olarak)
  // Convert hex string to bytes - ensure pollId is a string
  if (!pollId || typeof pollId !== 'string') {
    throw new Error(`Invalid pollId: ${pollId} (type: ${typeof pollId})`);
  }
  
  const pollIdStr = String(pollId).trim();
  if (!pollIdStr) {
    throw new Error("Poll ID is empty");
  }
  
  // Poll ID'yi hex string olarak normalize et - Seal SDK id'yi string olarak bekliyor
  const pollIdHex = pollIdStr.startsWith("0x") ? pollIdStr : "0x" + pollIdStr;
  if (!pollIdHex || pollIdHex.length === 0) {
    throw new Error("Invalid poll ID format");
  }
  
  // Option index'i bytes olarak şifrele (u64 = 8 bytes, little-endian)
  const optionIndexBytes = new Uint8Array(8);
  const view = new DataView(optionIndexBytes.buffer);
  view.setBigUint64(0, BigInt(optionIndex), true); // little-endian
  
  // Package ID kontrolü ve normalize etme
  let packageId = contractConfig.packageId;
  if (!packageId || typeof packageId !== 'string') {
    throw new Error(`Invalid packageId: ${packageId} (type: ${typeof packageId})`);
  }
  
  // Package ID'yi normalize et - Seal SDK hex string bekliyor
  packageId = packageId.trim();
  if (!packageId.startsWith("0x")) {
    packageId = "0x" + packageId;
  }
  
  // Seal ile şifrele
  // Seal SDK expects: packageId as string, id as string (hex), data as Uint8Array
  try {
    const { encryptedObject } = await sealClient.encrypt({
      threshold: SEAL_THRESHOLD,
      packageId: packageId, // Hex string formatında gönder
      id: pollIdHex, // Hex string formatında gönder (Seal SDK string bekliyor, Uint8Array değil!)
      data: optionIndexBytes, // Uint8Array
    });
    
    // BCS serialize edilmiş encrypted object'i al
    // encryptedObject is a Uint8Array, convert to array
    const encryptedBytes: number[] = encryptedObject instanceof Uint8Array 
      ? Array.from(encryptedObject) 
      : Array.from((encryptedObject as any).toBytes?.() || []);
    
    // Transaction oluştur
    const tx = new Transaction();

    tx.moveCall({
      target: `${packageId}::${contractConfig.moduleName}::vote_sealed`,
      arguments: [
        tx.object(pollIdStr), // Poll object - use the string version
        tx.pure.u64(optionIndex), // option_index for vote counting
        tx.pure.vector("u8", encryptedBytes), // encrypted_data
        tx.object(voteRegistryId), // VoteRegistry
      ],
    });

    return tx;
  } catch (error: any) {
    console.error("Seal encryption error:", error);
    throw new Error(`Seal encryption failed: ${error?.message || String(error)}`);
  }
}

/**
 * Seal ile şifreli oy verme fonksiyonu (NFT ile) - vote_sealed_with_nft(poll, encrypted_data, voteRegistry, nft) çağırır
 */
export async function createSealedVoteWithNftTransaction(
  client: SuiClient,
  pollId: string,
  optionIndex: number,
  voteRegistryId: string,
  nftType: string,
  nftId: string
): Promise<Transaction> {
  const sealClient = createSealClient(client);
  
  // Poll ID'yi identity olarak kullan (bytes olarak)
  // Convert hex string to bytes - ensure pollId is a string
  if (!pollId || typeof pollId !== 'string') {
    throw new Error(`Invalid pollId: ${pollId} (type: ${typeof pollId})`);
  }
  
  const pollIdStr = String(pollId).trim();
  if (!pollIdStr) {
    throw new Error("Poll ID is empty");
  }
  
  // Poll ID'yi hex string olarak normalize et - Seal SDK id'yi string olarak bekliyor
  const pollIdHex = pollIdStr.startsWith("0x") ? pollIdStr : "0x" + pollIdStr;
  if (!pollIdHex || pollIdHex.length === 0) {
    throw new Error("Invalid poll ID format");
  }
  
  // Option index'i bytes olarak şifrele (u64 = 8 bytes, little-endian)
  const optionIndexBytes = new Uint8Array(8);
  const view = new DataView(optionIndexBytes.buffer);
  view.setBigUint64(0, BigInt(optionIndex), true); // little-endian
  
  // Package ID kontrolü ve normalize etme
  let packageId = contractConfig.packageId;
  if (!packageId || typeof packageId !== 'string') {
    throw new Error(`Invalid packageId: ${packageId} (type: ${typeof packageId})`);
  }
  
  // Package ID'yi normalize et - Seal SDK hex string bekliyor
  packageId = packageId.trim();
  if (!packageId.startsWith("0x")) {
    packageId = "0x" + packageId;
  }
  
  // NFT type'ı parse et (örn: "0x...::module::Type")
  const typeParts = nftType.split("::");
  if (typeParts.length !== 3) {
    throw new Error("Invalid NFT type format");
  }
  
  // Seal ile şifrele
  // Seal SDK expects: packageId as string, id as string (hex), data as Uint8Array
  try {
    const { encryptedObject } = await sealClient.encrypt({
      threshold: SEAL_THRESHOLD,
      packageId: packageId, // Hex string formatında gönder
      id: pollIdHex, // Hex string formatında gönder (Seal SDK string bekliyor, Uint8Array değil!)
      data: optionIndexBytes, // Uint8Array
    });
    
    // BCS serialize edilmiş encrypted object'i al
    // encryptedObject is a Uint8Array, convert to array
    const encryptedBytes: number[] = encryptedObject instanceof Uint8Array 
      ? Array.from(encryptedObject) 
      : Array.from((encryptedObject as any).toBytes?.() || []);
    
    // Transaction oluştur
    const tx = new Transaction();

    tx.moveCall({
      target: `${packageId}::${contractConfig.moduleName}::vote_sealed_with_nft`,
      typeArguments: [nftType],
      arguments: [
        tx.object(pollIdStr), // Poll object - use the string version
        tx.pure.u64(optionIndex), // option_index for vote counting
        tx.pure.vector("u8", encryptedBytes), // encrypted_data
        tx.object(voteRegistryId), // VoteRegistry
        tx.object(nftId), // NFT object
      ],
    });

    return tx;
  } catch (error: any) {
    console.error("Seal encryption error:", error);
    throw new Error(`Seal encryption failed: ${error?.message || String(error)}`);
  }
}

/**
 * Kullanıcının sahip olduğu NFT'leri belirli bir collection type için getirir
 */
export async function getUserNftsByType(
  client: SuiClient,
  ownerAddress: string,
  nftType: string
): Promise<Array<{ objectId: string; type: string }>> {
  try {
    const objects = await client.getOwnedObjects({
      owner: ownerAddress,
      filter: {
        StructType: nftType,
      },
      options: {
        showType: true,
        showContent: false,
        showOwner: false,
      },
    });

    return (objects.data || []).map((obj) => ({
      objectId: obj.data?.objectId || "",
      type: obj.data?.type || "",
    })).filter((obj) => obj.objectId && obj.type);
  } catch (error) {
    console.error("Error getting user NFTs:", error);
    return [];
  }
}

/**
 * Kullanıcının attığı oyları getirir
 * Not: vote_sealed() ve vote_sealed_with_nft() fonksiyonları UserVote object'i oluşturmuyor,
 * bu yüzden tüm poll'ları kontrol edip VoteRegistry'den kullanıcının oylarını buluyoruz
 */
export async function getUserVotes(
  client: SuiClient,
  userAddress: string
): Promise<Array<{
  pollId: string;
  pollName: string;
  pollImage: string;
  optionName: string;
  optionIndex: number;
}>> {
  try {
    const packageId = contractConfig.packageId;
    if (!packageId) {
      console.log("Package ID not configured");
      return [];
    }

    console.log("Getting user votes for address:", userAddress);

    // Önce UserVote object'lerini kontrol et (eski sistemde mint_user_vote kullanılmışsa)
    const userVoteType = `${packageId}::${contractConfig.moduleName}::UserVote`;
    let ownedUserVotes: Array<{
      pollId: string;
      pollName: string;
      pollImage: string;
      optionName: string;
      optionIndex: number;
    }> = [];

    try {
      const ownedObjects = await client.getOwnedObjects({
        owner: userAddress,
        filter: {
          StructType: userVoteType,
        },
        options: {
          showContent: true,
          showType: true,
        },
      });

      console.log(`Found ${ownedObjects.data.length} UserVote objects`);

      for (const obj of ownedObjects.data) {
        if (obj.data?.content && "fields" in obj.data.content) {
          const fields = (obj.data.content as any).fields;
          
          // poll_id'yi al
          let pollId = "";
          if (fields.poll_id) {
            if (typeof fields.poll_id === "string") {
              pollId = fields.poll_id;
            } else if (fields.poll_id.id) {
              pollId = typeof fields.poll_id.id === "string" 
                ? fields.poll_id.id 
                : (fields.poll_id.id.id || "");
            }
          }

          if (!pollId) {
            console.log("Skipping UserVote - no poll_id");
            continue;
          }

          // Poll bilgilerini al
          const poll = await getPollById(client, pollId);
          if (!poll) {
            console.log(`Poll not found for ID: ${pollId}`);
            continue;
          }

          // poll_option bilgisini al
          let optionName = "Unknown";
          let optionIndex = -1;
          
          if (fields.poll_option && typeof fields.poll_option === "object" && "fields" in fields.poll_option) {
            const optionFields = fields.poll_option.fields;
            optionName = optionFields.name || "Unknown";
            
            // Poll'daki seçenekler arasında bu seçeneği bul
            optionIndex = poll.options.findIndex(opt => opt.name === optionName);
          }

          ownedUserVotes.push({
            pollId,
            pollName: poll.name,
            pollImage: poll.image_url,
            optionName,
            optionIndex,
          });
        }
      }
    } catch (error) {
      console.error("Error getting UserVote objects:", error);
    }

    // Şimdi tüm poll'ları al ve VoteRegistry'den kullanıcının oylarını kontrol et
    const allPolls = await getAllPolls(client);
    console.log(`Found ${allPolls.length} total polls`);

    const votesFromRegistry: Array<{
      pollId: string;
      pollName: string;
      pollImage: string;
      optionName: string;
      optionIndex: number;
    }> = [];

    // Her poll için VoteRegistry'yi kontrol et
    for (const poll of allPolls) {
      // Bu poll için zaten UserVote object'i varsa atla
      if (ownedUserVotes.some(v => v.pollId === poll.pollId)) {
        continue;
      }

      try {
        const voteRegistryId = await findVoteRegistryByPollId(client, poll.pollId);
        if (!voteRegistryId) {
          continue;
        }

        const voteData = await getVoteRegistry(client, voteRegistryId);
        if (!voteData) {
          continue;
        }

        // Kullanıcı bu poll'a oy vermiş mi?
        const userHasVoted = voteData.usersVoted.some(
          (addr: string) => addr.toLowerCase() === userAddress.toLowerCase()
        );

        if (!userHasVoted) {
          continue;
        }

        // Kullanıcının hangi seçeneğe oy verdiğini bulmak için:
        // VoteRegistry'de usersVoted array'indeki index'i kullanarak option_votes array'indeki artışı bulamayız
        // Çünkü bu bilgi VoteRegistry'de yok. 
        // Alternatif: Event'lerden option_index bilgisini almayı deneyelim
        // Veya sadece poll bilgilerini gösterelim, seçenek bilgisi olmadan

        // Şimdilik "Voted" olarak gösterelim, seçenek bilgisini event'lerden almaya çalışalım
        votesFromRegistry.push({
          pollId: poll.pollId,
          pollName: poll.name,
          pollImage: poll.image_url,
          optionName: "Voted", // Seçenek bilgisi VoteRegistry'de yok
          optionIndex: -1,
        });
      } catch (error) {
        console.error(`Error checking poll ${poll.pollId}:`, error);
        continue;
      }
    }

    // UserVoteMinted event'lerini kontrol et - option_index bilgisi için
    try {
      const events = await client.queryEvents({
        query: {
          MoveEventType: `${packageId}::${contractConfig.moduleName}::UserVoteMinted`,
        },
        limit: 1000,
        order: "descending",
      });

      console.log(`Found ${events.data.length} UserVoteMinted events`);

      // Event'lerden kullanıcının oylarını bul ve seçenek bilgisini güncelle
      // Not: Event'lerde option_index bilgisi yok, bu yüzden sadece poll ID'si var
      // Bu yüzden event'lerden seçenek bilgisini alamıyoruz
    } catch (error) {
      console.error("Error querying events:", error);
    }

    // UserVote object'leri varsa onları kullan, yoksa VoteRegistry'den gelenleri kullan
    const allVotes = ownedUserVotes.length > 0 ? ownedUserVotes : votesFromRegistry;
    
    console.log(`Returning ${allVotes.length} votes`);
    return allVotes;
  } catch (error) {
    console.error("Error getting user votes:", error);
    return [];
  }
}

