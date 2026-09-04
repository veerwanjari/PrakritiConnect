import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      login(res.data);
      nav('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="text-center">
        <img src="/logo.png" alt="" className="w-14 h-14 mx-auto rounded-full mb-2" />
        <h1 className="font-display font-semibold text-2xl text-canopy-950">Welcome back</h1>
        <p className="text-sm text-canopy-950/60 mt-1">Log in to register for events or manage your drives.</p>
      </div>
      {error && <div className="rounded-xl bg-clay-500/10 border border-clay-400 text-clay-600 text-sm px-3 py-2">{error}</div>}
      <form onSubmit={submit} className="card space-y-3">
        <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn w-full">Login</button>
      </form>
      <div className="card text-sm">
        <div className="font-semibold mb-2 text-canopy-950/80">Demo credentials</div>
        <ul className="space-y-1 text-canopy-950/70">
          <li><span className="font-medium">Volunteer</span>: volunteer@example.com / password</li>
          <li><span className="font-medium">Organizer</span>: organizer@example.com / password</li>
          <li><span className="font-medium">Admin</span>: admin@example.com / password</li>
        </ul>
      </div>
      <div className="text-sm text-canopy-950/60 text-center">No account? <Link to="/signup" className="underline text-canopy-700">Sign up</Link></div>
    </div>
  );
}
