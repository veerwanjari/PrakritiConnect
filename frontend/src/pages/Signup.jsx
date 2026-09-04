import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { CATEGORIES } from '../constants/categories.js';

export default function Signup() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('volunteer');
  const [interests, setInterests] = useState([]);
  const [error, setError] = useState('');

  function toggleInterest(value) {
    setInterests((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/auth/signup', { name, email, password, role, interests });
      login(res.data);
      nav('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="text-center">
        <img src="/logo.png" alt="" className="w-14 h-14 mx-auto rounded-full mb-2" />
        <h1 className="font-display font-semibold text-2xl text-canopy-950">Join PrakritiConnect</h1>
        <p className="text-sm text-canopy-950/60 mt-1">Sign up to volunteer or start organizing green events.</p>
      </div>
      {error && <div className="rounded-xl bg-clay-500/10 border border-clay-400 text-clay-600 text-sm px-3 py-2">{error}</div>}
      <form onSubmit={submit} className="card space-y-3">
        <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRole('volunteer')}
            className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${role === 'volunteer' ? 'border-canopy-600 bg-canopy-100 text-canopy-800' : 'border-canopy-200 text-canopy-950/60 hover:bg-canopy-50'}`}
          >
            🙋 Volunteer
          </button>
          <button
            type="button"
            onClick={() => setRole('organizer')}
            className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${role === 'organizer' ? 'border-canopy-600 bg-canopy-100 text-canopy-800' : 'border-canopy-200 text-canopy-950/60 hover:bg-canopy-50'}`}
          >
            📋 Organizer
          </button>
        </div>

        {role === 'volunteer' && (
          <div>
            <label className="text-xs font-medium text-canopy-950/60 uppercase tracking-wide">Causes you care about (optional)</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => toggleInterest(c.value)}
                  className={interests.includes(c.value) ? 'tag-leaf-solid' : 'tag-leaf-outline'}
                >
                  {c.icon} {c.value}
                </button>
              ))}
            </div>
          </div>
        )}

        <button className="btn w-full">Create account</button>
      </form>
      <div className="text-sm text-canopy-950/60 text-center">Have an account? <Link to="/login" className="underline text-canopy-700">Login</Link></div>
    </div>
  );
}
