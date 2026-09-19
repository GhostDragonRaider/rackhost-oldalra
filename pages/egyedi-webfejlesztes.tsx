import ServicePageView from "../components/landing/ServicePageView";
import { SERVICE_PAGES } from "../components/landing/servicePages";

const page = SERVICE_PAGES.find((p) => p.path === "/egyedi-webfejlesztes")!;

export default function EgyediWebfejlesztesPage() {
  return <ServicePageView page={page} />;
}
