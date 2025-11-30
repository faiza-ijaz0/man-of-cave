'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar, Clock, User, Search, Filter, CheckCircle, XCircle, AlertCircle, Bell, Smartphone, Globe, Plus, Edit, Trash2, Phone, Mail, RefreshCw, FileText, Scissors, Package, DollarSign, Receipt, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AdminSidebar, AdminMobileSidebar } from "@/components/admin/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { AdvancedCalendar } from "@/components/ui/advanced-calendar";
import { NotificationSystem, useNotifications } from "@/components/ui/notification-system";
import { cn } from "@/lib/utils";

export default function AdminAppointments() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'advanced-calendar' | 'list'>('advanced-calendar');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    customer: '',
    phone: '',
    email: '',
    service: '',
    barber: '',
    date: '',
    time: '',
    notes: '',
    products: [] as Array<{name: string, category: string, price: number, quantity: number}>,
    tax: 5,
    serviceCharges: 0,
    status: 'pending',
    generateInvoice: false
  });

  // Notification system
  const { notifications, addNotification, markAsRead, dismiss } = useNotifications();

  // Mock products data
  const mockProducts = [
    { name: "Premium Shampoo", category: "Hair Care", price: 15 },
    { name: "Beard Oil", category: "Grooming", price: 12 },
    { name: "Hair Wax", category: "Styling", price: 8 },
    { name: "Face Mask", category: "Skincare", price: 20 },
    { name: "Hair Clippers", category: "Tools", price: 45 },
    { name: "Styling Gel", category: "Styling", price: 10 },
    { name: "Aftershave", category: "Grooming", price: 18 },
    { name: "Hair Brush", category: "Tools", price: 25 }
  ];

  // Helper functions for pricing
  const getServicePrice = (serviceName: string) => {
    const servicePrices: { [key: string]: number } = {
      "Classic Haircut": 35,
      "Beard Trim & Shape": 25,
      "Premium Package": 85,
      "Haircut & Style": 50,
      "Hair Coloring": 120,
      "Facial Treatment": 75
    };
    return servicePrices[serviceName] || 0;
  };

  const calculateTax = () => {
    const servicePrice = getServicePrice(bookingData.service);
    const productsTotal = bookingData.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const subtotal = servicePrice + productsTotal + bookingData.serviceCharges;
    return ((subtotal * bookingData.tax) / 100).toFixed(2);
  };

  const calculateTotal = () => {
    const servicePrice = getServicePrice(bookingData.service);
    const productsTotal = bookingData.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const subtotal = servicePrice + productsTotal + bookingData.serviceCharges;
    const taxAmount = (subtotal * bookingData.tax) / 100;
    return (subtotal + taxAmount).toFixed(2);
  };

  // Mock appointments data with more comprehensive data
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
      status: "completed",
      phone: "(555) 123-4567",
      email: "john.doe@email.com",
      notes: "Regular customer, prefers fade",
      source: "website", // website or mobile
      branch: "Downtown Premium",
      createdAt: "2025-11-30T08:00:00Z",
      updatedAt: "2025-12-01T09:30:00Z"
    },
    {
      id: 2,
      customer: "Jane Smith",
      service: "Beard Trim & Shape",
      barber: "Alex Rodriguez",
      date: "2025-12-01",
      time: "10:00 AM",
      duration: "20 min",
      price: 25,
      status: "in-progress",
      phone: "(555) 234-5678",
      email: "jane.smith@email.com",
      notes: "First time customer",
      source: "mobile",
      branch: "Downtown Premium",
      createdAt: "2025-11-30T14:30:00Z",
      updatedAt: "2025-12-01T10:00:00Z"
    },
    {
      id: 3,
      customer: "Bob Johnson",
      service: "Premium Package",
      barber: "Mike Johnson",
      date: "2025-12-01",
      time: "11:00 AM",
      duration: "60 min",
      price: 85,
      status: "scheduled",
      phone: "(555) 345-6789",
      email: "bob.johnson@email.com",
      notes: "VIP customer, prefers hot towel",
      source: "website",
      branch: "Downtown Premium",
      createdAt: "2025-11-29T16:45:00Z",
      updatedAt: "2025-11-29T16:45:00Z"
    },
    {
      id: 4,
      customer: "Alice Brown",
      service: "Haircut & Style",
      barber: "Sarah Chen",
      date: "2025-12-01",
      time: "2:00 PM",
      duration: "45 min",
      price: 55,
      status: "scheduled",
      phone: "(555) 456-7890",
      email: "alice.brown@email.com",
      notes: "Color treatment last visit",
      source: "mobile",
      branch: "Downtown Premium",
      createdAt: "2025-11-30T11:20:00Z",
      updatedAt: "2025-11-30T11:20:00Z"
    },
    {
      id: 5,
      customer: "Charlie Wilson",
      service: "Beard Grooming",
      barber: "Alex Rodriguez",
      date: "2025-12-01",
      time: "3:30 PM",
      duration: "25 min",
      price: 30,
      status: "cancelled",
      phone: "(555) 567-8901",
      email: "charlie.wilson@email.com",
      notes: "Emergency cancellation",
      source: "website",
      branch: "Downtown Premium",
      createdAt: "2025-11-30T09:15:00Z",
      updatedAt: "2025-12-01T15:00:00Z"
    },
    {
      id: 6,
      customer: "David Lee",
      service: "Classic Haircut",
      barber: "Mike Johnson",
      date: "2025-12-02",
      time: "9:30 AM",
      duration: "30 min",
      price: 35,
      status: "scheduled",
      phone: "(555) 678-9012",
      email: "david.lee@email.com",
      notes: "New customer referral",
      source: "mobile",
      branch: "Downtown Premium",
      createdAt: "2025-12-01T10:30:00Z",
      updatedAt: "2025-12-01T10:30:00Z"
    },
    {
      id: 7,
      customer: "Emma Davis",
      service: "Hair Color",
      barber: "Sarah Chen",
      date: "2025-12-02",
      time: "1:00 PM",
      duration: "90 min",
      price: 120,
      status: "scheduled",
      phone: "(555) 789-0123",
      email: "emma.davis@email.com",
      notes: "Full color treatment",
      source: "website",
      branch: "Downtown Premium",
      createdAt: "2025-11-28T13:45:00Z",
      updatedAt: "2025-11-28T13:45:00Z"
    }
  ];

  // Mock notifications - in real app, this would come from API/websockets
  const mockNotifications = [
    {
      id: "1",
      type: "info" as const,
      title: "New Booking",
      message: "John Doe booked Classic Haircut for tomorrow",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      action: {
        label: "View",
        onClick: () => handleAppointmentClick(appointments.find(a => a.customer === "John Doe")!)
      }
    },
    {
      id: "2",
      type: "warning" as const,
      title: "Booking Cancelled",
      message: "Charlie Wilson cancelled Beard Grooming",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: false,
      action: {
        label: "View",
        onClick: () => handleAppointmentClick(appointments.find(a => a.customer === "Charlie Wilson")!)
      }
    },
    {
      id: "3",
      type: "info" as const,
      title: "Appointment Reminder",
      message: "Jane Smith appointment starts in 30 minutes",
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: true
    }
  ];

  useEffect(() => {
    // Initialize with mock notifications
    mockNotifications.forEach(notification => {
      addNotification(notification);
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "in-progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "scheduled": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved": return "bg-purple-100 text-purple-800 border-purple-200";
      case "pending": return "bg-orange-100 text-orange-800 border-orange-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      case "rejected": return "bg-red-100 text-red-800 border-red-200";
      case "rescheduled": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "in-progress": return <Clock className="w-4 h-4" />;
      case "scheduled": return <Calendar className="w-4 h-4" />;
      case "approved": return <CheckCircle className="w-4 h-4" />;
      case "pending": return <Clock className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
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

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    const matchesSearch = appointment.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         appointment.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         appointment.barber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !selectedDate || appointment.date === selectedDate.toISOString().split('T')[0];
    return matchesStatus && matchesSearch && matchesDate;
  });

  const getAppointmentsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === dateString);
  };

  const handleCreateBooking = (barber: string, date: string, time: string) => {
    setBookingData({
      customer: '',
      phone: '',
      email: '',
      service: '',
      barber: barber,
      date: date,
      time: time,
      notes: '',
      products: [],
      tax: 5,
      serviceCharges: 0,
      status: 'pending',
      generateInvoice: false
    });
    setShowBookingDialog(true);
  };

  const handleSubmitBooking = () => {
    // Validate required fields
    if (!bookingData.customer || !bookingData.service || !bookingData.barber || !bookingData.date || !bookingData.time) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields.',
      });
      return;
    }

    // In a real app, this would make an API call to create the booking
    console.log('Creating booking:', bookingData);

    // Add notification
    addNotification({
      type: 'success',
      title: 'Booking Created',
      message: `Appointment scheduled for ${bookingData.customer} with ${bookingData.barber} on ${bookingData.date} at ${bookingData.time}`,
    });

    // Close dialog and reset form
    setShowBookingDialog(false);
    setBookingData({
      customer: '',
      phone: '',
      email: '',
      service: '',
      barber: '',
      date: '',
      time: '',
      notes: '',
      products: [],
      tax: 5,
      serviceCharges: 0,
      status: 'pending',
      generateInvoice: false
    });
  };

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  const handleStatusChange = (appointmentId: number, newStatus: string) => {
    // In a real app, this would update the backend
    console.log(`Updating appointment ${appointmentId} to status ${newStatus}`);
    // Update local state
    const updatedAppointments = appointments.map(apt =>
      apt.id === appointmentId ? { ...apt, status: newStatus, updatedAt: new Date().toISOString() } : apt
    );
    // For demo purposes, we'll just log it
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

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
                  <h1 className="text-2xl font-bold text-gray-900">Appointment Calendar</h1>
                  <p className="text-sm text-gray-600">Manage all bookings from website and mobile</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="relative">
                      <Bell className="w-4 h-4" />
                      {notifications.filter(n => !n.read).length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {notifications.filter(n => !n.read).length}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Notifications</SheetTitle>
                      <SheetDescription>
                        Recent appointment updates and reminders
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                      {notifications.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                              notification.read
                                ? 'bg-muted/50 border-muted'
                                : 'bg-background border-border'
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                {getIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-medium truncate">
                                    {notification.title}
                                  </h4>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                                {notification.action && (
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="p-0 h-auto mt-2 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      notification.action?.onClick();
                                    }}
                                  >
                                    {notification.action.label}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </SheetContent>
                </Sheet>

                <Button variant="outline" onClick={() => router.push('/admin/booking-approvals')} className="hidden sm:flex mr-2">
                  Booking Approvals
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
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'calendar' | 'advanced-calendar' | 'list')}>
                <div className="flex items-center justify-between mb-6">
                  <TabsList>
                    <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                    <TabsTrigger value="advanced-calendar">Advanced Calendar</TabsTrigger>
                    <TabsTrigger value="list">List View</TabsTrigger>
                  </TabsList>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 max-w-sm">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search appointments..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <TabsContent value="calendar" className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <div></div>
                    <Button onClick={() => setShowBookingDialog(true)} className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Create Booking
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {/* Calendar */}
                    <div className="md:col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Booking Calendar
                          </CardTitle>
                          <CardDescription>
                            Click on a date to view appointments. Appointments from both website and mobile are shown.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <CalendarComponent
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md border"
                            modifiers={{
                              hasAppointments: (date) => getAppointmentsForDate(date).length > 0
                            }}
                            modifiersStyles={{
                              hasAppointments: {
                                backgroundColor: 'rgb(59 130 246 / 0.1)',
                                color: 'rgb(59 130 246)',
                                fontWeight: 'bold'
                              }
                            }}
                          />
                        </CardContent>
                      </Card>
                    </div>

                    {/* Selected Date Appointments */}
                    <div className="md:col-span-1">
                      <Card className="h-fit">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base md:text-lg">
                            {selectedDate ? selectedDate.toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'Select a date'}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {selectedDate && `${getAppointmentsForDate(selectedDate).length} appointment(s)`}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {selectedDate && (
                            <div className="space-y-2 md:space-y-3">
                              {getAppointmentsForDate(selectedDate).map((appointment) => (
                                <div
                                  key={appointment.id}
                                  className="p-2 md:p-3 border rounded-lg cursor-pointer"
                                  onClick={() => handleAppointmentClick(appointment)}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-1 md:gap-2">
                                      <span className="font-medium text-xs md:text-sm">{appointment.time}</span>
                                      <div className={`flex items-center gap-1 ${getSourceColor(appointment.source)}`}>
                                        {getSourceIcon(appointment.source)}
                                        <span className="text-xs capitalize hidden sm:inline">{appointment.source}</span>
                                      </div>
                                    </div>
                                    <Badge className={`${getStatusColor(appointment.status)} border text-xs`}>
                                      {appointment.status}
                                    </Badge>
                                  </div>
                                  <div className="text-xs md:text-sm">
                                    <p className="font-medium truncate">{appointment.customer}</p>
                                    <p className="text-gray-600 truncate">{appointment.service}</p>
                                    <p className="text-gray-500 text-xs truncate">with {appointment.barber}</p>
                                  </div>
                                </div>
                              ))}
                              {getAppointmentsForDate(selectedDate).length === 0 && (
                                <div className="text-center py-6 md:py-8 text-gray-500">
                                  <Calendar className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">No appointments scheduled</p>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="advanced-calendar" className="space-y-6">
                  <AdvancedCalendar
                    appointments={appointments}
                    onAppointmentClick={handleAppointmentClick}
                    onStatusChange={handleStatusChange}
                    onCreateBooking={handleCreateBooking}
                  />
                </TabsContent>

                <TabsContent value="list" className="space-y-6">
                  {/* Appointments List */}
                  <div className="space-y-4">
                    {filteredAppointments.map((appointment) => (
                      <Card key={appointment.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-secondary" />
                              </div>
                              <div>
                                <CardTitle className="text-lg text-primary flex items-center gap-2">
                                  {appointment.customer}
                                  <div className={`flex items-center gap-1 ${getSourceColor(appointment.source)}`}>
                                    {getSourceIcon(appointment.source)}
                                    <span className="text-xs capitalize">{appointment.source}</span>
                                  </div>
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-1">
                                  <span>{appointment.service}</span>
                                  <span>•</span>
                                  <span>{appointment.barber}</span>
                                  <span>•</span>
                                  <span>{appointment.branch}</span>
                                </CardDescription>
                              </div>
                            </div>
                            <Badge className={`${getStatusColor(appointment.status)} border flex items-center gap-1`}>
                              {getStatusIcon(appointment.status)}
                              {appointment.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{appointment.date} at {appointment.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{appointment.duration}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-semibold text-secondary">
                              <span>${appointment.price}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span>{appointment.phone}</span>
                            </div>
                          </div>
                          {appointment.notes && (
                            <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded">
                              <strong>Notes:</strong> {appointment.notes}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>Created: {new Date(appointment.createdAt).toLocaleDateString()}</span>
                              <span>Updated: {new Date(appointment.updatedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleAppointmentClick(appointment)}>
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              {appointment.status === 'scheduled' && (
                                <>
                                  <Button size="sm" variant="outline">
                                    Reschedule
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              )}
                              {appointment.status === 'in-progress' && (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleStatusChange(appointment.id, 'completed')}
                                >
                                  Mark Complete
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredAppointments.length === 0 && (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No appointments found</h3>
                      <p className="text-gray-500">Try adjusting your filters or search query</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Details Sheet */}
      <Sheet open={showAppointmentDetails} onOpenChange={setShowAppointmentDetails}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              Appointment Details
              {selectedAppointment && (
                <div className={`flex items-center gap-1 ${getSourceColor(selectedAppointment.source)}`}>
                  {getSourceIcon(selectedAppointment.source)}
                  <span className="text-sm capitalize">{selectedAppointment.source}</span>
                </div>
              )}
            </SheetTitle>
            <SheetDescription>
              Complete appointment information and management
            </SheetDescription>
          </SheetHeader>

          {selectedAppointment && (
            <div className="mt-6 space-y-6">
              {/* Customer Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <p className="text-sm text-gray-900">{selectedAppointment.customer}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm text-gray-900">{selectedAppointment.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedAppointment.email}</p>
                  </div>
                </div>
              </div>

              {/* Appointment Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Appointment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Service</label>
                    <p className="text-sm text-gray-900">{selectedAppointment.service}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Barber</label>
                    <p className="text-sm text-gray-900">{selectedAppointment.barber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Date & Time</label>
                    <p className="text-sm text-gray-900">{selectedAppointment.date} at {selectedAppointment.time}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Duration</label>
                    <p className="text-sm text-gray-900">{selectedAppointment.duration}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Price</label>
                    <p className="text-sm font-semibold text-secondary">${selectedAppointment.price}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <Badge className={`${getStatusColor(selectedAppointment.status)} border`}>
                      {selectedAppointment.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedAppointment.notes && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <Textarea
                    value={selectedAppointment.notes}
                    readOnly
                    className="min-h-[80px]"
                  />
                </div>
              )}

              {/* Timestamps */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Timestamps</label>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Created: {new Date(selectedAppointment.createdAt).toLocaleString()}</p>
                  <p>Last Updated: {new Date(selectedAppointment.updatedAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Appointment
                </Button>
                {selectedAppointment.status === 'scheduled' && (
                  <>
                    <Button variant="outline" className="flex-1">
                      Reschedule
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleStatusChange(selectedAppointment.id, 'cancelled')}
                    >
                      Cancel
                    </Button>
                  </>
                )}
                {selectedAppointment.status === 'in-progress' && (
                  <Button
                    className="bg-green-600 hover:bg-green-700 flex-1"
                    onClick={() => handleStatusChange(selectedAppointment.id, 'completed')}
                  >
                    Mark Complete
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Booking Creation Dialog */}
      <Sheet open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <SheetContent className="sm:max-w-[900px] w-full z-[60] overflow-y-auto">
          <SheetHeader className="border-b pb-4 mb-6">
            <SheetTitle className="text-xl font-semibold">Create New Booking</SheetTitle>
            <SheetDescription className="text-base">
              Schedule a new appointment for a customer.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 pb-6">
            {/* Customer Information */}
            <div className="space-y-6 p-6 bg-gray-50/50 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Customer Information
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Customer Name *</label>
                  <Input
                    placeholder="Enter customer name"
                    value={bookingData.customer}
                    onChange={(e) => setBookingData({...bookingData, customer: e.target.value})}
                    className="h-11"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <Input
                      placeholder="(555) 123-4567"
                      value={bookingData.phone}
                      onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <Input
                      type="email"
                      placeholder="customer@email.com"
                      value={bookingData.email}
                      onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
                      className="h-11"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div className="space-y-6 p-6 bg-gray-50/50 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-primary" />
                Service Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Service *</label>
                  <Select value={bookingData.service} onValueChange={(value) => setBookingData({...bookingData, service: value})}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Classic Haircut">Classic Haircut - $35</SelectItem>
                      <SelectItem value="Beard Trim & Shape">Beard Trim & Shape - $25</SelectItem>
                      <SelectItem value="Premium Package">Premium Package - $85</SelectItem>
                      <SelectItem value="Haircut & Style">Haircut & Style - $50</SelectItem>
                      <SelectItem value="Hair Coloring">Hair Coloring - $120</SelectItem>
                      <SelectItem value="Facial Treatment">Facial Treatment - $75</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Barber *</label>
                  <Select value={bookingData.barber} onValueChange={(value) => setBookingData({...bookingData, barber: value})}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select a barber" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                      <SelectItem value="Alex Rodriguez">Alex Rodriguez</SelectItem>
                      <SelectItem value="Sarah Chen">Sarah Chen</SelectItem>
                      <SelectItem value="David Kim">David Kim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="space-y-6 p-6 bg-gray-50/50 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Products
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Product</label>
                    <Select onValueChange={(value) => {
                      const product = mockProducts.find(p => p.name === value);
                      if (product) {
                        setBookingData(prev => ({
                          ...prev,
                          products: [...prev.products, { ...product, quantity: 1 }]
                        }));
                      }
                    }}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Add product" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockProducts.map((product) => (
                          <SelectItem key={product.name} value={product.name}>
                            {product.name} - {product.category} - ${product.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Quantity</label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="1"
                      className="h-11"
                      onChange={(e) => {
                        // This would update the last added product's quantity
                        // For simplicity, we'll handle this in a more complete implementation
                      }}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 w-full"
                      onClick={() => {
                        // Add product logic would go here
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>

                {/* Selected Products List */}
                {bookingData.products.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Selected Products</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {bookingData.products.map((product, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{product.name}</div>
                            <div className="text-xs text-gray-500">{product.category}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">${product.price}</span>
                            <span className="text-sm text-gray-500">x{product.quantity}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setBookingData(prev => ({
                                  ...prev,
                                  products: prev.products.filter((_, i) => i !== index)
                                }));
                              }}
                            >
                              <XCircle className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-6 p-6 bg-gray-50/50 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Pricing & Charges
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tax (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={bookingData.tax}
                    onChange={(e) => setBookingData({...bookingData, tax: parseFloat(e.target.value) || 0})}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Service Charges ($)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={bookingData.serviceCharges}
                    onChange={(e) => setBookingData({...bookingData, serviceCharges: parseFloat(e.target.value) || 0})}
                    className="h-11"
                  />
                </div>
              </div>

              {/* Price Summary */}
              <div className="mt-4 p-4 bg-white rounded border">
                <h4 className="font-medium text-gray-900 mb-3">Price Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Service:</span>
                    <span>${getServicePrice(bookingData.service)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Products:</span>
                    <span>${bookingData.products.reduce((sum, p) => sum + (p.price * p.quantity), 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Charges:</span>
                    <span>${bookingData.serviceCharges}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({bookingData.tax}%):</span>
                    <span>${calculateTax()}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${calculateTotal()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-6 p-6 bg-gray-50/50 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Booking Status
              </h3>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select value={bookingData.status} onValueChange={(value) => setBookingData({...bookingData, status: value})}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rescheduled">Rescheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date & Time */}
            <div className="space-y-6 p-6 bg-gray-50/50 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Date & Time
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Date *</label>
                  <Input
                    type="date"
                    value={bookingData.date}
                    onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Time *</label>
                  <Input
                    type="time"
                    value={bookingData.time}
                    onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            {/* Invoice Generation */}
            <div className="space-y-6 p-6 bg-gray-50/50 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                Invoice Options
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="generateInvoice" className="text-sm font-medium text-gray-700">
                    Generate invoice automatically after booking
                  </label>
                  <Switch
                    id="generateInvoice"
                    checked={bookingData.generateInvoice}
                    onCheckedChange={(checked) => setBookingData({...bookingData, generateInvoice: checked})}
                  />
                </div>

                {bookingData.generateInvoice && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Receipt className="w-4 h-4" />
                      <span className="text-sm font-medium">Invoice will be generated with:</span>
                    </div>
                    <ul className="mt-2 text-sm text-blue-700 space-y-1">
                      <li>• Customer details and booking information</li>
                      <li>• Itemized services and products</li>
                      <li>• Tax calculation and total amount</li>
                      <li>• Payment terms and due date</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-6 p-6 bg-gray-50/50 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Additional Notes
              </h3>

              <div className="space-y-2">
                <Textarea
                  placeholder="Any special requests or notes..."
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                  className="min-h-[100px] resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-8 border-t bg-white px-6 py-4 -mx-6 -mb-6">
            <Button variant="outline" onClick={() => setShowBookingDialog(false)} className="px-6 h-11">
              Cancel
            </Button>
            <Button onClick={handleSubmitBooking} className="px-6 h-11 bg-primary hover:bg-primary/90">
              Create Booking
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </ProtectedRoute>
  );
}