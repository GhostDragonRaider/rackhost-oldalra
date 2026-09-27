import type { GetServerSideProps } from "next";

/**
 * Public Weboldal-ellenőrző is intentionally offline.
 * The tool remains available only in the admin UI.
 */
export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: "/",
    permanent: false,
  },
});

export default function WebsiteAuditLandingDisabled() {
  return null;
}
