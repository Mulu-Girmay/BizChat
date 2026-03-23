import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Shield, Mail, UserPlus, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';

export function EmployeePage() {
  const { user } = useSelector((state) => state.auth);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/users');
      setEmployees(response.data);
    } catch (err) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteEmployee = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const role = formData.get('role');

    setLoading(true);
    try {
      await api.post('/auth/invite-employee', { email, role });
      toast.success(`Invitation sent to ${email}`);
      setIsInviteOpen(false);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to remove this employee?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('Employee removed');
      fetchEmployees();
    } catch (err) {
      toast.error('Failed to remove employee');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Team management</h1>
          <p className="text-gray-400">Manage invitations and permissions</p>
        </div>
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/20 shadow-lg active:scale-95 transition-transform">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#13131a] border-white/10 text-white shadow-2xl">
            <DialogHeader>
              <DialogTitle>Invite team member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInviteEmployee} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  name="role"
                  className="w-full bg-white/5 border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:ring-1 focus:ring-violet-500"
                >
                  <option value="employee" className="bg-[#13131a]">Employee</option>
                  <option value="owner" className="bg-[#13131a]">Admin</option>
                </select>
              </div>
              <Button type="submit" className="w-full bg-violet-500 hover:bg-violet-600 shadow-lg shadow-violet-500/10">
                Send Invitation
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((member) => (
          <Card key={member._id} className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl p-6 hover:bg-white/10 transition-all group overflow-hidden relative shadow-lg">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Shield className="w-16 h-16" />
            </div>
            <div className="flex flex-col items-center text-center relative z-10">
              <Avatar className="w-16 h-16 mb-4 border-2 border-violet-500/20">
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-lg font-bold">
                  {member.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-semibold text-white mb-1">{member.name}</h3>
              <p className="text-sm text-gray-400 mb-4 font-mono">{member.email}</p>
              
              <div className="flex items-center gap-2 mb-6">
                <Badge variant="outline" className={member.role === 'owner' ? 'border-orange-500/30 bg-orange-500/10 text-orange-400 font-bold px-3 py-1 uppercase text-[10px]' : 'border-blue-500/30 bg-blue-500/10 text-blue-400 font-bold px-3 py-1 uppercase text-[10px]'}>
                  <Shield className="w-3 h-3 mr-1" />
                  {member.role || 'Employee'}
                </Badge>
              </div>

              <div className="flex gap-2 w-full pt-4 border-t border-white/5">
                <Button variant="outline" size="sm" className="flex-1 border-white/10 text-gray-400 hover:text-white hover:bg-white/5">
                  <Edit className="w-4 h-4 mr-2" />
                  Permissions
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                  onClick={() => handleRemoveEmployee(member._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!loading && employees.length === 0 && (
        <Card className="bg-white/5 border-dashed border-white/10 p-12 text-center shadow-inner">
          <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No team members yet</h3>
          <p className="text-gray-400 max-w-sm mx-auto">Invite your first employee to start collaborating and managing your store together.</p>
        </Card>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 shadow-lg shadow-violet-500/25"></div>
        </div>
      )}
    </div>
  );
}
