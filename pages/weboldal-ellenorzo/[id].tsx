import type { GetServerSideProps } from "next";

/**
 * Public audit result pages are intentionally offline.
 * Use /admin/website-audit instead.
 */
export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: "/",
    permanent: false,
  },
});

export default function WebsiteAuditResultDisabled() {
  return null;
}
