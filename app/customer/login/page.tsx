'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/shared/Header';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Sparkles } from 'lucide-react';

// Firebase imports
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext'; // UPDATED: Import useAuth

export default function CustomerLogin() {
  const router = useRouter();
  const { login: authLogin } = useAuth(); // UPDATED: Use auth context
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Use AuthContext for login (with isCustomer = true)
      await authLogin(loginData.email, loginData.password, true);
      // AuthContext will handle the redirect to /customer/portal
      
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      console.log('📝 Starting registration process...');
      
      // Step 1: Firebase Authentication mein user create karein
      console.log('1. Creating user in Firebase Auth...');
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        registerData.email,
        registerData.password
      );

      const user = userCredential.user;
      console.log('✅ Firebase Auth user created with UID:', user.uid);
      
      // Step 2: Firestore ke "customers" collection mein data store karein
      // IMPORTANT: Use user.uid as document ID for consistency
      console.log('2. Saving to Firestore...');
      const customerData = {
        uid: user.uid,
        name: registerData.name,
        email: registerData.email,
        phone: registerData.phone,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: "active",
        role: "customer",
        emailVerified: false,
        lastLogin: serverTimestamp()
      };

      // Use setDoc with user.uid as document ID
      await setDoc(doc(db, "customers", user.uid), customerData);
      console.log('✅ Customer saved to Firestore with UID:', user.uid);
      
      // Step 3: Also create in "users" collection for AuthContext compatibility
      // This prevents the "User document not found" error
      await setDoc(doc(db, "users", user.uid), {
        email: registerData.email,
        name: registerData.name,
        role: "customer", // IMPORTANT: Set role as customer
        createdAt: serverTimestamp(),
        status: "active"
      });
      console.log('✅ User also saved to users collection');

      // Step 4: Local storage mein save karein for customer portal
      const customerObj = {
        uid: user.uid,
        email: registerData.email,
        name: registerData.name,
        phone: registerData.phone,
        role: 'customer',
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('customerAuth', JSON.stringify({
        isAuthenticated: true,
        customer: customerObj
      }));
      
      localStorage.setItem('user', JSON.stringify(customerObj));
      
      console.log('✅ Local storage updated');

      // Step 5: Auto login the user
      console.log('3. Auto-login after registration...');
      await signInWithEmailAndPassword(auth, registerData.email, registerData.password);
      
      // Success message
      setSuccess('Account created successfully! Redirecting...');
      
      // Redirect to customer portal
      setTimeout(() => {
        router.push('/customer/portal');
      }, 1500);

    } catch (firebaseError: any) {
      console.error("❌ Firebase Error: ", firebaseError);
      
      // Firebase specific error messages
      if (firebaseError.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please login instead.');
      } else if (firebaseError.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (firebaseError.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
      } else if (firebaseError.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(`Registration failed: ${firebaseError.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <Header />
      
      <div className="pt-32 pb-16 px-4">
        <div className="max-w-md mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-secondary font-black tracking-[0.2em] uppercase text-[10px]">Customer Portal</span>
            </div>
            <h1 className="text-4xl font-serif font-bold text-primary mb-4">
              Welcome to <span className="text-secondary">Man of Cave</span>
            </h1>
            <p className="text-muted-foreground font-light">
              Sign in to manage your bookings, orders, and profile
            </p>
          </div>

          <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-none">
                <TabsTrigger value="login" className="rounded-xl font-bold text-xs tracking-widest uppercase">Sign In</TabsTrigger>
                <TabsTrigger value="register" className="rounded-xl font-bold text-xs tracking-widest uppercase">Register</TabsTrigger>
              </TabsList>
              
              {/* Login Tab */}
              <TabsContent value="login" className="p-0">
                <CardHeader className="pb-4 pt-8 px-8">
                  <CardTitle className="text-xl font-serif">Sign In</CardTitle>
                  <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <form onSubmit={handleLogin} className="space-y-5">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                        {error}
                      </div>
                    )}
                    
                    {success && (
                      <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm">
                        {success}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={loginData.email}
                          onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                          className="pl-11 h-12 rounded-xl border-gray-200"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                          className="pl-11 pr-11 h-12 rounded-xl border-gray-200"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="text-muted-foreground">Remember me</span>
                      </label>
                      <a href="#" className="text-secondary hover:underline font-medium">Forgot password?</a>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-14 bg-primary hover:bg-secondary hover:text-primary font-black tracking-[0.2em] text-xs rounded-xl transition-all duration-300"
                      disabled={isLoading}
                    >
                      {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>

                  {/* Demo Credentials */}
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-xs font-bold text-blue-800 mb-2">Demo Credentials:</p>
                    <p className="text-xs text-blue-700">Email: customer@manofcave.com</p>
                    <p className="text-xs text-blue-700">Password: customer123</p>
                  </div>
                </CardContent>
              </TabsContent>
              
              {/* Register Tab */}
              <TabsContent value="register" className="p-0">
                <CardHeader className="pb-4 pt-8 px-8">
                  <CardTitle className="text-xl font-serif">Create Account</CardTitle>
                  <CardDescription>Join Man of Cave and start your journey</CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <form onSubmit={handleRegister} className="space-y-4">
                    {/* Success Message */}
                    {success && (
                      <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm">
                        {success}
                      </div>
                    )}
                    
                    {/* Error Message */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                        {error}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          value={registerData.name}
                          onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                          className="pl-11 h-12 rounded-xl border-gray-200"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-email" className="text-xs font-bold uppercase tracking-widest">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="you@example.com"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                          className="pl-11 h-12 rounded-xl border-gray-200"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(555) 123-4567"
                          value={registerData.phone}
                          onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                          className="pl-11 h-12 rounded-xl border-gray-200"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reg-password" className="text-xs font-bold uppercase tracking-widest">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="reg-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a password (min 6 characters)"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                          className="pl-11 h-12 rounded-xl border-gray-200"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-xs font-bold uppercase tracking-widest">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="confirm-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                          className="pl-11 h-12 rounded-xl border-gray-200"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-14 bg-secondary hover:bg-primary text-primary hover:text-white font-black tracking-[0.2em] text-xs rounded-xl transition-all duration-300"
                      disabled={isLoading}
                    >
                      {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                  
                  {/* Firebase Info Note */}
                  <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <p className="text-xs text-gray-600">
                      <strong>Note:</strong> Your account data will be securely stored in Firebase database.
                    </p>
                  </div>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Admin Login Link */}
          <div className="text-center mt-8 flex flex-col gap-4">
            <div className="flex items-center justify-center gap-2">
              <div className="h-px bg-gray-300 flex-1"></div>
              <span className="text-xs text-muted-foreground">OR</span>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-colors text-sm font-medium text-primary"
            >
              <Lock className="w-4 h-4" />
              Admin Login
            </Link>
            <Link href="/" className="text-muted-foreground hover:text-primary text-sm font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
