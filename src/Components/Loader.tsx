'use client';

import { useEffect } from 'react';

export default function Loader() {
  useEffect(() => {
    async function getLoader() {
      const { waveform } = await import('ldrs');
      waveform.register();
    }

    getLoader();
  }, []);

  return <l-waveform color="coral"></l-waveform>;
}