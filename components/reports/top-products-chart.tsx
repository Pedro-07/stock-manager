"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface TopProductsChartProps {
  data: Array<{
    name: string
    quantity: number
    revenue: number
  }>
}

const chartConfig = {
  revenue: {
    label: "Receita",
    color: "hsl(var(--chart-2))",
  },
  quantity: {
    label: "Quantidade",
    color: "hsl(var(--chart-3))",
  },
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const chartData = data.slice(0, 5).map((item) => ({
    ...item,
    name: item.name.length > 15 ? item.name.substring(0, 15) + "..." : item.name,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Produtos</CardTitle>
        <CardDescription>Produtos mais vendidos por receita</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="horizontal">
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                width={100}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value: number, name: string) => [
                  name === "revenue" ? formatCurrency(value) : `${value} un.`,
                  name === "revenue" ? "Receita" : "Quantidade",
                ]}
              />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Top Products List */}
        <div className="mt-6 space-y-3">
          {data.slice(0, 5).map((product, index) => (
            <div key={product.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                  {index + 1}
                </div>
                <span className="font-medium text-sm">{product.name}</span>
              </div>
              <div className="text-right">
                <p className="font-medium text-sm">{formatCurrency(product.revenue)}</p>
                <p className="text-xs text-muted-foreground">{product.quantity} vendidos</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
