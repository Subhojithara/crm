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
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Crate } from '@/types/Crate';

interface EditCrateDialogProps {
  crate: Crate;
  onClose: () => void;
  onUpdate: (updatedCrate: Crate) => void;
}

const EditCrateDialog: React.FC<EditCrateDialogProps> = ({ crate, onClose, onUpdate }) => {
  const [crateId, setCrateId] = useState<string>(crate.crateId);
  const [crateName, setCrateName] = useState<string>(crate.crateName);
  const [crateQuantity, setCrateQuantity] = useState<number>(crate.crateQuantity);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleUpdate = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/crates/${crate.id}`, {
        method: 'PUT',
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
        throw new Error(errorData.error || 'Failed to update crate');
      }

      const updatedCrate = await response.json();
      onUpdate(updatedCrate.crate);

      toast({
        title: 'Success',
        description: 'Crate updated successfully.',
      });

      onClose();
    } catch (error: unknown) {
      console.error('Error updating crate:', error);
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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Crate</DialogTitle>
          <DialogDescription>
            Make changes to the crate details.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editCrateId">Crate ID</Label>
            <Input
              id="editCrateId"
              value={crateId}
              onChange={(e) => setCrateId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editCrateName">Crate Name</Label>
            <Input
              id="editCrateName"
              value={crateName}
              onChange={(e) => setCrateName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editCrateQuantity">Quantity</Label>
            <Input
              id="editCrateQuantity"
              type="number"
              value={crateQuantity}
              onChange={(e) => setCrateQuantity(Number(e.target.value))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleUpdate} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCrateDialog;