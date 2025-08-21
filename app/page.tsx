import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Package, BarChart3, Users, Smartphone } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">StockManager</h1>
            </div>
            <div className="flex space-x-4">
              <Button asChild variant="outline">
                <Link href="/auth/login">Entrar</Link>
              </Button>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/auth/signup">Criar Conta</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-6xl">
            Gerencie seu Estoque
            <span className="text-blue-600"> com Facilidade</span>
          </h2>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Sistema completo para controle de estoque, vendas e relatórios. Escaneie produtos, gerencie clientes e
            acompanhe seu negócio em tempo real.
          </p>
          <div className="mt-10">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
              <Link href="/auth/signup">Começar Agora - Grátis</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center">
              <CardHeader>
                <Package className="h-12 w-12 text-blue-600 mx-auto" />
                <CardTitle>Gestão de Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Cadastre produtos com scanner de código de barras e controle de estoque automático
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Smartphone className="h-12 w-12 text-green-600 mx-auto" />
                <CardTitle>Vendas Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Sistema de vendas com scanner para agilizar o atendimento e controle de caixa
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-purple-600 mx-auto" />
                <CardTitle>Relatórios</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Relatórios automáticos via WhatsApp com vendas, lucros e produtos em falta
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-orange-600 mx-auto" />
                <CardTitle>Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Cadastro de clientes com histórico de compras e controle de relacionamento
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <Card className="bg-blue-600 text-white">
            <CardHeader>
              <CardTitle className="text-3xl">Pronto para começar?</CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                Crie sua conta gratuita e comece a gerenciar seu estoque hoje mesmo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" variant="secondary" className="text-blue-600">
                <Link href="/auth/signup">Criar Conta Grátis</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
