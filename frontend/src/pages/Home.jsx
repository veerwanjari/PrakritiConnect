import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext.jsx';
import { CATEGORIES, categoryIcon } from '../constants/categories.js';

// Critically damped by default (no overshoot) — reserve bounce for
// interactions that carry momentum from a drag/flick, not a page-load fade.
const easeSpring = { type: 'spring', bounce: 0, duration: 0.4 };

const gridContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const gridItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: easeSpring },
};

function StatusBadge({ status }) {
  const cls = status === 'approved' ? 'badge-approved' : status === 'pending' ? 'badge-pending' : 'badge-rejected';
  return <span className={cls}>{status}</span>;
}

function EventCard({ e }) {
  return (
    <motion.div variants={gridItem} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }} transition={easeSpring}>
      <Link
        to={`/events/${e._id}`}
        className="group block rounded-2xl border border-canopy-100 bg-white hover:shadow-leaf transition-shadow duration-200 relative overflow-visible"
      >
        <div className="relative overflow-hidden rounded-t-2xl">
          <img
            src={e.posterUrl || '/placeholder.svg'}
            alt=""
            className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(ev) => { ev.currentTarget.onerror = null; ev.currentTarget.src = '/placeholder.svg'; }}
            loading="lazy"
          />
        </div>
        <span className="tag-leaf-solid absolute top-[9.5rem] left-3 shadow-sm z-10">
          {categoryIcon(e.category)} {e.category}
        </span>
        <div className="p-4 pt-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-canopy-950 group-hover:text-canopy-700 transition-colors line-clamp-1">{e.title}</h3>
            <StatusBadge status={e.status} />
          </div>
          <p className="text-sm text-canopy-950/60 line-clamp-2 mt-1">{e.description}</p>
          <div className="text-xs text-canopy-950/50 mt-2">{new Date(e.date).toLocaleString()} • {e.location}</div>
          <div className="mt-2 text-sun-600 text-sm font-medium">⭐ {e.averageRating?.toFixed?.(1) || '0.0'}</div>
        </div>
      </Link>
    </motion.div>
  );
}

function EventCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-canopy-100 bg-white overflow-hidden">
      <div className="w-full h-44 bg-canopy-100" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-canopy-100 w-3/4 rounded" />
        <div className="h-3 bg-canopy-100 w-full rounded" />
        <div className="h-3 bg-canopy-100 w-1/2 rounded" />
      </div>
    </div>
  );
}

