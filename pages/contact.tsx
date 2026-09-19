import { useEffect } from "react";
import { useRouter } from "next/router";

/** Legacy route — contact lives on the landing page. */
export default function Contact() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/#kapcsolat");
  }, [router]);

  return null;
}
