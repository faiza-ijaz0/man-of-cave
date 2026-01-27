
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  Users, Mail, Lock, Building, Plus, Edit, MoreVertical, 
  Search, Filter, Trash2, X, Check, Eye, EyeOff, 
  UserCheck, Shield, AlertCircle, Loader2, Key, UserPlus, UserMinus,
  Home, FileText, Settings, Calendar, DollarSign, BarChart, 
  ShoppingCart, Package, Users as UsersIcon, Clipboard, Layers
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AdminSidebar, AdminMobileSidebar } from "@/components/admin/AdminSidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

// Firebase imports - UPDATED
import { 
  collection, 
  doc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { Unsubscribe } from 'firebase/firestore';

// ✅ Page types and definitions
export interface Page {
  id: string;
  name: string;
  path: string;
  icon: any;
  category: 'dashboard' | 'management' | 'operations' | 'reports';
}

// ✅ Available pages list
export const AVAILABLE_PAGES: Page[] = [
  // Dashboard
  { id: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: Home, category: 'dashboard' },
  
  // Management
  { id: 'users', name: 'Users', path: '/admin/users', icon: UsersIcon, category: 'management' },
  { id: 'branches', name: 'Branches', path: '/admin/branches', icon: Building, category: 'management' },
  { id: 'products', name: 'Products', path: '/admin/products', icon: Package, category: 'management' },
  { id: 'categories', name: 'Categories', path: '/admin/categories', icon: Layers, category: 'management' },
  
  // Operations
  { id: 'orders', name: 'Orders', path: '/orders', icon: ShoppingCart, category: 'operations' },
  { id: 'inventory', name: 'Inventory', path: '/inventory', icon: Package, category: 'operations' },
  { id: 'customers', name: 'Customers', path: '/customers', icon: Users, category: 'operations' },
  { id: 'tasks', name: 'Tasks', path: '/tasks', icon: Clipboard, category: 'operations' },
  
  // Reports
  { id: 'sales-report', name: 'Sales Report', path: '/reports/sales', icon: BarChart, category: 'reports' },
  { id: 'inventory-report', name: 'Inventory Report', path: '/reports/inventory', icon: FileText, category: 'reports' },
  { id: 'financial-report', name: 'Financial Report', path: '/reports/financial', icon: DollarSign, category: 'reports' },
  { id: 'attendance-report', name: 'Attendance Report', path: '/reports/attendance', icon: Calendar, category: 'reports' },
  
  // Settings
  { id: 'settings', name: 'Settings', path: '/settings', icon: Settings, category: 'management' },
];

// ✅ User Types - UPDATED with pages field
export interface User {
  id: string;
  uid?: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin';
  branchId?: string;
  branchName?: string;
  allowedPages: string[]; // ✅ Added: Array of allowed page IDs
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt?: Date;
  lastLogin?: Date;
}

export interface Branch {
  id: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export default function SuperAdminUsers() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states - UPDATED with allowedPages
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin' as 'super_admin' | 'admin',
    branchId: '',
    allowedPages: ['dashboard'] as string[], // ✅ Default: only dashboard
    status: 'active' as 'active' | 'inactive' | 'suspended'
  });

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 🔥 Firebase se real-time users fetch - UPDATED
  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersRef = collection(db, 'users');
        
        const q = query(usersRef, orderBy('createdAt', 'desc'));
        
        unsubscribe = onSnapshot(q, (snapshot) => {
          const usersData: User[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            const createdAt = data.createdAt as Timestamp;
            const updatedAt = data.updatedAt as Timestamp;
            const lastLogin = data.lastLogin as Timestamp;
            
            usersData.push({
              id: doc.id,
              uid: data.uid || undefined,
              name: data.name || '',
              email: data.email || '',
              role: data.role || 'admin',
              branchId: data.branchId || undefined,
              branchName: data.branchName || undefined,
              allowedPages: data.allowedPages || ['dashboard'], // ✅ Default if not set
              status: data.status || 'active',
              createdAt: createdAt?.toDate() || new Date(),
              updatedAt: updatedAt?.toDate(),
              lastLogin: lastLogin?.toDate()
            });
          });
          
          setUsers(usersData);
          setLoading(false);
        }, (error) => {
          console.error("Error fetching users: ", error);
          setLoading(false);
        });

      } catch (error) {
        console.error("Error in fetchUsers: ", error);
        setLoading(false);
      }
    };

    fetchUsers();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // 🔥 Firebase se branches fetch
  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;

    const fetchBranches = async () => {
      try {
        setBranchesLoading(true);
        const branchesRef = collection(db, 'branches');
        
        const q = query(branchesRef);
        
        unsubscribe = onSnapshot(q, (snapshot) => {
          const branchesData: Branch[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            const createdAt = data.createdAt as Timestamp;
            
            branchesData.push({
              id: doc.id,
              name: data.name || '',
              address: data.address || '',
              city: data.city || '',
              country: data.country || '',
              phone: data.phone || '',
              email: data.email || '',
              status: data.status || 'active',
              createdAt: createdAt?.toDate() || new Date()
            });
          });
          
          const activeBranches = branchesData
            .filter(branch => branch.status === 'active')
            .sort((a, b) => a.name.localeCompare(b.name));
          
          setBranches(activeBranches);
          setBranchesLoading(false);
        }, (error) => {
          console.error("Error fetching branches: ", error);
          setBranchesLoading(false);
        });

      } catch (error) {
        console.error("Error in fetchBranches: ", error);
        setBranchesLoading(false);
      }
    };

    fetchBranches();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'admin',
      branchId: '',
      allowedPages: ['dashboard'], // ✅ Reset to default
      status: 'active'
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // 🔥 Page toggle handler
  const togglePage = (pageId: string) => {
    setFormData(prev => {
      const isCurrentlySelected = prev.allowedPages.includes(pageId);
      if (isCurrentlySelected) {
        // Don't allow deselecting dashboard
        if (pageId === 'dashboard') return prev;
        return {
          ...prev,
          allowedPages: prev.allowedPages.filter(id => id !== pageId)
        };
      } else {
        return {
          ...prev,
          allowedPages: [...prev.allowedPages, pageId]
        };
      }
    });
  };

  // 🔥 Select all pages
  const selectAllPages = () => {
    setFormData(prev => ({
      ...prev,
      allowedPages: AVAILABLE_PAGES.map(page => page.id)
    }));
  };

  // 🔥 Deselect all pages (except dashboard)
  const deselectAllPages = () => {
    setFormData(prev => ({
      ...prev,
      allowedPages: ['dashboard']
    }));
  };

  // 🔥 Get pages by category
  const getPagesByCategory = (category: Page['category']) => {
    return AVAILABLE_PAGES.filter(page => page.category === category);
  };

  // 🔥✅ UPDATED: Add User to Firebase with Authentication
  const handleAddUser = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      alert('Please fill all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    // Check if email already exists
    const emailExists = users.some(user => user.email.toLowerCase() === formData.email.toLowerCase());
    if (emailExists) {
      alert('Email already exists');
      return;
    }

    // ✅ Check if at least one page is selected
    if (formData.allowedPages.length === 0) {
      alert('Please select at least one page for the user');
      return;
    }

    setIsAdding(true);
    try {
      // ✅ STEP 1: Firebase Authentication mein user create karein
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.trim().toLowerCase(),
        formData.password
      );

      const userId = userCredential.user.uid;
      
      // ✅ STEP 2: Firestore mein user data store karein
      const selectedBranch = branches.find(b => b.id === formData.branchId);
      
      const newUserData = {
        uid: userId,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        branchId: formData.branchId || null,
        branchName: selectedBranch ? selectedBranch.name : null,
        allowedPages: formData.allowedPages, // ✅ Store allowed pages
        status: formData.status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'users', userId), newUserData);
      
      setAddDialogOpen(false);
      resetForm();
      alert('User added successfully! ✅ User can now login with these credentials.');
      
    } catch (error: any) {
      console.error("Error adding user: ", error);
      
      if (error.code === 'auth/email-already-in-use') {
        alert('Email already exists in authentication system');
      } else if (error.code === 'auth/invalid-email') {
        alert('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        alert('Password is too weak. Use at least 6 characters');
      } else if (error.code === 'auth/operation-not-allowed') {
        alert('Email/password accounts are not enabled. Enable in Firebase Console');
      } else {
        alert(`Error adding user: ${error.message}`);
      }
    } finally {
      setIsAdding(false);
    }
  };

  // 🔥✅ UPDATED: Edit User in Firebase
  const handleEditUser = async () => {
    if (!selectedUser || !formData.name.trim() || !formData.email.trim()) {
      alert('Please fill all required fields');
      return;
    }

    // Check if email is changed and exists
    if (formData.email.toLowerCase() !== selectedUser.email.toLowerCase()) {
      const emailExists = users.some(user => 
        user.email.toLowerCase() === formData.email.toLowerCase() && user.id !== selectedUser.id
      );
      if (emailExists) {
        alert('Email already exists');
        return;
      }
    }

    // ✅ Check if at least one page is selected
    if (formData.allowedPages.length === 0) {
      alert('Please select at least one page for the user');
      return;
    }

    // If password is being changed
    if (formData.password.trim()) {
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
      }
      alert('Note: Password change requires additional setup. Contact developer for password reset functionality.');
    }

    setIsEditing(true);
    try {
      const userDoc = doc(db, 'users', selectedUser.id);
      
      const selectedBranch = branches.find(b => b.id === formData.branchId);
      
      const updateData: any = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        branchId: formData.branchId || null,
        branchName: selectedBranch ? selectedBranch.name : null,
        allowedPages: formData.allowedPages, // ✅ Update allowed pages
        status: formData.status,
        updatedAt: serverTimestamp()
      };

      await updateDoc(userDoc, updateData);
      
      setEditDialogOpen(false);
      setSelectedUser(null);
      resetForm();
      alert('User updated successfully!');
      
    } catch (error: any) {
      console.error("Error updating user: ", error);
      alert(`Error updating user: ${error.message}`);
    } finally {
      setIsEditing(false);
    }
  };

  // 🔥 Delete User from Firebase
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    // Prevent deleting yourself
    if (selectedUser.email === user?.email) {
      alert('You cannot delete your own account!');
      return;
    }

    setIsDeleting(selectedUser.id);
    try {
      const userDoc = doc(db, 'users', selectedUser.id);
      await deleteDoc(userDoc);
      
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      alert('User deleted from database! Note: User still exists in Authentication. Contact developer to fully remove.');
    } catch (error: any) {
      console.error("Error deleting user: ", error);
      alert(`Error deleting user: ${error.message}`);
    } finally {
      setIsDeleting(null);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      confirmPassword: '',
      role: user.role,
      branchId: user.branchId || '',
      allowedPages: user.allowedPages || ['dashboard'], // ✅ Load user's allowed pages
      status: user.status
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  // Filter users for display
  const filteredUsers = users.filter(userItem => {
    const matchesSearch = userItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userItem.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || userItem.role === roleFilter;
    const matchesBranch = branchFilter === 'all' ||
                         (branchFilter === 'global' && !userItem.branchId) ||
                         userItem.branchId === branchFilter;
    const matchesStatus = statusFilter === 'all' || userItem.status === statusFilter;

    return matchesSearch && matchesRole && matchesBranch && matchesStatus;
  });

  // Get branch info
  const getBranchInfo = (user?: User) => {
    if (!user) return 'No Branch';
    if (!user.branchId) return 'Global User';
    return user.branchName || `Branch (${user.branchId?.substring(0, 8)}...)`;
  };

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin": return "bg-purple-100 text-purple-800";
      case "admin": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "suspended": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Get page icon
  const getPageIcon = (pageId: string) => {
    const page = AVAILABLE_PAGES.find(p => p.id === pageId);
    return page ? page.icon : FileText;
  };

  // Get page name
  const getPageName = (pageId: string) => {
    const page = AVAILABLE_PAGES.find(p => p.id === pageId);
    return page ? page.name : pageId;
  };

  // Stats calculations
  const activeUsers = users.filter(u => u.status === 'active');
  const inactiveUsers = users.filter(u => u.status === 'inactive');
  const suspendedUsers = users.filter(u => u.status === 'suspended');
  const superAdmins = users.filter(u => u.role === 'super_admin');
  const admins = users.filter(u => u.role === 'admin');

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Add Dialog ko open karne par form reset
  const handleAddDialogOpen = (open: boolean) => {
    if (open) {
      resetForm();
    }
    setAddDialogOpen(open);
  };

  // Render loading state
  if (loading && users.length === 0) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-secondary" />
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar role="super_admin" onLogout={handleLogout} />
        <AdminMobileSidebar
          role="super_admin"
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
                <p className="text-sm text-gray-600">Manage users across all branches</p>
                {loading && users.length > 0 && (
                  <div className="flex items-center mt-1">
                    <Loader2 className="w-3 h-3 animate-spin mr-1 text-gray-400" />
                    <span className="text-xs text-gray-500">Syncing...</span>
                  </div>
                )}
              </div>
              <Button
                onClick={() => handleAddDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </header>

          {/* Filters */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>
              
              {/* Role Filter */}
              <Select value={roleFilter} onValueChange={setRoleFilter} disabled={loading}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Branch Filter */}
              <Select value={branchFilter} onValueChange={setBranchFilter} disabled={loading || branchesLoading}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  <SelectItem value="global">Global Users</SelectItem>
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter} disabled={loading}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <UserCheck className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Users</p>
                      <p className="text-2xl font-bold text-gray-900">{activeUsers.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Shield className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Super Admins</p>
                      <p className="text-2xl font-bold text-gray-900">{superAdmins.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Shield className="w-8 h-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Admins</p>
                      <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Users Grid */}
          <div className="flex-1 overflow-auto px-6 pb-6">
            {loading && users.length === 0 ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || roleFilter !== 'all' || branchFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Get started by adding your first user'
                  }
                </p>
                {!searchTerm && roleFilter === 'all' && branchFilter === 'all' && statusFilter === 'all' && (
                  <Button onClick={() => handleAddDialogOpen(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((userItem) => (
                  <Card key={userItem.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {userItem.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{userItem.name}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getRoleColor(userItem.role)}>
                                {userItem.role.replace('_', ' ')}
                              </Badge>
                              <Badge className={getStatusColor(userItem.status)}>
                                {userItem.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {userItem.email}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {getBranchInfo(userItem)}
                            </div>
                            {/* ✅ Pages Badges */}
                            <div className="flex flex-wrap gap-1 mt-2">
                              <Badge variant="outline" className="text-xs bg-blue-50">
                                {userItem.allowedPages?.length || 0} Pages
                              </Badge>
                              {userItem.allowedPages?.slice(0, 3).map(pageId => {
                                const Icon = getPageIcon(pageId);
                                return (
                                  <Badge key={pageId} variant="outline" className="text-xs">
                                    <Icon className="w-2.5 h-2.5 mr-1" />
                                    {getPageName(pageId)}
                                  </Badge>
                                );
                              })}
                              {userItem.allowedPages?.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{userItem.allowedPages.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={isDeleting === userItem.id}>
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(userItem)} disabled={isDeleting === userItem.id}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const userDoc = doc(db, 'users', userItem.id);
                                const newStatus = userItem.status === 'active' ? 'inactive' : 'active';
                                updateDoc(userDoc, { 
                                  status: newStatus,
                                  updatedAt: serverTimestamp()
                                });
                              }}
                              disabled={isDeleting === userItem.id}
                            >
                              {userItem.status === 'active' ? (
                                <>
                                  <UserMinus className="w-4 h-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(userItem)}
                              className="text-red-600"
                              disabled={isDeleting === userItem.id || userItem.email === user?.email}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-xs text-gray-500 pt-2">
                          Joined: {userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString() : 'N/A'}
                          {userItem.lastLogin && (
                            <span className="ml-3">
                              Last login: {new Date(userItem.lastLogin).toLocaleDateString()}
                            </span>
                          )}
                          {userItem.uid && (
                            <div className="text-xs text-gray-400 mt-1">
                              ID: {userItem.uid.substring(0, 8)}...
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add User Sheet */}
      <Sheet open={addDialogOpen} onOpenChange={handleAddDialogOpen}>
        <SheetContent className="sm:max-w-2xl h-[90vh] m-auto rounded-3xl p-4 w-full overflow-y-auto">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="shrink-0 px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <SheetHeader className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shadow-sm">
                    <UserPlus className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <SheetTitle className="text-2xl font-bold text-gray-900">Add New User</SheetTitle>
                    <SheetDescription className="text-gray-600 mt-1">
                      Create a new user account with role, branch assignment, and page permissions.
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <Users className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Basic Information</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter full name"
                        className="mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isAdding}
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                        className="mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isAdding}
                      />
                    </div>

                    <div>
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Password *
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter password (min 6 characters)"
                          className="mt-1 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={isAdding}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isAdding}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Minimum 6 characters required</p>
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        Confirm Password *
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirm password"
                          className="mt-1 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={isAdding}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isAdding}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ✅ Page Permissions Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Page Permissions ({formData.allowedPages.length} selected)
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={selectAllPages}
                        disabled={isAdding}
                        className="text-xs"
                      >
                        Select All
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={deselectAllPages}
                        disabled={isAdding}
                        className="text-xs"
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>

                  {/* Dashboard Category */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <Home className="w-4 h-4 text-blue-600" />
                      Dashboard
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {getPagesByCategory('dashboard').map((page) => (
                        <div
                          key={page.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            formData.allowedPages.includes(page.id)
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          } ${page.id === 'dashboard' ? 'cursor-not-allowed opacity-75' : ''}`}
                          onClick={() => page.id !== 'dashboard' && togglePage(page.id)}
                        >
                          <div className={`p-2 rounded ${
                            formData.allowedPages.includes(page.id)
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            <page.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{page.name}</p>
                            <p className="text-xs text-gray-500">Required access</p>
                          </div>
                          {page.id === 'dashboard' ? (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Required
                            </Badge>
                          ) : (
                            <input
                              type="checkbox"
                              checked={formData.allowedPages.includes(page.id)}
                              onChange={() => togglePage(page.id)}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              disabled={page.id === 'dashboard' || isAdding}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Management Category */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-600" />
                      Management
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {getPagesByCategory('management').map((page) => (
                        <div
                          key={page.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            formData.allowedPages.includes(page.id)
                              ? 'bg-purple-50 border-purple-200'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                          onClick={() => togglePage(page.id)}
                        >
                          <div className={`p-2 rounded ${
                            formData.allowedPages.includes(page.id)
                              ? 'bg-purple-100 text-purple-600'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            <page.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{page.name}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={formData.allowedPages.includes(page.id)}
                            onChange={() => togglePage(page.id)}
                            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            disabled={isAdding}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Operations Category */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-600" />
                      Operations
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {getPagesByCategory('operations').map((page) => (
                        <div
                          key={page.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            formData.allowedPages.includes(page.id)
                              ? 'bg-amber-50 border-amber-200'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                          onClick={() => togglePage(page.id)}
                        >
                          <div className={`p-2 rounded ${
                            formData.allowedPages.includes(page.id)
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            <page.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{page.name}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={formData.allowedPages.includes(page.id)}
                            onChange={() => togglePage(page.id)}
                            className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                            disabled={isAdding}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reports Category */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <BarChart className="w-4 h-4 text-green-600" />
                      Reports
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {getPagesByCategory('reports').map((page) => (
                        <div
                          key={page.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            formData.allowedPages.includes(page.id)
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                          onClick={() => togglePage(page.id)}
                        >
                          <div className={`p-2 rounded ${
                            formData.allowedPages.includes(page.id)
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            <page.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{page.name}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={formData.allowedPages.includes(page.id)}
                            onChange={() => togglePage(page.id)}
                            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            disabled={isAdding}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Role & Branch Assignment */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Role & Branch</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="role" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        User Role *
                      </Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value: 'super_admin' | 'admin') =>
                          setFormData(prev => ({ ...prev, role: value }))
                        }
                        disabled={isAdding}
                      >
                        <SelectTrigger className="mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="branch" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Branch Assignment
                      </Label>
                      <Select
                        value={formData.branchId}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, branchId: value }))}
                        disabled={isAdding || branchesLoading}
                      >
                        <SelectTrigger className="mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <SelectValue placeholder="Select branch (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="global">No Branch (Global User)</SelectItem>
                          {branches.map(branch => (
                            <SelectItem key={branch.id} value={branch.id}>
                              <div className="flex items-center gap-2">
                                <Building className="w-3 h-3" />
                                {branch.name}
                                {branch.city && (
                                  <span className="text-xs text-gray-500 ml-1">({branch.city})</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Settings Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <Check className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Settings</h3>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-gray-200">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <Label htmlFor="status" className="text-sm font-medium text-gray-900 cursor-pointer">
                          User Status
                        </Label>
                        <p className="text-xs text-gray-600">Set user account status</p>
                      </div>
                    </div>
                    <Select
                      value={formData.status}
                      onValueChange={(value: 'active' | 'inactive' | 'suspended') =>
                        setFormData(prev => ({ ...prev, status: value }))
                      }
                      disabled={isAdding}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-6 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setAddDialogOpen(false)}
                  className="w-full sm:w-auto border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  disabled={isAdding}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleAddUser}
                  disabled={isAdding || !formData.name.trim() || !formData.email.trim() || !formData.password.trim()}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding User...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add User to Firebase
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit User Sheet */}
      <Sheet open={editDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setSelectedUser(null);
          resetForm();
        }
        setEditDialogOpen(open);
      }}>
        <SheetContent className="sm:max-w-2xl h-[90vh] m-auto rounded-3xl p-4 w-full overflow-y-auto">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="shrink-0 px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <SheetHeader className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shadow-sm">
                    <Edit className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <SheetTitle className="text-2xl font-bold text-gray-900">Edit User</SheetTitle>
                    <SheetDescription className="text-gray-600 mt-1">
                      Update user information and settings.
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <Users className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Basic Information</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Full Name *
                      </Label>
                      <Input
                        id="edit-name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter full name"
                        className="mt-1 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        disabled={isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Address *
                      </Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                        className="mt-1 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        disabled={isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        New Password (optional)
                      </Label>
                      <div className="relative">
                        <Input
                          id="edit-password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Leave empty to keep current password"
                          className="mt-1 pr-10 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          disabled={isEditing}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isEditing}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Password change requires backend setup</p>
                    </div>

                    <div>
                      <Label htmlFor="edit-confirmPassword" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="edit-confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirm new password"
                          className="mt-1 pr-10 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          disabled={isEditing}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isEditing}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ✅ Page Permissions Section for Edit */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Page Permissions ({formData.allowedPages.length} selected)
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={selectAllPages}
                        disabled={isEditing}
                        className="text-xs"
                      >
                        Select All
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={deselectAllPages}
                        disabled={isEditing}
                        className="text-xs"
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>

                  {/* Dashboard Category */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <Home className="w-4 h-4 text-blue-600" />
                      Dashboard
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {getPagesByCategory('dashboard').map((page) => (
                        <div
                          key={page.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            formData.allowedPages.includes(page.id)
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          } ${page.id === 'dashboard' ? 'cursor-not-allowed opacity-75' : ''}`}
                          onClick={() => page.id !== 'dashboard' && togglePage(page.id)}
                        >
                          <div className={`p-2 rounded ${
                            formData.allowedPages.includes(page.id)
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            <page.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{page.name}</p>
                            <p className="text-xs text-gray-500">Required access</p>
                          </div>
                          {page.id === 'dashboard' ? (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Required
                            </Badge>
                          ) : (
                            <input
                              type="checkbox"
                              checked={formData.allowedPages.includes(page.id)}
                              onChange={() => togglePage(page.id)}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              disabled={page.id === 'dashboard' || isEditing}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Management Category */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-600" />
                      Management
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {getPagesByCategory('management').map((page) => (
                        <div
                          key={page.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            formData.allowedPages.includes(page.id)
                              ? 'bg-purple-50 border-purple-200'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                          onClick={() => togglePage(page.id)}
                        >
                          <div className={`p-2 rounded ${
                            formData.allowedPages.includes(page.id)
                              ? 'bg-purple-100 text-purple-600'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            <page.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{page.name}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={formData.allowedPages.includes(page.id)}
                            onChange={() => togglePage(page.id)}
                            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            disabled={isEditing}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Operations Category */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-600" />
                      Operations
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {getPagesByCategory('operations').map((page) => (
                        <div
                          key={page.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            formData.allowedPages.includes(page.id)
                              ? 'bg-amber-50 border-amber-200'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                          onClick={() => togglePage(page.id)}
                        >
                          <div className={`p-2 rounded ${
                            formData.allowedPages.includes(page.id)
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            <page.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{page.name}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={formData.allowedPages.includes(page.id)}
                            onChange={() => togglePage(page.id)}
                            className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                            disabled={isEditing}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reports Category */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <BarChart className="w-4 h-4 text-green-600" />
                      Reports
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {getPagesByCategory('reports').map((page) => (
                        <div
                          key={page.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            formData.allowedPages.includes(page.id)
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                          onClick={() => togglePage(page.id)}
                        >
                          <div className={`p-2 rounded ${
                            formData.allowedPages.includes(page.id)
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            <page.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{page.name}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={formData.allowedPages.includes(page.id)}
                            onChange={() => togglePage(page.id)}
                            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            disabled={isEditing}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Role & Branch Assignment */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Role & Branch</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-role" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        User Role *
                      </Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value: 'super_admin' | 'admin') =>
                          setFormData(prev => ({ ...prev, role: value }))
                        }
                        disabled={isEditing}
                      >
                        <SelectTrigger className="mt-1 focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="edit-branch" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Branch Assignment
                      </Label>
                      <Select
                        value={formData.branchId}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, branchId: value }))}
                        disabled={isEditing || branchesLoading}
                      >
                        <SelectTrigger className="mt-1 focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                          <SelectValue placeholder="Select branch (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="global">No Branch (Global User)</SelectItem>
                          {branches.map(branch => (
                            <SelectItem key={branch.id} value={branch.id}>
                              <div className="flex items-center gap-2">
                                <Building className="w-3 h-3" />
                                {branch.name}
                                {branch.city && (
                                  <span className="text-xs text-gray-500 ml-1">({branch.city})</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Settings Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <Check className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Settings</h3>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-gray-200">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <Label htmlFor="edit-status" className="text-sm font-medium text-gray-900 cursor-pointer">
                          User Status
                        </Label>
                        <p className="text-xs text-gray-600">Set user account status</p>
                      </div>
                    </div>
                    <Select
                      value={formData.status}
                      onValueChange={(value: 'active' | 'inactive' | 'suspended') =>
                        setFormData(prev => ({ ...prev, status: value }))
                      }
                      disabled={isEditing}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-6 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditDialogOpen(false);
                    setSelectedUser(null);
                    resetForm();
                  }}
                  className="w-full sm:w-auto border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  disabled={isEditing}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleEditUser}
                  disabled={isEditing || !formData.name.trim() || !formData.email.trim()}
                  className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isEditing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Update User
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Sheet */}
      <Sheet open={deleteDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setSelectedUser(null);
        }
        setDeleteDialogOpen(open);
      }}>
        <SheetContent className="sm:max-w-lg h-[700px] m-auto rounded-3xl p-4 w-full">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="shrink-0 px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-pink-50">
              <SheetHeader className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shadow-sm">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <SheetTitle className="text-2xl font-bold text-gray-900">Delete User</SheetTitle>
                    <SheetDescription className="text-gray-600 mt-1">
                      This action cannot be undone.
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 py-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">
                      Are you sure you want to delete this user?
                    </h3>
                    <p className="text-red-700 mb-4">
                      This will permanently delete <strong>"{selectedUser?.name}"</strong> and all associated data.
                      This action cannot be undone.
                    </p>
                    {selectedUser?.email === user?.email && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                          <p className="text-yellow-700 font-medium">
                            Warning: You cannot delete your own account!
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="bg-white rounded-lg p-4 border border-red-300">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {selectedUser?.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{selectedUser?.name}</p>
                          <p className="text-sm text-gray-600">{selectedUser?.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getRoleColor(selectedUser?.role || '')}>
                              {selectedUser?.role?.replace('_', ' ')}
                            </Badge>
                            <Badge className={getStatusColor(selectedUser?.status || '')}>
                              {selectedUser?.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {getBranchInfo(selectedUser || undefined)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Allowed Pages: {selectedUser?.allowedPages?.length || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-6 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setSelectedUser(null);
                  }}
                  className="w-full sm:w-auto border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  disabled={isDeleting === selectedUser?.id}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteUser}
                  disabled={isDeleting === selectedUser?.id || selectedUser?.email === user?.email}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isDeleting === selectedUser?.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete User
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </ProtectedRoute>
  );
}