function ImpactStats() {
  const [totals, setTotals] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const r = await axios.get('/api/stats/summary');
        setTotals(r.data.totals);
      } catch { /* optional, safe to ignore */ }
    })();
  }, []);

  const stats = [
    { label: 'Events hosted', value: totals?.events },
    { label: 'Upcoming', value: totals?.upcomingEvents },
    { label: 'Volunteers', value: totals?.volunteers },
    { label: 'Registrations', value: totals?.registrations },
  ];

  return (
    <motion.div
      className="card !rounded-3xl shadow-leaf grid grid-cols-2 md:grid-cols-4 gap-4"
      initial="hidden"
      animate="show"
      variants={gridContainer}
    >
      {stats.map((s) => (
        <motion.div key={s.label} variants={gridItem} className="text-center py-2">
          <div className="font-display text-3xl font-semibold text-canopy-800 tracking-tight">{s.value ?? '—'}</div>
          <div className="text-xs uppercase tracking-wide text-canopy-950/50 mt-1">{s.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function EcoLeaderboard() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const r = await axios.get('/api/stats/leaderboard');
        setRows(r.data.leaderboard || []);
      } catch { /* optional, safe to ignore */ }
    })();
  }, []);

  if (rows.length === 0) return null;

  return (
    <div className="card">
      <h2 className="font-semibold mb-3 flex items-center gap-2">🏆 Eco Champions</h2>
      <ul className="space-y-2">
        {rows.map((r, idx) => (
          <li key={r._id || idx} className="flex items-center justify-between p-2 rounded-xl bg-canopy-50">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-canopy-100 text-xs font-semibold text-canopy-800">{idx + 1}</span>
              <span className="text-sm">{r.name}</span>
            </div>
            <span className="text-canopy-700 font-semibold text-sm">{r.points} pts</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  const [events, setEvents] = useState([]);
  const [recs, setRecs] = useState([]);
  const [dash, setDash] = useState({ categories: [], upcomingByMonth: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (user) fetchRecs();
    else setRecs([]);
  }, [user]);

  async function fetchEvents(overrides = {}) {
    setLoading(true);
    setError('');
    try {
      const effQ = overrides.q !== undefined ? overrides.q : q;
      const effCategory = overrides.category !== undefined ? overrides.category : category;
      const params = {};
      if (effQ) params.q = effQ;
      if (effCategory) params.category = effCategory;
      const res = await axios.get('/api/events', { params });
      setEvents(res.data.events || []);
    } catch {
      const msg = 'Could not load events. Please make sure the API is running.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRecs() {
    try {
      const res = await axios.get('/api/stats/recommendations');
      setRecs(res.data.events || []);
    } catch { /* optional, safe to ignore */ }
  }

  async function fetchDashboard() {
    try {
      const r = await axios.get('/api/stats/dashboard');
      setDash({ categories: r.data?.categories || [], upcomingByMonth: r.data?.upcomingByMonth || [] });
    } catch { /* optional, safe to ignore */ }
  }

  return (
    <div className="space-y-8">
      <ImpactStats />

      {error && (
        <div className="rounded-xl p-3 bg-clay-500/10 border border-clay-400 text-clay-600 text-sm">{error}</div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input className="input max-w-xs" placeholder="Search events…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          <button
            className={!category ? 'tag-leaf-solid' : 'tag-leaf-outline'}
            onClick={() => { setCategory(''); fetchEvents({ category: '' }); }}
          >
            🌿 All
          </button>
          {CATEGORIES.map((c) => {
            const active = c.value === category;
            return (
              <button
                key={c.value}
                className={active ? 'tag-leaf-solid' : 'tag-leaf-outline'}
                onClick={() => { setCategory(c.value); fetchEvents({ category: c.value }); }}
              >
                {c.icon} {c.value}
              </button>
            );
          })}
        </div>
        <button className="btn" onClick={() => fetchEvents()}>Search</button>
      </div>

      {recs.length > 0 && (
        <section className="space-y-3">
          <h2 className="section-heading">Recommended for you</h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            initial="hidden"
            animate="show"
            variants={gridContainer}
          >
            {recs.map((e) => <EventCard key={e._id} e={e} />)}
          </motion.div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="section-heading">Upcoming events</h2>
        {!loading && events.length === 0 && (
          <div className="card text-center text-canopy-950/60 py-10">
            No events match your search yet. Try a different category, or be the first to <Link to="/signup" className="underline text-canopy-700">organize one</Link>.
          </div>
        )}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          initial="hidden"
          animate="show"
          variants={gridContainer}
        >
          {loading ? Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />) : events.map((e) => <EventCard key={e._id} e={e} />)}
        </motion.div>
      </section>

      <section className="grid md:grid-cols-3 gap-5">
        <EcoLeaderboard />
        {(dash.categories.length > 0 || dash.upcomingByMonth.length > 0) && (
          <div className="card md:col-span-2">
            <h2 className="font-semibold mb-3">Community activity</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium mb-2 text-canopy-950/70">By category</div>
                <ul className="space-y-1">
                  {dash.categories.map((c) => (
                    <li key={c._id} className="flex items-center justify-between p-2 rounded-lg bg-canopy-50">
                      <span>{categoryIcon(c._id)} {c._id || 'Uncategorized'}</span>
                      <span className="text-canopy-950/60">{c.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-medium mb-2 text-canopy-950/70">Upcoming (next months)</div>
                <ul className="space-y-1">
                  {dash.upcomingByMonth.map((m) => (
                    <li key={m._id} className="flex items-center justify-between p-2 rounded-lg bg-canopy-50">
                      <span>{m._id}</span>
                      <span className="text-canopy-950/60">{m.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
