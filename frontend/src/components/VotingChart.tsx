import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { VotePool } from "../types/poll";

interface VotingChartProps {
  chartData: Array<Record<string, any>>;
  localPool: VotePool;
}

/**
 * VotingChart Component
 * Displays voting trends chart using recharts
 */
const VotingChart: React.FC<VotingChartProps> = ({ chartData, localPool }) => {
  const colors = ["#3b82f6", "#87ceeb", "#60a5fa", "#93c5fd"];

  return (
    <div className="card" style={{
      background: "rgba(10, 10, 10, 0.82)",
      border: "1px solid rgba(96, 165, 250, 0.25)",
      boxShadow: "0 12px 38px rgba(0, 0, 0, 0.45)",
      backdropFilter: "blur(6px)",
    }}>
      <div style={{ marginBottom: "clamp(1.5rem, 3vw, 2rem)" }}>
        <h3
          style={{
            fontSize: "clamp(1.5rem, 3vw, 1.75rem)",
            fontWeight: "700",
            marginBottom: "0.5rem",
            color: "var(--text-primary)",
            background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Voting Trends
        </h3>
        <p style={{ color: "#ffffff", fontSize: "clamp(0.9rem, 1.5vw, 1rem)" }}>
          Track how votes have changed over time
        </p>
      </div>
      <div style={{
        background: "rgba(0, 0, 0, 0.35)",
        borderRadius: "0.75rem",
        padding: "1rem",
        border: "1px solid rgba(255, 255, 255, 0.05)",
      }}>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(255, 255, 255, 0.1)" 
              strokeOpacity={0.3}
            />
            <XAxis 
              dataKey="date" 
              stroke="var(--text-secondary)"
              style={{ fontSize: "0.875rem" }}
              tick={{ fill: "var(--text-muted)" }}
            />
            <YAxis 
              stroke="var(--text-secondary)" 
              domain={[0, 100]}
              style={{ fontSize: "0.875rem" }}
              tick={{ fill: "var(--text-muted)" }}
              label={{ value: "Percentage (%)", angle: -90, position: "insideLeft", fill: "var(--text-muted)", style: { fontSize: "0.875rem" } }}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(27, 27, 27, 0.95)",
                border: "1px solid rgba(96, 165, 250, 0.3)",
                borderRadius: "0.75rem",
                color: "var(--text-primary)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                padding: "0.75rem 1rem",
              }}
              labelStyle={{ color: "var(--text-primary)", fontWeight: "600", marginBottom: "0.5rem" }}
              itemStyle={{ color: "var(--text-secondary)", padding: "0.25rem 0" }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: "1rem" }}
              iconType="line"
              formatter={(value) => <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{value}</span>}
            />
            {localPool.options.map((option, index) => (
              <Line
                key={option.id}
                type="monotone"
                dataKey={option.name}
                stroke={colors[index % colors.length]}
                strokeWidth={3}
                dot={{ fill: colors[index % colors.length], r: 5, strokeWidth: 2, stroke: "rgba(0, 0, 0, 0.2)" }}
                activeDot={{ r: 7, stroke: colors[index % colors.length], strokeWidth: 2, fill: "#fff" }}
                strokeDasharray={index === 0 ? "0" : "5 5"}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VotingChart;

