import { GetServerSideProps } from "next";

/** Legacy English contact route → Hungarian /kapcsolat */
export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: "/kapcsolat",
    permanent: true,
  },
});

export default function ContactRedirect() {
  return null;
}
