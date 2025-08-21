import { SalesForm } from "@/components/sales/sales-form"

export default function NewSalePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nova Venda</h1>
        <p className="text-gray-600">Registre uma nova venda</p>
      </div>

      <SalesForm />
    </div>
  )
}
