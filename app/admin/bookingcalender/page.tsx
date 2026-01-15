"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format, isSameDay } from "date-fns";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { v4 as uuidv4 } from "uuid";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CreditCard,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  FileText,
  Hash,
  Users,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  MoreVertical,
  Loader2,
  Star,
  Eye,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ToggleLeft,
  ToggleRight,
  EyeOff,
  Eye as EyeIcon
} from "lucide-react";

// Firebase imports
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Types (Project 1 ke same)
interface BookingService {
  serviceId?: string;
  serviceName: string;
  category: string;
  duration: number;
  price: number;
  quantity: number;
}

type BookingStatus = "upcoming" | "past" | "cancelled";

interface Booking {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  services: BookingService[];
  bookingDate: Date;
  bookingTime: string;
  branch: string;
  branchId?: string;
  staff: string;
  staffId?: string;
  totalPrice: number;
  totalDuration: number;
  status: BookingStatus;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  emailConfirmation: boolean;
  smsConfirmation: boolean;
  createdAt: Date;
  updatedAt: Date;
  remarks?: string | null;
  cardLastFour?: string;
  trnNumber?: string;
  additionalNotes?: string;
  tipAmount?: number;
  discount?: number;
  notes?: string;
}

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  branch: string;
  branchId: string;
  status: 'active' | 'inactive';
  specialization: string[];
  rating: number;
  reviews: number;
  experience: string;
}

interface Branch {
  id: string;
  name: string;
  address?: string;
  city?: string;
  status: 'active' | 'inactive';
}

// Constants (Project 1 ke same)
const PAYMENT_METHODS = ["cash", "card", "tabby", "tamara", "apple pay", "google pay", "samsung wallet", "paypal", "american express", "ewallet STC pay", "bank transfer", "cash on delivery", "other"];
const CATEGORY_OPTIONS = ["Facial", "Hair", "Nails", "Lashes", "Massage", "Spa", "Makeup", "Waxing"];

