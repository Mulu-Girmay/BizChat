import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInventory, addProduct, updateProduct, deleteProduct } from '../store/slices/inventorySlice';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function InventoryPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: products, loading } = useSelector((state) => state.inventory);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    const storeId = user?.store?._id || user?.storeId;
    if (storeId) {
      dispatch(fetchInventory(storeId));
    }
  }, [dispatch, user]);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(product => {
    const name = product.name || '';
    const sku = product.sku || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteProduct = async (id) => {
    const resultAction = await dispatch(deleteProduct(id));
    if (deleteProduct.fulfilled.match(resultAction)) {
      toast.success('Product deleted successfully');
    } else {
      toast.error('Failed to delete product');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const stock = Number(formData.get('stock'));
    const storeId = user?.store?._id || user?.storeId;

    const newProduct = {
      name: formData.get('name'),
      sku: formData.get('sku'),
      price: Number(formData.get('price')),
      stock,
      category: formData.get('category'),
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      storeId
    };

    const resultAction = await dispatch(addProduct(newProduct));
    if (addProduct.fulfilled.match(resultAction)) {
      setIsAddDialogOpen(false);
      toast.success('Product added successfully');
    } else {
      toast.error('Failed to add product');
    }
  };

  const stockStatusColor = (status, stock) => {
    if (stock === 0 || status === 'out') return 'border-red-500/30 bg-red-500/10 text-red-400';
    if (stock < 10 || status === 'low') return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400';
    return 'border-green-500/30 bg-green-500/10 text-green-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Inventory</h1>
          <p className="text-gray-400">Manage your product catalog and stock levels</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#13131a] border-white/10 text-white shadow-2xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  name="sku"
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    required
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    required
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <Button type="submit" className="w-full bg-violet-500 hover:bg-violet-600">
                Add Product
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search products by name or SKU..."
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <Card key={product._id || product.id} className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl overflow-hidden hover:bg-white/10 transition-all group shadow-lg">
            <div className="aspect-video w-full bg-white/5 relative overflow-hidden">
              <ImageWithFallback
                src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
                alt={product.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
              />
              <Badge
                variant="outline"
                className={`absolute top-3 right-3 shadow-md ${stockStatusColor(product.stockStatus, product.stock)}`}
              >
                {product.stock === 0 ? 'Out of Stock' : product.stock < 10 ? 'Low Stock' : 'In Stock'}
              </Badge>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-1 truncate">{product.name}</h3>
                <p className="text-xs text-gray-400 font-mono tracking-wider">{product.sku}</p>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-white tracking-tight">${product.price?.toFixed(2)}</p>
                  <p className="text-xs text-gray-400 mt-1">{product.stock} units available</p>
                </div>
                <Badge variant="outline" className="border-violet-500/30 bg-violet-500/10 text-violet-400 px-3">
                  {product.category}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
                  onClick={() => setEditingProduct(product)}
                >
                  <Edit className="w-4 h-4 mr-1 text-violet-400" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  onClick={() => handleDeleteProduct(product._id || product.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!loading && filteredProducts.length === 0 && (
        <Card className="bg-white/5 border-dashed border-white/10 p-12 text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
          <p className="text-gray-400">Try adding some products or adjusting your search.</p>
        </Card>
      )}

      {loading && (
        <div className="flex justify-center py-12">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 shadow-lg shadow-violet-500/20"></div>
        </div>
      )}
    </div>
  );
}
