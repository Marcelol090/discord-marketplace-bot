import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Eye, RotateCw } from "lucide-react";
import { trpc } from "@/lib/trpc";

type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
type DeliveryStatus = "pending" | "sent" | "failed";

interface OrdersFilter {
  page: number;
  limit: number;
  status?: OrderStatus;
  deliveryStatus?: DeliveryStatus;
  paymentMethod?: "pix" | "credit_card";
}

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-cyan-100 text-cyan-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const deliveryStatusColors: Record<DeliveryStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  sent: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export function OrdersManagement() {
  const [filters, setFilters] = useState<OrdersFilter>({
    page: 1,
    limit: 20,
  });

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch orders
  const ordersQuery = trpc.admin.getOrders.useQuery(filters);
  const orderDetailsQuery = trpc.admin.getOrderDetails.useQuery(
    { orderId: selectedOrder?.id },
    { enabled: !!selectedOrder }
  );

  // Mutations
  const updateStatusMutation = trpc.admin.updateOrderStatus.useMutation();
  const retryDeliveryMutation = trpc.admin.retryDigitalDelivery.useMutation();

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ orderId, status: newStatus });
      ordersQuery.refetch();
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const handleRetryDelivery = async (orderId: number) => {
    try {
      await retryDeliveryMutation.mutateAsync({ orderId });
      ordersQuery.refetch();
    } catch (error) {
      console.error("Failed to retry delivery:", error);
    }
  };

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  if (ordersQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin">
          <RefreshCw className="h-8 w-8 text-primary" />
        </div>
      </div>
    );
  }

  const data = ordersQuery.data;
  if (!data) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Erro ao Carregar Pedidos
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Status do Pedido</label>
              <Select
                value={filters.status || ""}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: value as OrderStatus | undefined,
                    page: 1,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="processing">Processando</SelectItem>
                  <SelectItem value="shipped">Enviado</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Status de Entrega</label>
              <Select
                value={filters.deliveryStatus || ""}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    deliveryStatus: value as DeliveryStatus | undefined,
                    page: 1,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="sent">Enviado</SelectItem>
                  <SelectItem value="failed">Falhado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Método de Pagamento</label>
              <Select
                value={filters.paymentMethod || ""}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    paymentMethod: value as "pix" | "credit_card" | undefined,
                    page: 1,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Pedidos */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos</CardTitle>
          <CardDescription>
            Mostrando {data.orders.length} de {data.pagination.total} pedidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">ID</th>
                  <th className="text-left py-3 px-4 font-medium">Discord User</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Entrega</th>
                  <th className="text-left py-3 px-4 font-medium">Valor</th>
                  <th className="text-left py-3 px-4 font-medium">Pagamento</th>
                  <th className="text-left py-3 px-4 font-medium">Data</th>
                  <th className="text-left py-3 px-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((order: any) => (
                  <tr key={order.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-mono text-xs">#{order.id}</td>
                    <td className="py-3 px-4 font-mono text-xs">{order.discordUserId}</td>
                    <td className="py-3 px-4">
                      <Badge className={statusColors[order.status as OrderStatus]}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={deliveryStatusColors[order.deliveryStatus as DeliveryStatus]}>
                        {order.deliveryStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-medium">R$ {order.totalAmount}</td>
                    <td className="py-3 px-4 text-xs">
                      {order.paymentMethod === "pix" ? "PIX" : "💳"}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {order.deliveryStatus === "failed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRetryDelivery(order.id)}
                            disabled={retryDeliveryMutation.isPending}
                          >
                            <RotateCw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Página {data.pagination.page} de {data.pagination.pages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(data.pagination.page - 1)}
                disabled={data.pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(data.pagination.page + 1)}
                disabled={data.pagination.page === data.pagination.pages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Informações completas e itens do pedido
            </DialogDescription>
          </DialogHeader>

          {orderDetailsQuery.isLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : orderDetailsQuery.data ? (
            <div className="space-y-6">
              {/* Informações do Pedido */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Select
                    value={orderDetailsQuery.data.order.status}
                    onValueChange={(value) =>
                      handleStatusChange(selectedOrder.id, value as OrderStatus)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="processing">Processando</SelectItem>
                      <SelectItem value="shipped">Enviado</SelectItem>
                      <SelectItem value="delivered">Entregue</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Valor Total
                  </label>
                  <p className="text-lg font-bold">
                    R$ {orderDetailsQuery.data.order.totalAmount}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Método de Pagamento
                  </label>
                  <p className="text-sm">
                    {orderDetailsQuery.data.order.paymentMethod === "pix" ? "PIX" : "Cartão de Crédito"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Discord User ID
                  </label>
                  <p className="text-sm font-mono">{orderDetailsQuery.data.order.discordUserId}</p>
                </div>
              </div>

              {/* Itens do Pedido */}
              <div>
                <h3 className="font-semibold mb-3">Itens do Pedido</h3>
                <div className="space-y-2">
                  {orderDetailsQuery.data.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between p-3 bg-muted rounded">
                      <div>
                        <p className="font-medium">{item.product?.name || "Produto Desconhecido"}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantidade: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">R$ {item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status de Entrega Digital */}
              {orderDetailsQuery.data.order.deliveryStatus === "failed" && (
                <div className="bg-destructive/10 border border-destructive/20 rounded p-4">
                  <p className="text-sm font-medium text-destructive mb-3">
                    ⚠️ Entrega Digital Falhou
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Tentativas: {orderDetailsQuery.data.order.deliveryAttempts}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => handleRetryDelivery(selectedOrder.id)}
                    disabled={retryDeliveryMutation.isPending}
                  >
                    <RotateCw className="h-4 w-4 mr-2" />
                    Tentar Novamente
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
