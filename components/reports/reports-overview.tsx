import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart } from "lucide-react"

interface ReportsOverviewProps {
  currentMonthRevenue: number
  lastMonthRevenue: number
  revenueGrowth: number
  totalProducts: number
  totalCustomers: number
  totalSales: number
}

export function ReportsOverview({
  currentMonthRevenue,
  lastMonthRevenue,
  revenueGrowth,
  totalProducts,
  totalCustomers,
  totalSales,
}: ReportsOverviewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* Revenue This Month */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(currentMonthRevenue)}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            {revenueGrowth >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
            )}
            <span className={revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}>
              {formatPercentage(revenueGrowth)}
            </span>
            <span className="ml-1">vs mês anterior</span>
          </div>
        </CardContent>
      </Card>

      {/* Total Sales */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vendas do Mês</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSales}</div>
          <p className="text-xs text-muted-foreground">vendas realizadas</p>
        </CardContent>
      </Card>

      {/* Total Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProducts}</div>
          <p className="text-xs text-muted-foreground">produtos cadastrados</p>
        </CardContent>
      </Card>

      {/* Total Customers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCustomers}</div>
          <p className="text-xs text-muted-foreground">clientes cadastrados</p>
        </CardContent>
      </Card>

      {/* Revenue Comparison */}
      <Card className="sm:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Comparativo de Receita</CardTitle>
          <CardDescription>Comparação entre o mês atual e anterior</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Mês Atual</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(currentMonthRevenue)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Mês Anterior</p>
              <p className="text-2xl font-bold text-gray-600">{formatCurrency(lastMonthRevenue)}</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Crescimento:</span>
              <div className="flex items-center">
                {revenueGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 mr-2" />
                )}
                <span className={`font-bold ${revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatPercentage(revenueGrowth)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
