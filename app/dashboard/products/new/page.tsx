import { ProductForm } from "@/components/products/product-form"

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Novo Produto</h1>
        <p className="text-gray-600">Adicione um novo produto ao seu estoque</p>
      </div>

      <ProductForm />
    </div>
  )
}
