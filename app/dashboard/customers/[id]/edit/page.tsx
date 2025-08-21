"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { CustomerForm } from "@/components/customers/customer-form"
import { createClient } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditCustomerPage() {
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
      const { data, error } = await supabase.from("customers").select("*").eq("id", params.id).single()

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
        <Skeleton className="h-8 w-64" />
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-96" />
        </div>
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Editar Cliente</h1>
        <p className="text-gray-600">Atualize as informações do cliente</p>
      </div>

      <CustomerForm customer={customer} />
    </div>
  )
}
