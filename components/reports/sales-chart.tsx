"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface SalesChartProps {
  data: Array<{
    date: string
    amount: number
  }>
}

const chartConfig = {
  amount: {
    label: "Vendas",
    color: "hsl(var(--chart-1))",
  },
}

export function SalesChart({ data }: SalesChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const totalSales = data.reduce((sum, item) => sum + item.amount, 0)
  const averageSales = data.length > 0 ? totalSales / data.length : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas Diárias</CardTitle>
        <CardDescription>
          Total: {formatCurrency(totalSales)} | Média: {formatCurrency(averageSales)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="fillAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-amount)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-amount)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={formatCurrency} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value: number) => [formatCurrency(value), "Vendas"]}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="var(--color-amount)"
                fillOpacity={1}
                fill="url(#fillAmount)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
