type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';

interface StatusBadgeProps {
  label: string;
  variant: BadgeVariant;
  icon?: React.ReactNode;
  theme: string;
}

const variantStyles = {
  dark: {
    success: 'bg-green-900/30 text-green-300',
    warning: 'bg-yellow-900/30 text-yellow-300',
    danger: 'bg-red-900/30 text-red-300',
    info: 'bg-blue-900/30 text-blue-300',
    neutral: 'bg-zinc-700 text-zinc-300',
    primary: 'bg-cyan-900/30 text-cyan-300',
  },
  light: {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    neutral: 'bg-gray-200 text-gray-700',
    primary: 'bg-cyan-100 text-cyan-700',
  }
};

export function StatusBadge({ label, variant, icon, theme }: StatusBadgeProps) {
  const styles = theme === 'dark' ? variantStyles.dark : variantStyles.light;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${styles[variant]}`}>
      {icon}
      {label}
    </span>
  );
}


