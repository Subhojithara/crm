'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const CarForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    carName: '',
    carNumber: '',
    driverName: '',
    driverLicense: '',
    driverPhone: '',
    carModel: '',
    carColor: '',
    carType: '',
    status: 'active'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/car', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add car');
      }

      toast({
        title: "Success",
        description: "Car added successfully",
      });

      setFormData({
        carName: '',
        carNumber: '',
        driverName: '',
        driverLicense: '',
        driverPhone: '',
        carModel: '',
        carColor: '',
        carType: '',
        status: 'active'
      });
      setIsOpen(false);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to add car",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Car</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Car</DialogTitle>
          <DialogDescription>
            Add a new car and driver details to the system.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="carName" className="text-right">
              Car Name
            </Label>
            <Input
              id="carName"
              name="carName"
              value={formData.carName}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="carNumber" className="text-right">
              Car Number
            </Label>
            <Input
              id="carNumber"
              name="carNumber"
              value={formData.carNumber}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="driverName" className="text-right">
              Driver Name
            </Label>
            <Input
              id="driverName"
              name="driverName"
              value={formData.driverName}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="driverLicense" className="text-right">
              License No.
            </Label>
            <Input
              id="driverLicense"
              name="driverLicense"
              value={formData.driverLicense}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="driverPhone" className="text-right">
              Phone
            </Label>
            <Input
              id="driverPhone"
              name="driverPhone"
              value={formData.driverPhone}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="carModel" className="text-right">
              Car Model
            </Label>
            <Input
              id="carModel"
              name="carModel"
              value={formData.carModel}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="carColor" className="text-right">
              Car Color
            </Label>
            <Input
              id="carColor"
              name="carColor"
              value={formData.carColor}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select
              onValueChange={(value) => setFormData({ ...formData, status: value })}
              defaultValue={formData.status}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Car'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CarForm;