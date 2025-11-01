import { useState } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { contractConfig } from "../config/contractConfig";
import { findPollRegistry } from "../utils/blockchain";
import "../styles/theme.css";

interface Option {
  name: string;
  image: string;
}

interface CreateVotePoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: {
    name: string;
    description: string;
    image: string;
    options: Option[];
    startTime: string;
    endTime: string;
  }) => void;
  onSuccess?: () => void;
}

const CreateVotePoolModal = ({ isOpen, onClose, onSubmit, onSuccess }: CreateVotePoolModalProps) => {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    startTime: "",
    endTime: "",
  });
  const [options, setOptions] = useState<Option[]>([
    { name: "", image: "" },
    { name: "", image: "" },
  ]);
  const [error, setError] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!account?.address) {
      setError("Wallet not connected");
      return;
    }

    // Validation
    if (!formData.name.trim()) {
      setError("Pool name is required");
      return;
    }
    if (formData.name.trim().length < 3 || formData.name.trim().length > 250) {
      setError("Pool name must be between 3 and 250 characters");
      return;
    }
    if (!formData.description.trim()) {
      setError("Pool description is required");
      return;
    }
    if (!formData.image.trim()) {
      setError("Pool image URL is required");
      return;
    }
    if (formData.image.trim().length < 7 || formData.image.trim().length > 1000) {
      setError("Image URL must be between 7 and 1000 characters");
      return;
    }
    const validOptions = options.filter((opt) => opt.name.trim() !== "");
    if (validOptions.length < 2) {
      setError("At least 2 options with names are required");
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      setError("Start and end times are required");
      return;
    }
    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      setError("End time must be after start time");
      return;
    }

    // Check if package ID is configured
    if (!contractConfig.packageId) {
      setError("Contract package ID is not configured. Please set VITE_PACKAGE_ID in .env file.");
      return;
    }

    try {
      // Find PollRegistry
      const pollRegistryId = await findPollRegistry(client);
      if (!pollRegistryId) {
        setError("PollRegistry not found. Please ensure the contract is properly deployed.");
        return;
      }

      // Create transaction
      const tx = new Transaction();

      // Her option için create_poll_option çağrısı yap ve sonuçları bir vector'e topla
      // Sui Transaction API'de transaction içinde intermediate değerler kullanabiliriz
      const optionResults: any[] = [];
      
      for (const option of validOptions) {
        const optionCall = tx.moveCall({
          target: `${contractConfig.packageId}::${contractConfig.moduleName}::create_poll_option`,
          arguments: [
            tx.pure.string(option.name.trim()),
            tx.pure.string(option.image.trim() || ""), // Boşsa boş string
          ],
        });
        optionResults.push(optionCall);
      }

      // Start ve end date'leri ISO string formatına çevir
      const startDateISO = new Date(formData.startTime).toISOString();
      const endDateISO = new Date(formData.endTime).toISOString();

      // Validate date string lengths (Move'da 3-100 karakter)
      if (startDateISO.length < 3 || startDateISO.length > 100) {
        setError("Start date format is invalid");
        return;
      }
      if (endDateISO.length < 3 || endDateISO.length > 100) {
        setError("End date format is invalid");
        return;
      }

      // End timestamp'i u64 olarak hesapla (milisaniye)
      const endTimestampMs = new Date(formData.endTime).getTime();

      // mint_poll çağrısı
      // Vector oluşturmak için Sui Transaction API'sinde tx.makeMoveVec kullanıyoruz
      tx.moveCall({
        target: `${contractConfig.packageId}::${contractConfig.moduleName}::${contractConfig.functionNames.mintPoll}`,
        arguments: [
          tx.pure.string(formData.name.trim()),
          tx.pure.string(formData.description.trim()),
          tx.pure.string(formData.image.trim()),
          tx.pure.string(startDateISO),
          tx.pure.string(endDateISO),
          tx.pure.u64(endTimestampMs), // end_timestamp_ms
          tx.makeMoveVec({ 
            type: `${contractConfig.packageId}::${contractConfig.moduleName}::PollOption`,
            elements: optionResults 
          }),
          tx.object(pollRegistryId), // PollRegistry shared object
        ],
      });

      // Execute transaction
      signAndExecute(
        {
          transaction: tx,
        } as any, // Temporary type assertion - options may be supported but types may be outdated
        {
          onSuccess: (result) => {
            console.log("Poll created successfully:", result);
            
            // Callback'leri çağır
            if (onSubmit) {
              onSubmit({
                ...formData,
                options: validOptions,
              });
            }
            
            if (onSuccess) {
              onSuccess();
            }

            // Reset form
            setFormData({
              name: "",
              description: "",
              image: "",
              startTime: "",
              endTime: "",
            });
            setOptions([
              { name: "", image: "" },
              { name: "", image: "" },
            ]);
            setError("");
            onClose();
          },
          onError: (error) => {
            console.error("Failed to create poll on blockchain:", error);
            
            // Check for specific error messages from Move contract
            const errorMessage = error.message || String(error);
            
            if (errorMessage.includes("EInvalidPollNameLength")) {
              setError("Pool name must be between 3 and 250 characters");
            } else if (errorMessage.includes("EInvalidPollImageUrlLength")) {
              setError("Image URL must be between 7 and 1000 characters");
            } else if (errorMessage.includes("EInvalidStartDateLength") || errorMessage.includes("EInvalidEndDateLength")) {
              setError("Date format is invalid");
            } else if (errorMessage.includes("EInvalidOptionsLength")) {
              setError("At least 2 options are required");
            } else {
              setError(`Failed to create poll: ${errorMessage}. Please try again.`);
            }
          },
        }
      );
    } catch (error) {
      console.error("Failed to create poll:", error);
      setError(`Failed to create poll: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const addOption = () => {
    setOptions([...options, { name: "", image: "" }]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, field: keyof Option, value: string) => {
    const updatedOptions = [...options];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setOptions(updatedOptions);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "clamp(1rem, 3vw, 2rem)",
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "var(--bg-card)",
          padding: "clamp(1.25rem, 2.5vw, 1.5rem)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "clamp(1rem, 2vw, 1.5rem)" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 1.75rem)", fontWeight: "600", color: "var(--text-primary)" }}>
            Create Vote Pool
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              color: "var(--text-secondary)",
              cursor: "pointer",
              padding: "0.5rem",
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "1rem",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "0.5rem",
              color: "#ef4444",
              marginBottom: "1.5rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Pool Name */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "var(--text-primary)",
                fontWeight: "500",
              }}
            >
              Pool Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter pool name"
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "0.5rem",
                color: "var(--text-primary)",
                fontSize: "1rem",
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "var(--text-primary)",
                fontWeight: "500",
              }}
            >
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this vote pool is about"
              required
              rows={4}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "0.5rem",
                color: "var(--text-primary)",
                fontSize: "1rem",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Pool Image */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "var(--text-primary)",
                fontWeight: "500",
              }}
            >
              Pool Image URL *
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "0.5rem",
                color: "var(--text-primary)",
                fontSize: "1rem",
              }}
            />
          </div>

          {/* Options */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <label
                style={{
                  display: "block",
                  color: "var(--text-primary)",
                  fontWeight: "500",
                }}
              >
                Options * (minimum 2)
              </label>
              <button
                type="button"
                onClick={addOption}
                className="button button-secondary"
                style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}
              >
                Add Option
              </button>
            </div>
            {options.map((option, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "1rem",
                  padding: "1rem",
                  background: "var(--bg-secondary)",
                  borderRadius: "0.5rem",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Option {index + 1}</span>
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        fontSize: "1.2rem",
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={option.name}
                  onChange={(e) => updateOption(index, "name", e.target.value)}
                  placeholder="Option name"
                  required={index < 2}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "var(--bg-primary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "0.5rem",
                    color: "var(--text-primary)",
                    fontSize: "1rem",
                    marginBottom: "0.5rem",
                  }}
                />
                <input
                  type="url"
                  value={option.image}
                  onChange={(e) => updateOption(index, "image", e.target.value)}
                  placeholder="Option image URL (optional)"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "var(--bg-primary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "0.5rem",
                    color: "var(--text-primary)",
                    fontSize: "1rem",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Date Times */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "var(--text-primary)",
                  fontWeight: "500",
                  fontSize: "clamp(0.9rem, 1.5vw, 1rem)",
                }}
              >
                Start Time *
              </label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "clamp(0.6rem, 1.5vw, 0.75rem)",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "0.5rem",
                  color: "var(--text-primary)",
                  fontSize: "clamp(0.9rem, 1.5vw, 1rem)",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "var(--text-primary)",
                  fontWeight: "500",
                  fontSize: "clamp(0.9rem, 1.5vw, 1rem)",
                }}
              >
                End Time *
              </label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "clamp(0.6rem, 1.5vw, 0.75rem)",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "0.5rem",
                  color: "var(--text-primary)",
                  fontSize: "clamp(0.9rem, 1.5vw, 1rem)",
                }}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              className="button button-secondary"
              style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="button button-primary"
              disabled={isPending}
              style={{ cursor: isPending ? "not-allowed" : "pointer" }}
            >
              {isPending ? "Creating..." : "Create Pool"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVotePoolModal;

