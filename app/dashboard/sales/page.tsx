import { createClient } from "@/lib/supabase/server"
import { SalesList } from "@/components/sales/sales-list"
import { Button } from "@/components/ui/button"
import { Plus, Scan } from "lucide-react"
import Link from "next/link"

export default async function SalesPage() {
  const supabase = await createClient()

  const { data: sales, error } = await supabase
    .from("sales")
    .select(`
      id,
      total_amount,
      payment_method,
      status,
      created_at,
      customers (name),
      sale_items (
        quantity,
        unit_price,
        products (name)
      )
    `)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("Error fetching sales:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendas</h1>
          <p className="text-gray-600">Gerencie suas vendas e histórico</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline" className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
            <Link href="/dashboard/scanner">
              <Scan className="h-4 w-4 mr-2" />
              Scanner POS
            </Link>
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/dashboard/sales/new">
              <Plus className="h-4 w-4 mr-2" />
              Nova Venda
            </Link>
          </Button>
        </div>
      </div>

      <SalesList sales={sales || []} />
    </div>
  )
}
