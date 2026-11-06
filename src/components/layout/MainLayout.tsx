'use client';
import type {ReactNode} from 'react';
import NativeShell from '@/redesign/NativeShell';
export default function MainLayout({children}:{children:ReactNode}) {
  return <NativeShell>{children}</NativeShell>;
}
