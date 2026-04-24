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
import { Input } from "@/components/ui/input";
import { ShoppingCart, Heart } from "lucide-react";

export default function Shop() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const handleViewProduct = (product: any) => {
    setSelectedProduct(product);
    setQuantity(1);
    setIsOpen(true);
  };

  const handleAddToCart = async () => {
    if (!selectedProduct) return;
    // TODO: Implement add to cart via tRPC
    console.log("Add to cart:", selectedProduct.id, quantity);
    setIsOpen(false);
  };

  const handleToggleFavorite = (productId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">🛍️ Marketplace</h1>
            <p className="text-muted-foreground">Descubra produtos incríveis</p>
          </div>
          <Button size="lg">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Carrinho
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Categorias</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Badge variant="default" className="cursor-pointer">
              Todos
            </Badge>
            <Badge variant="outline" className="cursor-pointer">
              Acessos
            </Badge>
            <Badge variant="outline" className="cursor-pointer">
              Serviços
            </Badge>
            <Badge variant="outline" className="cursor-pointer">
              Premium
            </Badge>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Nenhum produto disponível no momento.
                </p>
              </CardContent>
            </Card>
          ) : (
            products.map((product) => (
              <Card
                key={product.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewProduct(product)}
              >
                {product.imageUrl && (
                  <div className="relative h-48 bg-slate-200 overflow-hidden rounded-t-lg">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(product.id);
                      }}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-slate-100"
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          favorites.has(product.id)
                            ? "fill-red-500 text-red-500"
                            : "text-slate-400"
                        }`}
                      />
                    </button>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        R$ {product.price}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.stock > 0 ? `${product.stock} em estoque` : "Fora de estoque"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProduct(product);
                      }}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
            <DialogDescription>{selectedProduct?.description}</DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-6">
              {selectedProduct.imageUrl && (
                <div className="h-64 bg-slate-200 rounded-lg overflow-hidden">
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Preço</p>
                  <p className="text-3xl font-bold">R$ {selectedProduct.price}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estoque</p>
                  <p className="text-3xl font-bold">{selectedProduct.stock}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Quantidade</p>
                <div className="flex gap-2 items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    −
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max={selectedProduct.stock}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.min(selectedProduct.stock, parseInt(e.target.value) || 1))
                    }
                    className="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setQuantity(Math.min(selectedProduct.stock, quantity + 1))
                    }
                  >
                    +
                  </Button>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={selectedProduct.stock === 0}
                className="w-full"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Adicionar ao Carrinho
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
