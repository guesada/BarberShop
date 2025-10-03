import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, User, Scissors, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import apiService from '../services/apiService';
import toast from 'react-hot-toast';

// --- Styled Components ---
const ModalBackdrop = styled(motion.div)`
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 2000;
`;

const ModalContainer = styled(motion.div)`
  background: var(--color-surface); border-radius: var(--radius-lg); width: 90%; max-width: 500px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: var(--space-16) var(--space-24); border-bottom: 1px solid var(--color-secondary); display: flex; justify-content: space-between; align-items: center;
  h2 { font-size: 1.25rem; color: var(--color-text); }
`;

const CloseButton = styled.button`
  background: none; border: none; color: var(--color-text-secondary); cursor: pointer; padding: var(--space-8);
`;

const ModalContent = styled.div`
  padding: var(--space-24); overflow-y: auto; flex: 1;
`;

const ModalFooter = styled.div`
  padding: var(--space-16) var(--space-24); border-top: 1px solid var(--color-secondary); display: flex; justify-content: space-between;
`;

const StepIndicator = styled.div`
  display: flex; gap: var(--space-8); margin-bottom: var(--space-24); justify-content: center;
`;

const StepDot = styled.div`
  width: 10px; height: 10px; border-radius: 50%; background: ${({ active }) => (active ? 'var(--color-primary)' : 'var(--color-secondary)')}; transition: background var(--transition-base);
`;

const StepContent = styled(motion.div)``;

const SelectionGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: var(--space-16);
`;

const SelectionCard = styled.div`
  background: var(--color-background); border: 2px solid ${({ selected }) => (selected ? 'var(--color-primary)' : 'var(--color-secondary)')}; border-radius: var(--radius-base); padding: var(--space-16); text-align: center; cursor: pointer; transition: all var(--transition-base);
  &:hover { transform: translateY(-4px); border-color: var(--color-primary); }
  h4 { font-size: 1rem; margin-top: var(--space-8); color: var(--color-text); }
`;

const NavButton = styled.button`
  background: var(--color-primary); color: white; padding: var(--space-12) var(--space-20); border-radius: var(--radius-base); border: none; cursor: pointer; display: inline-flex; align-items: center; gap: var(--space-8);
  &:disabled { background: var(--color-secondary); cursor: not-allowed; }
`;

const CalendarContainer = styled.div`
  .react-calendar { width: 100%; border: none; background: var(--color-surface); color: var(--color-text); border-radius: var(--radius-base); padding: var(--space-12); }
  .react-calendar__tile--active { background: var(--color-primary); border-radius: 50%; }
  .react-calendar__tile--now { background: var(--color-secondary); border-radius: 50%; }
  .react-calendar__navigation button { color: var(--color-primary); font-weight: bold; }
  .react-calendar__month-view__days__day--weekend { color: var(--color-primary-hover); }
  .react-calendar__tile:disabled { background-color: var(--color-background); color: var(--color-text-secondary); opacity: 0.5; }
`;

const TimeSlotGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: var(--space-12); margin-top: var(--space-24);
`;

const TimeSlot = styled.button`
  background: ${({ selected }) => (selected ? 'var(--color-primary)' : 'var(--color-background)')}; color: ${({ selected }) => (selected ? 'white' : 'var(--color-text)')}; border: 1px solid var(--color-secondary); padding: var(--space-12); border-radius: var(--radius-base); cursor: pointer; transition: all var(--transition-fast);
  &:hover { border-color: var(--color-primary); transform: scale(1.05); }
  &:disabled { background: var(--color-secondary); cursor: not-allowed; opacity: 0.5; }
`;

const ConfirmationSummary = styled.div`
  h3 { margin-bottom: var(--space-16); text-align: center; }
  p { font-size: 1.1rem; color: var(--color-text-secondary); margin-bottom: var(--space-16); line-height: 1.8; }
  strong { color: var(--color-text); }
`;

const SummaryCard = styled.div`
  background: var(--color-background); padding: var(--space-20); border-radius: var(--radius-base); border: 1px solid var(--color-secondary);
`;

const steps = ['Serviço', 'Barbeiro', 'Data e Hora', 'Confirmar'];

