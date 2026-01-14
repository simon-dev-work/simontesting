"use client"

import { useEffect } from "react";
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // If we reach this component, it means the middleware didn't rewrite the URL
    // to a practice-specific path. In this case, we default to the info_centre.
    router.push('/info_centre');
  }, [router]);

  return null;
}