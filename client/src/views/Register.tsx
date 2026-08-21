import { useNavigate } from 'react-router-dom';
import AuthForm, { type AuthFormValues } from '../components/AuthForm';
import { auth } from '../store/auth';

export default function Register() {
  const navigate = useNavigate();

  async function submit(values: AuthFormValues) {
    await auth.register(values);
    navigate('/videos');
  }

  return (
    <div className="center">
      <AuthForm
        mode="register"
        onSubmit={submit}
      />
    </div>
  );
}
