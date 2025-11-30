'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  Phone,
  Mail,
  Search,
  Filter,
  AlertCircle,
  Smartphone,
  Globe,
  RefreshCw,
  Play,
  Square,
  RotateCcw
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AdminSidebar, AdminMobileSidebar } from "@/components/admin/AdminSidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { formatDistanceToNow, parseISO, format } from "date-fns";

export default function BookingApprovals() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rescheduleDialog, setRescheduleDialog] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  // Mock appointments data with workflow states
  const appointments = [
    {
      id: 1,
      customer: "John Doe",
      service: "Classic Haircut",
      barber: "Mike Johnson",
      date: "2025-12-01",
      time: "9:00 AM",
      duration: "30 min",
      price: 35,
      status: "pending", // New status for approval workflow
      phone: "(555) 123-4567",
      email: "john.doe@email.com",
      notes: "First time customer",
      source: "website",
      branch: "Downtown Premium",
      createdAt: "2025-11-30T08:30:00Z",
      updatedAt: "2025-11-30T08:30:00Z"
    },
    {
      id: 2,
      customer: "Jane Smith",
      service: "Premium Haircut & Style",
      barber: "Sarah Wilson",
      date: "2025-12-01",
      time: "10:00 AM",
      duration: "45 min",
      price: 55,
      status: "approved", // Approved but not started
      phone: "(555) 234-5678",
      email: "jane.smith@email.com",
      notes: "Regular customer",
      source: "mobile",
      branch: "Downtown Premium",
      createdAt: "2025-11-30T09:15:00Z",
      updatedAt: "2025-11-30T09:45:00Z"
    },
    {
      id: 3,
      customer: "Bob Johnson",
      service: "Beard Trim & Shape",
      barber: "Alex Chen",
      date: "2025-12-01",
      time: "11:00 AM",
      duration: "20 min",
      price: 25,
      status: "in-progress", // Service started
      phone: "(555) 345-6789",
      email: "bob.johnson@email.com",
      notes: "Beard specialist request",
      source: "website",
      branch: "Midtown Elite",
      createdAt: "2025-11-30T10:00:00Z",
      updatedAt: "2025-12-01T11:00:00Z"
    },
    {
      id: 4,
      customer: "Alice Brown",
      service: "Complete Grooming Package",
      barber: "Mike Johnson",
      date: "2025-12-01",
      time: "2:00 PM",
      duration: "90 min",
      price: 85,
      status: "completed", // Service completed
      phone: "(555) 456-7890",
      email: "alice.brown@email.com",
      notes: "VIP customer",
      source: "mobile",
      branch: "Downtown Premium",
      createdAt: "2025-11-30T13:00:00Z",
      updatedAt: "2025-12-01T15:30:00Z"
    },
    {
      id: 5,
      customer: "Charlie Wilson",
      service: "Hot Towel Shave",
      barber: "Sarah Wilson",
      date: "2025-12-01",
      time: "4:00 PM",
      duration: "30 min",
      price: 45,
      status: "rejected", // Booking rejected
      phone: "(555) 567-8901",
      email: "charlie.wilson@email.com",
      notes: "Emergency cancellation",
      source: "website",
      branch: "Downtown Premium",
      createdAt: "2025-11-30T15:30:00Z",
      updatedAt: "2025-12-01T10:00:00Z"
    },
    {
      id: 6,
      customer: "David Lee",
      service: "Classic Haircut",
      barber: "Alex Chen",
      date: "2025-12-02",
      time: "9:30 AM",
      duration: "30 min",
      price: 35,
      status: "rescheduled", // Rescheduled booking
      phone: "(555) 678-9012",
      email: "david.lee@email.com",
      notes: "New customer referral",
      source: "mobile",
      branch: "Downtown Premium",
      createdAt: "2025-12-01T10:30:00Z",
      updatedAt: "2025-12-01T14:00:00Z"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-orange-100 text-orange-800 border-orange-200";
      case "approved": return "bg-purple-100 text-purple-800 border-purple-200";
      case "in-progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "rejected": return "bg-red-100 text-red-800 border-red-200";
      case "rescheduled": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "approved": return <CheckCircle className="w-4 h-4" />;
      case "in-progress": return <Play className="w-4 h-4" />;
      case "completed": return <Square className="w-4 h-4" />;
      case "rejected": return <XCircle className="w-4 h-4" />;
      case "rescheduled": return <RefreshCw className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getSourceIcon = (source: string) => {
    return source === "mobile" ? <Smartphone className="w-4 h-4" /> : <Globe className="w-4 h-4" />;
  };

  const getSourceColor = (source: string) => {
    return source === "mobile" ? "text-blue-600" : "text-green-600";
  };

  const handleStatusChange = (appointmentId: number, newStatus: string) => {
    // In a real app, this would make an API call
    console.log(`Changing appointment ${appointmentId} status to ${newStatus}`);
    // Update local state or refetch data
  };

  const handleApprove = (appointmentId: number) => {
    handleStatusChange(appointmentId, 'approved');
  };

  const handleStartService = (appointmentId: number) => {
    handleStatusChange(appointmentId, 'in-progress');
  };

  const handleCompleteService = (appointmentId: number) => {
    handleStatusChange(appointmentId, 'completed');
  };

  const handleReject = (appointmentId: number) => {
    handleStatusChange(appointmentId, 'rejected');
  };

  const handleReschedule = (appointmentId: number) => {
    // Open reschedule dialog
    setRescheduleDialog(true);
    setSelectedAppointment(appointments.find(a => a.id === appointmentId));
  };

  const confirmReschedule = () => {
    if (selectedAppointment && newDate && newTime) {
      // In a real app, this would make an API call
      console.log(`Rescheduling appointment ${selectedAppointment.id} to ${newDate} ${newTime}`);
      setRescheduleDialog(false);
      setNewDate('');
      setNewTime('');
      setSelectedAppointment(null);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         appointment.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         appointment.barber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getActionButtons = (appointment: any) => {
    switch (appointment.status) {
      case 'pending':
        return (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleApprove(appointment.id)} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleReject(appointment.id)}>
              <XCircle className="w-4 h-4 mr-1" />
              Reject
            </Button>
          </div>
        );
      case 'approved':
        return (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleStartService(appointment.id)} className="bg-blue-600 hover:bg-blue-700">
              <Play className="w-4 h-4 mr-1" />
              Start Service
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleReschedule(appointment.id)}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Reschedule
            </Button>
          </div>
        );
      case 'in-progress':
        return (
          <Button size="sm" onClick={() => handleCompleteService(appointment.id)} className="bg-green-600 hover:bg-green-700">
            <Square className="w-4 h-4 mr-1" />
            Complete
          </Button>
        );
      case 'completed':
      case 'rejected':
      case 'rescheduled':
        return (
          <Button size="sm" variant="outline" onClick={() => handleReschedule(appointment.id)}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Reschedule
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <AdminMobileSidebar role="branch_admin" onLogout={handleLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex">
          <AdminSidebar role="branch_admin" onLogout={handleLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)} />
          <div className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out",
          sidebarOpen ? "lg:ml-64" : "lg:ml-0"
        )}>
            <header className="bg-white border-b border-gray-200 px-4 py-4 lg:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Booking Approvals</h1>
                  <p className="text-sm text-gray-600">Manage appointment workflow and approvals</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 hidden sm:block">Welcome, {user?.email}</span>
                  <Button variant="outline" onClick={handleLogout} className="hidden sm:flex">
                    Logout
                  </Button>
                </div>
              </div>
            </header>

            <main className="p-4 lg:p-6">
              <div className="max-w-7xl mx-auto space-y-6">
                {/* Filters */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="Search by customer, service, or barber..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-48">
                          <Filter className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="rescheduled">Rescheduled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Status Overview */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { status: 'pending', label: 'Pending', count: appointments.filter(a => a.status === 'pending').length },
                    { status: 'approved', label: 'Approved', count: appointments.filter(a => a.status === 'approved').length },
                    { status: 'in-progress', label: 'In Progress', count: appointments.filter(a => a.status === 'in-progress').length },
                    { status: 'completed', label: 'Completed', count: appointments.filter(a => a.status === 'completed').length },
                    { status: 'rejected', label: 'Rejected', count: appointments.filter(a => a.status === 'rejected').length },
                    { status: 'rescheduled', label: 'Rescheduled', count: appointments.filter(a => a.status === 'rescheduled').length }
                  ].map(({ status, label, count }) => (
                    <Card key={status}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{count}</p>
                            <p className="text-xs text-muted-foreground">{label}</p>
                          </div>
                          <div className={`p-2 rounded-full ${getStatusColor(status).split(' ')[0]}`}>
                            {getStatusIcon(status)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Appointments List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Appointment Workflow</CardTitle>
                    <CardDescription>
                      Manage the complete booking lifecycle from approval to completion
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-full ${getStatusColor(appointment.status).split(' ')[0]}`}>
                                {getStatusIcon(appointment.status)}
                              </div>
                              <div>
                                <h3 className="font-semibold">{appointment.customer}</h3>
                                <p className="text-sm text-muted-foreground">{appointment.service}</p>
                                <div className="flex items-center gap-4 mt-1">
                                  <span className="text-sm flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {appointment.barber}
                                  </span>
                                  <span className="text-sm flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {format(parseISO(appointment.date), 'MMM dd')} at {appointment.time}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
                                    {appointment.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getActionButtons(appointment)}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setShowAppointmentDetails(true);
                                }}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </div>

        {/* Appointment Details Sheet */}
        <Sheet open={showAppointmentDetails} onOpenChange={setShowAppointmentDetails}>
          <SheetContent className="w-full sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>Appointment Details</SheetTitle>
              <SheetDescription>
                Complete appointment information and management
              </SheetDescription>
            </SheetHeader>
            {selectedAppointment && (
              <div className="mt-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedAppointment.customer}</h3>
                    <p className="text-muted-foreground">{selectedAppointment.service}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Barber</label>
                      <p className="text-sm text-muted-foreground">{selectedAppointment.barber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Date & Time</label>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(selectedAppointment.date), 'MMM dd, yyyy')} at {selectedAppointment.time}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Duration</label>
                      <p className="text-sm text-muted-foreground">{selectedAppointment.duration}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Price</label>
                      <p className="text-sm text-muted-foreground">${selectedAppointment.price}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedAppointment.status)}>
                        {getStatusIcon(selectedAppointment.status)}
                        <span className="ml-1 capitalize">{selectedAppointment.status}</span>
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {selectedAppointment.phone}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {selectedAppointment.email}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Source</label>
                    <p className={`text-sm flex items-center gap-1 ${getSourceColor(selectedAppointment.source)}`}>
                      {getSourceIcon(selectedAppointment.source)}
                      {selectedAppointment.source === 'mobile' ? 'Mobile App' : 'Website'}
                    </p>
                  </div>

                  {selectedAppointment.notes && (
                    <div>
                      <label className="text-sm font-medium">Notes</label>
                      <p className="text-sm text-muted-foreground mt-1">{selectedAppointment.notes}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <div className="flex gap-2">
                      {getActionButtons(selectedAppointment)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Reschedule Sheet */}
        <Sheet open={rescheduleDialog} onOpenChange={setRescheduleDialog}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Reschedule Appointment</SheetTitle>
              <SheetDescription>
                Update the date and time for this appointment
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <div>
                <label className="text-sm font-medium">New Date</label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
              <div>
                <label className="text-sm font-medium">New Time</label>
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={confirmReschedule} disabled={!newDate || !newTime}>
                  Confirm Reschedule
                </Button>
                <Button variant="outline" onClick={() => setRescheduleDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </ProtectedRoute>
  );
}