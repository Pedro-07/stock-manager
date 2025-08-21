import { createClient } from "@/lib/supabase/server"
import { MovementsHistory } from "@/components/inventory/movements-history"

export default async function MovementsPage() {
  const supabase = await createClient()

  const { data: movements } = await supabase
    .from("stock_movements")
    .select(`
      id,
      movement_type,
      quantity,
      reason,
      reference_id,
      created_at,
      products (id, name, sku)
    `)
    .order("created_at", { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Histórico de Movimentações</h1>
        <p className="text-gray-600">Visualize todas as movimentações de estoque</p>
      </div>

      <MovementsHistory movements={movements || []} />
    </div>
  )
}
