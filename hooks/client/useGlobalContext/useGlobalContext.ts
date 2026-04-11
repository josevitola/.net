'use client';

import { GlobalContext } from '@/context';
import { useContext } from 'react';

export default function useGlobalContext() {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalContextProvider');
  }
  return context;
}
