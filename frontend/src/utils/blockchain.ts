import { SuiClient } from "@mysten/sui/client";
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
        options: pollOptions,
      };
    }

    return null;
  } catch (error) {
    console.error(`Error reading poll ${pollId}:`, error);
    return null;
  }
}

