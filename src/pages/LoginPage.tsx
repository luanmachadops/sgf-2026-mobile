import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const schema = z.object({
  cpf: z.string().min(11, 'Informe o CPF'),
  password: z.string().min(1, 'Informe a senha')
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const { driver, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  if (driver) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await login(data.cpf, data.password);
      navigate(from, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha no login.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <p className="eyebrow">SGF 2026</p>
        <h1>App do Motorista</h1>
        <p className="muted">Entre com CPF e senha para acessar as operacoes da frota.</p>

        <form className="stack" onSubmit={handleSubmit(onSubmit)}>
          <label className="field">
            <span>CPF</span>
            <input type="text" inputMode="numeric" placeholder="00000000000" {...register('cpf')} />
            {errors.cpf && <small>{errors.cpf.message}</small>}
          </label>

          <label className="field">
            <span>Senha</span>
            <input type="password" placeholder="Sua senha" {...register('password')} />
            {errors.password && <small>{errors.password.message}</small>}
          </label>

          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
