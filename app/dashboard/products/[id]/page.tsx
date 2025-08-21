import { createClient } from "@/lib/supabase/server"
import { ProductForm } from "@/components/products/product-form"
import { notFound, redirect } from "next/navigation"

interface ProductPageProps {
  params: {
    id: string
  }
}

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export default async function ProductPage({ params }: ProductPageProps) {
  if (params.id === "new") {
    redirect("/dashboard/products/new")
  }

  if (!isValidUUID(params.id)) {
    notFound()
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="text-lg font-semibold text-yellow-800">Configuração Necessária</h2>
          <p className="text-yellow-700">
            Supabase não está configurado. Configure as variáveis de ambiente no Project Settings.
          </p>
        </div>
      </div>
    )
  }

  try {
    const supabase = await createClient()

    const { data: product, error } = await supabase.from("products").select("*").eq("id", params.id).single()

    if (error) {
      console.error("Database error:", error)
      if (error.code === "PGRST116") {
        // No rows returned
        notFound()
      } else {
        // Other database errors
        return (
          <div className="space-y-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h2 className="text-lg font-semibold text-red-800">Erro de Conexão</h2>
              <p className="text-red-700">
                Não foi possível conectar ao banco de dados. Verifique a configuração do Supabase.
              </p>
              <p className="text-sm text-red-600 mt-2">Erro: {error.message}</p>
            </div>
          </div>
        )
      }
    }

    if (!product) {
      notFound()
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Produto</h1>
          <p className="text-gray-600">Atualize as informações do produto</p>
        </div>

        <ProductForm product={product} />
      </div>
    )
  } catch (error) {
    console.error("Unexpected error:", error)
    return (
      <div className="space-y-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800">Erro Inesperado</h2>
          <p className="text-red-700">Ocorreu um erro inesperado ao carregar o produto.</p>
        </div>
      </div>
    )
  }
}
