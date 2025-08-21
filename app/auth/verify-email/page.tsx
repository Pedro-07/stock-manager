import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Verifique seu Email</CardTitle>
            <CardDescription className="text-gray-600">Enviamos um link de confirmação para seu email</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-sm text-gray-600">
              <p>Clique no link enviado para seu email para ativar sua conta.</p>
              <p className="mt-2">Não recebeu o email? Verifique sua caixa de spam.</p>
            </div>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/auth/login">Voltar para Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
