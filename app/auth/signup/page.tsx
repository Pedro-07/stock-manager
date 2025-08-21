"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    storeName: "",
    phone: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setError("Sistema não configurado. Configure as variáveis de ambiente do Supabase.")
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            full_name: formData.fullName,
            store_name: formData.storeName,
            phone: formData.phone,
          },
        },
      })
      if (error) throw error
      router.push("/auth/verify-email")
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes("fetch failed")) {
          setError("Erro de conexão. Verifique se o Supabase está configurado corretamente.")
        } else {
          setError(error.message)
        }
      } else {
        setError("Ocorreu um erro inesperado")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Criar Conta</CardTitle>
            <CardDescription className="text-gray-600">Configure sua conta para gerenciar seu estoque</CardDescription>
          </CardHeader>
          <CardContent>
            {(!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  ⚠️ Configure o Supabase nas configurações do projeto para usar o sistema.
                </p>
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeName">Nome da Loja</Label>
                <Input
                  id="storeName"
                  name="storeName"
                  type="text"
                  required
                  value={formData.storeName}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
              {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Criando conta..." : "Criar Conta"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-gray-600">
              Já tem uma conta?{" "}
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Fazer login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
