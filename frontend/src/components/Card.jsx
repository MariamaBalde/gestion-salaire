import React from 'react';

export default function Card({ children, className = '', title, icon: Icon, ...props }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-xl ${className}`} {...props}>
      {(title || Icon) && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            {Icon && <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
            {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
          </div>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

export function StatCard({ title, value, icon: Icon, trend, color = 'blue', className = '' }) {
  const colorClasses = {
    blue: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
    green: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
    red: 'border-red-500 bg-red-50 dark:bg-red-900/20',
    gray: 'border-gray-500 bg-gray-50 dark:bg-gray-900/20',
    purple: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
    orange: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
  };

  return (
    <Card className={`border-l-4 ${colorClasses[color]} ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        {Icon && <Icon className={`h-8 w-8 text-${color}-500`} />}
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <span className={`text-sm text-${color}-600 dark:text-${color}-400`}>{trend}</span>
        </div>
      )}
    </Card>
  );
}