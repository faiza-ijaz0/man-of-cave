'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Edit, Download, Upload, Search, Mail, Phone, DollarSign, Gift, ShoppingCart, Calendar, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  spendingAmount: number;
  totalOrders: number;
  totalBookings: number;
  membershipTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  registrationDate: string;
  lastBookingDate?: string;
  address?: string;
  notes?: string;
}

interface ClientsManagementProps {
  role?: 'admin' | 'super_admin';
}

const MEMBERSHIP_COLORS = {
  bronze: 'bg-orange-100 text-orange-800',
  silver: 'bg-gray-100 text-gray-800',
  gold: 'bg-yellow-100 text-yellow-800',
  platinum: 'bg-blue-100 text-blue-800'
};

export default function ClientsManagement({ role = 'super_admin' }: ClientsManagementProps) {
  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '(555) 123-4567',
      loyaltyPoints: 2500,
      spendingAmount: 1250,
      totalOrders: 8,
      totalBookings: 5,
      membershipTier: 'gold',
      registrationDate: '2024-03-15',
      lastBookingDate: '2026-01-02',
      address: '123 Main St, New York, NY',
      notes: 'VIP customer, prefers evening appointments'
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '(555) 234-5678',
      loyaltyPoints: 1800,
      spendingAmount: 890,
      totalOrders: 6,
      totalBookings: 4,
      membershipTier: 'silver',
      registrationDate: '2024-06-20',
      lastBookingDate: '2025-12-28',
      address: '456 Oak Ave, Boston, MA',
      notes: 'Interested in new services'
    },
    {
      id: '3',
      firstName: 'Michael',
      lastName: 'Johnson',
      email: 'michael.j@example.com',
      phone: '(555) 345-6789',
      loyaltyPoints: 900,
      spendingAmount: 450,
      totalOrders: 3,
      totalBookings: 2,
      membershipTier: 'bronze',
      registrationDate: '2025-01-10',
      lastBookingDate: '2026-01-01',
      address: '789 Pine Rd, Chicago, IL'
    },
    {
      id: '4',
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.w@example.com',
      phone: '(555) 456-7890',
      loyaltyPoints: 5000,
      spendingAmount: 3200,
      totalOrders: 15,
      totalBookings: 12,
      membershipTier: 'platinum',
      registrationDate: '2023-11-05',
      lastBookingDate: '2025-12-30',
      address: '321 Elm St, Los Angeles, CA',
      notes: 'Long-time customer, refer other clients'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMembership, setFilterMembership] = useState('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  // Filter clients
  const filteredClients = clients.filter(client => {
    const searchMatch = 
      client.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery);
    
    const membershipMatch = filterMembership === 'all' || client.membershipTier === filterMembership;
    
    return searchMatch && membershipMatch;
  });

  // Calculate metrics
  const totalClients = clients.length;
  const totalSpending = clients.reduce((sum, c) => sum + c.spendingAmount, 0);
  const totalLoyaltyPoints = clients.reduce((sum, c) => sum + c.loyaltyPoints, 0);
  const avgOrderValue = clients.length > 0 ? (totalSpending / clients.reduce((sum, c) => sum + c.totalOrders, 0)) : 0;

  const handleAddClient = () => {
    if (!newClient.firstName || !newClient.lastName || !newClient.email || !newClient.phone) return;

    const client: Client = {
      id: Date.now().toString(),
      firstName: newClient.firstName,
      lastName: newClient.lastName,
      email: newClient.email,
      phone: newClient.phone,
      address: newClient.address,
      notes: newClient.notes,
      loyaltyPoints: 0,
      spendingAmount: 0,
      totalOrders: 0,
      totalBookings: 0,
      membershipTier: 'bronze',
      registrationDate: new Date().toISOString().split('T')[0]
    };

    setClients([...clients, client]);
    setNewClient({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      notes: ''
    });
  };

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
  };

  const handleExportClients = () => {
    const csv = [
      ['First Name', 'Last Name', 'Email', 'Phone', 'Loyalty Points', 'Spending Amount', 'Total Orders', 'Total Bookings', 'Membership Tier', 'Registration Date', 'Last Booking Date', 'Address', 'Notes'],
      ...filteredClients.map(c => [
        c.firstName,
        c.lastName,
        c.email,
        c.phone,
        c.loyaltyPoints,
        c.spendingAmount,
        c.totalOrders,
        c.totalBookings,
        c.membershipTier,
        c.registrationDate,
        c.lastBookingDate || '',
        c.address || '',
        c.notes || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `clients-export-${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleImportClients = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
        
        const importedClients: Client[] = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.replace(/"/g, ''));
          return {
            id: Date.now().toString() + index,
            firstName: values[0] || '',
            lastName: values[1] || '',
            email: values[2] || '',
            phone: values[3] || '',
            loyaltyPoints: parseInt(values[4]) || 0,
            spendingAmount: parseFloat(values[5]) || 0,
            totalOrders: parseInt(values[6]) || 0,
            totalBookings: parseInt(values[7]) || 0,
            membershipTier: (values[8] || 'bronze') as any,
            registrationDate: values[9] || new Date().toISOString().split('T')[0],
            lastBookingDate: values[10] || undefined,
            address: values[11] || undefined,
            notes: values[12] || undefined
          };
        });

        setClients([...clients, ...importedClients.filter(c => c.firstName)]);
      } catch (error) {
        console.error('Error importing clients:', error);
        alert('Error importing file. Please ensure it\'s a valid CSV.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm rounded-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Clients</p>
                <p className="text-3xl font-serif font-bold text-primary">{totalClients}</p>
              </div>
              <ShoppingCart className="w-12 h-12 text-secondary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Spending</p>
                <p className="text-3xl font-serif font-bold text-primary">${totalSpending.toLocaleString()}</p>
              </div>
              <DollarSign className="w-12 h-12 text-secondary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Loyalty Points</p>
                <p className="text-3xl font-serif font-bold text-primary">{totalLoyaltyPoints.toLocaleString()}</p>
              </div>
              <Gift className="w-12 h-12 text-secondary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Avg Order Value</p>
                <p className="text-3xl font-serif font-bold text-primary">${avgOrderValue.toFixed(2)}</p>
              </div>
              <ShoppingCart className="w-12 h-12 text-secondary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-lg border-gray-200"
          />
          <select
            value={filterMembership}
            onChange={(e) => setFilterMembership(e.target.value)}
            className="w-40 px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="all">All Tiers</option>
            <option value="bronze">Bronze</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
            <option value="platinum">Platinum</option>
          </select>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleExportClients}
            variant="outline"
            className="border-gray-200 rounded-lg flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button
            variant="outline"
            className="border-gray-200 rounded-lg flex items-center gap-2"
            asChild
          >
            <label className="cursor-pointer flex items-center gap-2">
              <Upload className="w-4 h-4" /> Import
              <input
                type="file"
                accept=".csv"
                onChange={handleImportClients}
                className="hidden"
              />
            </label>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button className="bg-secondary hover:bg-secondary/90 text-primary rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Client
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add New Client</SheetTitle>
                <SheetDescription>
                  Create a new client record
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <div>
                  <Label className="text-xs font-bold uppercase">First Name</Label>
                  <Input
                    placeholder="First name"
                    value={newClient.firstName}
                    onChange={(e) => setNewClient({...newClient, firstName: e.target.value})}
                    className="mt-1 rounded-lg"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase">Last Name</Label>
                  <Input
                    placeholder="Last name"
                    value={newClient.lastName}
                    onChange={(e) => setNewClient({...newClient, lastName: e.target.value})}
                    className="mt-1 rounded-lg"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase">Email</Label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    className="mt-1 rounded-lg"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase">Phone</Label>
                  <Input
                    placeholder="(555) 123-4567"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    className="mt-1 rounded-lg"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase">Address</Label>
                  <Input
                    placeholder="Street address"
                    value={newClient.address}
                    onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                    className="mt-1 rounded-lg"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase">Notes</Label>
                  <textarea
                    placeholder="Any additional notes..."
                    value={newClient.notes}
                    onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                    className="mt-1 rounded-lg w-full border border-gray-200 p-2 text-sm"
                  />
                </div>
                <Button
                  onClick={handleAddClient}
                  className="w-full bg-secondary hover:bg-secondary/90 text-primary rounded-lg font-bold"
                >
                  Add Client
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Clients Table */}
      <Card className="border-none shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-gray-50">
          <CardTitle className="text-lg font-serif">All Clients ({filteredClients.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-600">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-600">Contact</th>
                  <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-widest text-gray-600">Tier</th>
                  <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-widest text-gray-600">Spending</th>
                  <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-widest text-gray-600">Points</th>
                  <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-widest text-gray-600">Orders</th>
                  <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-widest text-gray-600">Bookings</th>
                  <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-widest text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                      No clients found
                    </td>
                  </tr>
                ) : (
                  filteredClients.map(client => (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold">{client.firstName} {client.lastName}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{client.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{client.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge className={cn(MEMBERSHIP_COLORS[client.membershipTier], 'rounded-full')}>
                          {client.membershipTier}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-green-600">
                        ${client.spendingAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-primary">
                        {client.loyaltyPoints.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-semibold">
                        {client.totalOrders}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-semibold">
                        {client.totalBookings}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedClient(client)}
                                className="text-secondary hover:bg-secondary/10 rounded-lg"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent className="overflow-y-auto">
                              <SheetHeader>
                                <SheetTitle>Client Details</SheetTitle>
                              </SheetHeader>
                              {selectedClient && (
                                <div className="space-y-6 mt-6">
                                  <div>
                                    <h3 className="font-bold text-lg mb-4">{selectedClient.firstName} {selectedClient.lastName}</h3>
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Email</p>
                                          <p className="text-sm font-semibold">{selectedClient.email}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Phone</p>
                                          <p className="text-sm font-semibold">{selectedClient.phone}</p>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Address</p>
                                          <p className="text-sm font-semibold">{selectedClient.address || 'N/A'}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Membership Tier</p>
                                          <Badge className={cn(MEMBERSHIP_COLORS[selectedClient.membershipTier], 'rounded-full')}>
                                            {selectedClient.membershipTier}
                                          </Badge>
                                        </div>
                                      </div>

                                      <div className="border-t pt-4">
                                        <h4 className="font-bold mb-3">Activity & Metrics</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                                            <p className="text-xs font-bold uppercase text-muted-foreground">Total Spending</p>
                                            <p className="text-2xl font-bold text-primary mt-1">${selectedClient.spendingAmount.toLocaleString()}</p>
                                          </div>
                                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                                            <p className="text-xs font-bold uppercase text-muted-foreground">Loyalty Points</p>
                                            <p className="text-2xl font-bold text-purple-600 mt-1">{selectedClient.loyaltyPoints.toLocaleString()}</p>
                                          </div>
                                          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                                            <p className="text-xs font-bold uppercase text-muted-foreground">Total Orders</p>
                                            <p className="text-2xl font-bold text-green-600 mt-1">{selectedClient.totalOrders}</p>
                                          </div>
                                          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                                            <p className="text-xs font-bold uppercase text-muted-foreground">Bookings</p>
                                            <p className="text-2xl font-bold text-orange-600 mt-1">{selectedClient.totalBookings}</p>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="border-t pt-4">
                                        <div>
                                          <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Registration Date</p>
                                          <p className="text-sm font-semibold">{selectedClient.registrationDate}</p>
                                        </div>
                                        <div className="mt-3">
                                          <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Last Booking</p>
                                          <p className="text-sm font-semibold">{selectedClient.lastBookingDate || 'No bookings yet'}</p>
                                        </div>
                                        {selectedClient.notes && (
                                          <div className="mt-3">
                                            <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Notes</p>
                                            <p className="text-sm">{selectedClient.notes}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </SheetContent>
                          </Sheet>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditClient(client)}
                            className="text-secondary hover:bg-secondary/10 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteClient(client.id)}
                            className="text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
