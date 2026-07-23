import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProviders } from '@/shared/providers/AppProviders';
import { AppLayout } from '@/shared/layouts/AppLayout';
import { ProtectedRoute } from '@/modules/auth/ProtectedRoute';
import { LoginPage } from '@/modules/auth/LoginPage';
import { NotFoundPage } from '@/shared/components/NotFoundPage';

import { DashboardPage } from '@/modules/dashboard/DashboardPage';
import {
  PlanListPage, CreatePlanPage, EditPlanPage, PlanDetailPage, PLAN_ID_PARAM,
} from '@/modules/plans';
import {
  AddonListPage, CreateAddonPage, EditAddonPage, AddonDetailPage, ADDON_ID_PARAM,
} from '@/modules/addons';
import {
  FeatureListPage, CreateFeaturePage, EditFeaturePage, FeatureDetailPage, FEATURE_CODE_PARAM,
} from '@/modules/features';
import {
  CustomersListPage, CustomerDetailPage, EventBillingDetailPage, ConfigureEventBillingPage,
  ACCOUNT_ID_PARAM, EVENT_ID_PARAM,
} from '@/modules/event-billing';
import {
  OrderListPage, OrderDetailPage, GenerateOrderPage, ORDER_ID_PARAM, EVENT_BILLING_ID_PARAM,
} from '@/modules/orders';
import { CheckoutPage, EVENT_BILLING_ID_PARAM as CHECKOUT_EB_PARAM } from '@/modules/checkout';
import { BillingDashboardPage } from '@/modules/billing-dashboard';
import { PaymentsPage } from '@/modules/billing/payments/PaymentsPage';
import { EventsPage } from '@/modules/events/EventsPage';
import { UsersPage } from '@/modules/users/UsersPage';
import { AnalyticsPage } from '@/modules/analytics/AnalyticsPage';
import { SettingsPage } from '@/modules/settings/SettingsPage';
import { SystemPage } from '@/modules/system/SystemPage';

/**
 * App — providers + routing. Public: /login. Everything else lives behind
 * ProtectedRoute → AppLayout. Routes mirror the navigation config.
 */
export function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />

              {/* Billing */}
              <Route path="billing" element={<Navigate to="/billing/dashboard" replace />} />
              <Route path="billing/dashboard" element={<BillingDashboardPage />} />
              <Route path="billing/plans" element={<PlanListPage />} />
              <Route path="billing/plans/new" element={<CreatePlanPage />} />
              <Route path={`billing/plans/:${PLAN_ID_PARAM}`} element={<PlanDetailPage />} />
              <Route path={`billing/plans/:${PLAN_ID_PARAM}/edit`} element={<EditPlanPage />} />
              <Route path="billing/addons" element={<AddonListPage />} />
              <Route path="billing/addons/new" element={<CreateAddonPage />} />
              <Route path={`billing/addons/:${ADDON_ID_PARAM}`} element={<AddonDetailPage />} />
              <Route path={`billing/addons/:${ADDON_ID_PARAM}/edit`} element={<EditAddonPage />} />
              <Route path="billing/features" element={<FeatureListPage />} />
              <Route path="billing/features/new" element={<CreateFeaturePage />} />
              <Route path={`billing/features/:${FEATURE_CODE_PARAM}`} element={<FeatureDetailPage />} />
              <Route path={`billing/features/:${FEATURE_CODE_PARAM}/edit`} element={<EditFeaturePage />} />
              <Route path="billing/orders" element={<OrderListPage />} />
              <Route path={`billing/orders/new/:${EVENT_BILLING_ID_PARAM}`} element={<GenerateOrderPage />} />
              <Route path={`billing/orders/:${ORDER_ID_PARAM}`} element={<OrderDetailPage />} />
              <Route path={`billing/checkout/:${CHECKOUT_EB_PARAM}`} element={<CheckoutPage />} />
              <Route path="billing/payments" element={<PaymentsPage />} />
              <Route path="billing/customers" element={<CustomersListPage />} />
              <Route path={`billing/customers/:${ACCOUNT_ID_PARAM}`} element={<CustomerDetailPage />} />
              <Route
                path={`billing/customers/:${ACCOUNT_ID_PARAM}/events/:${EVENT_ID_PARAM}`}
                element={<EventBillingDetailPage />}
              />
              <Route
                path={`billing/customers/:${ACCOUNT_ID_PARAM}/events/:${EVENT_ID_PARAM}/configure`}
                element={<ConfigureEventBillingPage />}
              />

              {/* Platform */}
              <Route path="events" element={<EventsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />

              {/* System */}
              <Route path="settings" element={<SettingsPage />} />
              <Route path="system" element={<SystemPage />} />

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
}
