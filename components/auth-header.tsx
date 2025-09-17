"use client"

import { Button } from '@/components/ui/button';
import { LogOut, Shield } from 'lucide-react';

interface AuthHeaderProps {
  onLogout: () => void;
}

export function AuthHeader({ onLogout }: AuthHeaderProps) {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Shield className="w-4 h-4 text-green-500" />
        <span>Session sécurisée</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onLogout}
        className="flex items-center space-x-2"
      >
        <LogOut className="w-4 h-4" />
        <span>Déconnexion</span>
      </Button>
    </div>
  );
}