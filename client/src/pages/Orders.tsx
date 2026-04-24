import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Package, Eye } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  processing: "Processando",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const statusSteps = ["pending", "paid", "processing", "shipped", "delivered"];

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsOpen(true);
  };

  const getStatusProgress = (status: string): number => {
    const index = statusSteps.indexOf(status);
    return index >= 0 ? (index / (statusSteps.length - 1)) * 100 : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold">📦 Meus Pedidos</h1>
          <p className="text-muted-foreground">
            Acompanhe o status de seus pedidos
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12">
                <div className="text-center space-y-4">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground" />
                  <h3 className="text-xl font-semibold">Nenhum pedido realizado</h3>
                  <p className="text-muted-foreground">
                    Você ainda não realizou nenhuma compra.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Pedido #{order.id}</CardTitle>
                      <CardDescription>
                        {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Badge className={statusColors[order.status]}>
                        {statusLabels[order.status]}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Status Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progresso do Pedido</span>
                      <span>{statusLabels[order.status]}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getStatusProgress(order.status)}%` }}
                      />
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="font-semibold">R$ {order.totalAmount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Método</p>
                      <p className="font-semibold">
                        {order.paymentMethod === "pix" ? "PIX" : "Cartão"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Itens</p>
                      <p className="font-semibold">{order.itemCount || 1}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rastreamento</p>
                      <p className="font-semibold">
                        {order.trackingNumber ? (
                          <a
                            href={`https://rastreamento.correios.com.br/${order.trackingNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {order.trackingNumber}
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Informações completas do seu pedido
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Status Timeline */}
              <div className="space-y-4">
                <h3 className="font-semibold">Status do Pedido</h3>
                <div className="space-y-3">
                  {statusSteps.map((step, index) => (
                    <div key={step} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            statusSteps.indexOf(selectedOrder.status) >= index
                              ? "bg-primary text-white"
                              : "bg-slate-200 text-slate-400"
                          }`}
                        >
                          ✓
                        </div>
                        {index < statusSteps.length - 1 && (
                          <div
                            className={`w-0.5 h-12 ${
                              statusSteps.indexOf(selectedOrder.status) > index
                                ? "bg-primary"
                                : "bg-slate-200"
                            }`}
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {statusLabels[step]}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {step === selectedOrder.status
                            ? "Seu pedido está aqui"
                            : step === "delivered"
                            ? "Entregue"
                            : "Aguardando"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Data do Pedido</p>
                  <p className="font-semibold">
                    {new Date(selectedOrder.createdAt).toLocaleDateString(
                      "pt-BR"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-semibold">R$ {selectedOrder.totalAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Método de Pagamento</p>
                  <p className="font-semibold">
                    {selectedOrder.paymentMethod === "pix" ? "PIX" : "Cartão"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rastreamento</p>
                  <p className="font-semibold">
                    {selectedOrder.trackingNumber || "N/A"}
                  </p>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notas</p>
                  <p className="font-semibold">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
