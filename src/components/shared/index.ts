// ABOUTME: Barrel export for shared components
// ABOUTME: Import from '@/components/shared' for clean imports

export { default as AppHeader } from './AppHeader';
export { default as AppShell } from './AppShell';
export { default as Card, CardHeader, CardStat } from './Card';
export { default as Button } from './Button';
export { default as Input, Select, Toggle } from './Input';
export { default as Badge, StatusBadge } from './Badge';
export { EmptyState, emptyStatePresets } from './EmptyState';
export { StatCard } from './StatCard';
export { LoadingSpinner, Skeleton, SkeletonCard } from './LoadingSpinner';
export { 
  CheckIcon, 
  DollarIcon, 
  DocumentIcon, 
  RocketIcon, 
  ChartIcon, 
  LockIcon, 
  AlertIcon, 
  LightbulbIcon,
  ErrorIcon,
  StatusDot 
} from './Icons';

// Animated components
export {
  StaggerContainer,
  StaggerItem,
  FadeInUp,
  FadeIn,
  ScaleIn,
  AnimatedCard,
  AnimatedButton,
  AnimatedCounter,
  ScrollReveal,
  PageTransition,
} from './AnimatedComponents';

// Delight components
export {
  AnimatedCheckmark,
  SuccessCircle,
  ConfettiBurst,
  LoadingDots,
  PulseRing,
  ProgressCelebration,
  MilestoneBadge,
  ToastSuccess,
  NumberTicker,
  ShimmerButton,
} from './Delight';

// Error states
export { ErrorState, ErrorPage } from './ErrorState';
