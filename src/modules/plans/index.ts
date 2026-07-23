/**
 * Plans module — public surface consumed by the app shell (router). Everything
 * else (domain, application, infrastructure, components, hooks) is an internal
 * detail of the module. This is the template all future admin CRUD modules
 * (Addons, Features, Coupons) should follow — see docs/admin/PLAN_ARCHITECTURE.md.
 */
export {
  PlanListPage,
  CreatePlanPage,
  EditPlanPage,
  PlanDetailPage,
} from './presentation/pages';

export { planRoutes, PLAN_ID_PARAM } from './presentation/routes';
