// ABOUTME: Reusable loading spinner with optional message
// ABOUTME: Centered full-page or inline variants

interface LoadingSpinnerProps {
  message?: string;
  fullPage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ 
  message = 'Loading...', 
  fullPage = false,
  size = 'md' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  };

  const spinner = (
    <div className="text-center">
      <div 
        className={`${sizeClasses[size]} border-teal border-t-transparent rounded-full animate-spin mx-auto mb-3`}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <p className="text-medium-gray text-sm">{message}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}
