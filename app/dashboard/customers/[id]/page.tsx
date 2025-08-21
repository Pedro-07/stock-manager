"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { CustomerDetails } from "@/components/customers/customer-details"
import { createClient } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"

export default function CustomerDetailsPage() {
  const params = useParams()
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (params.id) {
      loadCustomer()
    }
  }, [params.id])

  const loadCustomer = async () => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select(`
          *,
          sales (
            id,
            total_amount,
            profit_amount,
            created_at,
            sale_items (
              quantity,
              unit_price,
              products (
                name,
                sku
              )
            )
          )
        `)
        .eq("id", params.id)
        .single()

      if (error) throw error
      setCustomer(data)
    } catch (error) {
      console.error("Error loading customer:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Cliente não encontrado</h2>
        <p className="text-gray-600 mt-2">O cliente solicitado não existe ou foi removido.</p>
      </div>
    )
  }

  return <CustomerDetails customer={customer} onUpdate={loadCustomer} />
}
