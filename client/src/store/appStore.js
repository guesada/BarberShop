import { create } from 'zustand';
import apiService from '../services/apiService';
import toast from 'react-hot-toast';

const useAppStore = create((set, get) => ({
  // App State
  isLoading: false,
  theme: 'dark',
  sidebarOpen: false,
  
  // Dashboard Data
  stats: { appointments: 0, pending: 0, completed: 0, rating: 0 },
  appointments: [],
  barbers: [],
  services: [],

  // Actions
  setLoading: (loading) => set({ isLoading: loading }),
  
  toggleTheme: () => set(state => ({ 
    theme: state.theme === 'dark' ? 'light' : 'dark' 
  })),
  
  toggleSidebar: () => set(state => ({ 
    sidebarOpen: !state.sidebarOpen 
  })),
  
  closeSidebar: () => set({ sidebarOpen: false }),
  
  // Data Fetching Actions
  fetchDashboardData: async () => {
    set({ isLoading: true });
    try {
      const [statsRes, appointmentsRes, barbersRes, servicesRes] = await Promise.all([
        apiService.dashboard.getStats(),
        apiService.appointments.getAll(),
        apiService.barbers.getAll(),
        apiService.services.getAll(),
      ]);
      set({
        stats: statsRes.data,
        appointments: appointmentsRes.data.appointments,
        barbers: barbersRes.data.users,
        services: servicesRes.data.data,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      set({ isLoading: false });
    }
  },

  // Appointment Actions
  addAppointment: (appointment) => set(state => ({
    appointments: [...state.appointments, { 
      ...appointment, 
      id: Date.now() 
    }],
    stats: {
      ...state.stats,
      appointments: state.stats.appointments + 1,
      pending: state.stats.pending + 1
    }
  })),
  
  updateAppointment: (id, updates) => set(state => ({
    appointments: state.appointments.map(apt => 
      apt.id === id ? { ...apt, ...updates } : apt
    )
  })),
  
  cancelAppointment: async (id) => {
    try {
      await apiService.appointments.cancel(id);
      set(state => ({ appointments: state.appointments.filter(apt => apt.id !== id) }));
      toast.success('Agendamento cancelado com sucesso!');
    } catch (error) {
      toast.error('Não foi possível cancelar o agendamento.');
    }
  },

  _cancelAppointment_old: (id) => set(state => ({
    appointments: state.appointments.filter(apt => apt.id !== id),
    stats: {
      ...state.stats,
      appointments: state.stats.appointments - 1,
      pending: state.stats.pending - 1
    }
  })),
  
  confirmAppointment: (id) => set(state => ({
    appointments: state.appointments.map(apt => 
      apt.id === id ? { ...apt, status: 'confirmed' } : apt
    ),
    stats: {
      ...state.stats,
      pending: state.stats.pending - 1
    }
  })),
  
  // Barber Actions
  getFavoriteBarbers: () => {
    const { barbers } = get();
    return barbers.filter(barber => barber.rating >= 4.8);
  },
  
  getBarberById: (id) => {
    const { barbers } = get();
    return barbers.find(barber => barber.id === id);
  },
  
  // Service Actions
  getServiceById: (id) => {
    const { services } = get();
    return services.find(service => service.id === id);
  }
}));

export default useAppStore;
