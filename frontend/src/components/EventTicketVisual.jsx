import { forwardRef } from 'react';

// Pure visual — no PDF logic here. Both the ticket modal (EventTicket.jsx)
// and the off-screen PDF export (utils/ticketPdf.jsx) render this same
// component so the on-screen preview and the downloaded PDF always match.
const EventTicketVisual = forwardRef(function EventTicketVisual({ registration }, ref) {
  const event = registration?.event;
  const eventDate = event?.date ? new Date(event.date) : new Date();

  return (
    <div ref={ref} className="mx-auto rounded-3xl overflow-hidden shadow-2xl" style={{ width: 980 }}>
      <div className="relative flex" style={{ minHeight: 360 }}>
        {/* Left main area */}
        <div className="flex-1 p-8 text-white bg-gradient-to-br from-canopy-900 via-canopy-700 to-canopy-800">
          <div className="flex items-center gap-3 mb-6">
            <img src="/logo.png" alt="" className="w-9 h-9 rounded-full bg-white/10" />
            <div>
              <div className="text-sm tracking-[0.2em] text-canopy-200">PRAKRITICONNECT</div>
              <div className="text-xs text-canopy-100/70">Volunteer Entry Pass</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-4xl font-display font-bold tracking-wide">{event?.title}</div>
            <div className="text-canopy-300 font-semibold mt-1">{event?.category?.toUpperCase()}</div>
          </div>

          <div className="flex items-end gap-8 mb-6">
            <div className="text-3xl font-bold tracking-wide">{eventDate.toLocaleDateString('en-GB')}</div>
            <div className="text-3xl font-bold tracking-wide">
              {eventDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <div className="uppercase tracking-widest text-canopy-300 mb-6">{event?.location}</div>

          <div className="flex items-center">
            <div className="h-16 w-56 bg-[repeating-linear-gradient(90deg,_#fff_0,_#fff_2px,_transparent_2px,_transparent_4px)] rounded" />
          </div>
        </div>

        {/* Perforation divider */}
        <div className="w-0.5 bg-white/40 relative">
          <div className="absolute inset-y-6 left-0 right-0 border-l-2 border-dashed border-white/70" />
        </div>

        {/* Right stub */}
        <div className="w-64 p-6 text-white bg-gradient-to-b from-bark-700 to-canopy-950 flex flex-col">
          <div
            className="text-canopy-200 text-base font-bold mb-5 tracking-widest"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            {eventDate.getDate().toString().padStart(2, '0')} {(eventDate.getMonth() + 1).toString().padStart(2, '0')} {eventDate.getFullYear()} •{' '}
            {eventDate.getHours().toString().padStart(2, '0')} {eventDate.getMinutes().toString().padStart(2, '0')}
          </div>

          <div className="bg-white/10 rounded-xl p-3 mb-4 text-center">
            <div className="text-canopy-100 text-sm mb-2">ENTRY QR</div>
            {registration?.qrCodeDataUrl && (
              <img src={registration.qrCodeDataUrl} alt="QR" className="mx-auto w-36 h-36 rounded-md bg-white p-1" />
            )}
          </div>

          <div className="mt-auto text-center text-[10px] text-canopy-100/80">
            <div className="font-semibold tracking-wide">PRAKRITICONNECT</div>
            <div className="opacity-80">Every ticket plants a seed of change 🌱</div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default EventTicketVisual;
