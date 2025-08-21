import { createClient } from "@/lib/supabase/server"
import { InventoryOverview } from "@/components/inventory/inventory-overview"
import { RecentMovements } from "@/components/inventory/recent-movements"
import { Button } from "@/components/ui/button"
import { Plus, FileText } from "lucide-react"
import Link from "next/link"

export default async function InventoryPage() {
  const supabase = await createClient()

  // Get inventory overview data
  const [{ data: lowStockProducts }, { data: recentMovements }, { data: totalProducts }, { data: outOfStockProducts }] =
    await Promise.all([
      supabase
        .from("products")
        .select("id, name, current_stock, min_stock, selling_price")
        .lte("current_stock", 5)
        .gt("min_stock", 0)
        .order("current_stock", { ascending: true })
        .limit(10),
      supabase
        .from("stock_movements")
        .select(`
        id,
        movement_type,
        quantity,
        reason,
        created_at,
        products (name)
      `)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("products").select("id", { count: "exact", head: true }).eq("current_stock", 0),
    ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Controle de Estoque</h1>
          <p className="text-gray-600">Gerencie movimentações e ajustes de estoque</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard/inventory/movements">
              <FileText className="h-4 w-4 mr-2" />
              Histórico
            </Link>
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/dashboard/inventory/adjustment">
              <Plus className="h-4 w-4 mr-2" />
              Ajuste de Estoque
            </Link>
          </Button>
        </div>
      </div>

      <InventoryOverview
        totalProducts={totalProducts?.count || 0}
        outOfStockProducts={outOfStockProducts?.count || 0}
        lowStockProducts={lowStockProducts || []}
      />

      <RecentMovements movements={recentMovements || []} />
    </div>
  )
}
