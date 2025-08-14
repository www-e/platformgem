// src/components/admin/UserChart.tsx
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserChartProps {
  data: {
    month: string;
    total: number;
  }[];
}

export default function UserChart({ data }: UserChartProps) {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>تحليلات الملتحقين</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        {/* We need a parent with a defined height for the chart to be responsive */}
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={data}>
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: string | number) => `${value}`}
              />
              <Tooltip
                contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--foreground))'
                }}
                labelStyle={{ color: 'hsl(var(--primary))' }}
              />
              <Legend wrapperStyle={{fontSize: "14px"}}/>
              <Bar dataKey="total" name="ملتحقين جدد" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}