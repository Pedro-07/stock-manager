import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { token, phone } = await request.json()

    if (!token || !phone) {
      return NextResponse.json({ error: "Token e telefone são obrigatórios" }, { status: 400 })
    }

    // Simular envio de mensagem de teste
    // Em produção, você integraria com a API do WhatsApp Business
    const testMessage = {
      to: phone,
      type: "text",
      text: {
        body: "🤖 Teste de integração WhatsApp\n\nSua integração está funcionando corretamente!\n\nSistema de Gestão de Estoque",
      },
    }

    // Aqui você faria a chamada real para a API do WhatsApp
    // const response = await fetch('https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(testMessage)
    // })

    console.log("[v0] WhatsApp test message:", testMessage)

    return NextResponse.json({
      success: true,
      message: "Mensagem de teste enviada com sucesso!",
    })
  } catch (error) {
    console.error("WhatsApp test error:", error)
    return NextResponse.json({ error: "Erro ao enviar mensagem de teste" }, { status: 500 })
  }
}
