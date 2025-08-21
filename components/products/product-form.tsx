"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Camera, Calculator, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Product {
  id?: string
  name: string
  description: string | null
  barcode: string | null
  sku: string | null
  category: string | null
  brand: string | null
  cost_price: number
  selling_price: number
  current_stock: number
  min_stock: number
  image_url: string | null
}

interface ProductFormProps {
  product?: Product
}

export function ProductForm({ product }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    barcode: product?.barcode || "",
    sku: product?.sku || "",
    category: product?.category || "",
    brand: product?.brand || "",
    cost_price: product?.cost_price || 0,
    selling_price: product?.selling_price || 0,
    current_stock: product?.current_stock || 0,
    min_stock: product?.min_stock || 0,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [showCalculator, setShowCalculator] = useState(false)
  const [marginPercentage, setMarginPercentage] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("price") || name.includes("stock") ? Number(value) || 0 : value,
    }))

    // Calculate margin when prices change
    if (name === "cost_price" || name === "selling_price") {
      const costPrice = name === "cost_price" ? Number(value) : formData.cost_price
      const sellingPrice = name === "selling_price" ? Number(value) : formData.selling_price

      if (costPrice > 0) {
        const margin = ((sellingPrice - costPrice) / costPrice) * 100
        setMarginPercentage(margin)
      }
    }
  }

  const calculateSellingPrice = (margin: number) => {
    if (formData.cost_price > 0) {
      const sellingPrice = formData.cost_price * (1 + margin / 100)
      setFormData((prev) => ({ ...prev, selling_price: sellingPrice }))
      setMarginPercentage(margin)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Erro ao acessar a câmera")
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      setIsCameraActive(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        alert("Supabase não está configurado. Configure as variáveis de ambiente no Project Settings.")
        return
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        console.error("Auth error:", authError)
        alert("Erro de autenticação. Faça login novamente.")
        router.push("/auth/login")
        return
      }

      if (!user) {
        alert("Usuário não autenticado. Faça login para continuar.")
        router.push("/auth/login")
        return
      }

      const productData = {
        ...formData,
        user_id: user.id,
      }

      let result
      if (product?.id) {
        // Update existing product
        result = await supabase.from("products").update(productData).eq("id", product.id)
      } else {
        // Create new product
        result = await supabase.from("products").insert([productData])
      }

      if (result.error) {
        console.error("Database error:", result.error)
        throw result.error
      }

      alert(product ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!")
      router.push("/dashboard/products")
    } catch (error) {
      console.error("Error saving product:", error)
      if (error instanceof Error) {
        if (error.message.includes("fetch")) {
          alert("Erro de conexão. Verifique sua internet e configuração do Supabase.")
        } else {
          alert(`Erro ao salvar produto: ${error.message}`)
        }
      } else {
        alert("Erro desconhecido ao salvar produto")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard/products">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ex: Smartphone Samsung Galaxy"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descrição detalhada do produto"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Ex: Eletrônicos"
                />
              </div>
              <div>
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="Ex: Samsung"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Codes and Identification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Códigos e Identificação
              <Button type="button" size="sm" variant="outline" onClick={isCameraActive ? stopCamera : startCamera}>
                <Camera className="h-4 w-4 mr-2" />
                {isCameraActive ? "Parar" : "Scanner"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isCameraActive && (
              <div className="relative">
                <video ref={videoRef} autoPlay playsInline className="w-full h-48 bg-black rounded-lg" />
                <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-24 border-2 border-red-500"></div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="barcode">Código de Barras</Label>
              <Input
                id="barcode"
                name="barcode"
                value={formData.barcode}
                onChange={handleInputChange}
                placeholder="Ex: 7891234567890"
              />
            </div>

            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="Ex: SAMS-GAL-001"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Preços e Margem
              <Button type="button" size="sm" variant="outline" onClick={() => setShowCalculator(!showCalculator)}>
                <Calculator className="h-4 w-4 mr-2" />
                Calculadora
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cost_price">Preço de Custo *</Label>
                <Input
                  id="cost_price"
                  name="cost_price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.cost_price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="selling_price">Preço de Venda *</Label>
                <Input
                  id="selling_price"
                  name="selling_price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.selling_price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
            </div>

            {formData.cost_price > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Margem de Lucro:</strong> {marginPercentage.toFixed(2)}%
                </p>
                <p className="text-sm text-blue-600">
                  <strong>Lucro por Unidade:</strong> R$ {(formData.selling_price - formData.cost_price).toFixed(2)}
                </p>
              </div>
            )}

            {showCalculator && (
              <div className="p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium mb-3">Calculadora de Margem</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 20, 30, 40, 50, 60, 70, 80, 100].map((margin) => (
                    <Button
                      key={margin}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => calculateSellingPrice(margin)}
                    >
                      {margin}%
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock */}
        <Card>
          <CardHeader>
            <CardTitle>Controle de Estoque</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="current_stock">Estoque Atual *</Label>
                <Input
                  id="current_stock"
                  name="current_stock"
                  type="number"
                  min="0"
                  required
                  value={formData.current_stock}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="min_stock">Estoque Mínimo</Label>
                <Input
                  id="min_stock"
                  name="min_stock"
                  type="number"
                  min="0"
                  value={formData.min_stock}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
            </div>

            {formData.current_stock <= formData.min_stock && formData.min_stock > 0 && (
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-800">⚠️ Estoque abaixo do mínimo recomendado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard/products">Cancelar</Link>
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Salvando..." : product ? "Atualizar" : "Salvar"}
        </Button>
      </div>
    </form>
  )
}
