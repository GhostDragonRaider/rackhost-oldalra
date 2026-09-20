import { GetServerSideProps } from "next";

/** Broken /about nav target → /rolam */
export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: "/rolam",
    permanent: true,
  },
});

export default function AboutRedirect() {
  return null;
}
