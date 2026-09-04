import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { categoryIcon } from '../constants/categories.js';

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [toast, setToast] = useState({ open: false, type: 'info', message: '' });

  const showToast = (type, message) => {
    setToast({ open: true, type, message });
    setTimeout(() => setToast({ open: false, type: 'info', message: '' }), 5000);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  async function load() {
    const [e, r] = await Promise.all([
      axios.get(`/api/events/${id}`),
      axios.get(`/api/reviews/${id}`),
    ]);
    setEvent(e.data.event);
    setReviews(r.data.reviews || []);
    if (user) {
      const userReview = r.data.reviews?.find((review) => review.user?._id === user.id);
      setHasReviewed(!!userReview);
    }
  }

  async function register() {
    try {
      await axios.post(`/api/registrations/${id}/register`);
      showToast('success', "You're registered! Check your email for confirmation.");
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not register for this event.');
    }
  }

  function shareEvent() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: event.title, text: event.description, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      showToast('info', 'Event link copied to clipboard!');
    }
  }

  function downloadIcs() {
    const start = new Date(event.date);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//PrakritiConnect//EN\nBEGIN:VEVENT\nUID:${event._id}@prakriticonnect\nDTSTAMP:${start.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\nDTSTART:${start.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\nDTEND:${end.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\nSUMMARY:${event.title}\nDESCRIPTION:${event.description}\nLOCATION:${event.location}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${event.title}.ics`; a.click();
    URL.revokeObjectURL(url);
  }

  async function submitReview() {
    try {
      await axios.post(`/api/reviews/${id}`, { rating, comment });
      showToast('success', 'Thanks — your review is posted!');
      setComment('');
      await load();
    } catch (error) {
      if (error.response?.status === 401) {
        showToast('warning', 'Please log in to post a review.');
      } else if (error.response?.status === 400 && error.response?.data?.message?.includes('reviewed')) {
        showToast('info', 'You have already reviewed this event.');
      } else {
        showToast('error', `Could not post review: ${error.response?.data?.message || 'please try again.'}`);
      }
    }
  }

  if (!event) return <div className="card text-center py-10 text-canopy-950/60">Loading event…</div>;

  return (
    <div className="space-y-5">
      {toast.open && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white ${toast.type === 'success' ? 'bg-canopy-600' : toast.type === 'warning' ? 'bg-sun-600' : toast.type === 'error' ? 'bg-clay-600' : 'bg-pond-600'}`}>
          <div className="flex items-start gap-3">
            <span className="font-semibold capitalize">{toast.type}</span>
            <span className="opacity-90">{toast.message}</span>
            <button className="ml-4 opacity-80 hover:opacity-100" onClick={() => setToast({ ...toast, open: false })}>×</button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        <div className="relative">
          <img
            src={event.posterUrl || '/placeholder.svg'}
            onError={(ev) => { ev.currentTarget.onerror = null; ev.currentTarget.src = '/placeholder.svg'; }}
            className="w-full h-72 object-cover rounded-2xl"
            alt=""
          />
          <span className="tag-leaf-solid absolute -bottom-3 left-4 shadow-sm">
            {categoryIcon(event.category)} {event.category}
          </span>
        </div>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-canopy-950">{event.title}</h1>
          <p className="text-canopy-950/70 mt-3">{event.description}</p>
          <div className="text-sm text-canopy-950/60 mt-3">📅 {new Date(event.date).toLocaleString()}</div>
          <div className="text-sm text-canopy-950/60">📍 {event.location}</div>
          {event.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {event.tags.map((t) => (
                <span key={t} className="tag-leaf-outline">{t}</span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-5">
            <button className="btn" onClick={register} disabled={!user}>{user ? 'Register to volunteer' : 'Log in to register'}</button>
            <button className="btn-outline" onClick={shareEvent}>Share</button>
            <button className="btn-outline" onClick={downloadIcs}>Add to calendar</button>
          </div>
          {!user && (
            <p className="text-xs text-canopy-950/50 mt-2">
              <Link to="/login" className="underline">Log in</Link> or <Link to="/signup" className="underline">sign up</Link> to register.
            </p>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-3">Reviews</h2>
        {user && !hasReviewed && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <select className="input w-auto" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} ⭐</option>)}
            </select>
            <input className="input flex-1 min-w-[200px]" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience" />
            <button className="btn" onClick={submitReview} disabled={!comment.trim()}>Post</button>
          </div>
        )}
        {user && hasReviewed && (
          <div className="rounded-xl bg-canopy-100 border border-canopy-200 p-3 mb-4 text-sm text-canopy-800">
            ✅ You've already reviewed this event — thanks for the feedback!
          </div>
        )}
        {reviews.length === 0 ? (
          <div className="text-sm text-canopy-950/50 italic text-center py-6">No reviews yet — be the first to share your experience.</div>
        ) : (
          <ul className="space-y-2">
            {reviews.map((r) => (
              <li key={r._id} className="p-3 border border-canopy-100 rounded-xl bg-canopy-50/60">
                <div className="text-sm text-canopy-950/50">{r.user?.name} • {new Date(r.createdAt).toLocaleString()}</div>
                <div className="text-sun-600">⭐ {r.rating}</div>
                <p className="text-canopy-950/80 text-sm mt-1">{r.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
