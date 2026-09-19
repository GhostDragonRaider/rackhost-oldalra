import ServicePageView from "../components/landing/ServicePageView";
import { SERVICE_PAGES } from "../components/landing/servicePages";

const page = SERVICE_PAGES.find((p) => p.path === "/webshop-keszites")!;

export default function WebshopKeszitesPage() {
  return <ServicePageView page={page} />;
}
