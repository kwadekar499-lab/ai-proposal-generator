import { CheckCircle, XCircle } from 'lucide-react';

export default function Toast({ message, type = 'success' }) {
  return (
    <div className={`toast toast-${type}`}>
      {type === 'success'
        ? <CheckCircle size={18} />
        : <XCircle size={18} />
      }
      {message}
    </div>
  );
}
