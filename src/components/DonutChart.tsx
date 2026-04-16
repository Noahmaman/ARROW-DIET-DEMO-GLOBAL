"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface MacroData {
  proteins: number;
  carbs: number;
  fats: number;
  water: number;
}

interface Props {
  data: MacroData;
  lang?: "fr" | "en";
}

const COLORS = ["#DFFFA0", "#8DC63F", "#1A1A1A", "#d4d4d4"];

export default function DonutChart({ data, lang = "fr" }: Props) {
  const labels =
    lang === "en"
      ? ["Proteins", "Carbohydrates", "Fats", "Water & other"]
      : ["Protéines", "Glucides", "Lipides", "Eau & autres"];

  const chartData = [
    { name: labels[0], value: data.proteins },
    { name: labels[1], value: data.carbs },
    { name: labels[2], value: data.fats },
    { name: labels[3], value: data.water },
  ].filter((d) => d.value > 0);

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value}%`, ""]}
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              fontSize: "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1">
        {chartData.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-[11px] text-gray-600 font-medium">
              {entry.name}
            </span>
          </div>
        ))}
      </div>

      {/* Percentage labels */}
      <div className="flex justify-around mt-4 px-2">
        {chartData.map((entry, index) => (
          <div key={entry.name} className="text-center">
            <div
              className="text-base font-bold"
              style={{ color: index === 3 ? "#999" : COLORS[index] === "#DFFFA0" ? "#8DC63F" : COLORS[index] }}
            >
              {entry.value}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