// Helper functions (Project 1 ke same)
function minutesToHHMM(mins: number) {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function toDisplayAMPM(hhmm: string) {
  const [hStr, m] = hhmm.split(":");
  let h = Number(hStr);
  const suffix = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  if (h > 12) h = h - 12;
  return `${h}:${m} ${suffix}`;
}

// 🔥 CHANGE: 24 hours time slots
function generateTimeSlots(start = 0, end = 23 * 60 + 30, step = 30) {
  const slots: string[] = [];
  for (let t = start; t <= end; t += step) {
    slots.push(minutesToHHMM(t));
  }
  return slots;
}

const TIMESLOTS = generateTimeSlots();

function calcTotals(services: BookingService[]) {
  const totalPrice = services.reduce(
    (sum, s) => sum + (Number(s.price) || 0) * (Number(s.quantity) || 0),
    0
  );
  const totalDuration = services.reduce(
    (sum, s) => sum + (Number(s.duration) || 0) * (Number(s.quantity) || 0),
    0
  );
  return { totalPrice, totalDuration };
}

const emptyService: BookingService = {
  serviceId: "",
  serviceName: "",
  category: "",
  duration: 30,
  price: 0,
  quantity: 1,
};

// Main Component
export default function BookingCalendar() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // States (Project 1 ke same)
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<Booking | null>(null);

  // Filter states (Project 1 ke same)
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>("");
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("");
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState<string>("");
  const [selectedTimeInterval, setSelectedTimeInterval] = useState<string>("");

  // Schedule board controls (Project 1 ke same)
  const [scheduleDate, setScheduleDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [scheduleBranch, setScheduleBranch] = useState<string>("all");
  
  // Form state (Project 1 ke same)
  const [branch, setBranch] = useState("");
  const [serviceDate, setServiceDate] = useState<string>(() => format(new Date(), "yyyy-MM-dd"));
  const [serviceTime, setServiceTime] = useState<string>("10:00");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [customPaymentMethod, setCustomPaymentMethod] = useState<string>("");
  const [emailConfirmation, setEmailConfirmation] = useState(false);
  const [smsConfirmation, setSmsConfirmation] = useState(false);
  const [status, setStatus] = useState<BookingStatus>("upcoming");
  const [staffName, setStaffName] = useState<string>("");
  const [servicesList, setServicesList] = useState<BookingService[]>([{ ...emptyService }]);
  const [remarks, setRemarks] = useState<string>("");
  const [cardLastFour, setCardLastFour] = useState<string>("");
  const [trnNumber, setTrnNumber] = useState<string>("");
  const [additionalNotes, setAdditionalNotes] = useState<string>("");
  const [tip, setTip] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'refunded'>('pending');

  // 🔥 NEW: Hour enabled/disabled state
  const uniqueHours = useMemo(() => {
    const hoursSet = new Set<string>();
    TIMESLOTS.forEach(time => {
      const hour = time.split(":")[0];
      hoursSet.add(hour);
    });
    return Array.from(hoursSet).sort((a, b) => parseInt(a) - parseInt(b));
  }, []);

  const [enabledHours, setEnabledHours] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    uniqueHours.forEach((h) => (map[h] = true));
    return map;
  });

  // 🔥 NEW: Filter time slots based on enabled hours
  const filteredTimeSlots = useMemo(() => {
    return TIMESLOTS.filter(timeSlot => {
      const hour = timeSlot.split(":")[0];
      return enabledHours[hour] !== false;
    });
  }, [enabledHours]);

  // 🔥 REAL-TIME Fetch Bookings from Firebase
  useEffect(() => {
    let unsubscribe: any;

    const fetchBookings = async () => {
      try {
        setLoading(true);
        const bookingsRef = collection(db, 'bookings');
        const q = query(bookingsRef, orderBy('createdAt', 'desc'));
        
        unsubscribe = onSnapshot(q, (snapshot) => {
          const bookingsData: Booking[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            
            let bookingDate: Date;
            if (data.bookingDate?.toDate) {
              bookingDate = data.bookingDate.toDate();
            } else if (data.bookingDate?.seconds) {
              bookingDate = new Date(data.bookingDate.seconds * 1000);
            } else if (typeof data.bookingDate === 'string') {
              bookingDate = new Date(data.bookingDate);
            } else {
              bookingDate = new Date();
            }

            let createdAt: Date;
            if (data.createdAt?.toDate) {
              createdAt = data.createdAt.toDate();
            } else if (data.createdAt?.seconds) {
              createdAt = new Date(data.createdAt.seconds * 1000);
            } else {
              createdAt = new Date();
            }

            let updatedAt: Date = createdAt;
            if (data.updatedAt?.toDate) {
              updatedAt = data.updatedAt.toDate();
            } else if (data.updatedAt?.seconds) {
              updatedAt = new Date(data.updatedAt.seconds * 1000);
            }

            bookingsData.push({
              id: doc.id,
              userId: data.userId || uuidv4(),
              customerName: data.customerName || '',
              customerEmail: data.customerEmail || '',
              customerPhone: data.customerPhone || '',
              services: data.services || [],
              bookingDate,
              bookingTime: data.bookingTime || '',
              branch: data.branch || '',
              branchId: data.branchId || '',
              staff: data.staff || '',
              staffId: data.staffId || '',
              totalPrice: data.totalPrice || 0,
              totalDuration: data.totalDuration || 0,
              status: (data.status as BookingStatus) || 'upcoming',
              paymentMethod: data.paymentMethod || 'cash',
              paymentStatus: data.paymentStatus || 'pending',
              emailConfirmation: data.emailConfirmation || false,
              smsConfirmation: data.smsConfirmation || false,
              remarks: data.remarks || data.notes || '',
              cardLastFour: data.cardLastFour || '',
              trnNumber: data.trnNumber || '',
              additionalNotes: data.additionalNotes || '',
              tipAmount: data.tipAmount || 0,
              discount: data.discount || 0,
              notes: data.notes || '',
              createdAt,
              updatedAt
            });
          });

          setBookings(bookingsData);
          setLoading(false);
        });

      } catch (error) {
        console.error("❌ Error fetching bookings:", error);
        setLoading(false);
      }
    };

    fetchBookings();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 🔥 Fetch Staff from Firebase
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const staffRef = collection(db, 'staff');
        const q = query(staffRef, where('status', '==', 'active'));
        const snapshot = await getDocs(q);
        
        const staffData: Staff[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          staffData.push({
            id: doc.id,
            name: data.name || 'Unnamed Staff',
            email: data.email || '',
            phone: data.phone || '',
            avatar: data.avatar || `https://ui-avatars.com/api/?name=${data.name || 'Staff'}&background=random`,
            role: data.role || 'Staff',
            branch: data.branch || 'No Branch',
            branchId: data.branchId || '',
            status: data.status || 'active',
            specialization: data.specialization || [],
            rating: data.rating || 0,
            reviews: data.reviews || 0,
            experience: data.experience || ''
          });
        });

        staffData.sort((a, b) => a.name.localeCompare(b.name));
        setStaff(staffData);
      } catch (error) {
        console.error("❌ Error fetching staff:", error);
      }
    };

    fetchStaff();
  }, []);

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const branchesRef = collection(db, 'branches');
        const q = query(branchesRef, where('status', '==', 'active'));
        const snapshot = await getDocs(q);
        
        const branchesData: Branch[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          branchesData.push({
            id: doc.id,
            name: data.name || '',
            address: data.address || '',
            city: data.city || '',
            status: data.status || 'active'
          });
        });

        branchesData.sort((a, b) => a.name.localeCompare(b.name));
        setBranches(branchesData);
        if (branchesData.length > 0) {
          setBranch(branchesData[0].id);
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    fetchBranches();
  }, []);

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesRef = collection(db, 'services');
        const q = query(servicesRef, where('status', '==', 'active'));
        const snapshot = await getDocs(q);
        
        const servicesData: any[] = [];
        snapshot.forEach((doc) => {
          servicesData.push({
            id: doc.id,
            ...doc.data()
          });
        });

        servicesData.sort((a, b) => a.name.localeCompare(b.name));
        setServices(servicesData);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, []);

  // Filtering logic (Project 1 ke same)
  const filteredBookings = bookings.filter((booking) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      booking.customerName.toLowerCase().includes(q) ||
      booking.branch.toLowerCase().includes(q) ||
      booking.customerPhone.toLowerCase().includes(q) ||
      booking.services.some((s) => s.serviceName.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === "all" ||
      booking.status === (statusFilter as BookingStatus);

    const matchesBranch =
      !selectedBranch || selectedBranch === "" || booking.branchId === selectedBranch;

    const matchesStaff =
      !selectedStaffFilter || selectedStaffFilter === "" || (booking.staff ? booking.staff === selectedStaffFilter : false);

    const matchesDate =
      !selectedDateFilter ||
      selectedDateFilter === "" ||
      format(booking.bookingDate, "yyyy-MM-dd") === selectedDateFilter;

    const matchesCustomer =
      !selectedCustomerFilter ||
      selectedCustomerFilter === "" ||
      booking.customerName.toLowerCase().includes(selectedCustomerFilter.toLowerCase());

    const matchesTime =
      !selectedTimeInterval ||
      selectedTimeInterval === "" ||
      booking.bookingTime === selectedTimeInterval;

    return matchesSearch && matchesStatus && matchesBranch && matchesStaff && matchesDate && matchesCustomer && matchesTime;
  });

  // Get Staff Options for Schedule
  const STAFF_OPTIONS = staff.map(s => s.name);

  // Schedule matrix logic (Project 1 ke same)
  const scheduleMatrix = useMemo(() => {
    const map: Record<string, Record<string, Booking[]>> = {};

    // 🔥 CHANGE: Use filteredTimeSlots instead of TIMESLOTS
    filteredTimeSlots.forEach((t) => {
      map[t] = {};
      STAFF_OPTIONS.forEach((s) => (map[t][s] = []));
      map[t]["Unassigned"] = [];
    });
    
    bookings.forEach((b) => {
      let bookingDateObj: Date;

     if (b.bookingDate instanceof Date) {
  bookingDateObj = b.bookingDate;
} else if (typeof b.bookingDate === "string") {
  bookingDateObj = new Date(b.bookingDate);
} else if ((b.bookingDate as any)?.seconds) {
  // Type casting use karein
  const seconds = (b.bookingDate as any).seconds;
  bookingDateObj = new Date(seconds * 1000);
} else {
  return;
}

      const matchDate = format(bookingDateObj, "yyyy-MM-dd") === scheduleDate;
      const matchBranch = scheduleBranch === "all" || b.branchId === scheduleBranch;
      const hour = b.bookingTime?.split(":")[0] ?? "";
      const hourEnabled = !!enabledHours[hour];

      if (!matchDate || !matchBranch || !hourEnabled) return;

      const t = b.bookingTime;
      const sName =
        b.staff && STAFF_OPTIONS.includes(b.staff) ? b.staff : "Unassigned";

      if (!map[t]) map[t] = {};
      if (!map[t][sName]) map[t][sName] = [];

      map[t][sName].push(b);
    });

    return map;
  }, [bookings, scheduleDate, scheduleBranch, STAFF_OPTIONS, enabledHours, filteredTimeSlots]);

  // Unique booking times
  const uniqueTimes = useMemo(() => {
    const times = bookings.map((b) => b.bookingTime).filter(Boolean);
    return Array.from(new Set(times)).sort();
  }, [bookings]);

  // 🔥 NEW: Enable/Disable All Hours Functions
  const enableAllHours = () => {
    const allEnabled: Record<string, boolean> = {};
    uniqueHours.forEach((h) => (allEnabled[h] = true));
    setEnabledHours(allEnabled);
  };

  const disableAllHours = () => {
    const allDisabled: Record<string, boolean> = {};
    uniqueHours.forEach((h) => (allDisabled[h] = false));
    setEnabledHours(allDisabled);
  };

  const toggleHour = (hour: string) => {
    setEnabledHours(prev => ({
      ...prev,
      [hour]: !prev[hour]
    }));
  };

  // Form handlers (Project 1 ke same)
  const resetForm = () => {
    setBranch(branches.length > 0 ? branches[0].id : "");
    setServiceDate(format(new Date(), "yyyy-MM-dd"));
    setServiceTime("10:00");
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setPaymentMethod("cash");
    setCustomPaymentMethod("");
    setEmailConfirmation(false);
    setSmsConfirmation(false);
    setStatus("upcoming");
    setStaffName("");
    setServicesList([{ ...emptyService }]);
    setRemarks("");
    setEditingId(null);
    setCardLastFour("");
    setTrnNumber("");
    setAdditionalNotes("");
    setTip(0);
    setDiscount(0);
    setPaymentStatus('pending');
  };

  const openForCreate = () => {
    resetForm();
    setShowCreate(true);
    setIsEditing(false);
  };

  const openForCreateFromCell = (prefillStaff: string, prefillTime: string) => {
    const hour = prefillTime.split(":")[0];
    if (!enabledHours[hour]) return;

    resetForm();
    setStaffName(prefillStaff);
    setServiceTime(prefillTime);
    setServiceDate(scheduleDate);
    setShowCreate(true);
    setIsEditing(false);
  };

  const openForEdit = (b: Booking) => {
    setEditingId(b.id);
    setIsEditing(true);
    setShowCreate(true);

    setBranch(b.branchId || (branches.length > 0 ? branches[0].id : ""));
    setServiceDate(format(b.bookingDate, "yyyy-MM-dd"));
    setServiceTime(b.bookingTime || "10:00");
    setCustomerName(b.customerName || "");
    setCustomerEmail(b.customerEmail || "");
    setCustomerPhone(b.customerPhone || "");
    setPaymentMethod(b.paymentMethod || "cash");
    setEmailConfirmation(!!b.emailConfirmation);
    setSmsConfirmation(!!b.smsConfirmation);
    setStatus(b.status || "upcoming");
    setStaffName(b.staff || "");
    setServicesList(
      b.services && b.services.length > 0
        ? b.services.map((s) => ({
            serviceId: s.serviceId || "",
            serviceName: s.serviceName || "",
            category: s.category || "",
            duration: Number(s.duration) || 0,
            price: Number(s.price) || 0,
            quantity: Number(s.quantity) || 1,
          }))
        : [{ ...emptyService }]
    );
    setRemarks(b.remarks || "");
    setCardLastFour(b.cardLastFour || "");
    setTrnNumber(b.trnNumber || "");
    setAdditionalNotes(b.additionalNotes || "");
    setTip(b.tipAmount || 0);
    setDiscount(b.discount || 0);
    setPaymentStatus(b.paymentStatus || 'pending');
  };

  const handleAddServiceRow = () => {
    setServicesList((prev) => [...prev, { ...emptyService }]);
  };

  const handleRemoveServiceRow = (index: number) => {
    setServicesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleServiceChange = (idx: number, field: string, value: any) => {
    setServicesList((prev) =>
      prev.map((s, i) => {
        if (i !== idx) return s;

        if (field === "serviceName") {
          const selectedService = services.find(
            (service) => service.name === value
          );
          if (selectedService) {
            return {
              ...s,
              serviceId: selectedService.id,
              serviceName: value,
              duration: selectedService.duration || 0,
              price: selectedService.price || 0,
              category: selectedService.category || s.category,
            };
          }
        }

        return { ...s, [field]: value };
      })
    );
  };

  const formTotals = calcTotals(servicesList);

  const validateForm = () => {
    if (!customerName.trim()) return "Customer name is required";
    if (!customerPhone.trim()) return "Phone number is required";
    if (!serviceDate) return "Service date is required";
    if (!serviceTime) return "Service time is required";
    if (!branch) return "Branch is required";
    if (!staffName) return "Staff is required";
    if (servicesList.length === 0) return "Add at least one service";
    const hasName = servicesList.every((s) => s.serviceName.trim().length > 0);
    if (!hasName) return "Each service must have a name";
    const selectedHour = serviceTime.split(":")[0];
    if (!enabledHours[selectedHour])
      return "Selected time falls into a disabled hour";
    return null;
  };

  const saveBooking = async () => {
    const err = validateForm();
    if (err) {
      alert(err);
      return;
    }

    try {
      setSaving(true);

      const selectedBranchObj = branches.find(b => b.id === branch);
      const selectedStaff = staff.find(s => s.name === staffName);

      const payload = {
        userId: uuidv4(),
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        services: servicesList.map((s) => ({
          ...s,
          price: Number(s.price) || 0,
          duration: Number(s.duration) || 0,
          quantity: Number(s.quantity) || 0,
        })),
        bookingDate: Timestamp.fromDate(new Date(serviceDate + "T00:00:00")),
        bookingTime: serviceTime,
        branch: selectedBranchObj?.name || '',
        branchId: branch,
        staff: staffName || null,
        staffId: selectedStaff?.id || '',
        totalPrice: formTotals.totalPrice,
        totalDuration: formTotals.totalDuration,
        status,
        paymentMethod: paymentMethod === "custom" ? customPaymentMethod : paymentMethod,
        paymentStatus,
        emailConfirmation,
        smsConfirmation,
        updatedAt: serverTimestamp(),
        remarks: remarks || null,
        tipAmount: Number(tip) || 0,
        discount: Number(discount) || 0,
        cardLastFour: cardLastFour.trim(),
        trnNumber: trnNumber.trim(),
        additionalNotes: additionalNotes.trim(),
      };

      if (editingId) {
        const ref = doc(db, "bookings", editingId);
        await updateDoc(ref, payload);
        alert("✅ Booking updated successfully!");
      } else {
        const docRef = await addDoc(collection(db, "bookings"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        
        // Add to local state immediately
        const newBooking: Booking = {
          id: docRef.id,
          userId: payload.userId,
          customerName: payload.customerName,
          customerEmail: payload.customerEmail,
          customerPhone: payload.customerPhone,
          services: payload.services,
          bookingDate: new Date(serviceDate),
          bookingTime: payload.bookingTime,
          branch: payload.branch,
          branchId: payload.branchId,
          staff: payload.staff || '',
          staffId: payload.staffId,
          totalPrice: payload.totalPrice,
          totalDuration: payload.totalDuration,
          status: payload.status,
          paymentMethod: payload.paymentMethod,
          paymentStatus: payload.paymentStatus,
          emailConfirmation: payload.emailConfirmation,
          smsConfirmation: payload.smsConfirmation,
          remarks: payload.remarks,
          cardLastFour: payload.cardLastFour,
          trnNumber: payload.trnNumber,
          additionalNotes: payload.additionalNotes,
          tipAmount: payload.tipAmount,
          discount: payload.discount,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        setBookings(prev => [newBooking, ...prev]);
        alert("✅ Booking created successfully!");
      }

      setShowCreate(false);
      resetForm();
    } catch (e) {
      console.error("Error saving booking:", e);
      alert("Failed to save booking. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const deleteBooking = async () => {
    if (!editingId) return;
    if (!confirm("Delete this booking? This action cannot be undone.")) return;

    try {
      setDeleting(true);
      // Remove from local state immediately
      setBookings(prev => prev.filter(b => b.id !== editingId));
      
      await deleteDoc(doc(db, "bookings", editingId));
      setShowCreate(false);
      resetForm();
      alert("✅ Booking deleted successfully!");
    } catch (e) {
      console.error("Error deleting booking:", e);
      alert("Failed to delete booking.");
      // Re-add if error
      const deletedBooking = bookings.find(b => b.id === editingId);
      if (deletedBooking) {
        setBookings(prev => [...prev, deletedBooking]);
      }
    } finally {
      setDeleting(false);
    }
  };

  const openInvoice = (booking: Booking) => {
    setInvoiceData({
      ...booking,
      tip: booking.tipAmount || 0,
      discount: booking.discount || 0,
      totalPrice: booking.totalPrice || 0,
    });
    setShowInvoice(true);
  };

  const downloadInvoicePDF = async () => {
    const input = document.getElementById("invoice-content");
    if (!input || !invoiceData) return;

    try {
      const imgData = await toPng(input, { cacheBust: true });

      const pdfWidth = 150;
      const pdfHeight = 180;
      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      });

      const contentWidth = pdfWidth - 10;
      const contentHeight =
        (input.offsetHeight * contentWidth) / input.offsetWidth;

      const x = 5;
      const y = 5;

      pdf.addImage(imgData, "PNG", x, y, contentWidth, contentHeight);
      pdf.save(`invoice_${invoiceData?.id || Date.now()}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  // Status badge colors (Project 1 ke same)
  const getStatusBadge = (s: string) => {
    switch (s) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "past":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBlock = (s: BookingStatus) => {
    switch (s) {
      case "upcoming":
        return "bg-blue-500 text-white font-bold";
      case "past":
        return "bg-green-500 font-bold text-white";
      case "cancelled":
        return "bg-red-500 text-white line-through font-bold";
      default:
        return "bg-green-500 text-white font-bold";
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "card":
      case "credit":
      case "debit":
        return <CreditCard className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  // Navigation functions
  const goToPreviousDay = () => {
    const newDate = new Date(scheduleDate);
    newDate.setDate(newDate.getDate() - 1);
    setScheduleDate(format(newDate, "yyyy-MM-dd"));
  };

  const goToNextDay = () => {
    const newDate = new Date(scheduleDate);
    newDate.setDate(newDate.getDate() + 1);
    setScheduleDate(format(newDate, "yyyy-MM-dd"));
  };

  const goToToday = () => {
    setScheduleDate(format(new Date(), "yyyy-MM-dd"));
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      router.push('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading booking calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 🔥 HEADER - Project 1 Style */}
      <header className="bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 text-white shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                  <Calendar className="w-8 h-8 animate-pulse-slow" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">📅 Booking Calendar</h1>
                  <p className="text-white/80 text-sm mt-1">
                    Real-time booking management system
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-4">
                <div className="text-sm bg-white/10 px-3 py-1 rounded-full">
                  {bookings.length} total bookings
                </div>
                <button
                  onClick={openForCreate}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    <span>New Booking</span>
                  </div>
                </button>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 🔥 HOURS CONTROL SECTION - TOP PAR */}
      <div className="px-6 py-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <ToggleRight className="w-7 h-7 text-blue-600" />
                Hours Control Panel
              </h3>
              <p className="text-gray-600 mt-2">
                Enable or disable hours for booking. Disabled hours will be hidden from the calendar.
              </p>
            </div>
            <div className="flex gap-3 mt-4 lg:mt-0">
              <button
                onClick={enableAllHours}
                className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 flex items-center gap-2 transition-all"
              >
                <CheckCircle className="w-5 h-5" />
                Enable All Hours
              </button>
              <button
                onClick={disableAllHours}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 flex items-center gap-2 transition-all"
              >
                <XCircle className="w-5 h-5" />
                Disable All Hours
              </button>
            </div>
          </div>

          {/* Hours Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3">
            {uniqueHours.map((hour) => {
              const hourNum = parseInt(hour);
              const displayHour = hourNum === 0 ? "12 AM" : 
                               hourNum < 12 ? `${hourNum} AM` : 
                               hourNum === 12 ? "12 PM" : 
                               `${hourNum - 12} PM`;
              
              const isEnabled = enabledHours[hour];
              const slotCount = TIMESLOTS.filter(slot => slot.startsWith(hour)).length;
              
              return (
                <div key={hour} className="flex flex-col items-center">
                  <div className="text-center mb-2">
                    <div className="text-lg font-bold text-gray-900">{displayHour}</div>
                    <div className="text-xs text-gray-500">{hour}:00 - {hour}:59</div>
                  </div>
                  <button
                    onClick={() => toggleHour(hour)}
                    className={`w-full py-3 rounded-xl flex flex-col items-center justify-center transition-all transform hover:scale-[1.02] ${
                      isEnabled 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg' 
                        : 'bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-lg'
                    }`}
                  >
                    {isEnabled ? (
                      <>
                        <EyeIcon className="w-6 h-6 mb-2" />
                        <span className="font-bold text-sm">Enabled</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-6 h-6 mb-2" />
                        <span className="font-bold text-sm">Disabled</span>
                      </>
                    )}
                    <span className="text-xs mt-1 opacity-90">
                      {slotCount} slots
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-700">Enabled: {Object.values(enabledHours).filter(v => v).length} hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium text-gray-700">Disabled: {Object.values(enabledHours).filter(v => !v).length} hours</span>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-bold text-blue-600">{filteredTimeSlots.length}</span> time slots available
              </div>
            </div>
          </div>
        </div>

        {/* 🔥 FILTER BAR - Project 1 Style */}
        <div className="bg-white/80 dark:bg-slate-800/60 p-4 rounded-2xl shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Branch Filter */}
            <div>
              <label className="text-xs block mb-1 font-medium text-gray-700">Branch</label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Staff Filter */}
            <div>
              <label className="text-xs block mb-1 font-medium text-gray-700">Staff</label>
              <select
                value={selectedStaffFilter}
                onChange={(e) => setSelectedStaffFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Staff</option>
                {STAFF_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="text-xs block mb-1 font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Customer Filter */}
            <div>
              <label className="text-xs block mb-1 font-medium text-gray-700">Customer</label>
              <input
                type="text"
                placeholder="Search customer"
                value={selectedCustomerFilter}
                onChange={(e) => setSelectedCustomerFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Time Filter */}
            <div>
              <label className="text-xs block mb-1 font-medium text-gray-700">Time</label>
              <select
                value={selectedTimeInterval}
                onChange={(e) => setSelectedTimeInterval(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Times</option>
                {uniqueTimes.map((time) => (
                  <option key={time} value={time}>
                    {toDisplayAMPM(time)} ({time})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-xs block mb-1 font-medium text-gray-700">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 max-w-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedBranch("");
                  setSelectedStaffFilter("");
                  setSelectedDateFilter("");
                  setSelectedCustomerFilter("");
                  setSelectedTimeInterval("");
                  setStatusFilter("all");
                  setSearchTerm("");
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
              <button
                onClick={openForCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Quick Booking
              </button>
            </div>
          </div>
        </div>

        {/* 🔥 SCHEDULE BOARD HEADER - Project 1 Style */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                📅 Daily Schedule Board
              </h2>
              <p className="text-gray-600">
                Manage appointments for {format(new Date(scheduleDate), 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-sm text-blue-600 font-medium mt-1">
                Showing {filteredTimeSlots.length} enabled time slots
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousDay}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                  title="Previous day"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={goToToday}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Today
                </button>
                <button
                  onClick={goToNextDay}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                  title="Next day"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-4">
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
                
                <select
                  value={scheduleBranch}
                  onChange={(e) => setScheduleBranch(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="all">All Branches</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 🔥 SCHEDULE TABLE - Project 1 EXACT SAME UI */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          {/* Table Header */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <th className="sticky left-0 bg-gray-50 p-4 border border-gray-200 text-left min-w-[120px] z-10">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-gray-900">Time</span>
                    </div>
                  </th>
                  {STAFF_OPTIONS.map((staffName) => (
                    <th key={staffName} className="p-4 border border-gray-200 bg-gray-50 text-center min-w-[220px]">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {staffName.charAt(0)}
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-gray-900">{staffName}</div>
                            <div className="text-xs text-gray-600 flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span>{staff.find(s => s.name === staffName)?.rating.toFixed(1) || '5.0'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTimeSlots.map((timeSlot) => {
                  const hour = timeSlot.split(":")[0];
                  const hourEnabled = enabledHours[hour] !== false;
                  
                  return (
                    <tr key={timeSlot} className="hover:bg-gray-50/50">
                      <td className="sticky left-0 bg-white p-4 border border-gray-200 text-center font-medium z-10">
                        <div className="flex flex-col items-center">
                          <div className="text-lg font-bold text-gray-900">{toDisplayAMPM(timeSlot)}</div>
                          <div className="text-xs text-gray-500">{timeSlot}</div>
                        </div>
                      </td>
                      
                      {STAFF_OPTIONS.map((staffName) => {
                        const bookingsInCell = scheduleMatrix[timeSlot]?.[staffName] || [];
                        
                        return (
                          <td
                            key={`${timeSlot}-${staffName}`}
                            className={`p-2 border border-gray-200 min-h-[120px] ${
                              !hourEnabled 
                                ? "bg-gray-100 opacity-50 cursor-not-allowed" 
                                : "cursor-pointer hover:bg-blue-50/30"
                            }`}
                            onClick={() => {
                              if (hourEnabled) {
                                openForCreateFromCell(staffName, timeSlot);
                              }
                            }}
                          >
                            {bookingsInCell.length === 0 ? (
                              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-4">
                                <div className="text-sm font-medium mb-1">
                                  {hourEnabled ? "Available" : "Disabled"}
                                </div>
                                {hourEnabled && (
                                  <div className="text-xs text-gray-500">
                                    Click to book
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-2 p-1">
                                {bookingsInCell.map((booking) => (
                                  <div
                                    key={booking.id}
                                    className={`p-3 rounded-xl border-l-4 cursor-pointer shadow-sm transform transition-all hover:scale-[1.02] ${
                                      getStatusBadge(booking.status)
                                    }`}
                                    style={{
                                      borderLeftColor: 
                                        booking.status === 'upcoming' ? '#3B82F6' :
                                        booking.status === 'past' ? '#10B981' : '#EF4444',
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openForEdit(booking);
                                    }}
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                          {booking.customerName.charAt(0)}
                                        </div>
                                        <div>
                                          <div className="font-bold text-gray-900">{booking.customerName}</div>
                                          <div className="text-xs text-gray-600">{booking.customerPhone || 'No phone'}</div>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-sm font-bold text-green-700">
                                          ${booking.totalPrice}
                                        </div>
                                        <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                                          booking.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                          booking.status === 'past' ? 'bg-green-100 text-green-800' :
                                          'bg-red-100 text-red-800'
                                        }`}>
                                          {booking.status}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
                                      <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        <span className="truncate max-w-[80px]">{booking.branch}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>{booking.services.length} service{booking.services.length !== 1 ? 's' : ''}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="border-t border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 border border-blue-600"></div>
                <span className="text-sm font-medium text-gray-700">Upcoming</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 border border-green-600"></div>
                <span className="text-sm font-medium text-gray-700">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 border border-red-600"></div>
                <span className="text-sm font-medium text-gray-700">Cancelled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300 border border-gray-400"></div>
                <span className="text-sm font-medium text-gray-700">Disabled Slot</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-white border border-gray-300"></div>
                <span className="text-sm font-medium text-gray-700">Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* 🔥 RECENT BOOKINGS LIST */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">📋 Recent Bookings</h3>
            <div className="text-sm text-gray-600">
              Showing {Math.min(filteredBookings.length, 10)} of {filteredBookings.length} bookings
            </div>
          </div>
          
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-500 mb-2">No bookings found</h4>
              <p className="text-gray-400">Try adjusting your filters or create a new booking</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 font-medium text-gray-700">Customer</th>
                    <th className="text-left p-3 font-medium text-gray-700">Date & Time</th>
                    <th className="text-left p-3 font-medium text-gray-700">Branch</th>
                    <th className="text-left p-3 font-medium text-gray-700">Staff</th>
                    <th className="text-left p-3 font-medium text-gray-700">Services</th>
                    <th className="text-left p-3 font-medium text-gray-700">Amount</th>
                    <th className="text-left p-3 font-medium text-gray-700">Status</th>
                    <th className="text-left p-3 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.slice(0, 10).map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {booking.customerName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{booking.customerName}</div>
                            <div className="text-sm text-gray-500">{booking.customerPhone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm font-medium text-gray-900">
                          {format(booking.bookingDate, 'MMM d, yyyy')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {toDisplayAMPM(booking.bookingTime)}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{booking.branch}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm text-gray-700">{booking.staff || 'Unassigned'}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm text-gray-700">
                          {booking.services.length} service{booking.services.length !== 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-green-700">${booking.totalPrice}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'past' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openForEdit(booking)}
                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openInvoice(booking)}
                            className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                            title="Invoice"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this booking?")) {
                                deleteDoc(doc(db, "bookings", booking.id));
                                setBookings(prev => prev.filter(b => b.id !== booking.id));
                              }
                            }}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* =================== CREATE / EDIT MODAL - Project 1 EXACT SAME =================== */}
      {showCreate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 overflow-y-auto h-full w-full">
          <div className="relative top-10 mx-auto w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3">
            <div className="bg-white rounded-lg shadow-xl border">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">
                  {isEditing ? "Edit Booking" : "Add New Booking"}
                </h3>
                <div className="flex items-center gap-2">
                  {isEditing && (
                    <button
                      onClick={deleteBooking}
                      disabled={deleting}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
                      title="Delete booking"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                
                  {isEditing && (
                    <button
                      onClick={() => {
                        const booking = bookings.find((b) => b.id === editingId);
                        if (booking) openInvoice(booking);
                      }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      title="Generate Invoice"
                    >
                      Invoice
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowCreate(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                    title="Close"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Card Number, TRN & Notes Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
                  {/* Card Last 4 Digits */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Card Last 4 Digits
                      </div>
                    </label>
                    <input
                      type="text"
                      placeholder="XXXX"
                      maxLength={4}
                      className="mt-1 w-full border rounded-md px-3 py-2"
                      value={cardLastFour}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 4) {
                          setCardLastFour(value);
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter last 4 digits only
                    </p>
                  </div>

                  {/* TRN Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        TRN Number
                      </div>
                    </label>
                    <input
                      type="text"
                      placeholder="TRN Number"
                      className="mt-1 w-full border rounded-md px-3 py-2"
                      value={trnNumber}
                      onChange={(e) => setTrnNumber(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tax Registration Number
                    </p>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Additional Notes
                      </div>
                    </label>
                    <textarea
                      placeholder="Any additional notes"
                      className="mt-1 w-full border rounded-md px-3 py-2 min-h-[80px]"
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                    />
                  </div>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="mt-1 w-full border rounded-md px-3 py-2"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="+1234567890"
                      className="mt-1 w-full border rounded-md px-3 py-2"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="customer@example.com"
                      className="mt-1 w-full border rounded-md px-3 py-2"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Branch *
                    </label>
                    <select
                      className="mt-1 w-full border rounded-md px-3 py-2"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Category Select */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      className="mt-1 w-full border rounded-md px-3 py-2"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="">Select Category</option>
                      {Array.from(new Set(services.map((s) => s.category))).map(
                        (c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Staff *
                    </label>
                    <select
                      className="mt-1 w-full border rounded-md px-3 py-2"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                    >
                      <option value="">Select Staff</option>
                      {STAFF_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date *
                    </label>
                    <input
                      type="date"
                      className="mt-1 w-full border rounded-md px-3 py-2"
                      value={serviceDate}
                      onChange={(e) => setServiceDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Time *
                    </label>
                    <select
                      className="mt-1 w-full border rounded-md px-3 py-2"
                      value={serviceTime}
                      onChange={(e) => setServiceTime(e.target.value)}
                    >
                      {filteredTimeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {toDisplayAMPM(slot)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Method
                  </label>
                  <select
                    className="mt-1 w-full border rounded-md px-3 py-2"
                    value={paymentMethod}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      if (e.target.value !== "custom") {
                        setCustomPaymentMethod("");
                      }
                    }}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="online">Online</option>
                    <option value="custom">Custom</option>
                  </select>

                  {paymentMethod === "custom" && (
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Custom Payment Method
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full border rounded-md px-3 py-2"
                        placeholder="Enter custom payment method"
                        value={customPaymentMethod}
                        onChange={(e) => setCustomPaymentMethod(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Services table */}
                <div className="border rounded-lg">
                  <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 text-xs font-semibold">
                    <div className="col-span-4">Service</div>
                    <div className="col-span-2">Duration (min)</div>
                    <div className="col-span-2">Price</div>
                    <div className="col-span-1">Qty</div>
                    <div className="col-span-1 text-right">—</div>
                  </div>

                  {servicesList.map((s, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 px-4 py-3 border-t"
                    >
                      <div className="col-span-4">
                        <select
                          className="w-full border rounded-md px-3 py-2"
                          value={s.serviceName}
                          onChange={(e) =>
                            handleServiceChange(idx, "serviceName", e.target.value)
                          }
                        >
                          <option value="">Select a service</option>
                          {services
                            .filter((service) =>
                              selectedCategory
                                ? service.category === selectedCategory
                                : true
                            )
                            .map((service) => (
                              <option key={service.id} value={service.name}>
                                {service.name}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min={0}
                          className="w-full border rounded-md px-3 py-2"
                          value={s.duration}
                          onChange={(e) =>
                            handleServiceChange(
                              idx,
                              "duration",
                              Number(e.target.value || 0)
                            )
                          }
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          className="w-full border rounded-md px-3 py-2"
                          value={s.price}
                          onChange={(e) =>
                            handleServiceChange(
                              idx,
                              "price",
                              Number(e.target.value || 0)
                            )
                          }
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="number"
                          min={1}
                          className="w-full border rounded-md px-3 py-2"
                          value={s.quantity}
                          onChange={(e) =>
                            handleServiceChange(
                              idx,
                              "quantity",
                              Number(e.target.value || 1)
                            )
                          }
                        />
                      </div>
                      <div className="col-span-1 flex justify-end items-center">
                        {servicesList.length > 1 && (
                          <button
                            onClick={() => handleRemoveServiceRow(idx)}
                            className="p-2 rounded hover:bg-red-50 text-red-600"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="px-4 py-3 border-t">
                    <button
                      onClick={handleAddServiceRow}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add Another Service
                    </button>
                  </div>

                  {/* Tip + Discount + Total */}
                  <div className="px-4 py-3 border-t space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Tip Amount ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="mt-1 w-full border rounded-md px-3 py-2"
                          placeholder="Enter tip"
                          value={tip || ""}
                          onChange={(e) => setTip(Number(e.target.value) || 0)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Discount ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="mt-1 w-full border rounded-md px-3 py-2"
                          placeholder="Enter discount amount"
                          value={discount || ""}
                          onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                        />
                      </div>

                      <div className="flex flex-col justify-end">
                        <div className="text-sm font-semibold text-gray-800">
                          Subtotal: ${formTotals.totalPrice.toFixed(2)}
                        </div>
                        <div className="text-lg font-bold text-green-700">
                          Final Total: ${(
                            formTotals.totalPrice + (tip || 0) - (discount || 0)
                          ).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status & Payment Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Booking Status
                    </label>
                    <select
                      className="mt-1 w-full border rounded-md px-3 py-2"
                      value={status}
                      onChange={(e) =>
                        setStatus(e.target.value as BookingStatus)
                      }
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="past">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Payment Status
                    </label>
                    <select
                      className="mt-1 w-full border rounded-md px-3 py-2"
                      value={paymentStatus}
                      onChange={(e) =>
                        setPaymentStatus(e.target.value as 'pending' | 'paid' | 'refunded')
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Remarks (optional)
                  </label>
                  <textarea
                    className="mt-1 w-full border rounded-md px-3 py-2 min-h-[80px]"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>

                {/* Email/SMS Confirmation */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={emailConfirmation}
                      onChange={(e) => setEmailConfirmation(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Email Confirmation</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={smsConfirmation}
                      onChange={(e) => setSmsConfirmation(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">SMS Confirmation</span>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreate(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  disabled={saving || deleting}
                >
                  Close
                </button>
                <button
                  onClick={saveBooking}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:opacity-60"
                  disabled={saving || deleting}
                >
                  {saving
                    ? isEditing
                      ? "Updating..."
                      : "Saving..."
                    : isEditing
                    ? "Update"
                    : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================== INVOICE MODAL - Project 1 EXACT SAME =================== */}
      {showInvoice && invoiceData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            {/* Close Button */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Invoice Receipt</h2>
              <button
                onClick={() => setShowInvoice(false)}
                className="text-gray-500 hover:text-gray-800 p-2"
              >
                ✖
              </button>
            </div>

            {/* Invoice Content */}
            <div id="invoice-content" className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-xl font-bold text-blue-700">MIRRORS BEAUTY LOUNGE</h3>
                  <p className="text-gray-600">Professional Beauty Services</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">INVOICE #{invoiceData.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>

              {/* Customer & Booking Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Bill To:</h4>
                  <p className="text-gray-900 font-medium">{invoiceData.customerName}</p>
                  <p className="text-gray-600">{invoiceData.customerEmail || 'N/A'}</p>
                  <p className="text-gray-600">{invoiceData.customerPhone || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Booking Details:</h4>
                  <p className="text-gray-600">
                    <span className="font-medium">Date:</span> {format(invoiceData.bookingDate, 'MMM d, yyyy')}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Time:</span> {toDisplayAMPM(invoiceData.bookingTime)}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Branch:</span> {invoiceData.branch}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Staff:</span> {invoiceData.staff || 'Unassigned'}
                  </p>
                </div>
              </div>

              {/* Services Table */}
              <div className="border rounded-lg overflow-hidden mb-6">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-3 font-medium">Service</th>
                      <th className="text-center p-3 font-medium">Qty</th>
                      <th className="text-right p-3 font-medium">Price</th>
                      <th className="text-right p-3 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.services.map((service, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3">{service.serviceName}</td>
                        <td className="p-3 text-center">{service.quantity}</td>
                        <td className="p-3 text-right">${service.price.toFixed(2)}</td>
                        <td className="p-3 text-right font-medium">
                          ${(service.price * service.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="ml-auto max-w-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${invoiceData.totalPrice.toFixed(2)}</span>
                </div>
                {invoiceData.tipAmount && invoiceData.tipAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tip:</span>
                    <span className="font-medium text-green-600">+${invoiceData.tipAmount.toFixed(2)}</span>
                  </div>
                )}
                {invoiceData.discount && invoiceData.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-red-600">-${invoiceData.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>
                    ${(
                      invoiceData.totalPrice + 
                      (invoiceData.tipAmount || 0) - 
                      (invoiceData.discount || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-2">Payment Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Method:</span>
                    <span className="ml-2 font-medium">{invoiceData.paymentMethod}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className={`ml-2 font-medium ${
                      invoiceData.paymentStatus === 'paid' ? 'text-green-600' :
                      invoiceData.paymentStatus === 'pending' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {invoiceData.paymentStatus}
                    </span>
                  </div>
                  {invoiceData.cardLastFour && (
                    <div>
                      <span className="text-gray-600">Card:</span>
                      <span className="ml-2 font-medium">**** {invoiceData.cardLastFour}</span>
                    </div>
                  )}
                  {invoiceData.trnNumber && (
                    <div>
                      <span className="text-gray-600">TRN:</span>
                      <span className="ml-2 font-medium">{invoiceData.trnNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 text-center text-gray-500 text-sm">
                <p>Thank you for choosing Mirrors Beauty Lounge!</p>
                <p>For inquiries: contact@mirrorsbeautylounge.com | +123 456 7890</p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowInvoice(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={downloadInvoicePDF}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}