import {
  LayoutDashboard, Package, Puzzle, ToggleRight, Receipt, Wallet, Users2,
  CalendarDays, UserCog, BarChart3, Settings, Server, LineChart, type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/**
 * The Backoffice navigation. Single source of truth for both the sidebar and the
 * router: routes are generated from this so the two never drift.
 */
export const navigation: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', to: '/', icon: LayoutDashboard }],
  },
  {
    label: 'Billing',
    items: [
      { label: 'Dashboard', to: '/billing/dashboard', icon: LineChart },
      { label: 'Plans', to: '/billing/plans', icon: Package },
      { label: 'Addons', to: '/billing/addons', icon: Puzzle },
      { label: 'Features', to: '/billing/features', icon: ToggleRight },
      { label: 'Orders', to: '/billing/orders', icon: Receipt },
      { label: 'Payments', to: '/billing/payments', icon: Wallet },
      { label: 'Customers', to: '/billing/customers', icon: Users2 },
    ],
  },
  {
    label: 'Platform',
    items: [
      { label: 'Events', to: '/events', icon: CalendarDays },
      { label: 'Users', to: '/users', icon: UserCog },
      { label: 'Analytics', to: '/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', to: '/settings', icon: Settings },
      { label: 'System', to: '/system', icon: Server },
    ],
  },
];
