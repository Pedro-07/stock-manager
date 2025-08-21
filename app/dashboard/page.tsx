import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, TrendingUp, Users, AlertTriangle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

async function DashboardContent() {
  const supabase = await createClient()

  try {
    const [
      { count: totalProducts, error: productsError },
      { count: totalCustomers, error: customersError },
      { data: lowStockProducts, error: stockError },
      { data: recentSales, error: salesError },
    ] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("customers").select("id", { count: "exact", head: true }),
      supabase.from("products").select("name, current_stock, min_stock").lte("current_stock", 5).limit(5),
      supabase.from("sales").select("total_amount").order("created_at", { ascending: false }).limit(5),
    ])

    if (productsError || customersError || stockError || salesError) {
      console.error("Dashboard query errors:", { productsError, customersError, stockError, salesError })
    }

    const totalSales = recentSales?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do seu negócio</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts || 0}</div>
              <p className="text-xs text-muted-foreground">Produtos cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas Recentes</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalSales.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Últimas 5 vendas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomers || 0}</div>
              <p className="text-xs text-muted-foreground">Clientes cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockProducts?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Produtos em falta</p>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts && lowStockProducts.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">Produtos com Estoque Baixo</CardTitle>
              <CardDescription className="text-orange-600">Estes produtos precisam de reposição</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockProducts.map((product, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-sm text-orange-600">
                      {product.current_stock} / {product.min_stock} unidades
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  } catch (error) {
    console.error("Dashboard error:", error)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-red-600">Erro ao carregar dados. Verifique sua conexão.</p>
        </div>
      </div>
    )
  }
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
