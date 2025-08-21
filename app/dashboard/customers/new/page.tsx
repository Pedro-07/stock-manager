"use client"

import { CustomerForm } from "@/components/customers/customer-form"

export default function NewCustomerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Novo Cliente</h1>
        <p className="text-gray-600">Adicione um novo cliente ao sistema</p>
      </div>

      <CustomerForm />
    </div>
  )
}
