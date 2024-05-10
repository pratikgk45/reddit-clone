'use client';

import { useEffect } from 'react';

export default function Loader() {
  useEffect(() => {
    async function getLoader() {
      const { ring2 } = await import('ldrs');
      ring2.register();
    }

    getLoader();
  }, []);

  return <l-ring-2 color="coral"></l-ring-2>;
}