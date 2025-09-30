export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    active: 'bg-status-active text-white',
    inactive: 'bg-status-inactive text-white',
    draft: 'bg-status-draft text-white',
    approved: 'bg-status-approved text-white',
    paid: 'bg-status-paid text-white',
    partial: 'bg-status-partial text-white',
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}