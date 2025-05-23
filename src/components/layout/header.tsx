
import { PartyPopper } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center gap-3">
        <PartyPopper className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-primary tracking-tight">Hangout Helper</h1>
      </div>
    </header>
  );
}
