import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [isProcessing, setIsProcessing] = useState(false);

  // PIX State
  const [pixQrCode, setPixQrCode] = useState<string | null>(null);
  const [pixCopyPaste, setPixCopyPaste] = useState<string | null>(null);

  // Card State
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  // Shipping State
  const [shippingData, setShippingData] = useState({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    number: "",
    complement: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const handleGeneratePixQrCode = async () => {
    setIsProcessing(true);
    try {
      // TODO: Implement PIX QR code generation via tRPC
      console.log("Generate PIX QR code");
      // Mock response
      setPixQrCode("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");
      setPixCopyPaste("00020126580014br.gov.bcb.pix0136...");
      toast.success("QR Code PIX gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar QR Code PIX");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    try {
      // TODO: Implement payment processing via tRPC
      if (paymentMethod === "pix") {
        await handleGeneratePixQrCode();
      } else {
        console.log("Process card payment:", cardData);
        toast.success("Pagamento processado com sucesso!");
        setLocation("/orders");
      }
    } catch (error) {
      toast.error("Erro ao processar pagamento");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyPixKey = () => {
    if (pixCopyPaste) {
      navigator.clipboard.writeText(pixCopyPaste);
      toast.success("Chave PIX copiada!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold">💳 Checkout</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>Endereço de Entrega</CardTitle>
                <CardDescription>
                  Informe o endereço para entrega do pedido
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <Input
                      id="fullName"
                      value={shippingData.fullName}
                      onChange={(e) =>
                        setShippingData({
                          ...shippingData,
                          fullName: e.target.value,
                        })
                      }
                      placeholder="João Silva"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingData.email}
                      onChange={(e) =>
                        setShippingData({
                          ...shippingData,
                          email: e.target.value,
                        })
                      }
                      placeholder="joao@example.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={shippingData.phone}
                    onChange={(e) =>
                      setShippingData({ ...shippingData, phone: e.target.value })
                    }
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="street">Rua</Label>
                    <Input
                      id="street"
                      value={shippingData.street}
                      onChange={(e) =>
                        setShippingData({
                          ...shippingData,
                          street: e.target.value,
                        })
                      }
                      placeholder="Rua Principal"
                    />
                  </div>
                  <div>
                    <Label htmlFor="number">Número</Label>
                    <Input
                      id="number"
                      value={shippingData.number}
                      onChange={(e) =>
                        setShippingData({
                          ...shippingData,
                          number: e.target.value,
                        })
                      }
                      placeholder="123"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="complement">Complemento (Opcional)</Label>
                  <Input
                    id="complement"
                    value={shippingData.complement}
                    onChange={(e) =>
                      setShippingData({
                        ...shippingData,
                        complement: e.target.value,
                      })
                    }
                    placeholder="Apto 456"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={shippingData.city}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, city: e.target.value })
                      }
                      placeholder="São Paulo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={shippingData.state}
                      onChange={(e) =>
                        setShippingData({
                          ...shippingData,
                          state: e.target.value,
                        })
                      }
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">CEP</Label>
                    <Input
                      id="zipCode"
                      value={shippingData.zipCode}
                      onChange={(e) =>
                        setShippingData({
                          ...shippingData,
                          zipCode: e.target.value,
                        })
                      }
                      placeholder="01234-567"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Método de Pagamento</CardTitle>
                <CardDescription>
                  Escolha como deseja pagar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={paymentMethod}
                  onValueChange={(value) =>
                    setPaymentMethod(value as "pix" | "card")
                  }
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="pix">PIX</TabsTrigger>
                    <TabsTrigger value="card">Cartão de Crédito</TabsTrigger>
                  </TabsList>

                  <TabsContent value="pix" className="space-y-4 mt-4">
                    {pixQrCode ? (
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center gap-4">
                          <img
                            src={pixQrCode}
                            alt="QR Code PIX"
                            className="w-48 h-48"
                          />
                          <p className="text-sm text-muted-foreground">
                            Escaneie o QR Code com seu banco
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Ou copie a chave PIX:</Label>
                          <div className="flex gap-2">
                            <Input
                              readOnly
                              value={pixCopyPaste || ""}
                              className="font-mono text-xs"
                            />
                            <Button
                              onClick={handleCopyPixKey}
                              variant="outline"
                            >
                              Copiar
                            </Button>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Após realizar o pagamento, seu pedido será processado
                          automaticamente.
                        </p>
                      </div>
                    ) : (
                      <Button
                        onClick={handleGeneratePixQrCode}
                        disabled={isProcessing}
                        className="w-full"
                      >
                        {isProcessing ? "Gerando..." : "Gerar QR Code PIX"}
                      </Button>
                    )}
                  </TabsContent>

                  <TabsContent value="card" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="cardNumber">Número do Cartão</Label>
                      <Input
                        id="cardNumber"
                        value={cardData.cardNumber}
                        onChange={(e) =>
                          setCardData({
                            ...cardData,
                            cardNumber: e.target.value,
                          })
                        }
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cardName">Nome no Cartão</Label>
                      <Input
                        id="cardName"
                        value={cardData.cardName}
                        onChange={(e) =>
                          setCardData({
                            ...cardData,
                            cardName: e.target.value,
                          })
                        }
                        placeholder="JOÃO SILVA"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Validade</Label>
                        <Input
                          id="expiryDate"
                          value={cardData.expiryDate}
                          onChange={(e) =>
                            setCardData({
                              ...cardData,
                              expiryDate: e.target.value,
                            })
                          }
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          value={cardData.cvv}
                          onChange={(e) =>
                            setCardData({
                              ...cardData,
                              cvv: e.target.value,
                            })
                          }
                          placeholder="123"
                          maxLength={3}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>R$ 100.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Imposto</span>
                    <span>R$ 10.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Entrega</span>
                    <span>R$ 0.00</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>R$ 110.00</span>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleProcessPayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processando..." : "Finalizar Pedido"}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setLocation("/cart")}
                >
                  Voltar ao Carrinho
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
