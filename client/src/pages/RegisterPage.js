import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Scissors, User, UserCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import styled, { ThemeProvider } from 'styled-components';
import { useAppSelector, useAppDispatch } from '../store';
import { selectEffectiveTheme } from '../store/slices/uiSlice';
import { registerUser, selectAuth } from '../store/slices/authSlice';
import { lightTheme, darkTheme } from '../styles/theme';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';

const RegisterContainer = styled(motion.div)`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
  padding: ${({ theme }) => theme.spacing[6]};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing[4]};
  }
`;

const RegisterHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const BackButton = styled(Button)`
  position: absolute;
  top: ${({ theme }) => theme.spacing[6]};
  left: ${({ theme }) => theme.spacing[6]};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    top: ${({ theme }) => theme.spacing[4]};
    left: ${({ theme }) => theme.spacing[4]};
  }
`;

const RegisterLogo = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const LogoCircle = styled.div`
  width: 60px;
  height: 60px;
  background: ${({ theme }) => theme.colors.primary[500]};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: ${({ theme }) => theme.shadows.orange};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 50px;
    height: 50px;
  }
`;

const RegisterTitle = styled(motion.h2)`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
  }
`;

const RegisterSubtitle = styled(motion.p)`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
`;

const RegisterForm = styled(motion.form)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[5]};
  width: 100%;
`;

const FormGroup = styled.div`
  margin-bottom: var(--space-20);
`;

const FormLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: white;
  margin-bottom: var(--space-8);
  font-family: 'Inter', sans-serif;
`;

const InputContainer = styled.div`
  position: relative;
`;

const FormInput = styled.input`
  width: 100%;
  padding: var(--space-16);
  background: var(--color-surface);
  border: 1px solid var(--color-secondary);
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-family: 'Inter', sans-serif;
  transition: all var(--transition-base);
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
  }
  
  &::placeholder {
    color: var(--color-text-secondary);
  }
  
  &.error {
    border-color: #ef4444;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: var(--space-16);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0;
  
  &:hover {
    color: var(--color-primary);
  }
`;

const ErrorMessage = styled.span`
  display: block;
  color: #ef4444;
  font-size: 12px;
  margin-top: var(--space-4);
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: flex-start;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: 1.4;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  margin-right: ${({ theme }) => theme.spacing[2]};
  accent-color: ${({ theme }) => theme.colors.primary[500]};
  margin-top: 2px;
  cursor: pointer;
`;

const SubmitButton = styled(motion.button)`
  width: 100%;
  padding: var(--space-16);
  background: var(--color-primary);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  margin-bottom: var(--space-24);
  font-family: 'Inter', sans-serif;
  
  &:hover:not(:disabled) {
    background: var(--color-primary-hover);
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(255, 107, 53, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const RegisterFooter = styled(motion.div)`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  margin-top: ${({ theme }) => theme.spacing[6]};
  
  p {
    margin-bottom: ${({ theme }) => theme.spacing[2]};
  }
  
  a {
    color: ${({ theme }) => theme.colors.primary[500]};
    text-decoration: none;
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    cursor: pointer;
    transition: all ${({ theme }) => theme.animations.duration.normal} ${({ theme }) => theme.animations.easing.easeOut};
    
    &:hover {
      color: ${({ theme }) => theme.colors.primary[400]};
      text-decoration: underline;
    }
  }
`;

const pageVariants = {
  initial: { opacity: 0, x: -20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: 20 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5
};

function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectEffectiveTheme);
  const { isLoading, error } = useAppSelector(selectAuth);
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;
  
  const userType = location.state?.userType || 'client';
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      await dispatch(registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        userType: userType
      })).unwrap();
      
      toast.success('Cadastro realizado com sucesso!');
      navigate('/login', { state: { userType } });
    } catch (error) {
      toast.error(error || 'Erro ao criar conta');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login', { state: { userType } });
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <RegisterContainer
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <BackButton
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
          onClick={handleBack}
          iconOnly
        />
        
        <Card padding="xl" style={{ width: '100%', maxWidth: '400px' }}>
          <RegisterHeader>
        
        <RegisterLogo>
          <LogoCircle>
            {userType === 'cliente' ? (
              <User size={24} color="white" />
            ) : (
              <UserCheck size={24} color="white" />
            )}
          </LogoCircle>
        </RegisterLogo>
        
        <RegisterTitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Cadastro {userType === 'cliente' ? 'Cliente' : 'Barbeiro'}
        </RegisterTitle>
        
        <RegisterSubtitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Crie sua conta para começar
        </RegisterSubtitle>
      </RegisterHeader>

      <RegisterForm
        onSubmit={handleSubmit(onSubmit)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Input
          label="Nome Completo"
          type="text"
          placeholder="Digite seu nome completo"
          error={errors.name?.message}
          {...register('name', {
            required: 'Nome é obrigatório',
            minLength: {
              value: 2,
              message: 'Nome deve ter pelo menos 2 caracteres'
            }
          })}
        />

        <Input
          label="E-mail"
          type="email"
          placeholder="Digite seu e-mail"
          error={errors.email?.message}
          {...register('email', {
            required: 'E-mail é obrigatório',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'E-mail inválido'
            }
          })}
        />

        <Input
          label="Senha"
          type="password"
          placeholder="Digite sua senha"
          error={errors.password?.message}
          {...register('password', {
            required: 'Senha é obrigatória',
            minLength: {
              value: 6,
              message: 'Senha deve ter pelo menos 6 caracteres'
            }
          })}
        />

        <Input
          label="Confirmar Senha"
          type="password"
          placeholder="Confirme sua senha"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Confirmação de senha é obrigatória',
            validate: value => value === password || 'As senhas não coincidem'
          })}
        />

        <CheckboxContainer>
          <CheckboxLabel>
            <Checkbox
              type="checkbox"
              {...register('terms', {
                required: 'Você deve aceitar os termos de uso'
              })}
            />
            Aceito os{' '}
            <a href="#" onClick={(e) => e.preventDefault()}>
              termos de uso
            </a>{' '}
            e{' '}
            <a href="#" onClick={(e) => e.preventDefault()}>
              política de privacidade
            </a>
          </CheckboxLabel>
        </CheckboxContainer>
        {errors.terms && <span style={{ color: currentTheme.colors.error[500], fontSize: currentTheme.typography.fontSize.xs }}>{errors.terms.message}</span>}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
        >
          Criar Conta
        </Button>

        <RegisterFooter>
          <p>Já tem uma conta?</p>
          <a onClick={handleLogin}>
            Fazer login
          </a>
        </RegisterFooter>
      </RegisterForm>
    </Card>
  </RegisterContainer>
</ThemeProvider>
);
}

export default RegisterPage;
