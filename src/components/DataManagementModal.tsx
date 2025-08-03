'use client';

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DataManager } from './DataManager';

/**
 * Props for the DataManagementModal component
 */
interface DataManagementModalProps {
  /** Custom trigger element */
  trigger?: React.ReactNode;
  /** Custom CSS classes */
  className?: string;
}

/**
 * Modal wrapper for the DataManager component
 * Provides a clean way to access save/load functionality from the header
 */
export function DataManagementModal({ 
  trigger, 
  className 
}: DataManagementModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDataLoaded = (data: unknown) => {
    console.log('Data loaded:', data);
    // Could show a toast notification here
    // Auto-close modal after successful load
    setIsOpen(false);
  };

  const handleDataSaved = (filename: string) => {
    console.log('Data saved as:', filename);
    // Could show a toast notification here
    // Auto-close modal after successful save
    setIsOpen(false);
  };

  const defaultTrigger = (
    <Button 
      variant="outline" 
      size="sm" 
      className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
      aria-label="Save or load your investment data"
    >
      <Download className="h-4 w-4" />
      <span className="hidden md:inline">Data</span>
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent 
        className={`max-w-2xl ${className}`}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Save & Load Your Data
          </DialogTitle>
          <DialogDescription>
            Save your watchlist and learning progress to a secure file, or load previously saved data.
            Your data is encrypted and stored locally on your device.
          </DialogDescription>
        </DialogHeader>

        {/* Data Manager Component */}
        <div className="mt-4">
          <DataManager 
            onDataLoaded={handleDataLoaded}
            onDataSaved={handleDataSaved}
            className="border-0 shadow-none bg-transparent"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}