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
  ReferenceDot,
} from "recharts";

// Generate visually distinct colors by evenly spacing hues
function getDistinctColor(index, total) {
  const hue = (index * 360) / total; // evenly space hues
  return `hsl(${hue}, 70%, 50%)`;
}

// Detect intersections (2 cities: sign changes, 3+ cities: cluster)
function findIntersectionsFromChartData(chartData, cityNames, tolerance = 1) {
  if (!chartData || cityNames.length < 2) return [];
  const intersections = [];

  if (cityNames.length === 2) {
    const [cityA, cityB] = cityNames;
    let lastSign = null;

    chartData.forEach((row) => {
      const a = row[cityA];
      const b = row[cityB];
      if (a == null || b == null) {
        lastSign = null;
        return;
      }
      const sign = Math.sign(a - b);
      if (lastSign !== null && sign !== lastSign && sign !== 0) {
        intersections.push({ date: row.date, minutes: Math.round((a + b) / 2) });
      }
      lastSign = sign !== 0 ? sign : lastSign;
    });

    return intersections;
  }

  chartData.forEach((row) => {
    const dayMinutes = cityNames.map((name) => row[name]);
    if (dayMinutes.some((m) => m == null)) return;
    const min = Math.min(...dayMinutes);
    const max = Math.max(...dayMinutes);
    if (max - min <= tolerance) {
      intersections.push({
        date: row.date,
        minutes: Math.round(dayMinutes.reduce((a, b) => a + b, 0) / dayMinutes.length),
      });
    }
  });

  return intersections;
}

export default function DaylightChart({ citiesData }) {
  const validCities = (citiesData || [])
    .filter((c) => c?.data?.daylight?.length)
    .filter((v, idx, arr) => arr.findIndex(a => a.city === v.city) === idx)
    .slice(0, 10);

  const year = new Date().getFullYear();

  // Generate full year of daily dates for placeholders
  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31`);
  const emptyChartData = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    emptyChartData.push({
      date: d.toISOString().slice(0, 10),
    });
  }

  let chartData = validCities.length
    ? validCities[0].data.daylight.map((day, idx) => {
        const row = { date: day.date };
        validCities.forEach((city) => {
          let minutes = city.data.daylight[idx]?.minutes;
          if (minutes === 0 || minutes === 1440) minutes = null;
          row[city.city] = minutes;
        });
        return row;
      })
    : emptyChartData;

  const cityNames = validCities.map(c => c.city);
  const intersections = findIntersectionsFromChartData(chartData, cityNames);

  // Month labels for ticks
  const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthTicks = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2,'0')}-01`);

  return (
    <div className="w-full h-[520px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Daylight</h2>
        <div className="text-sm text-gray-500">
          {validCities.length === 0
            ? "No cities — add one to see lines"
            : `${validCities.length} ${validCities.length === 1 ? "city" : "cities"} shown`}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6" />
            <XAxis
              dataKey="date"
              ticks={monthTicks}
              tickFormatter={(d) => monthLabels[parseInt(d.slice(5,7),10)-1] || d.slice(5,7)}
              minTickGap={20}
            />
            <YAxis label={{ value: "Minutes", angle: -90, position: "insideLeft", fill: "#374151" }} />
            <Tooltip contentStyle={{ backgroundColor: "white", borderRadius: 8 }} />
            <Legend verticalAlign="bottom" height={36} />
            {validCities.map((city, idx) => (
              <Line
                key={city.city}
                type="monotone"
                dataKey={city.city}
                stroke={getDistinctColor(idx, validCities.length)}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
            ))}
            {intersections.map(pt => (
              <ReferenceDot key={pt.date} x={pt.date} y={pt.minutes} r={5} fill="red" stroke="none" />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
