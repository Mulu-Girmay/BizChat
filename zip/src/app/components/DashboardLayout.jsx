import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  Store,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search
} from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';

export function DashboardLayout({ children }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Chat', href: '/chat', icon: MessageSquare, badge: 3 },
    { name: 'Employees', href: '/employees', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Storefront', href: `/shop/${user?.store?.slug || 'my-store'}`, icon: Store }
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-all duration-500 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-gradient-to-b from-[#13131a] to-[#0f0f14] border-r border-white/5 shadow-2xl`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">BizChat</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href ||
                             (item.name === 'Storefront' && location.pathname.startsWith('/shop'));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="flex-1 text-sm font-medium">{item.name}</span>
                  {item.badge && (
                    <Badge className={`border-0 text-[10px] px-2 h-5 flex items-center justify-center ${isActive ? 'bg-white/20 text-white' : 'bg-violet-500 text-white'}`}>
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 bg-white/[0.02] border-t border-white/5">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
              <Avatar className="w-10 h-10 border border-white/10">
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold text-sm">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate leading-tight">{user?.name}</p>
                <p className="text-[10px] text-gray-500 truncate uppercase tracking-widest font-bold mt-0.5">{user?.role || 'Hustler'}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-400 transition-colors"
                title="Secure Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`transition-all duration-500 min-h-screen flex flex-col ${sidebarOpen ? 'lg:pl-64' : ''}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-40 h-20 bg-[#0f0f14]/80 backdrop-blur-xl border-b border-white/5 flex items-center px-8 justify-between shadow-sm">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white bg-white/5 rounded-xl border border-white/5"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="relative hidden xl:block">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Global command search..."
                className="w-96 pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-4 border-r border-white/10 pr-6 mr-2">
               <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">System Status</p>
                  <div className="flex items-center gap-2 mt-0.5 justify-end">
                     <span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                     <span className="text-xs text-white font-medium">Operational</span>
                  </div>
               </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="relative text-gray-400 hover:text-white bg-white/5 rounded-xl border border-white/5"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-violet-500 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.6)]"></span>
            </Button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