// --- Component ---
const NewAppointmentModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [selection, setSelection] = useState({ service: null, barber: null, dateTime: null });
  const [selectedDate, setSelectedDate] = useState(new Date());

  // --- API Calls ---
  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: () => apiService.services.getAll(),
  });

  const { data: barbers, isLoading: isLoadingBarbers } = useQuery({
    queryKey: ['barbers'],
    queryFn: () => apiService.barbers.getAll(),
    enabled: !!selection.service,
  });

  const { data: availability, isLoading: isLoadingAvailability } = useQuery({
    queryKey: ['availability', selection.barber?.id, selectedDate.toISOString().split('T')[0]],
    queryFn: () => apiService.barbers.getAvailability(selection.barber.id, selectedDate.toISOString().split('T')[0]),
    enabled: !!selection.barber && !!selectedDate,
  });

  const appointmentMutation = useMutation({
    mutationFn: apiService.appointments.create,
    onSuccess: () => {
      toast.success('Agendamento confirmado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Não foi possível criar o agendamento.');
    }
  });

  // --- Handlers ---
  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleConfirm = () => {
    appointmentMutation.mutate({
      service_id: selection.service.id,
      barber_id: selection.barber.id,
      appointment_date: selection.dateTime.toISOString(),
    });
  };

  // --- Render Logic ---
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        if (isLoadingServices) return <p>Carregando serviços...</p>;
        return (
          <SelectionGrid>
            {services?.data?.data.map((service) => (
              <SelectionCard key={service.id} selected={selection.service?.id === service.id} onClick={() => setSelection((prev) => ({ ...prev, service }))}>
                <Scissors size={32} />
                <h4>{service.name}</h4>
                <p>R$ {service.price}</p>
              </SelectionCard>
            ))}
          </SelectionGrid>
        );
      case 1:
        if (isLoadingBarbers) return <p>Carregando barbeiros...</p>;
        return (
          <SelectionGrid>
            {barbers?.data?.data?.users.map((barber) => (
              <SelectionCard key={barber.id} selected={selection.barber?.id === barber.id} onClick={() => setSelection((prev) => ({ ...prev, barber }))}>
                <User size={32} />
                <h4>{barber.name}</h4>
              </SelectionCard>
            ))}
          </SelectionGrid>
        );
      case 2:
        return (
          <CalendarContainer>
            <Calendar onChange={setSelectedDate} value={selectedDate} minDate={new Date()} />
            {isLoadingAvailability && <p>Verificando horários...</p>}
            {availability && (
              <TimeSlotGrid>
                {availability.data.availableSlots.map((slot) => (
                  <TimeSlot key={slot.time} selected={selection.dateTime?.toTimeString().startsWith(slot.time)} onClick={() => {
                    const [hours, minutes] = slot.time.split(':');
                    const newDateTime = new Date(selectedDate);
                    newDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                    setSelection((prev) => ({ ...prev, dateTime: newDateTime }));
                  }}>
                    {slot.time}
                  </TimeSlot>
                ))}
              </TimeSlotGrid>
            )}
          </CalendarContainer>
        );
      case 3:
        return (
          <ConfirmationSummary>
            <h3>Resumo do Agendamento</h3>
            <SummaryCard>
              <p><strong>Serviço:</strong> {selection.service?.name}</p>
              <p><strong>Barbeiro:</strong> {selection.barber?.name}</p>
              <p><strong>Data:</strong> {selection.dateTime?.toLocaleDateString()}</p>
              <p><strong>Hora:</strong> {selection.dateTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <hr style={{ margin: 'var(--space-16) 0', border: '1px solid var(--color-secondary)' }} />
              <p><strong>Preço:</strong> R$ {selection.service?.price}</p>
            </SummaryCard>
          </ConfirmationSummary>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  // --- JSX ---
  return (
    <ModalBackdrop initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <ModalContainer initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}>
        <ModalHeader>
          <h2>Novo Agendamento</h2>
          <CloseButton onClick={onClose}><X /></CloseButton>
        </ModalHeader>
        <ModalContent>
          <StepIndicator>
            {steps.map((_, index) => (
              <StepDot key={index} active={index === currentStep} />
            ))}
          </StepIndicator>
          <AnimatePresence mode="wait">
            <StepContent key={currentStep} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} transition={{ duration: 0.3 }}>
              {renderStepContent()}
            </StepContent>
          </AnimatePresence>
        </ModalContent>
        <ModalFooter>
          <NavButton onClick={handleBack} disabled={currentStep === 0}>
            <ArrowLeft />
            Voltar
          </NavButton>
          {currentStep === steps.length - 1 ? (
            <NavButton onClick={handleConfirm} disabled={appointmentMutation.isPending}>
              {appointmentMutation.isPending ? 'Confirmando...' : 'Confirmar Agendamento'}
              <Check />
            </NavButton>
          ) : (
            <NavButton onClick={handleNext} disabled={ (currentStep === 0 && !selection.service) || (currentStep === 1 && !selection.barber) || (currentStep === 2 && !selection.dateTime) }>
              Avançar
              <ArrowRight />
            </NavButton>
          )}
        </ModalFooter>
      </ModalContainer>
    </ModalBackdrop>
  );
};

export default NewAppointmentModal;
