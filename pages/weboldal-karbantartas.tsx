import ServicePageView from "../components/landing/ServicePageView";
import { SERVICE_PAGES } from "../components/landing/servicePages";

const page = SERVICE_PAGES.find((p) => p.path === "/weboldal-karbantartas")!;

export default function WeboldalKarbantartasPage() {
  return <ServicePageView page={page} />;
}
