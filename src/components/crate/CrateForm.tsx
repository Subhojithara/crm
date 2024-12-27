'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const CrateForm = () => {
  const [crateId, setCrateId] = useState<string>('');
  const [crateName, setCrateName] = useState<string>('');
  const [crateQuantity, setCrateQuantity] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCrateSubmit = async () => {
    if (!crateId || !crateName || crateQuantity <= 0) {
      setError('Please fill in all fields correctly.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/crates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crateId,
          crateName,
          crateQuantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save crate');
      }

      // Success
      toast({
        title: 'Crate Saved',
        description: 'Crate information saved successfully.',
      });

      // Reset form
      setCrateId('');
      setCrateName('');
      setCrateQuantity(0);
    } catch (error) {
      console.error('Error saving crate:', error);
      setError((error as Error).message); // Specify the type of error
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add Crate</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Crate</DialogTitle>
          <DialogDescription>
            Enter the details of the new crate.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {error && (
            <div
              className="bg-destructive/15 text-destructive text-sm p-3 rounded-md"
              role="alert"
            >
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="crateId">Crate ID</Label>
            <Input
              id="crateId"
              placeholder="Enter crate ID"
              value={crateId}
              onChange={(e) => setCrateId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="crateName">Crate Name</Label>
            <Input
              id="crateName"
              placeholder="Enter crate name"
              value={crateName}
              onChange={(e) => setCrateName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="crateQuantity">Quantity</Label>
            <Input
              id="crateQuantity"
              type="number"
              placeholder="Enter quantity"
              value={crateQuantity}
              onChange={(e) => setCrateQuantity(Number(e.target.value))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCrateSubmit} disabled={isLoading} className="w-full">
            {isLoading ? 'Saving...' : 'Save Crate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CrateForm; 