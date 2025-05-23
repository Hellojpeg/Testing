
'use client';

import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from 'react';

export function ClientToaster() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; 
  }
  return <Toaster />;
}
