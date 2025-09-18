import {
  Home,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Settings,
  Search,
  Plus,
  Minus,
  Edit,
  Trash2,
  Eye,
  Printer,
  Download,
  Upload,
  Check,
  X,
  AlertTriangle,
  Info,
  DollarSign,
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  Star,
  Heart,
  Bookmark,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  Save,
  Copy,
  Share,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Menu,
  MoreVertical,
  Bell,
  User,
  LogOut,
  LogIn,
  Lock,
  Unlock,
  Wifi,
  WifiOff,
  Database,
  Server,
  Cloud,
  CloudOff,
  CreditCard,
  Banknote,
  QrCode,
  Smartphone,
  Building,
  Store,
  Tag,
  Percent,
  Calculator,
  FileText,
  Image,
  Camera,
  Barcode,
  ShoppingBag,
  Receipt,
  Target,
  Award,
  Zap,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Layers,
  Grid,
  List,
  Table,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Square,
  Circle,
  Triangle,
  Loader,
  Loader2,
  Spinner,
  RotateCw,
  RefreshCcw,
  Power,
  PowerOff,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  Scan,
  Move,
  MousePointer,
  Hand,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Key,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  Users2,
  Crown,
  Gem,
  Gift,
  Sparkles,
  Flame
} from 'lucide-react';

export const iconMap = {
  // Navegación principal
  '🏠': Home,
  '🛒': ShoppingCart,
  '📦': Package,
  '👥': Users,
  '📊': TrendingUp,
  '⚙️': Settings,
  '🏪': Store,
  '🏢': Building,
  
  // Acciones básicas
  '🔍': Search,
  '➕': Plus,
  '➖': Minus,
  '✏️': Edit,
  '🗑️': Trash2,
  '👁️': Eye,
  '🖨️': Printer,
  '📥': Download,
  '📤': Upload,
  '✅': Check,
  '❌': X,
  '💾': Save,
  '📋': Copy,
  '🔗': Share,
  '🌐': ExternalLink,
  
  // Estados y alertas
  '⚠️': AlertTriangle,
  'ℹ️': Info,
  '🔔': Bell,
  '⭐': Star,
  '❤️': Heart,
  '🔖': Bookmark,
  '🎯': Target,
  '🏆': Award,
  '⚡': Zap,
  '📈': Activity,
  
  // Dinero y pagos
  '💰': DollarSign,
  '💳': CreditCard,
  '💵': Banknote,
  '🏧': Calculator,
  '📊': BarChart3,
  '🥧': PieChart,
  '📈': LineChart,
  '📉': TrendingUp,
  '💹': TrendingUp,
  '💲': DollarSign,
  '🧾': Receipt,
  '🔢': Calculator,
  '%': Percent,
  
  // Tiempo y fechas
  '📅': Calendar,
  '🕒': Clock,
  '⏰': Clock,
  '⏱️': Clock,
  '⏲️': Clock,
  
  // Contacto y comunicación
  '📞': Phone,
  '📱': Smartphone,
  '✉️': Mail,
  '📧': Mail,
  '📨': Mail,
  '📩': Mail,
  '📡': Wifi,
  '📶': Wifi,
  '📵': WifiOff,
  
  // Ubicación
  '📍': MapPin,
  '🗺️': MapPin,
  '🧭': MapPin,
  '📌': MapPin,
  
  // Navegación y movimiento
  '◀️': ChevronLeft,
  '▶️': ChevronRight,
  '🔼': ChevronUp,
  '🔽': ChevronDown,
  '⬅️': ArrowLeft,
  '➡️': ArrowRight,
  '⬆️': ArrowUp,
  '⬇️': ArrowDown,
  '↩️': RotateCcw,
  '↪️': RotateCw,
  '🔄': RefreshCw,
  '🔃': RefreshCcw,
  '🔁': Repeat,
  '🔀': Shuffle,
  '⏮️': SkipBack,
  '⏭️': SkipForward,
  '▶️': Play,
  '⏸️': Pause,
  '⏹️': Square,
  
  // Menú y opciones
  '☰': Menu,
  '⋮': MoreVertical,
  '⋯': MoreHorizontal,
  '🔧': Settings,
  '🛠️': Settings,
  
  // Sistema y tecnología
  '👤': User,
  '🚪': LogOut,
  '🔑': LogIn,
  '🔒': Lock,
  '🔓': Unlock,
  '🗄️': Database,
  '🖥️': Server,
  '☁️': Cloud,
  '⛅': CloudOff,
  '💻': Server,
  '⌚': Clock,
  '📷': Camera,
  '📸': Camera,
  '🖼️': Image,
  '🎨': Image,
  
  // Códigos y escaneo
  '📊': Barcode,
  '🔍': Scan,
  '📱': QrCode,
  '📋': FileText,
  '🎯': Target,
  '🔎': ZoomIn,
  
  // Productos y categorías
  '👕': Package,
  '👖': Package,
  '👗': Package,
  '👚': Package,
  '👔': Package,
  '🧥': Package,
  '👜': ShoppingBag,
  '👛': ShoppingBag,
  '🎒': ShoppingBag,
  '💼': ShoppingBag,
  '🛍️': ShoppingBag,
  
  // Filtros y ordenamiento
  '🔽': Filter,
  '🔼': SortAsc,
  '🔃': SortDesc,
  '📶': BarChart3,
  '📋': List,
  '📄': FileText,
  '📃': FileText,
  
  // Estados de carga
  '⏳': Loader,
  '⌛': Loader2,
  '🔄': Spinner,
  
  // Poder y control
  '🔌': Power,
  '🔋': Power,
  '💡': Power,
  
  // Tamaño y zoom
  '📏': Maximize,
  '📐': Minimize,
  
  // Interacción
  '👆': MousePointer,
  '👇': Hand,
  '👈': Hand,
  '👉': Hand,
  '👋': Hand,
  
  // Seguridad
  '🛡️': Shield,
  '🔐': Key,
  '🗝️': Key,
  '👑': Crown,
  '💎': Gem,
  '🎁': Gift,
  '✨': Sparkles,
  '🔥': Flame
};

// Componente Icon reutilizable
export const Icon = ({ name, size = 20, color = 'currentColor', className = '', ...props }) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icono no encontrado: ${name}`);
    return <span className={className} {...props}>{name}</span>; // Fallback al emoji original
  }
  
  return (
    <IconComponent 
      size={size} 
      color={color} 
      className={className} 
      {...props}
    />
  );
};

// Hook para usar iconos de manera consistente
export const useIcon = (iconName, defaultSize = 20) => {
  const IconComponent = iconMap[iconName];
  
  return {
    IconComponent,
    hasIcon: !!IconComponent,
    renderIcon: (props = {}) => (
      <Icon 
        name={iconName} 
        size={defaultSize} 
        {...props} 
      />
    )
  };
};

export default Icon;
