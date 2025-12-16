'use client';

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from '../ui/chart';

type ProgressChartProps = {
  data: { name: string; students: number }[];
};

const chartConfig = {
  students: {
    label: 'Students',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function ProgressChart({ data }: ProgressChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer>
        <BarChart data={data} accessibilityLayer>
          <XAxis
            dataKey="name"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            label={{
              value: 'Progress Range (%)',
              position: 'insideBottom',
              offset: -10,
            }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            allowDecimals={false}
            label={{
              value: 'Number of Students',
              angle: -90,
              position: 'insideLeft',
            }}
          />
          <Tooltip cursor={false} content={<ChartTooltipContent />} />
          <Legend />
          <Bar dataKey="students" fill="var(--color-students)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
