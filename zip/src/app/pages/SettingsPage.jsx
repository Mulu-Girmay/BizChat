import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { User, Store, Lock, Bell, Shield } from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';

export function SettingsPage() {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Logic for profile update
    setTimeout(() => {
      setLoading(false);
      toast.success('Profile updated successfully');
    }, 1000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.patch('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      e.target.reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your account and store preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 p-1">
          <TabsTrigger value="profile" className="data-[state=active]:bg-violet-500 text-white">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="store" className="data-[state=active]:bg-violet-500 text-white">
            <Store className="w-4 h-4 mr-2" />
            Store
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-violet-500 text-white">
            < Lock className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl p-8 max-w-2xl shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                <Input
                  id="name"
                  defaultValue={user?.name}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user?.email}
                  disabled
                  className="bg-white/5 border-white/10 text-white opacity-50"
                />
              </div>
              <Button type="submit" disabled={loading} className="bg-violet-500 hover:bg-violet-600 shadow-lg shadow-violet-500/20 active:scale-95 transition-transform">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="store">
          <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl p-8 max-w-2xl shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-6">Store Configuration</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-gray-300">Store Name</Label>
                <Input
                  defaultValue={user?.store?.name || user?.businessName}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Store Slug</Label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-gray-500 text-sm flex items-center">
                    bizchat.app/shop/
                    <span className="text-white ml-1 font-semibold">{user?.store?.slug || 'my-store'}</span>
                  </div>
                  <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">Edit</Button>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <h3 className="text-sm font-semibold text-white mb-4">Notification Settings</h3>
                <div className="flex items-center justify-between mb-4 bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center">
                      <Bell className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">Order Notifications</p>
                      <p className="text-xs text-gray-400">Get notified of new sales</p>
                    </div>
                  </div>
                  <div className="w-12 h-6 bg-violet-500 rounded-full relative cursor-pointer shadow-inner shadow-black/20">
                     <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all"></div>
                  </div>
                </div>
              </div>
              <Button className="w-full bg-violet-500 hover:bg-violet-600 shadow-lg shadow-violet-500/10">Update Store</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl p-8 max-w-2xl shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-6">Security Settings</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-violet-500 hover:bg-violet-600 shadow-lg shadow-violet-500/20 active:scale-95 transition-transform mt-4">
                {loading ? 'Updating...' : 'Change Password'}
              </Button>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
