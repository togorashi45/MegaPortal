import { canAccess } from "@/lib/access";
import { requireModuleAccess } from "@/lib/module-guard";
import { FlipForecastingClient } from "./flip-forecasting-client";

export default async function FlipForecastingPage() {
  const user = await requireModuleAccess("flip-forecasting-dashboard", "VIEW");
  const canEdit = canAccess(user, "flip-forecasting-dashboard", "EDIT");
  return <FlipForecastingClient canEdit={canEdit} />;
}
