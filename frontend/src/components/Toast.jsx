import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    success: 'bg-gradient-to-r from-green-50 to-green-100 border-green-300 text-green-800 shadow-green-100',
    error: 'bg-gradient-to-r from-red-50 to-red-100 border-red-300 text-red-800 shadow-red-100',
    warning: 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300 text-yellow-800 shadow-yellow-100',
    info: 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300 text-blue-800 shadow-blue-100',
  };

  const progressColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  const Icon = icons[toast.type] || Info;

  return (
    <div className={`max-w-sm w-full ${colors[toast.type]} border rounded-xl p-4 shadow-lg transform transition-all duration-300 ease-in-out animate-slide-in-right`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-semibold">{toast.message}</p>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={onClose}
            className="inline-flex text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-full p-1 hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress bar for auto-dismiss */}
      {toast.duration > 0 && (
        <div className="mt-3 bg-gray-200 rounded-full h-1 overflow-hidden">
          <div
            className={`h-full ${progressColors[toast.type]} transition-all duration-100 ease-linear animate-progress`}
            style={{
              animationDuration: `${toast.duration}ms`,
              animationFillMode: 'forwards'
            }}
          />
        </div>
      )}
    </div>
  );
}