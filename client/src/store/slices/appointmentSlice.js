// Simple appointment slice

// Selectors for compatibility
export const selectAppointments = (state) => state.appointments?.list || [];
export const selectAppointmentsLoading = (state) => state.appointments?.isLoading || false;
export const selectAppointmentsError = (state) => state.appointments?.error || null;

// Action creators for compatibility
export const fetchAppointments = async () => {
  // Mock function for compatibility
  return Promise.resolve([]);
};

export const createAppointment = async (data) => {
  // Mock function for compatibility
  return Promise.resolve(data);
};

export const updateAppointment = async (id, data) => {
  // Mock function for compatibility
  return Promise.resolve({ id, ...data });
};

export default () => ({});
