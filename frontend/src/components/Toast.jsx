import { useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 5000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [onClose, duration]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };

  const Icon = icons[type] || CheckCircle;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${colors[type]} border rounded-md p-4 shadow-lg`}>
      <div className="flex items-center">
        <Icon className="h-5 w-5 mr-3" />
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="ml-auto text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}