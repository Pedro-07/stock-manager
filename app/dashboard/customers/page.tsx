"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import Link from "next/link"
import { CustomersList } from "@/components/customers/customers-list"
import { createClient } from "@/lib/supabase/client"

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("customers")
        .select(`
          *,
          sales (
            id,
            total_amount,
            created_at
          )
        `)
        .eq("store_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error("Error loading customers:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gerencie seus clientes e histórico de compras</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/customers/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <CustomersList customers={filteredCustomers} loading={loading} onRefresh={loadCustomers} />
    </div>
  )
}
