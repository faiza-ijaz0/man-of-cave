// 'use client';

// import { useState } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Separator } from "@/components/ui/separator";
// import { Settings, User, Bell, Shield, Palette, Database, Mail, Phone, MapPin, Clock, Save, RefreshCw } from "lucide-react";
// import ProtectedRoute from "@/components/ProtectedRoute";
// import { AdminSidebar, AdminMobileSidebar } from "@/components/admin/AdminSidebar";
// import { cn } from "@/lib/utils";
// import { useAuth } from "@/contexts/AuthContext";
// import { useRouter } from "next/navigation";

// export default function SuperAdminSettings() {
//   const { user, logout } = useAuth();
//   const router = useRouter();
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const handleLogout = () => {
//     logout();
//     router.push('/login');
//   };

//   const [settings, setSettings] = useState({
//     // General Settings
//     businessName: "Luxury Barbershop Chain",
//     businessEmail: "admin@luxurybarbershop.com",
//     businessPhone: "+1 (555) 123-4567",
//     businessAddress: "123 Main Street, Suite 100",
//     businessCity: "New York",
//     businessState: "NY",
//     businessZip: "10001",
//     timezone: "America/New_York",
//     currency: "USD",

//     // Notification Settings
//     emailNotifications: true,
//     smsNotifications: false,
//     pushNotifications: true,
//     bookingReminders: true,
//     paymentNotifications: true,
//     systemAlerts: true,

//     // Security Settings
//     twoFactorAuth: false,
//     sessionTimeout: "30",
//     passwordExpiry: "90",
//     loginAttempts: "5",

//     // Appearance Settings
//     theme: "luxury",
//     primaryColor: "#1a1a1a",
//     secondaryColor: "#d4af37",
//     accentColor: "#8b4513",

//     // System Settings
//     autoBackup: true,
//     backupFrequency: "daily",
//     dataRetention: "365",
//     maintenanceMode: false,
//     debugMode: false
//   });

//   const handleSave = () => {
//     // In a real app, this would save to backend
//     console.log('Settings saved:', settings);
//   };

//   const handleInputChange = (field: string, value: any) => {
//     setSettings(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   return (
//     <ProtectedRoute requiredRole="super_admin">
//       <div className="flex h-screen bg-gray-50">
//         {/* Sidebar */}
//         <AdminSidebar role="super_admin" onLogout={handleLogout}
//           isOpen={sidebarOpen}
//           onToggle={() => setSidebarOpen(!sidebarOpen)} />

//         {/* Main Content */}
//         <div className={cn(
//           "flex-1 flex flex-col transition-all duration-300 ease-in-out",
//           sidebarOpen ? "lg:ml-64" : "lg:ml-0"
//         )}>
//           {/* Header */}
//           <header className="bg-white shadow-sm border-b">
//             <div className="flex items-center justify-between px-4 py-4 lg:px-8">
//               <div className="flex items-center gap-4">
//                 <AdminMobileSidebar role="super_admin" onLogout={handleLogout}
//           isOpen={sidebarOpen}
//           onToggle={() => setSidebarOpen(!sidebarOpen)} />
//                 <div>
//                   <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
//                   <p className="text-sm text-gray-600">Configure system-wide settings and preferences</p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-4">
//                 <Button variant="outline">
//                   <RefreshCw className="w-4 h-4 mr-2" />
//                   Reset
//                 </Button>
//                 <Button onClick={handleSave}>
//                   <Save className="w-4 h-4 mr-2" />
//                   Save Changes
//                 </Button>
//                 <span className="text-sm text-gray-600 hidden sm:block">Welcome, {user?.email}</span>
//                 <Button variant="outline" onClick={handleLogout} className="hidden sm:flex">
//                   Logout
//                 </Button>
//               </div>
//             </div>
//           </header>

//           {/* Content */}
//           <div className="flex-1 overflow-auto">
//             <div className="p-4 lg:p-8">
//               <Tabs defaultValue="general" className="space-y-6">
//                 <TabsList className="grid w-full grid-cols-5">
//                   <TabsTrigger value="general" className="flex items-center gap-2">
//                     <Settings className="w-4 h-4" />
//                     General
//                   </TabsTrigger>
//                   <TabsTrigger value="notifications" className="flex items-center gap-2">
//                     <Bell className="w-4 h-4" />
//                     Notifications
//                   </TabsTrigger>
//                   <TabsTrigger value="security" className="flex items-center gap-2">
//                     <Shield className="w-4 h-4" />
//                     Security
//                   </TabsTrigger>
//                   <TabsTrigger value="appearance" className="flex items-center gap-2">
//                     <Palette className="w-4 h-4" />
//                     Appearance
//                   </TabsTrigger>
//                   <TabsTrigger value="system" className="flex items-center gap-2">
//                     <Database className="w-4 h-4" />
//                     System
//                   </TabsTrigger>
//                 </TabsList>

//                 {/* General Settings */}
//                 <TabsContent value="general">
//                   <Card>
//                     <CardHeader>
//                       <CardTitle>Business Information</CardTitle>
//                       <CardDescription>Basic business details and contact information</CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-6">
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div className="space-y-2">
//                           <Label htmlFor="businessName">Business Name</Label>
//                           <Input
//                             id="businessName"
//                             value={settings.businessName}
//                             onChange={(e) => handleInputChange('businessName', e.target.value)}
//                           />
//                         </div>
//                         <div className="space-y-2">
//                           <Label htmlFor="businessEmail">Business Email</Label>
//                           <Input
//                             id="businessEmail"
//                             type="email"
//                             value={settings.businessEmail}
//                             onChange={(e) => handleInputChange('businessEmail', e.target.value)}
//                           />
//                         </div>
//                         <div className="space-y-2">
//                           <Label htmlFor="businessPhone">Business Phone</Label>
//                           <Input
//                             id="businessPhone"
//                             value={settings.businessPhone}
//                             onChange={(e) => handleInputChange('businessPhone', e.target.value)}
//                           />
//                         </div>
//                         <div className="space-y-2">
//                           <Label htmlFor="timezone">Timezone</Label>
//                           <Select value={settings.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
//                             <SelectTrigger>
//                               <SelectValue />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="America/New_York">Eastern Time</SelectItem>
//                               <SelectItem value="America/Chicago">Central Time</SelectItem>
//                               <SelectItem value="America/Denver">Mountain Time</SelectItem>
//                               <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
//                             </SelectContent>
//                           </Select>
//                         </div>
//                       </div>

//                       <Separator />

//                       <div className="space-y-4">
//                         <h3 className="text-lg font-medium">Business Address</h3>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                           <div className="space-y-2">
//                             <Label htmlFor="businessAddress">Street Address</Label>
//                             <Input
//                               id="businessAddress"
//                               value={settings.businessAddress}
//                               onChange={(e) => handleInputChange('businessAddress', e.target.value)}
//                             />
//                           </div>
//                           <div className="space-y-2">
//                             <Label htmlFor="businessCity">City</Label>
//                             <Input
//                               id="businessCity"
//                               value={settings.businessCity}
//                               onChange={(e) => handleInputChange('businessCity', e.target.value)}
//                             />
//                           </div>
//                           <div className="space-y-2">
//                             <Label htmlFor="businessState">State</Label>
//                             <Input
//                               id="businessState"
//                               value={settings.businessState}
//                               onChange={(e) => handleInputChange('businessState', e.target.value)}
//                             />
//                           </div>
//                           <div className="space-y-2">
//                             <Label htmlFor="businessZip">ZIP Code</Label>
//                             <Input
//                               id="businessZip"
//                               value={settings.businessZip}
//                               onChange={(e) => handleInputChange('businessZip', e.target.value)}
//                             />
//                           </div>
//                         </div>
//                       </div>

//                       <Separator />

//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div className="space-y-2">
//                           <Label htmlFor="currency">Currency</Label>
//                           <Select value={settings.currency} onValueChange={(value) => handleInputChange('currency', value)}>
//                             <SelectTrigger>
//                               <SelectValue />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="USD">USD ($)</SelectItem>
//                               <SelectItem value="EUR">EUR (€)</SelectItem>
//                               <SelectItem value="GBP">GBP (£)</SelectItem>
//                               <SelectItem value="CAD">CAD (C$)</SelectItem>
//                             </SelectContent>
//                           </Select>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 {/* Notification Settings */}
//                 <TabsContent value="notifications">
//                   <Card>
//                     <CardHeader>
//                       <CardTitle>Notification Preferences</CardTitle>
//                       <CardDescription>Configure how and when you receive notifications</CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-6">
//                       <div className="space-y-4">
//                         <div className="flex items-center justify-between">
//                           <div className="space-y-0.5">
//                             <Label>Email Notifications</Label>
//                             <p className="text-sm text-gray-600">Receive notifications via email</p>
//                           </div>
//                           <Switch
//                             checked={settings.emailNotifications}
//                             onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
//                           />
//                         </div>

//                         <div className="flex items-center justify-between">
//                           <div className="space-y-0.5">
//                             <Label>SMS Notifications</Label>
//                             <p className="text-sm text-gray-600">Receive notifications via SMS</p>
//                           </div>
//                           <Switch
//                             checked={settings.smsNotifications}
//                             onCheckedChange={(checked) => handleInputChange('smsNotifications', checked)}
//                           />
//                         </div>

//                         <div className="flex items-center justify-between">
//                           <div className="space-y-0.5">
//                             <Label>Push Notifications</Label>
//                             <p className="text-sm text-gray-600">Receive push notifications in browser</p>
//                           </div>
//                           <Switch
//                             checked={settings.pushNotifications}
//                             onCheckedChange={(checked) => handleInputChange('pushNotifications', checked)}
//                           />
//                         </div>
//                       </div>

//                       <Separator />

//                       <div className="space-y-4">
//                         <h3 className="text-lg font-medium">Notification Types</h3>

//                         <div className="flex items-center justify-between">
//                           <div className="space-y-0.5">
//                             <Label>Booking Reminders</Label>
//                             <p className="text-sm text-gray-600">Notify about upcoming appointments</p>
//                           </div>
//                           <Switch
//                             checked={settings.bookingReminders}
//                             onCheckedChange={(checked) => handleInputChange('bookingReminders', checked)}
//                           />
//                         </div>

//                         <div className="flex items-center justify-between">
//                           <div className="space-y-0.5">
//                             <Label>Payment Notifications</Label>
//                             <p className="text-sm text-gray-600">Notify about payment activities</p>
//                           </div>
//                           <Switch
//                             checked={settings.paymentNotifications}
//                             onCheckedChange={(checked) => handleInputChange('paymentNotifications', checked)}
//                           />
//                         </div>

//                         <div className="flex items-center justify-between">
//                           <div className="space-y-0.5">
//                             <Label>System Alerts</Label>
//                             <p className="text-sm text-gray-600">Notify about system issues and updates</p>
//                           </div>
//                           <Switch
//                             checked={settings.systemAlerts}
//                             onCheckedChange={(checked) => handleInputChange('systemAlerts', checked)}
//                           />
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 {/* Security Settings */}
//                 <TabsContent value="security">
//                   <Card>
//                     <CardHeader>
//                       <CardTitle>Security Configuration</CardTitle>
//                       <CardDescription>Manage security settings and access controls</CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-6">
//                       <div className="space-y-4">
//                         <div className="flex items-center justify-between">
//                           <div className="space-y-0.5">
//                             <Label>Two-Factor Authentication</Label>
//                             <p className="text-sm text-gray-600">Require 2FA for all admin accounts</p>
//                           </div>
//                           <Switch
//                             checked={settings.twoFactorAuth}
//                             onCheckedChange={(checked) => handleInputChange('twoFactorAuth', checked)}
//                           />
//                         </div>
//                       </div>

//                       <Separator />

//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div className="space-y-2">
//                           <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
//                           <Select value={settings.sessionTimeout} onValueChange={(value) => handleInputChange('sessionTimeout', value)}>
//                             <SelectTrigger>
//                               <SelectValue />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="15">15 minutes</SelectItem>
//                               <SelectItem value="30">30 minutes</SelectItem>
//                               <SelectItem value="60">1 hour</SelectItem>
//                               <SelectItem value="120">2 hours</SelectItem>
//                             </SelectContent>
//                           </Select>
//                         </div>

//                         <div className="space-y-2">
//                           <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
//                           <Select value={settings.passwordExpiry} onValueChange={(value) => handleInputChange('passwordExpiry', value)}>
//                             <SelectTrigger>
//                               <SelectValue />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="30">30 days</SelectItem>
//                               <SelectItem value="60">60 days</SelectItem>
//                               <SelectItem value="90">90 days</SelectItem>
//                               <SelectItem value="180">180 days</SelectItem>
//                             </SelectContent>
//                           </Select>
//                         </div>

//                         <div className="space-y-2">
//                           <Label htmlFor="loginAttempts">Max Login Attempts</Label>
//                           <Select value={settings.loginAttempts} onValueChange={(value) => handleInputChange('loginAttempts', value)}>
//                             <SelectTrigger>
//                               <SelectValue />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="3">3 attempts</SelectItem>
//                               <SelectItem value="5">5 attempts</SelectItem>
//                               <SelectItem value="10">10 attempts</SelectItem>
//                             </SelectContent>
//                           </Select>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 {/* Appearance Settings */}
//                 <TabsContent value="appearance">
//                   <Card>
//                     <CardHeader>
//                       <CardTitle>Appearance & Branding</CardTitle>
//                       <CardDescription>Customize the look and feel of your system</CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-6">
//                       <div className="space-y-4">
//                         <div className="space-y-2">
//                           <Label htmlFor="theme">Theme</Label>
//                           <Select value={settings.theme} onValueChange={(value) => handleInputChange('theme', value)}>
//                             <SelectTrigger>
//                               <SelectValue />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="luxury">Luxury (Gold & Black)</SelectItem>
//                               <SelectItem value="modern">Modern</SelectItem>
//                               <SelectItem value="classic">Classic</SelectItem>
//                               <SelectItem value="minimal">Minimal</SelectItem>
//                             </SelectContent>
//                           </Select>
//                         </div>
//                       </div>

//                       <Separator />

//                       <div className="space-y-4">
//                         <h3 className="text-lg font-medium">Color Scheme</h3>
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                           <div className="space-y-2">
//                             <Label htmlFor="primaryColor">Primary Color</Label>
//                             <Input
//                               id="primaryColor"
//                               type="color"
//                               value={settings.primaryColor}
//                               onChange={(e) => handleInputChange('primaryColor', e.target.value)}
//                               className="w-full h-10"
//                             />
//                           </div>
//                           <div className="space-y-2">
//                             <Label htmlFor="secondaryColor">Secondary Color</Label>
//                             <Input
//                               id="secondaryColor"
//                               type="color"
//                               value={settings.secondaryColor}
//                               onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
//                               className="w-full h-10"
//                             />
//                           </div>
//                           <div className="space-y-2">
//                             <Label htmlFor="accentColor">Accent Color</Label>
//                             <Input
//                               id="accentColor"
//                               type="color"
//                               value={settings.accentColor}
//                               onChange={(e) => handleInputChange('accentColor', e.target.value)}
//                               className="w-full h-10"
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 {/* System Settings */}
//                 <TabsContent value="system">
//                   <Card>
//                     <CardHeader>
//                       <CardTitle>System Configuration</CardTitle>
//                       <CardDescription>Advanced system settings and maintenance options</CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-6">
//                       <div className="space-y-4">
//                         <div className="flex items-center justify-between">
//                           <div className="space-y-0.5">
//                             <Label>Automatic Backups</Label>
//                             <p className="text-sm text-gray-600">Automatically backup system data</p>
//                           </div>
//                           <Switch
//                             checked={settings.autoBackup}
//                             onCheckedChange={(checked) => handleInputChange('autoBackup', checked)}
//                           />
//                         </div>

//                         <div className="flex items-center justify-between">
//                           <div className="space-y-0.5">
//                             <Label>Maintenance Mode</Label>
//                             <p className="text-sm text-gray-600">Put system in maintenance mode</p>
//                           </div>
//                           <Switch
//                             checked={settings.maintenanceMode}
//                             onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
//                           />
//                         </div>

//                         <div className="flex items-center justify-between">
//                           <div className="space-y-0.5">
//                             <Label>Debug Mode</Label>
//                             <p className="text-sm text-gray-600">Enable detailed logging and debugging</p>
//                           </div>
//                           <Switch
//                             checked={settings.debugMode}
//                             onCheckedChange={(checked) => handleInputChange('debugMode', checked)}
//                           />
//                         </div>
//                       </div>

//                       <Separator />

//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div className="space-y-2">
//                           <Label htmlFor="backupFrequency">Backup Frequency</Label>
//                           <Select value={settings.backupFrequency} onValueChange={(value) => handleInputChange('backupFrequency', value)}>
//                             <SelectTrigger>
//                               <SelectValue />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="hourly">Hourly</SelectItem>
//                               <SelectItem value="daily">Daily</SelectItem>
//                               <SelectItem value="weekly">Weekly</SelectItem>
//                               <SelectItem value="monthly">Monthly</SelectItem>
//                             </SelectContent>
//                           </Select>
//                         </div>

//                         <div className="space-y-2">
//                           <Label htmlFor="dataRetention">Data Retention (days)</Label>
//                           <Select value={settings.dataRetention} onValueChange={(value) => handleInputChange('dataRetention', value)}>
//                             <SelectTrigger>
//                               <SelectValue />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="90">90 days</SelectItem>
//                               <SelectItem value="180">180 days</SelectItem>
//                               <SelectItem value="365">1 year</SelectItem>
//                               <SelectItem value="730">2 years</SelectItem>
//                             </SelectContent>
//                           </Select>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>
//               </Tabs>
//             </div>
//           </div>
//         </div>
//       </div>
//     </ProtectedRoute>
//   );
// }

// new code

'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Settings, User, Bell, Shield, Palette, Database, Mail, Phone, MapPin, Clock, Save, RefreshCw, Upload, Image as ImageIcon, X, Link } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AdminSidebar, AdminMobileSidebar } from "@/components/admin/AdminSidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

// Firebase imports
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { toast } from "sonner";

export default function SuperAdminSettings() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoMethod, setLogoMethod] = useState<'upload' | 'url'>('upload'); // New state for logo method
  const [logoUrlInput, setLogoUrlInput] = useState(''); // New state for URL input

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Initial settings state
  const [settings, setSettings] = useState({
    businessName: "",
    businessEmail: "",
    businessPhone: "",
    businessAddress: "",
    businessCity: "",
    businessState: "",
    businessZip: "",
    businessLogo: "",
    businessLogoFile: null as File | null,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    bookingReminders: true,
    paymentNotifications: true,
    systemAlerts: true,
    twoFactorAuth: false,
    sessionTimeout: "30",
    passwordExpiry: "90",
    loginAttempts: "5",
    theme: "luxury",
    primaryColor: "#1a1a1a",
    secondaryColor: "#d4af37",
    accentColor: "#8b4513",
    autoBackup: true,
    backupFrequency: "daily",
    dataRetention: "365",
    maintenanceMode: false,
    debugMode: false
  });

  // Load settings from Firebase on component mount
  useEffect(() => {
    loadSettingsFromFirebase();
  }, []);

  // Firebase se settings load karna
  const loadSettingsFromFirebase = async () => {
    try {
      setLoading(true);
      
      const settingsRef = doc(db, "general", "settings");
      const settingsSnap = await getDoc(settingsRef);
      
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        
        setSettings(prev => ({
          ...prev,
          ...data,
          businessLogoFile: null
        }));
        
        // Agar Firebase se logo URL aa rahi hai to URL method select karein
        if (data.businessLogo) {
          setLogoMethod('url');
          setLogoUrlInput(data.businessLogo);
        }
        
        toast.success("Settings loaded successfully from Firebase");
      } else {
        toast.info("No settings found. Please configure and save.");
      }
    } catch (error) {
      console.error("Error loading settings from Firebase:", error);
      toast.error("Failed to load settings from Firebase");
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection for logo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file (JPG, PNG, etc.)');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      const previewUrl = URL.createObjectURL(file);
      
      setSettings(prev => ({
        ...prev,
        businessLogo: previewUrl,
        businessLogoFile: file
      }));
      
      toast.success('Logo selected. Click Save to upload to Firebase.');
    }
  };

  // Handle URL input for logo
  const handleUrlInputChange = (url: string) => {
    setLogoUrlInput(url);
    
    // Validate URL format
    if (url) {
      try {
        new URL(url); // Check if it's a valid URL
        setSettings(prev => ({
          ...prev,
          businessLogo: url,
          businessLogoFile: null
        }));
      } catch (error) {
        // Invalid URL, don't update the logo
      }
    } else {
      setSettings(prev => ({
        ...prev,
        businessLogo: "",
        businessLogoFile: null
      }));
    }
  };

  // Apply URL as logo
  const applyUrlAsLogo = () => {
    if (!logoUrlInput.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    try {
      // Validate URL
      new URL(logoUrlInput);
      
      setSettings(prev => ({
        ...prev,
        businessLogo: logoUrlInput,
        businessLogoFile: null
      }));
      
      toast.success('Logo URL applied successfully');
    } catch (error) {
      toast.error('Please enter a valid URL (e.g., https://example.com/logo.png)');
    }
  };

  // Remove logo
  const removeLogo = () => {
    setSettings(prev => ({
      ...prev,
      businessLogo: "",
      businessLogoFile: null
    }));
    setLogoUrlInput('');
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Upload image to Firebase Storage
  const uploadImageToFirebase = async (file: File): Promise<string> => {
    try {
      setUploading(true);
      
      if (!storage) {
        throw new Error('Firebase Storage is not initialized.');
      }
      
      const timestamp = Date.now();
      const filename = `business-logo-${timestamp}-${file.name.replace(/\s+/g, '-')}`;
      
      const storageRef = ref(storage, `business-logos/${filename}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('✅ Image uploaded to Firebase Storage:', downloadURL);
      return downloadURL;
    } catch (error: any) {
      console.error('❌ Error uploading image:', error);
      toast.error(`Failed to upload image: ${error.message || 'Unknown error'}`);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // Firebase mein settings save karna - SIMPLIFIED
  const saveSettingsToFirebase = async () => {
    try {
      setSaving(true);
      
      let logoUrl = settings.businessLogo;
      
      // Agar upload method hai aur file hai to upload karein
      if (logoMethod === 'upload' && settings.businessLogoFile) {
        try {
          toast.info('Uploading logo to Firebase Storage...');
          logoUrl = await uploadImageToFirebase(settings.businessLogoFile);
          toast.success('Logo uploaded successfully!');
        } catch (error) {
          toast.error('Failed to upload logo');
          return false;
        }
      }
      // Agar URL method hai to direct use karein
      else if (logoMethod === 'url' && logoUrlInput) {
        logoUrl = logoUrlInput;
      }
      
      // Prepare data for Firebase
      const settingsData = {
        businessName: settings.businessName,
        businessEmail: settings.businessEmail,
        businessPhone: settings.businessPhone,
        businessAddress: settings.businessAddress,
        businessCity: settings.businessCity,
        businessState: settings.businessState,
        businessZip: settings.businessZip,
        businessLogo: logoUrl,
        emailNotifications: settings.emailNotifications,
        smsNotifications: settings.smsNotifications,
        pushNotifications: settings.pushNotifications,
        bookingReminders: settings.bookingReminders,
        paymentNotifications: settings.paymentNotifications,
        systemAlerts: settings.systemAlerts,
        twoFactorAuth: settings.twoFactorAuth,
        sessionTimeout: settings.sessionTimeout,
        passwordExpiry: settings.passwordExpiry,
        loginAttempts: settings.loginAttempts,
        theme: settings.theme,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        accentColor: settings.accentColor,
        autoBackup: settings.autoBackup,
        backupFrequency: settings.backupFrequency,
        dataRetention: settings.dataRetention,
        maintenanceMode: settings.maintenanceMode,
        debugMode: settings.debugMode,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.email || "unknown",
        lastUpdated: new Date().toLocaleString()
      };

      const settingsRef = doc(db, "general", "settings");
      await setDoc(settingsRef, settingsData, { merge: true });
      
      toast.success("✅ All settings saved to Firebase!");
      
      // Reset file reference
      if (logoMethod === 'upload') {
        setSettings(prev => ({ 
          ...prev, 
          businessLogoFile: null,
          businessLogo: logoUrl
        }));
      }
      
      return true;
    } catch (error: any) {
      console.error("❌ Error saving settings to Firebase:", error);
      toast.error(`❌ Failed to save: ${error.message || 'Unknown error'}`);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Save button handler - SIMPLIFIED
  const handleSave = async () => {
    // Validate required fields
    if (!settings.businessName.trim()) {
      toast.error('Business Name is required');
      return;
    }
    
    if (!settings.businessEmail.trim()) {
      toast.error('Business Email is required');
      return;
    }
    
    if (!settings.businessPhone.trim()) {
      toast.error('Business Phone is required');
      return;
    }
    
    // Validate logo based on method
    if (logoMethod === 'upload' && !settings.businessLogoFile && !settings.businessLogo.includes('firebasestorage')) {
      toast.warning('Please select a logo file or switch to URL method');
      return;
    }
    
    if (logoMethod === 'url' && !logoUrlInput.trim()) {
      toast.error('Please enter a logo URL');
      return;
    }
    
    const saved = await saveSettingsToFirebase();
    if (saved) {
      // Success message already shown
    }
  };

  // Reset button handler
  const handleReset = () => {
    loadSettingsFromFirebase();
    toast.info("Settings reset to saved values");
  };

  // Input change handler
  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
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
          "flex-1 flex flex-col transition-all duration-300 ease-in-out",
          sidebarOpen ? "lg:ml-64" : "lg:ml-0"
        )}>
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="flex items-center justify-between px-4 py-4 lg:px-8">
              <div className="flex items-center gap-4">
                <AdminMobileSidebar role="super_admin" onLogout={handleLogout}
                  isOpen={sidebarOpen}
                  onToggle={() => setSidebarOpen(!sidebarOpen)} />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                  <p className="text-sm text-gray-600">Configure system-wide settings and preferences</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleReset} disabled={loading || saving || uploading}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={handleSave} disabled={loading || saving || uploading}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : uploading ? "Uploading..." : "Save to Firebase"}
                </Button>
                <span className="text-sm text-gray-600 hidden sm:block">Welcome, {user?.email}</span>
                <Button variant="outline" onClick={handleLogout} className="hidden sm:flex">
                  Logout
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <div className="p-4 lg:p-8">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading settings from Firebase...</p>
                  </div>
                </div>
              ) : (
                <Tabs defaultValue="general" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="general" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      General
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Notifications
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Security
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Appearance
                    </TabsTrigger>
                    <TabsTrigger value="system" className="flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      System
                    </TabsTrigger>
                  </TabsList>

                  {/* General Settings */}
                  <TabsContent value="general">
                    <Card>
                      <CardHeader>
                        <CardTitle>Business Information</CardTitle>
                        <CardDescription>
                          Basic business details and contact information
                         
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Business Logo Upload Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-base font-medium">Business Logo</Label>
                              <p className="text-sm text-gray-500">Upload image or use external URL</p>
                            </div>
                          </div>
                          
                          {/* Logo Method Selection */}
                          <div className="flex gap-4 mb-4">
                            <Button
                              type="button"
                              variant={logoMethod === 'upload' ? "default" : "outline"}
                              onClick={() => setLogoMethod('upload')}
                              className="gap-2"
                            >
                              <Upload className="w-4 h-4" />
                              Upload Image
                            </Button>
                            <Button
                              type="button"
                              variant={logoMethod === 'url' ? "default" : "outline"}
                              onClick={() => setLogoMethod('url')}
                              className="gap-2"
                            >
                              <Link className="w-4 h-4" />
                              Use URL
                            </Button>
                          </div>
                          
                          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            {/* Logo Preview */}
                            <div className="flex-shrink-0">
                              {settings.businessLogo ? (
                                <div className="relative">
                                  <div className="w-40 h-40 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                                    <img 
                                      src={settings.businessLogo} 
                                      alt="Business Logo" 
                                      className="w-full h-full object-contain"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/160x160?text=Logo+Not+Found';
                                      }}
                                    />
                                  </div>
                                  <button
                                    onClick={removeLogo}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                                    type="button"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="w-40 h-40 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center">
                                  <ImageIcon className="w-12 h-12 text-gray-400" />
                                  <p className="text-sm text-gray-500 mt-2">No logo</p>
                                </div>
                              )}
                            </div>
                            
                            {/* Upload/URL Controls */}
                            <div className="space-y-4">
                              {logoMethod === 'upload' ? (
                                <>
                                  <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/*"
                                    className="hidden"
                                  />
                                  
                                  <div className="space-y-3">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={triggerFileInput}
                                      disabled={uploading}
                                      className="gap-2"
                                    >
                                      <Upload className="w-4 h-4" />
                                      {settings.businessLogo ? 'Change Logo' : 'Select Logo File'}
                                    </Button>
                                    
                                    <div className="space-y-1">
                                      <p className="text-sm text-gray-600">
                                        Supported formats: JPG, PNG, GIF, WebP
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Max file size: 5MB
                                      </p>
                                      {settings.businessLogoFile ? (
                                        <p className="text-sm text-green-600 font-medium">
                                          ✓ New logo selected. Click "Save to Firebase" to upload.
                                        </p>
                                      ) : settings.businessLogo && settings.businessLogo.includes('firebasestorage') ? (
                                        <p className="text-sm text-blue-600 font-medium">
                                          ✓ Logo loaded from Firebase Storage
                                        </p>
                                      ) : null}
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="space-y-3">
                                  <div className="space-y-2">
                                    <Label htmlFor="logoUrl">Logo URL</Label>
                                    <div className="flex gap-2">
                                      <Input
                                        id="logoUrl"
                                        type="url"
                                        value={logoUrlInput}
                                        onChange={(e) => handleUrlInputChange(e.target.value)}
                                        placeholder="https://example.com/logo.png"
                                        className="border-gray-300"
                                      />
                                      <Button
                                        type="button"
                                        onClick={applyUrlAsLogo}
                                        variant="outline"
                                      >
                                        Apply
                                      </Button>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                      Enter direct image URL (JPG, PNG, etc.)
                                    </p>
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <p className="text-sm text-gray-600">
                                      Example URLs:
                                    </p>
                                    <ul className="text-xs text-gray-500 list-disc list-inside">
                                      <li>https://example.com/logo.png</li>
                                      <li>https://imgur.com/abc123.jpg</li>
                                      <li>https://cdn.company.com/logo.svg</li>
                                    </ul>
                                    {logoUrlInput && (
                                      <p className="text-sm text-green-600 font-medium">
                                        ✓ URL entered. Click "Save to Firebase" to save.
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Business Name */}
                          <div className="space-y-2">
                            <Label htmlFor="businessName">
                              Business Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="businessName"
                              value={settings.businessName}
                              onChange={(e) => handleInputChange('businessName', e.target.value)}
                              placeholder="Enter your business name"
                              className="border-gray-300"
                            />
                           
                          </div>

                          {/* Business Email */}
                          <div className="space-y-2">
                            <Label htmlFor="businessEmail">
                              Business Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="businessEmail"
                              type="email"
                              value={settings.businessEmail}
                              onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                              placeholder="contact@yourbusiness.com"
                              className="border-gray-300"
                            />
                           
                          </div>

                          {/* Business Phone */}
                          <div className="space-y-2">
                            <Label htmlFor="businessPhone">
                              Business Phone <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="businessPhone"
                              value={settings.businessPhone}
                              onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                              placeholder="+92 300 1234567"
                              className="border-gray-300"
                            />
                           
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Business Address</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Business Address */}
                            <div className="space-y-2">
                              <Label htmlFor="businessAddress">Street Address</Label>
                              <Input
                                id="businessAddress"
                                value={settings.businessAddress}
                                onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                                placeholder="123 Main Street, Suite 100"
                                className="border-gray-300"
                              />
                             
                            </div>

                            {/* Business City */}
                            <div className="space-y-2">
                              <Label htmlFor="businessCity">City</Label>
                              <Input
                                id="businessCity"
                                value={settings.businessCity}
                                onChange={(e) => handleInputChange('businessCity', e.target.value)}
                                placeholder="Karachi"
                                className="border-gray-300"
                              />
                              
                            </div>

                            {/* Business State */}
                            <div className="space-y-2">
                              <Label htmlFor="businessState">State/Province</Label>
                              <Input
                                id="businessState"
                                value={settings.businessState}
                                onChange={(e) => handleInputChange('businessState', e.target.value)}
                                placeholder="Sindh"
                                className="border-gray-300"
                              />
                              
                            </div>

                            {/* Business ZIP */}
                            <div className="space-y-2">
                              <Label htmlFor="businessZip">ZIP/Postal Code</Label>
                              <Input
                                id="businessZip"
                                value={settings.businessZip}
                                onChange={(e) => handleInputChange('businessZip', e.target.value)}
                                placeholder="75500"
                                className="border-gray-300"
                              />
                              <p className="text-xs text-gray-500">Firebase field: "businessZip"</p>
                            </div>
                          </div>
                        </div>

                        {/* Firebase Information Box */}
                        

                       
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Notification Settings */}
                  <TabsContent value="notifications">
                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Preferences</CardTitle>
                        <CardDescription>Configure how and when you receive notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Email Notifications</Label>
                              <p className="text-sm text-gray-600">Receive notifications via email</p>
                            </div>
                            <Switch
                              checked={settings.emailNotifications}
                              onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>SMS Notifications</Label>
                              <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                            </div>
                            <Switch
                              checked={settings.smsNotifications}
                              onCheckedChange={(checked) => handleInputChange('smsNotifications', checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Push Notifications</Label>
                              <p className="text-sm text-gray-600">Receive push notifications in browser</p>
                            </div>
                            <Switch
                              checked={settings.pushNotifications}
                              onCheckedChange={(checked) => handleInputChange('pushNotifications', checked)}
                            />
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Notification Types</h3>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Booking Reminders</Label>
                              <p className="text-sm text-gray-600">Notify about upcoming appointments</p>
                            </div>
                            <Switch
                              checked={settings.bookingReminders}
                              onCheckedChange={(checked) => handleInputChange('bookingReminders', checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Payment Notifications</Label>
                              <p className="text-sm text-gray-600">Notify about payment activities</p>
                            </div>
                            <Switch
                              checked={settings.paymentNotifications}
                              onCheckedChange={(checked) => handleInputChange('paymentNotifications', checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>System Alerts</Label>
                              <p className="text-sm text-gray-600">Notify about system issues and updates</p>
                            </div>
                            <Switch
                              checked={settings.systemAlerts}
                              onCheckedChange={(checked) => handleInputChange('systemAlerts', checked)}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Security Settings */}
                  <TabsContent value="security">
                    <Card>
                      <CardHeader>
                        <CardTitle>Security Configuration</CardTitle>
                        <CardDescription>Manage security settings and access controls</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Two-Factor Authentication</Label>
                              <p className="text-sm text-gray-600">Require 2FA for all admin accounts</p>
                            </div>
                            <Switch
                              checked={settings.twoFactorAuth}
                              onCheckedChange={(checked) => handleInputChange('twoFactorAuth', checked)}
                            />
                          </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                            <Select value={settings.sessionTimeout} onValueChange={(value) => handleInputChange('sessionTimeout', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                                <SelectItem value="120">2 hours</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                            <Select value={settings.passwordExpiry} onValueChange={(value) => handleInputChange('passwordExpiry', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="30">30 days</SelectItem>
                                <SelectItem value="60">60 days</SelectItem>
                                <SelectItem value="90">90 days</SelectItem>
                                <SelectItem value="180">180 days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                            <Select value={settings.loginAttempts} onValueChange={(value) => handleInputChange('loginAttempts', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="3">3 attempts</SelectItem>
                                <SelectItem value="5">5 attempts</SelectItem>
                                <SelectItem value="10">10 attempts</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Appearance Settings */}
                  <TabsContent value="appearance">
                    <Card>
                      <CardHeader>
                        <CardTitle>Appearance & Branding</CardTitle>
                        <CardDescription>Customize the look and feel of your system</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="theme">Theme</Label>
                            <Select value={settings.theme} onValueChange={(value) => handleInputChange('theme', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="luxury">Luxury (Gold & Black)</SelectItem>
                                <SelectItem value="modern">Modern</SelectItem>
                                <SelectItem value="classic">Classic</SelectItem>
                                <SelectItem value="minimal">Minimal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Color Scheme</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="primaryColor">Primary Color</Label>
                              <Input
                                id="primaryColor"
                                type="color"
                                value={settings.primaryColor}
                                onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                                className="w-full h-10"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="secondaryColor">Secondary Color</Label>
                              <Input
                                id="secondaryColor"
                                type="color"
                                value={settings.secondaryColor}
                                onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                                className="w-full h-10"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="accentColor">Accent Color</Label>
                              <Input
                                id="accentColor"
                                type="color"
                                value={settings.accentColor}
                                onChange={(e) => handleInputChange('accentColor', e.target.value)}
                                className="w-full h-10"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* System Settings */}
                  <TabsContent value="system">
                    <Card>
                      <CardHeader>
                        <CardTitle>System Configuration</CardTitle>
                        <CardDescription>Advanced system settings and maintenance options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Automatic Backups</Label>
                              <p className="text-sm text-gray-600">Automatically backup system data</p>
                            </div>
                            <Switch
                              checked={settings.autoBackup}
                              onCheckedChange={(checked) => handleInputChange('autoBackup', checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Maintenance Mode</Label>
                              <p className="text-sm text-gray-600">Put system in maintenance mode</p>
                            </div>
                            <Switch
                              checked={settings.maintenanceMode}
                              onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Debug Mode</Label>
                              <p className="text-sm text-gray-600">Enable detailed logging and debugging</p>
                            </div>
                            <Switch
                              checked={settings.debugMode}
                              onCheckedChange={(checked) => handleInputChange('debugMode', checked)}
                            />
                          </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="backupFrequency">Backup Frequency</Label>
                            <Select value={settings.backupFrequency} onValueChange={(value) => handleInputChange('backupFrequency', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hourly">Hourly</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="dataRetention">Data Retention (days)</Label>
                            <Select value={settings.dataRetention} onValueChange={(value) => handleInputChange('dataRetention', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="90">90 days</SelectItem>
                                <SelectItem value="180">180 days</SelectItem>
                                <SelectItem value="365">1 year</SelectItem>
                                <SelectItem value="730">2 years</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}