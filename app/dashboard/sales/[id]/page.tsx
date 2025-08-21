import { createClient } from "@/lib/supabase/server"
import { SaleDetails } from "@/components/sales/sale-details"
import { notFound } from "next/navigation"

interface SalePageProps {
  params: {
    id: string
  }
}

export default async function SalePage({ params }: SalePageProps) {
  const supabase = await createClient()

  const { data: sale, error } = await supabase
    .from("sales")
    .select(`
      id,
      total_amount,
      payment_method,
      status,
      notes,
      created_at,
      customers (id, name, phone),
      sale_items (
        id,
        quantity,
        unit_price,
        total_price,
        products (id, name, sku)
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !sale) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Detalhes da Venda</h1>
        <p className="text-gray-600">Venda #{sale.id.slice(0, 8)}</p>
      </div>

      <SaleDetails sale={sale} />
    </div>
  )
}
