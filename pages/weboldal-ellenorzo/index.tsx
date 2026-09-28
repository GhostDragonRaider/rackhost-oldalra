import type { GetServerSideProps } from "next";

/**
 * Public Weboldal-ellenőrző is intentionally offline.
 * Available only in the admin UI until explicitly enabled.
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
