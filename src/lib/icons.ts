// Optimized icon imports - only import the icons we actually use
// This reduces bundle size by avoiding the entire lucide-react library

export {
  TrendingUp,
  TrendingDown,
  BookOpen,
  DollarSign,
  PieChart,
  ChevronDown,
  ChevronUp,
  Minus,
  BarChart3,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  Shield,
  LogOut,
  Search,
  Building2,
  ArrowRight,
  Calendar,
  X,
  RefreshCw,
  WifiOff,
  AlertTriangle,
  Ban,
} from 'lucide-react';

// Re-export common icon groups for easy importing
import {
  TrendingUp as TrendUp,
  TrendingDown as TrendDown,
  Minus as MinusIcon,
  ChevronDown as ChevDown,
  ChevronUp as ChevUp,
  X as XIcon,
  Search as SearchIcon,
  ArrowRight as ArrowRightIcon,
  AlertCircle as AlertCircleIcon,
  CheckCircle as CheckCircleIcon,
  Loader2 as Loader2Icon,
  RefreshCw as RefreshCwIcon,
  WifiOff as WifiOffIcon,
  AlertTriangle as AlertTriangleIcon,
  Ban as BanIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Shield as ShieldIcon,
  LogOut as LogOutIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  BarChart3 as BarChart3Icon,
  Calendar as CalendarIcon,
  DollarSign as DollarSignIcon,
} from 'lucide-react';

export const TrendIcons = {
  TrendingUp: TrendUp,
  TrendingDown: TrendDown,
  Minus: MinusIcon,
} as const;

export const UIIcons = {
  ChevronDown: ChevDown,
  ChevronUp: ChevUp,
  X: XIcon,
  Search: SearchIcon,
  ArrowRight: ArrowRightIcon,
} as const;

export const StatusIcons = {
  AlertCircle: AlertCircleIcon,
  CheckCircle: CheckCircleIcon,
  Loader2: Loader2Icon,
  RefreshCw: RefreshCwIcon,
  WifiOff: WifiOffIcon,
  AlertTriangle: AlertTriangleIcon,
  Ban: BanIcon,
} as const;

export const AuthIcons = {
  Eye: EyeIcon,
  EyeOff: EyeOffIcon,
  Shield: ShieldIcon,
  LogOut: LogOutIcon,
} as const;

export const DataIcons = {
  Download: DownloadIcon,
  Upload: UploadIcon,
  BarChart3: BarChart3Icon,
  Calendar: CalendarIcon,
  DollarSign: DollarSignIcon,
} as const;