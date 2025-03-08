
import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  let variantClasses = '';
  let sizeClasses = '';

  // Variant styles
  switch (variant) {
    case 'primary':
      variantClasses = 'bg-purple-500 hover:bg-purple-600 text-white';
      break;
    case 'secondary':
      variantClasses = 'bg-gray-200 hover:bg-gray-300 text-gray-800';
      break;
    case 'outline':
      variantClasses = 'bg-transparent border border-purple-500 text-purple-500 hover:bg-purple-50';
      break;
    default:
      variantClasses = 'bg-purple-500 hover:bg-purple-600 text-white';
  }

  // Size styles
  switch (size) {
    case 'sm':
      sizeClasses = 'py-1 px-3 text-sm rounded';
      break;
    case 'md':
      sizeClasses = 'py-2 px-4 rounded-md';
      break;
    case 'lg':
      sizeClasses = 'py-3 px-6 text-lg rounded-md';
      break;
    default:
      sizeClasses = 'py-2 px-4 rounded-md';
  }

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300 ${variantClasses} ${sizeClasses} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
