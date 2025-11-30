'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Star, Clock, Phone, Mail, Plus, Edit, MoreVertical, Search, Filter, Building } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AdminSidebar, AdminMobileSidebar } from "@/components/admin/AdminSidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function SuperAdminStaff() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Mock staff data across all branches
  const staff = [
    {
      id: 1,
      name: "Mike Johnson",
      role: "Master Barber",
      branch: "Downtown Premium",
      email: "mike@premiumcuts.com",
      phone: "(555) 123-4567",
      rating: 4.9,
      reviews: 247,
      experience: "8 years",
      status: "active",
      hireDate: "2017-03-15",
      salary: 45000,
      avatar: "/api/placeholder/100/100"
    },
    {
      id: 2,
      name: "Sarah Chen",
      role: "Stylist",
      branch: "Midtown Elite",
      email: "sarah@premiumcuts.com",
      phone: "(555) 234-5678",
      rating: 4.8,
      reviews: 189,
      experience: "6 years",
      status: "active",
      hireDate: "2019-07-22",
      salary: 38000,
      avatar: "/api/placeholder/100/100"
    },
    {
      id: 3,
      name: "Alex Rodriguez",
      role: "Barber",
      branch: "Uptown Luxury",
      email: "alex@premiumcuts.com",
      phone: "(555) 345-6789",
      rating: 4.7,
      reviews: 156,
      experience: "5 years",
      status: "active",
      hireDate: "2020-01-10",
      salary: 35000,
      avatar: "/api/placeholder/100/100"
    },
    {
      id: 4,
      name: "Emma Davis",
      role: "Apprentice",
      branch: "Suburban Comfort",
      email: "emma@premiumcuts.com",
      phone: "(555) 456-7890",
      rating: 4.5,
      reviews: 23,
      experience: "1 year",
      status: "active",
      hireDate: "2024-06-01",
      salary: 25000,
      avatar: "/api/placeholder/100/100"
    },
    {
      id: 5,
      name: "John Smith",
      role: "Barber",
      branch: "Westside Modern",
      email: "john@premiumcuts.com",
      phone: "(555) 567-8901",
      rating: 4.6,
      reviews: 134,
      experience: "4 years",
      status: "active",
      hireDate: "2021-04-15",
      salary: 32000,
      avatar: "/api/placeholder/100/100"
    },
    {
      id: 6,
      name: "Lisa Brown",
      role: "Stylist",
      branch: "Eastside Classic",
      email: "lisa@premiumcuts.com",
      phone: "(555) 678-9012",
      rating: 4.7,
      reviews: 178,
      experience: "7 years",
      status: "active",
      hireDate: "2018-09-30",
      salary: 40000,
      avatar: "/api/placeholder/100/100"
    },
    {
      id: 7,
      name: "Tom Wilson",
      role: "Barber",
      branch: "Northgate Plaza",
      email: "tom@premiumcuts.com",
      phone: "(555) 789-0123",
      rating: 4.3,
      reviews: 67,
      experience: "3 years",
      status: "active",
      hireDate: "2022-02-20",
      salary: 30000,
      avatar: "/api/placeholder/100/100"
    },
    {
      id: 8,
      name: "Maria Garcia",
      role: "Apprentice",
      branch: "Southpoint Mall",
      email: "maria@premiumcuts.com",
      phone: "(555) 890-1234",
      rating: 4.1,
      reviews: 12,
      experience: "6 months",
      status: "inactive",
      hireDate: "2024-09-15",
      salary: 22000,
      avatar: "/api/placeholder/100/100"
    }
  ];

  const branches = [...new Set(staff.map(member => member.branch))];
  const roles = [...new Set(staff.map(member => member.role))];

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.branch.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = branchFilter === 'all' || member.branch === branchFilter;
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesBranch && matchesRole;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "on-leave": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <ProtectedRoute requiredRole="super_admin">
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <AdminSidebar role="super_admin" onLogout={handleLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Main Content */}
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out min-h-0",
          sidebarOpen ? "lg:ml-64" : "lg:ml-16"
        )}>
          {/* Header */}
          <header className="bg-white shadow-sm border-b flex-shrink-0">
            <div className="flex items-center justify-between px-4 py-4 lg:px-8">
              <div className="flex items-center gap-4">
                <AdminMobileSidebar role="super_admin" onLogout={handleLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)} />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
                  <p className="text-sm text-gray-600">Manage staff across all branches</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button className="bg-secondary hover:bg-secondary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Staff
                </Button>
                <span className="text-sm text-gray-600 hidden sm:block">Welcome, {user?.email}</span>
                <Button variant="outline" onClick={handleLogout} className="hidden sm:flex">
                  Logout
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-auto min-h-0">
            <div className="h-full p-4 lg:p-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{staff.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {staff.filter(s => s.status === 'active').length} active members
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(staff.reduce((acc, member) => acc + member.rating, 0) / staff.length).toFixed(1)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Team performance
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {staff.reduce((acc, member) => acc + member.reviews, 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Customer feedback
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Salary</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${(staff.reduce((acc, member) => acc + member.salary, 0) / staff.length / 1000).toFixed(0)}k
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Annual salary
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search staff..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={branchFilter} onValueChange={setBranchFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        {branches.map(branch => (
                          <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {roles.map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Staff Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredStaff.map((member) => (
                  <Card key={member.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-lg font-semibold text-gray-600">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-xl text-primary">{member.name}</CardTitle>
                            <CardDescription className="text-secondary font-medium">{member.role}</CardDescription>
                            <div className="flex items-center gap-2 mt-2">
                              <Building className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{member.branch}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1 text-sm">
                                <Star className="w-4 h-4 fill-secondary text-secondary" />
                                <span>{member.rating}</span>
                                <span className="text-gray-500">({member.reviews} reviews)</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(member.status)}>
                            {member.status}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Clock className="w-4 h-4 mr-2" />
                                Manage Schedule
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Star className="w-4 h-4 mr-2" />
                                View Reviews
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span>{member.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{member.phone}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Experience</h4>
                            <p className="text-sm text-gray-600">{member.experience}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Salary</h4>
                            <p className="text-sm text-gray-600">${member.salary.toLocaleString()}/year</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Hire Date</h4>
                          <p className="text-sm text-gray-600">{new Date(member.hireDate).toLocaleDateString()}</p>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            View Schedule
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            Performance
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredStaff.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No staff found</h3>
                  <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}