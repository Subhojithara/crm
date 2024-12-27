'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Car } from '@/types/Car';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CarEditProps {
  car: Car;
  onClose: () => void;
  onCarUpdated: (updatedCar: Car) => void;
}

const CarEdit: React.FC<CarEditProps> = ({ car, onClose, onCarUpdated }) => {
  const [editedCar, setEditedCar] = useState<Car>(car);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    setEditedCar(car);
  }, [car]);

  const handleInputChange = (field: keyof Car, value: string | undefined) => {
    setEditedCar((prevCar) => ({
      ...prevCar,
      [field]: value,
    }));
  };

  const handleUpdateCar = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/car/${car.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedCar),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update car');
      }

      const updatedCarData = await response.json();
      onCarUpdated(updatedCarData.car);

      toast({
        title: 'Success',
        description: 'Car updated successfully.',
      });

      onClose();
    } catch (error: unknown) {
      console.error('Error updating car:', error);
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Car</DialogTitle>
          <DialogDescription>
            Make changes to the car details here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="carName" className="text-right">
              Car Name
            </Label>
            <Input
              id="carName"
              value={editedCar.carName}
              onChange={(e) => handleInputChange('carName', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="carNumber" className="text-right">
              Car Number
            </Label>
            <Input
              id="carNumber"
              value={editedCar.carNumber}
              onChange={(e) => handleInputChange('carNumber', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="driverName" className="text-right">
              Driver Name
            </Label>
            <Input
              id="driverName"
              value={editedCar.driverName}
              onChange={(e) => handleInputChange('driverName', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="driverLicense" className="text-right">
              Driver License
            </Label>
            <Input
              id="driverLicense"
              value={editedCar.driverLicense}
              onChange={(e) => handleInputChange('driverLicense', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="driverPhone" className="text-right">
              Driver Phone
            </Label>
            <Input
              id="driverPhone"
              value={editedCar.driverPhone}
              onChange={(e) => handleInputChange('driverPhone', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="carModel" className="text-right">
              Car Model
            </Label>
            <Input
              id="carModel"
              value={editedCar.carModel || ''}
              onChange={(e) => handleInputChange('carModel', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="carColor" className="text-right">
              Car Color
            </Label>
            <Input
              id="carColor"
              value={editedCar.carColor || ''}
              onChange={(e) => handleInputChange('carColor', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="carType" className="text-right">
              Car Type
            </Label>
            <Input
              id="carType"
              value={editedCar.carType || ''}
              onChange={(e) => handleInputChange('carType', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select
              value={editedCar.status}
              onValueChange={(value) => handleInputChange('status', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleUpdateCar} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CarEdit;
