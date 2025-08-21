import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { ProductsList } from "@/components/products/products-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

function ProductsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

async function ProductsContent() {
  const supabase = await createClient()

  try {
    const { data: products, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        description,
        barcode,
        sku,
        category,
        brand,
        cost_price,
        selling_price,
        margin_percentage,
        current_stock,
        min_stock,
        is_active,
        image_url
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products:", error)
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
              <p className="text-red-600">Erro ao carregar produtos. Verifique sua conexão.</p>
            </div>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/dashboard/products/new">
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Link>
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
            <p className="text-gray-600">Gerencie seu catálogo de produtos</p>
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/dashboard/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Link>
          </Button>
        </div>

        <ProductsList products={products || []} />
      </div>
    )
  } catch (error) {
    console.error("Products page error:", error)
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
            <p className="text-red-600">Erro inesperado. Tente recarregar a página.</p>
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/dashboard/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Link>
          </Button>
        </div>
      </div>
    )
  }
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ProductsContent />
    </Suspense>
  )
}
