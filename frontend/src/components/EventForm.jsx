import { useState, useEffect } from 'react';
import { CATEGORIES } from '../constants/categories.js';

const emptyForm = { title: '', date: '', location: '', category: CATEGORIES[0].value, description: '', posterUrl: '', capacity: '', tags: '' };

function toFormValues(event) {
  if (!event) return emptyForm;
  return {
    title: event.title || '',
    date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
    location: event.location || '',
    category: event.category || CATEGORIES[0].value,
    description: event.description || '',
    posterUrl: event.posterUrl || '',
    capacity: event.capacity ?? '',
    tags: (event.tags || []).join(', '),
  };
}

export default function EventForm({ initialValues, onSubmit, submitLabel = 'Save', onCancel }) {
  const [form, setForm] = useState(() => toFormValues(initialValues));

  useEffect(() => {
    setForm(toFormValues(initialValues));
  }, [initialValues]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      title: form.title,
      date: form.date,
      location: form.location,
      category: form.category,
      description: form.description,
      posterUrl: form.posterUrl || undefined,
      capacity: form.capacity ? Number(form.capacity) : undefined,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm text-canopy-950/60">Title</label>
        <input className="input" placeholder="e.g. Riverside Tree Plantation Drive" value={form.title} onChange={(e) => set('title', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm text-canopy-950/60">Date & time</label>
          <input className="input" type="datetime-local" value={form.date} onChange={(e) => set('date', e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-canopy-950/60">Capacity</label>
          <input className="input" type="number" min="0" placeholder="e.g. 50" value={form.capacity} onChange={(e) => set('capacity', e.target.value)} />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-sm text-canopy-950/60">Location</label>
        <input className="input" placeholder="Location" value={form.location} onChange={(e) => set('location', e.target.value)} />
      </div>
      <div className="space-y-1">
        <label className="text-sm text-canopy-950/60">Category</label>
        <select className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.value}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-sm text-canopy-950/60">Description</label>
        <textarea className="input min-h-[100px]" rows="4" placeholder="What will volunteers be doing?" value={form.description} onChange={(e) => set('description', e.target.value)} />
      </div>
      <div className="space-y-1">
        <label className="text-sm text-canopy-950/60">Poster image URL (optional)</label>
        <input className="input" placeholder="https://…" value={form.posterUrl} onChange={(e) => set('posterUrl', e.target.value)} />
        <p className="text-xs text-canopy-950/40">Paste a link to an image — no file upload needed, keeps things simple to host.</p>
      </div>
      <div className="space-y-1">
        <label className="text-sm text-canopy-950/60">Tags (comma separated, optional)</label>
        <input className="input" placeholder="beginner-friendly, weekend, kids-welcome" value={form.tags} onChange={(e) => set('tags', e.target.value)} />
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && <button type="button" className="btn-outline" onClick={onCancel}>Cancel</button>}
        <button className="btn">{submitLabel}</button>
      </div>
    </form>
  );
}
