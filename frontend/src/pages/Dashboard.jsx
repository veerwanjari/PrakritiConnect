import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import EventTicket from '../components/EventTicket.jsx';
import EventForm from '../components/EventForm.jsx';
import ActionMenu from '../components/ActionMenu.jsx';
import { downloadTicketPdf } from '../utils/ticketPdf.jsx';
import { categoryIcon } from '../constants/categories.js';

function StatusPill({ status }) {
  const cls = status === 'approved' ? 'text-canopy-700' : status === 'pending' ? 'text-sun-600' : 'text-clay-600';
  return <span className={`font-medium capitalize ${cls}`}>{status}</span>;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [mine, setMine] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [downloadAction, setDownloadAction] = useState(null);
  const [toast, setToast] = useState({ open: false, type: 'info', message: '' });

  const showToast = (type, message) => {
    setToast({ open: true, type, message });
    setTimeout(() => setToast({ open: false, type: 'info', message: '' }), 3000);
  };

  useEffect(() => {
    if (!user) return;
    if (user.role === 'volunteer') loadMyRegs();
    if (user.role === 'organizer') loadMyEvents();
    if (user.role === 'admin') loadMyEvents();
  }, [user]);

  async function loadMyRegs() {
    const res = await axios.get('/api/registrations/me');
    setMine(res.data.registrations || []);
  }

  async function loadMyEvents() {
    // Admins manage every organizer's events, not just their own.
    const params = user.role === 'admin' ? {} : { organizer: user.id };
    const res = await axios.get('/api/events', { params });
    setMine(res.data.events || []);
  }

  async function loadParticipants(eventId) {
    const res = await axios.get(`/api/registrations/${eventId}/participants`);
    setParticipants(res.data.participants || []);
  }

  async function exportCsv(eventId) {
    try {
      const check = await axios.get(`/api/registrations/${eventId}/participants`);
      const list = check.data.participants || [];
      if (!Array.isArray(list) || list.length === 0) {
        showToast('error', 'No participants registered for this event yet.');
        return;
      }
    } catch {
      showToast('error', 'Unable to fetch participants. Please try again.');
      return;
    }

    const res = await axios.get(`/api/registrations/${eventId}/participants.csv`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url; a.download = `participants-${eventId}.csv`; a.click();
    window.URL.revokeObjectURL(url);
  }

  async function createEvent(values) {
    try {
      await axios.post('/api/events', values);
      showToast('success', 'Event submitted for approval!');
      await loadMyEvents();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not create event.');
    }
  }

  async function saveEdit(values) {
    try {
      await axios.put(`/api/events/${editingEvent._id}`, values);
      showToast('success', 'Event updated.');
      setEditingEvent(null);
      await loadMyEvents();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not update event.');
    }
  }

  async function removeEvent(id) {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    try {
      await axios.delete(`/api/events/${id}`);
      showToast('success', 'Event deleted.');
      await loadMyEvents();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not delete event.');
    }
  }

  // Admins can approve/reject any event at any time — not just ones still pending —
  // so a decision can be reversed later if needed.
  async function approve(id) {
    try {
      await axios.post(`/api/admin/events/${id}/approve`);
      showToast('success', 'Event approved.');
      await loadMyEvents();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not approve event.');
    }
  }

  async function reject(id) {
    try {
      await axios.post(`/api/admin/events/${id}/reject`);
      showToast('info', 'Event rejected.');
      await loadMyEvents();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not reject event.');
    }
  }

  const analytics = useMemo(() => {
    const byStatus = mine.reduce((acc, e) => { acc[e.status] = (acc[e.status] || 0) + 1; return acc; }, {});
    const byCategory = mine.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + 1; return acc; }, {});
    return { byStatus, byCategory };
  }, [mine]);

  const isStaff = user?.role === 'organizer' || user?.role === 'admin';

  return (
    <div className="space-y-5">
      {toast.open && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-xl text-white shadow-lg ${toast.type === 'error' ? 'bg-clay-600' : toast.type === 'success' ? 'bg-canopy-600' : 'bg-pond-600'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-canopy-950">Dashboard</h1>
          <p className="text-sm text-canopy-950/60">{user?.name} • <span className="capitalize">{user?.role}</span></p>
        </div>
        <button className="btn-ghost" onClick={logout}>Logout</button>
      </div>

      {user?.role === 'volunteer' && (
        <div className="card">
          <h2 className="font-semibold mb-4">My registrations</h2>
          {mine.length === 0 ? (
            <div className="text-sm text-canopy-950/50 italic p-8 text-center border border-dashed border-canopy-200 rounded-xl">
              No registrations yet — browse events and sign up to start volunteering.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mine.map((r) => (
                <div key={r._id} className="p-4 border border-canopy-100 rounded-xl hover:shadow-sm transition">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-medium text-canopy-950">{categoryIcon(r.event?.category)} {r.event?.title}</div>
                      <div className="text-sm text-canopy-950/60 mt-1">{new Date(r.event?.date).toLocaleDateString()} • {r.event?.location}</div>
                      <div className="text-sm mt-1">Status: <StatusPill status={r.status === 'registered' ? 'approved' : r.status} /></div>
                    </div>
                    {r.qrCodeDataUrl && <img src={r.qrCodeDataUrl} className="h-16 w-16 border border-canopy-100 rounded-lg" alt="QR Code" />}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button onClick={() => setSelectedTicket(r)} className="btn-outline !px-3 !py-1.5 text-xs">View ticket</button>
                    <button onClick={() => downloadTicketPdf(r)} className="btn !px-3 !py-1.5 text-xs">📥 Download</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isStaff && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card">
            <h2 className="font-semibold mb-4">Create an event</h2>
            <EventForm onSubmit={createEvent} submitLabel="Publish" />
          </div>

          <div className="space-y-4">
            <div className="card">
              <h2 className="font-semibold mb-3">Analytics</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="font-medium mb-1 text-canopy-950/70">By status</div>
                  <ul className="space-y-1">{Object.entries(analytics.byStatus).map(([k, v]) => <li key={k} className="flex justify-between"><span className="capitalize">{k}</span><span className="font-semibold">{v}</span></li>)}</ul>
                </div>
                <div>
                  <div className="font-medium mb-1 text-canopy-950/70">By category</div>
                  <ul className="space-y-1">{Object.entries(analytics.byCategory).map(([k, v]) => <li key={k} className="flex justify-between"><span>{categoryIcon(k)} {k}</span><span className="font-semibold">{v}</span></li>)}</ul>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="font-semibold mb-3">{user.role === 'admin' ? 'All events (every organizer)' : 'My events'}</h2>
              {mine.length === 0 ? (
                <div className="text-sm text-canopy-950/50 italic text-center py-6 border border-dashed border-canopy-200 rounded-xl">No events yet{user.role === 'organizer' ? ' — publish your first drive.' : '.'}</div>
              ) : (
                <ul className="space-y-2">
                  {mine.map((e) => (
                    <li key={e._id} className="p-3 border border-canopy-100 rounded-xl space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium">{categoryIcon(e.category)} {e.title}</div>
                          <div className="text-sm text-canopy-950/50">
                            Status: <StatusPill status={e.status} />
                            {user.role === 'admin' && e.organizer?.name ? ` • by ${e.organizer.name}` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end items-center">
                        {user.role === 'admin' && (
                          <>
                            <button className="btn !bg-canopy-600 !px-3 !py-1 text-xs disabled:opacity-40" disabled={e.status === 'approved'} onClick={() => approve(e._id)}>Approve</button>
                            <button className="btn !bg-clay-600 hover:!bg-clay-700 !px-3 !py-1 text-xs disabled:opacity-40" disabled={e.status === 'rejected'} onClick={() => reject(e._id)}>Reject</button>
                          </>
                        )}
                        <ActionMenu
                          items={[
                            { label: 'Edit', onClick: () => setEditingEvent(e) },
                            { label: 'Participants', onClick: () => { setSelectedEvent(e._id); loadParticipants(e._id); } },
                            { label: 'Export CSV', onClick: () => exportCsv(e._id) },
                            { label: 'Delete', onClick: () => removeEvent(e._id), danger: true },
                          ]}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {selectedEvent && (
              <div className="card">
                <h2 className="font-semibold mb-2">Participants</h2>
                {participants.length === 0 ? (
                  <div className="text-sm text-canopy-950/50 italic p-4 text-center border border-dashed border-canopy-200 rounded-lg">No participants found</div>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {participants.map((a) => (
                      <li key={a._id} className="flex items-center justify-between p-2 border border-canopy-100 rounded-lg">
                        <span>{a.user?.name} ({a.user?.email})</span>
                        <span className="text-canopy-950/50 capitalize">{a.status}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {editingEvent && (
        <div className="fixed inset-0 bg-canopy-950/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-display font-semibold text-canopy-950">Edit event</h3>
              <button onClick={() => setEditingEvent(null)} className="text-canopy-950/50 hover:text-canopy-950 text-2xl leading-none" aria-label="Close">×</button>
            </div>
            <EventForm initialValues={editingEvent} onSubmit={saveEdit} submitLabel="Save changes" onCancel={() => setEditingEvent(null)} />
          </div>
        </div>
      )}

      {selectedTicket && (
        <div className="fixed inset-0 bg-canopy-950/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-display font-semibold text-canopy-950">Event ticket</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => downloadAction && downloadAction()} className="btn !px-3 !py-1.5 text-sm">📥 Download ticket</button>
                  <button onClick={() => setSelectedTicket(null)} className="text-canopy-950/50 hover:text-canopy-950 text-2xl leading-none" aria-label="Close">×</button>
                </div>
              </div>
              <EventTicket registration={selectedTicket} onReady={(fn) => setDownloadAction(() => fn)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}