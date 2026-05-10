import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Edit2, Eye } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface ProductsFilter {
  page: number;
  limit: number;
  isActive?: boolean;
  isDigital?: boolean;
}

export function ProductsManagement() {
  const [filters, setFilters] = useState<ProductsFilter>({
    page: 1,
    limit: 20,
  });

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [editingStock, setEditingStock] = useState<string>("");
  const [editingPrice, setEditingPrice] = useState<string>("");

  // Fetch products
  const productsQuery = trpc.admin.getProducts.useQuery(filters);

  // Mutations
  const updateStockMutation = trpc.admin.updateProductStock.useMutation();
  const updatePriceMutation = trpc.admin.updateProductPrice.useMutation();
  const toggleActiveMutation = trpc.admin.toggleProductActive.useMutation();

  const handleUpdateStock = async () => {
    if (!selectedProduct || !editingStock) return;

    try {
      await updateStockMutation.mutateAsync({
        productId: selectedProduct.id,
        stock: parseInt(editingStock),
      });
      productsQuery.refetch();
      setEditingStock("");
    } catch (error) {
      console.error("Failed to update stock:", error);
    }
  };

  const handleUpdatePrice = async () => {
    if (!selectedProduct || !editingPrice) return;

    try {
      await updatePriceMutation.mutateAsync({
        productId: selectedProduct.id,
        price: editingPrice,
      });
      productsQuery.refetch();
      setEditingPrice("");
    } catch (error) {
      console.error("Failed to update price:", error);
    }
  };

  const handleToggleActive = async (productId: number) => {
    try {
      await toggleActiveMutation.mutateAsync({ productId });
      productsQuery.refetch();
    } catch (error) {
      console.error("Failed to toggle product active status:", error);
    }
  };

  const handleViewDetails = (product: any) => {
    setSelectedProduct(product);
    setShowDetails(true);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  if (productsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin">
          <RefreshCw className="h-8 w-8 text-primary" />
        </div>
      </div>
    );
  }

  const data = productsQuery.data;
  if (!data) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Erro ao Carregar Produtos
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.isActive === true}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      isActive: e.target.checked ? true : undefined,
                      page: 1,
                    }))
                  }
                  className="rounded"
                />
                <span className="text-sm font-medium">Apenas Ativos</span>
              </label>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.isDigital === true}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      isDigital: e.target.checked ? true : undefined,
                      page: 1,
                    }))
                  }
                  className="rounded"
                />
                <span className="text-sm font-medium">Apenas Digitais</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Produtos */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos</CardTitle>
          <CardDescription>
            Mostrando {data.products.length} de {data.pagination.total} produtos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Nome</th>
                  <th className="text-left py-3 px-4 font-medium">Preço</th>
                  <th className="text-left py-3 px-4 font-medium">Estoque</th>
                  <th className="text-left py-3 px-4 font-medium">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.products.map((product: any) => (
                  <tr key={product.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium max-w-xs truncate">
                      {product.name}
                    </td>
                    <td className="py-3 px-4">R$ {product.price}</td>
                    <td className="py-3 px-4">
                      <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                        {product.stock} unidades
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">
                        {product.isDigital ? "🔗 Digital" : "📦 Físico"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(product)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(product.id)}
                          disabled={toggleActiveMutation.isPending}
                        >
                          {product.isActive ? "Desativar" : "Ativar"}
                        </Button>
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

      {/* Modal de Edição */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-3">
                <div>
                  <Label>Nome</Label>
                  <p className="text-sm font-medium mt-1">{selectedProduct.name}</p>
                </div>

                <div>
                  <Label>Tipo</Label>
                  <p className="text-sm font-medium mt-1">
                    {selectedProduct.isDigital ? "🔗 Produto Digital" : "📦 Produto Físico"}
                  </p>
                </div>

                <div>
                  <Label>Status</Label>
                  <p className="text-sm font-medium mt-1">
                    {selectedProduct.isActive ? "✅ Ativo" : "❌ Inativo"}
                  </p>
                </div>
              </div>

              {/* Edição de Preço */}
              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$)</Label>
                <div className="flex gap-2">
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder={selectedProduct.price}
                    value={editingPrice}
                    onChange={(e) => setEditingPrice(e.target.value)}
                  />
                  <Button
                    onClick={handleUpdatePrice}
                    disabled={!editingPrice || updatePriceMutation.isPending}
                  >
                    Atualizar
                  </Button>
                </div>
              </div>

              {/* Edição de Estoque */}
              <div className="space-y-2">
                <Label htmlFor="stock">Estoque</Label>
                <div className="flex gap-2">
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    placeholder={selectedProduct.stock.toString()}
                    value={editingStock}
                    onChange={(e) => setEditingStock(e.target.value)}
                  />
                  <Button
                    onClick={handleUpdateStock}
                    disabled={!editingStock || updateStockMutation.isPending}
                  >
                    Atualizar
                  </Button>
                </div>
              </div>

              {/* Informações Adicionais */}
              {selectedProduct.isDigital && selectedProduct.assetKey && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm font-medium text-blue-900">🔗 Arquivo Digital</p>
                  <p className="text-xs text-blue-800 mt-1 font-mono break-all">
                    {selectedProduct.assetKey}
                  </p>
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleToggleActive(selectedProduct.id)}
                  disabled={toggleActiveMutation.isPending}
                  className="flex-1"
                >
                  {selectedProduct.isActive ? "Desativar" : "Ativar"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(false)}
                  className="flex-1"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
