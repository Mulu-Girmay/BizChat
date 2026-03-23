import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { ShoppingCart, Search, Plus, Minus, X, Store as StoreIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import api from '../lib/api';

export function StorefrontPage() {
  const { slug } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const storeRes = await api.get(`/stores/${slug}`);
        const storeData = storeRes.data.data;
        setStore(storeData);

        const productsRes = await api.get(`/inventory/store/${storeData._id}`);
        setProducts(productsRes.data.data);
      } catch (error) {
        toast.error('Failed to load store');
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchStoreData();
  }, [slug]);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory && (product.stock > 0 || product.stockStatus !== 'out');
  });

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product._id === product._id);
      if (existing) {
        return prev.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success('Added to cart');
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev =>
      prev.map(item => {
        if (item.product._id === productId) {
          const newQuantity = Math.max(1, Math.min(item.quantity + delta, item.product.stock));
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product._id !== productId));
    toast.success('Removed from cart');
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);
    try {
      const orderData = {
        storeId: store._id,
        items: cart.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
          productName: item.product.name
        })),
        total: cartTotal,
        customerName: 'Guest Customer',
        customerEmail: 'guest@example.com'
      };

      const response = await api.post('/orders', orderData);
      const trackingToken = response.data.data.trackingToken;
      
      toast.success('Order placed successfully!');
      setCart([]);
      setShowCart(false);
      window.location.href = `/track/${trackingToken}`;
    } catch (error) {
      toast.error('Failed to place order');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center text-white px-6">
        <StoreIcon className="w-16 h-16 text-gray-600 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Store Not Found</h1>
        <p className="text-gray-400 mb-6">The store you're looking for doesn't exist.</p>
        <Button onClick={() => window.location.href = '/'} variant="outline">Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#13131a] to-[#0a0a0f]">
      <header className="sticky top-0 z-40 bg-[#0f0f14]/80 backdrop-blur-xl border-b border-white/5 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <StoreIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{store.name}</h1>
                <p className="text-xs text-gray-400">Online Store</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCart(!showCart)}
              className="relative bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white border-0 shadow-sm">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl p-6 mb-8 overflow-hidden">
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
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category
                    ? 'bg-violet-500 hover:bg-violet-600 text-white shrink-0'
                    : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5 shrink-0'
                  }
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <Card key={product._id} className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl overflow-hidden hover:bg-white/10 transition-all group shadow-xl">
              <div className="aspect-square w-full bg-white/5 relative overflow-hidden">
                <ImageWithFallback
                  src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                />
                <Badge variant="outline" className="absolute top-3 right-3 border-violet-500/30 bg-violet-500/20 text-violet-300">
                  {product.category}
                </Badge>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2 truncate">{product.name}</h3>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-2xl font-bold text-white">${product.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-400 font-mono">{product.stock} units left</p>
                </div>
                <Button
                  onClick={() => addToCart(product)}
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-md active:scale-95 transition-transform"
                >
                  Add to Cart
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-24 opacity-30">
            <Search className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl text-white font-semibold">No products found</h3>
            <p className="text-gray-500">Try a different search or category.</p>
          </div>
        )}
      </div>

      {showCart && (
        <>
          <div
            className="fixed inset-0 bg-black/80 z-50 animate-in fade-in duration-300 backdrop-blur-sm"
            onClick={() => setShowCart(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-full md:w-[450px] bg-[#0f0f14] border-l border-white/10 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-500">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                 <ShoppingCart className="w-6 h-6 text-violet-500" />
                 <h2 className="text-xl font-bold text-white">Your Cart</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCart(false)}
                className="text-gray-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="text-center py-32 opacity-20">
                  <ShoppingCart className="w-20 h-20 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium">Your selection is empty</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product._id} className="bg-white/5 border border-white/10 rounded-2xl p-4 transition-all hover:bg-white/[0.08] group relative">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-white/5 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                        <ImageWithFallback
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                           <p className="text-white font-semibold truncate pr-4">{item.product.name}</p>
                           <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCart(item.product._id)}
                              className="text-gray-500 hover:text-red-400 h-8 w-8 -mt-1 -mr-1"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                           <div className="flex items-center gap-2 bg-black/40 rounded-xl p-1 border border-white/5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.product._id, -1)}
                              className="h-7 w-7 text-white hover:bg-white/10 rounded-lg"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-white w-6 text-center text-xs font-bold font-mono">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.product._id, 1)}
                              disabled={item.quantity >= item.product.stock}
                              className="h-7 w-7 text-white hover:bg-white/10 rounded-lg"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-violet-400 font-bold">${(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-8 border-t border-white/10 space-y-6 bg-white/[0.03] backdrop-blur-xl">
                <div className="space-y-2">
                   <div className="flex justify-between text-gray-500 text-sm">
                      <span>Subtotal</span>
                      <span>${cartTotal.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between text-gray-500 text-sm pb-2 border-b border-white/5">
                      <span>Processing Fee</span>
                      <span className="text-green-500">FREE</span>
                   </div>
                   <div className="flex items-center justify-between text-2xl font-bold pt-2">
                      <span className="text-white">Total</span>
                      <span className="text-violet-400 shadow-violet-500/5">${cartTotal.toFixed(2)}</span>
                   </div>
                </div>
                <Button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full h-14 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-violet-500/20 active:scale-95 transition-all"
                >
                  {isCheckingOut ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    'Confirm Secure Order'
                  )}
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
