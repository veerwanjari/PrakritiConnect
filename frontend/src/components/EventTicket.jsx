import { useEffect, useRef } from 'react';
import EventTicketVisual from './EventTicketVisual.jsx';
import { downloadTicketFromNode } from '../utils/ticketPdf.jsx';

export default function EventTicket({ registration, onDownload, onReady }) {
  const ticketRef = useRef(null);

  const downloadTicket = async () => {
    if (!ticketRef.current) return;
    try {
      await downloadTicketFromNode(ticketRef.current, registration);
      if (onDownload) onDownload();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  useEffect(() => {
    if (typeof onReady === 'function') onReady(downloadTicket);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onReady]);

  return <EventTicketVisual ref={ticketRef} registration={registration} />;
}
