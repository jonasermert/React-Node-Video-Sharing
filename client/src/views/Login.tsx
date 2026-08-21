import { useNavigate } from 'react-router-dom';
import AuthForm, { type AuthFormValues } from '../components/AuthForm';
import { auth } from '../store/auth';

export default function Login() {
  const navigate = useNavigate();

  async function submit(values: AuthFormValues) {
    await auth.login(values);
    navigate('/videos');
  }

  return (
    <div className="center">
      <AuthForm
        mode="login"
        onSubmit={submit}
      />
    </div>
  );
}
