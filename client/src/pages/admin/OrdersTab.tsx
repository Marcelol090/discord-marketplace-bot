import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";

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

export default function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsOpen(true);
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    // TODO: Implement order status update via tRPC
    console.log("Update order status:", orderId, newStatus);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Pedidos</h2>
        <p className="text-muted-foreground">Acompanhe e gerencie todos os pedidos</p>
      </div>

      <div className="grid gap-4">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Nenhum pedido realizado ainda.
              </p>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
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
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-semibold">{order.discordUserId}</p>
                  </div>
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
                    <p className="text-sm text-muted-foreground">Rastreamento</p>
                    <p className="font-semibold">
                      {order.trackingNumber || "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Visualize e atualize o status do pedido
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-semibold">{selectedOrder.discordUserId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
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
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(statusLabels).map(([status, label]) => (
                    <Button
                      key={status}
                      variant={
                        selectedOrder.status === status ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedOrder.trackingNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">Rastreamento</p>
                  <p className="font-semibold">{selectedOrder.trackingNumber}</p>
                </div>
              )}

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
