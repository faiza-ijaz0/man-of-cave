// 'use client';

// import { useAuth } from '@/contexts/AuthContext';

// import { AdminSidebar } from '@/components/admin/AdminSidebar';
// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';

// export default function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const { user, isLoading, logout } = useAuth();
//   const router = useRouter();
  
//   useEffect(() => {
//     // Debugging ke liye
//     console.log('🔍 Admin Layout - User:', user);
//     console.log('🔍 Admin Layout - Allowed Pages:', user?.allowedPages);
    
//     if (!isLoading && !user) {
//       router.push('/login');
//     }
    
//     // Agar customer admin page pe aaye toh redirect
//     if (user && user.role === 'customer') {
//       router.push('/customer/portal');
//     }
//   }, [user, isLoading, router]);
  
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }
  
//   if (!user || user.role === 'customer') {
//     return null; // Redirect ho jayega
//   }
  
//   // Role mapping
//   const sidebarRole = user.role === 'admin' ? 'branch_admin' : 'super_admin';
  
//   // Debug log
//   console.log('🎭 Sidebar Role:', sidebarRole);
//   console.log('📋 Passing allowedPages:', user.allowedPages || []);
  
//   return (
//     <div className="flex h-screen">
//       <AdminSidebar
//         role={sidebarRole}
//         onLogout={logout}
//         allowedPages={user.allowedPages || []} // 🔥 YEH LINE IMPORTANT HAI
//       />
//       <main className="flex-1 overflow-auto bg-gray-50">
//         <div className="p-6">
//           {children}
//         </div>
//       </main>
//     </div>
//   );
// }

// neww code final corrected cidee
// 'use client';

// import { useAuth } from '@/contexts/AuthContext';
// import { AdminSidebar } from '@/components/admin/AdminSidebar';
// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';

// export default function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const { user, isLoading, logout } = useAuth();
//   const router = useRouter();
  
//   useEffect(() => {
//     if (!isLoading && !user) {
//       router.push('/login');
//     }
//   }, [user, isLoading, router]);
  
//   if (isLoading) {
//     return <div>Loading...</div>;
//   }
  
//   if (!user) {
//     return null;
//   }
  
//   const sidebarRole = user.role === 'admin' ? 'branch_admin' : 'super_admin';
  
//   return (
//     <div className="flex h-screen">
//       <AdminSidebar
//         role={sidebarRole}
//         onLogout={logout}
//         allowedPages={user.allowedPages || []}
//       />
//       <main className="flex-1 overflow-auto">
//         {children}
//       </main>
//     </div>
//   );
// }

// new codee
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const cleanupDone = useRef(false);
  
  // 🔥 NUCLEAR OPTION - 100% WORKING
  useEffect(() => {
    if (cleanupDone.current) return;
    
    const nukeDuplicateSidebars = () => {
      // METHOD 1: Remove by exact structure
      const allElements = document.body.getElementsByTagName('*');
      const sidebars = [];
      
      for (let element of allElements) {
        if (element.className && typeof element.className === 'string') {
          const classes = element.className.split(' ');
          if (
            classes.includes('flex') &&
            classes.includes('h-full') && 
            classes.includes('flex-col') &&
            classes.includes('bg-primary')
          ) {
            sidebars.push(element);
          }
        }
      }
      
      // Keep only first sidebar
      if (sidebars.length > 1) {
        console.log(`💣 NUKING: Found ${sidebars.length} sidebars`);
        for (let i = sidebars.length - 1; i > 0; i--) {
          console.log(`Removing sidebar ${i + 1}`);
          sidebars[i].remove();
        }
      }
      
      // Also check parent wrappers
      const wrappers = document.querySelectorAll('.h-full.shrink-0.bg-white.border-r');
      if (wrappers.length > 1) {
        for (let i = wrappers.length - 1; i > 0; i--) {
          wrappers[i].remove();
        }
      }
    };
    
    // Run multiple times
    nukeDuplicateSidebars();
    
    const intervals = [
      setTimeout(nukeDuplicateSidebars, 50),
      setTimeout(nukeDuplicateSidebars, 150),
      setTimeout(nukeDuplicateSidebars, 300),
      setTimeout(nukeDuplicateSidebars, 500),
      setTimeout(nukeDuplicateSidebars, 1000),
      setTimeout(nukeDuplicateSidebars, 2000),
    ];
    
    // Mutation observer for any new elements
    const observer = new MutationObserver(nukeDuplicateSidebars);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
    
    cleanupDone.current = true;
    
    return () => {
      intervals.forEach(clearTimeout);
      observer.disconnect();
    };
  }, []);
  
  // ✅ TEMPORARY: Direct CSS injection - YEH PEHLE HO
  useEffect(() => {
    // Inject CSS directly
    const style = document.createElement('style');
    style.textContent = `
      /* NUCLEAR CSS - Hide ALL duplicate sidebars */
      body .flex.h-full.flex-col.bg-primary ~ .flex.h-full.flex-col.bg-primary {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        position: absolute !important;
        left: -9999px !important;
        width: 0 !important;
        height: 0 !important;
        pointer-events: none !important;
        user-select: none !important;
      }
      
      /* Hide duplicate wrappers */
      .h-full.shrink-0.bg-white.border-r ~ .h-full.shrink-0.bg-white.border-r {
        display: none !important;
      }
      
      /* Hide any element with sidebar classes */
      div[class*="sidebar"]:not(:first-of-type),
      div[class*="Sidebar"]:not(:first-of-type),
      nav:not(:first-of-type),
      aside:not(:first-of-type) {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return null;
  }
  
  const sidebarRole = user.role === 'admin' ? 'branch_admin' : 'super_admin';
  
  return (
    <div className="flex h-screen">
      <AdminSidebar
        role={sidebarRole}
        onLogout={logout}
        allowedPages={user.allowedPages || []}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}