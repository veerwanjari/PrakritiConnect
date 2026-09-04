import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Pass() {
  const [regs, setRegs] = useState([]);
  useEffect(() => {
    (async () => {
      const r = await axios.get('/api/registrations/me');
      setRegs(r.data.registrations || []);
    })();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-canopy-950">My passes</h1>
        <p className="text-sm text-canopy-950/60">Open this page once online — your QR passes stay visible for check-in at the venue.</p>
      </div>
      {regs.length === 0 ? (
        <div className="card text-center text-canopy-950/60 py-10">No passes yet — register for an event to get your entry QR.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {regs.map((r) => (
            <div key={r._id} className="card flex items-center gap-4">
              <div className="flex-1">
                <div className="font-semibold text-canopy-950">{r.event?.title}</div>
                <div className="text-sm text-canopy-950/60">{new Date(r.event?.date).toLocaleString()} • {r.event?.location}</div>
              </div>
              {r.qrCodeDataUrl && <img src={r.qrCodeDataUrl} alt="QR" className="h-24 w-24 rounded-lg border border-canopy-100" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
