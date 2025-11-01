import { useState } from "react";
import "../styles/theme.css";

interface Option {
  name: string;
  image: string;
}

interface CreateVotePoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    image: string;
    options: Option[];
    startTime: string;
    endTime: string;
  }) => void;
}

const CreateVotePoolModal = ({ isOpen, onClose, onSubmit }: CreateVotePoolModalProps) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name.trim()) {
      setError("Pool name is required");
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

    onSubmit({
      ...formData,
      options: validOptions,
    });

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
        padding: "2rem",
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
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "600", color: "var(--text-primary)" }}>
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "var(--text-primary)",
                  fontWeight: "500",
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
                  padding: "0.75rem",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "0.5rem",
                  color: "var(--text-primary)",
                  fontSize: "1rem",
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
                  padding: "0.75rem",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "0.5rem",
                  color: "var(--text-primary)",
                  fontSize: "1rem",
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
            <button type="submit" className="button button-primary">
              Create Pool
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVotePoolModal;

