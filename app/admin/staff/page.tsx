'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Star, Clock, Phone, Mail, Plus, Edit, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AdminSidebar, AdminMobileSidebar } from "@/components/admin/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AdminStaff() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Mock staff data
  const staff = [
    {
      id: 1,
      name: "Mike Johnson",
      role: "Master Barber",
      email: "mike@premiumcuts.com",
      phone: "(555) 123-4567",
      rating: 4.9,
      reviews: 247,
      specialties: ["Fades", "Classic Cuts", "Beard Trimming"],
      experience: "8 years",
      status: "active",
      avatar: "/api/placeholder/100/100",
      schedule: {
        monday: "9AM-7PM",
        tuesday: "9AM-7PM",
        wednesday: "9AM-7PM",
        thursday: "9AM-7PM",
        friday: "9AM-7PM",
        saturday: "8AM-5PM",
        sunday: "Closed"
      }
    },
    {
      id: 2,
      name: "Sarah Chen",
      role: "Stylist",
      email: "sarah@premiumcuts.com",
      phone: "(555) 234-5678",
      rating: 4.8,
      reviews: 189,
      specialties: ["Color", "Styling", "Hair Treatments"],
      experience: "6 years",
      status: "active",
      avatar: "/api/placeholder/100/100",
      schedule: {
        monday: "10AM-6PM",
        tuesday: "10AM-6PM",
        wednesday: "10AM-6PM",
        thursday: "10AM-6PM",
        friday: "10AM-6PM",
        saturday: "9AM-4PM",
        sunday: "Closed"
      }
    },
    {
      id: 3,
      name: "Alex Rodriguez",
      role: "Barber",
      email: "alex@premiumcuts.com",
      phone: "(555) 345-6789",
      rating: 4.7,
      reviews: 156,
      specialties: ["Beard Care", "Modern Cuts", "Hot Towel Shave"],
      experience: "5 years",
      status: "active",
      avatar: "/api/placeholder/100/100",
      schedule: {
        monday: "9AM-7PM",
        tuesday: "9AM-7PM",
        wednesday: "9AM-7PM",
        thursday: "9AM-7PM",
        friday: "9AM-7PM",
        saturday: "8AM-5PM",
        sunday: "Closed"
      }
    },
    {
      id: 4,
      name: "Emma Davis",
      role: "Apprentice",
      email: "emma@premiumcuts.com",
      phone: "(555) 456-7890",
      rating: 4.5,
      reviews: 23,
      specialties: ["Basic Cuts", "Shampoo"],
      experience: "1 year",
      status: "active",
      avatar: "/api/placeholder/100/100",
      schedule: {
        monday: "10AM-4PM",
        tuesday: "10AM-4PM",
        wednesday: "10AM-4PM",
        thursday: "10AM-4PM",
        friday: "10AM-4PM",
        saturday: "Closed",
        sunday: "Closed"
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "on-leave": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <ProtectedRoute requiredRole="branch_admin">
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <AdminSidebar
          role="branch_admin"
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main Content */}
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out min-h-0",
          sidebarOpen ? "lg:ml-64" : "lg:ml-16"
        )}>
          {/* Header */}
          <header className="bg-white shadow-sm border-b flex-shrink-0">
            <div className="flex items-center justify-between px-4 py-4 lg:px-8">
              <div className="flex items-center gap-4">
                <AdminMobileSidebar
                  role="branch_admin"
                  onLogout={handleLogout}
                  isOpen={sidebarOpen}
                  onToggle={() => setSidebarOpen(!sidebarOpen)}
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
                  <p className="text-sm text-gray-600">Manage your team members</p>
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
                      All active
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
                    <CardTitle className="text-sm font-medium">Experience</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(staff.reduce((acc, member) => acc + parseInt(member.experience), 0) / staff.length).toFixed(1)}y
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Avg experience
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Staff Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {staff.map((member) => (
                  <Card key={member.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback>
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <CardTitle className="text-xl text-primary">{member.name}</CardTitle>
                            <CardDescription className="text-secondary font-medium">{member.role}</CardDescription>
                            <div className="flex items-center gap-2 mt-2">
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

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Specialties</h4>
                          <div className="flex flex-wrap gap-1">
                            {member.specialties.map((specialty, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Experience</h4>
                          <p className="text-sm text-gray-600">{member.experience} in the industry</p>
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
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}