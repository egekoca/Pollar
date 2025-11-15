import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { contractConfig } from "../config/contractConfig";

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

    console.log("Parsed VoteRegistry:", {
      poll_id: pollId,
      usersVoted,
      option_votes,
    });

    return {
      poll_id: pollId,
      usersVoted,
      option_votes,
    };
  } catch (error) {
    console.error("Error reading VoteRegistry:", error);
    return null;
  }
}

/**
 * Basit oy verme fonksiyonu - vote(poll, option_index, voteRegistry) çağırır
 */
export function createVoteTransaction(
  pollId: string,
  optionIndex: number,
  voteRegistryId: string
): Transaction {
  const tx = new Transaction();
  const packageId = contractConfig.packageId;

  if (!packageId) {
    throw new Error("Package ID not configured");
  }

  tx.moveCall({
    target: `${packageId}::${contractConfig.moduleName}::vote`,
    arguments: [
      tx.object(pollId), // Poll object
      tx.pure.u64(optionIndex), // option_index
      tx.object(voteRegistryId), // VoteRegistry
    ],
  });

  return tx;
}

/**
 * NFT ile oy verme fonksiyonu - vote_with_nft(poll, option_index, voteRegistry, nft) çağırır
 * NFT ownership kontrolü Sui runtime tarafından yapılır
 */
export function createVoteWithNftTransaction(
  pollId: string,
  optionIndex: number,
  voteRegistryId: string,
  nftId: string,
  nftType: string // Full NFT type (e.g., "0x...::popkins_nft::Popkins")
): Transaction {
  const tx = new Transaction();
  const packageId = contractConfig.packageId;

  if (!packageId) {
    throw new Error("Package ID not configured");
  }

  tx.moveCall({
    target: `${packageId}::${contractConfig.moduleName}::vote_with_nft`,
    typeArguments: [nftType], // Generic type argument for NFT
    arguments: [
      tx.object(pollId), // Poll object
      tx.pure.u64(optionIndex), // option_index
      tx.object(voteRegistryId), // VoteRegistry
      tx.object(nftId), // NFT object - ownership verified by Sui runtime
    ],
  });

  return tx;
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

