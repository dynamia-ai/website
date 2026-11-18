'use client';

import {ServerCrash} from 'lucide-react';
import {useEffect} from 'react';

import {Button} from '@/components/ui/button';
import {Link} from '@/i18n/navigation';

interface ErrorProps {
  error: Error & {digest?: string};
  reset: () => void;
}

export default function Error({error, reset}: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
        <ServerCrash className="h-10 w-10 text-red-600" />
      </div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mb-8 text-lg text-gray-600">
        Please try again, or return to the homepage.
      </p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button onClick={() => reset()} variant="default">
          Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </div>
  );
}
