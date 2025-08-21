import { StockAdjustmentForm } from "@/components/inventory/stock-adjustment-form"

export default function StockAdjustmentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ajuste de Estoque</h1>
        <p className="text-gray-600">Faça ajustes manuais no estoque dos produtos</p>
      </div>

      <StockAdjustmentForm />
    </div>
  )
}
