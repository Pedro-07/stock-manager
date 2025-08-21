import { createClient } from "@/lib/supabase/server"
import { ReportsOverview } from "@/components/reports/reports-overview"
import { SalesChart } from "@/components/reports/sales-chart"
import { TopProductsChart } from "@/components/reports/top-products-chart"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import Link from "next/link"

export default async function ReportsPage() {
  const supabase = await createClient()

  // Get current date ranges
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  // Get analytics data
  const [
    { data: currentMonthSales },
    { data: lastMonthSales },
    { data: topProducts },
    { data: dailySales },
    { count: totalProducts },
    { count: totalCustomers },
  ] = await Promise.all([
    // Current month sales
    supabase
      .from("sales")
      .select("total_amount")
      .gte("created_at", startOfMonth.toISOString())
      .eq("status", "completed"),
    // Last month sales
    supabase
      .from("sales")
      .select("total_amount")
      .gte("created_at", startOfLastMonth.toISOString())
      .lt("created_at", startOfMonth.toISOString())
      .eq("status", "completed"),
    // Top selling products
    supabase
      .from("sale_items")
      .select(`
        quantity,
        unit_price,
        products (name)
      `)
      .gte("created_at", startOfMonth.toISOString()),
    // Daily sales for chart
    supabase
      .from("sales")
      .select("total_amount, created_at")
      .gte("created_at", startOfMonth.toISOString())
      .eq("status", "completed")
      .order("created_at", { ascending: true }),
    // Total products
    supabase
      .from("products")
      .select("*", { count: "exact", head: true }),
    // Total customers
    supabase
      .from("customers")
      .select("*", { count: "exact", head: true }),
  ])

  // Calculate metrics
  const currentMonthRevenue = currentMonthSales?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0
  const lastMonthRevenue = lastMonthSales?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0
  const revenueGrowth = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

  // Process top products
  const productSales = new Map()
  topProducts?.forEach((item) => {
    const productName = item.products?.name || "Produto removido"
    const revenue = item.quantity * item.unit_price
    const current = productSales.get(productName) || { quantity: 0, revenue: 0 }
    productSales.set(productName, {
      quantity: current.quantity + item.quantity,
      revenue: current.revenue + revenue,
    })
  })

  const topProductsList = Array.from(productSales.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  // Process daily sales for chart
  const salesByDay = new Map()
  dailySales?.forEach((sale) => {
    const date = new Date(sale.created_at).toISOString().split("T")[0]
    const current = salesByDay.get(date) || 0
    salesByDay.set(date, current + Number(sale.total_amount))
  })

  const chartData = Array.from(salesByDay.entries())
    .map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      amount,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios e Análises</h1>
          <p className="text-gray-600">Acompanhe o desempenho do seu negócio</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard/reports/detailed">
              <FileText className="h-4 w-4 mr-2" />
              Relatórios Detalhados
            </Link>
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <ReportsOverview
        currentMonthRevenue={currentMonthRevenue}
        lastMonthRevenue={lastMonthRevenue}
        revenueGrowth={revenueGrowth}
        totalProducts={totalProducts || 0}
        totalCustomers={totalCustomers || 0}
        totalSales={currentMonthSales?.length || 0}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart data={chartData} />
        <TopProductsChart data={topProductsList} />
      </div>
    </div>
  )
}
