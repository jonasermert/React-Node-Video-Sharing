import { FormEvent, useState } from 'react';

export interface AuthFormValues {
  name: string;
  email: string;
  password: string;
}

interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (values: AuthFormValues) => Promise<void>;
}

export default function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const [form, setForm] = useState<AuthFormValues>({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  async function go(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await onSubmit({ ...form });
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form
      className="card form"
      onSubmit={go}
    >
      <h1>{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>

      {mode !== 'login' && (
        <label>
          Name
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            minLength={5}
          />
        </label>
      )}

      <label>
        Email
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          type="email"
        />
      </label>

      <label>
        Password
        <input
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          type="password"
          minLength={8}
        />
      </label>

      {error && <p className="error">{error}</p>}

      <button className="button">{mode === 'login' ? 'Login' : 'Register'}</button>
    </form>
  );
}
