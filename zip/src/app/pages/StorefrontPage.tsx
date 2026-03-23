import { useState } from 'react';
import { useParams } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { ShoppingCart, Search, Plus, Minus, X, Store } from 'lucide-react';
import { mockProducts, Product } from '../lib/mockData';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface CartItem {
  product: Product;
  quantity: number;
}

export function StorefrontPage() {
  const { slug } = useParams();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCart, setShowCart] = useState(false);

  const businessName = slug?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'TechStore Pro';
  const categories = ['all', ...Array.from(new Set(mockProducts.map(p => p.category)))];

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.stock > 0;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success('Added to cart');
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          const newQuantity = Math.max(1, Math.min(item.quantity + delta, item.product.stock));
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    toast.success('Removed from cart');
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    toast.success('Order placed successfully! Check your email for tracking.');
    setCart([]);
    setShowCart(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#13131a] to-[#0a0a0f]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0f0f14]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{businessName}</h1>
                <p className="text-xs text-gray-400">Online Store</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCart(!showCart)}
              className="relative bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white border-0">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Filters */}
        <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="flex gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category
                    ? 'bg-violet-500 hover:bg-violet-600 text-white'
                    : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                  }
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <Card key={product.id} className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl overflow-hidden hover:from-white/10 hover:to-white/5 transition-all">
              <div className="aspect-square w-full bg-white/5 relative overflow-hidden">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <Badge variant="outline" className="absolute top-3 right-3 border-violet-500/30 bg-violet-500/20 text-violet-300">
                  {product.category}
                </Badge>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-2xl font-bold text-white">${product.price}</p>
                  <p className="text-sm text-gray-400">{product.stock} in stock</p>
                </div>
                <Button
                  onClick={() => addToCart(product)}
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
                >
                  Add to Cart
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowCart(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-full md:w-96 bg-[#13131a] border-l border-white/10 z-50 flex flex-col">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Shopping Cart</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCart(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Your cart is empty</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex gap-3 mb-3">
                      <div className="w-16 h-16 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{item.product.name}</p>
                        <p className="text-gray-400 text-sm">${item.product.price}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="h-8 w-8 border-white/10 text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-white w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="h-8 w-8 border-white/10 text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-white font-semibold">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between text-xl font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-white">${cartTotal.toFixed(2)}</span>
                </div>
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
                >
                  Checkout
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
