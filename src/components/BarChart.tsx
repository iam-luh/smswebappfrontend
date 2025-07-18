
import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "../context/ThemeContext";

interface ChartProps {
  data: { name: string; value: number }[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  title?: string;
}

const BarChart: React.FC<ChartProps> = ({ 
  data, 
  xAxisLabel = "", 
  yAxisLabel = "", 
  title = "Chart" 
}) => {
  const { theme } = useTheme();
  
  const textColor = theme === "dark" ? "#E2E8F0" : "#1A202C";
  const gridColor = theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  return (
    <div className="w-full h-full">
      {title && <h3 className="text-lg font-medium mb-3">{title}</h3>}
      <ResponsiveContainer width="100%" height={350}>
        <RechartsBarChart
          data={data}
          margin={{ top: 5, right: 20, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            dataKey="name" 
            label={{ value: xAxisLabel, position: "insideBottom", offset: -10 }} 
            tick={{ fill: textColor }}
          />
          <YAxis 
            label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }}
            tick={{ fill: textColor }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: theme === "dark" ? "#1E293B" : "#FFFFFF",
              color: textColor,
              border: "none",
              borderRadius: "0.5rem",
            }}
          />
          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
