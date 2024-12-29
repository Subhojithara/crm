'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

interface Seller {
  id: number;
  name: string;
  address: string;
  email: string;
  number: string;
  createdAt: string;
  updatedAt: string;
}

interface AddSellerDialogProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddSellerDialog: React.FC<AddSellerDialogProps> = ({ setIsOpen }) => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [form, setForm] = useState({
    name: '',
    address: '',
    email: '',
    number: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchSellers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/seller');
      setSellers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error fetching sellers';
      setError(errorMsg);
      setSellers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/seller', form);
      setSellers([...sellers, response.data]);
      setForm({ name: '', address: '', email: '', number: '' });
      setIsOpen(false);
      toast({
        title: "Success",
        description: "Seller added successfully",
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error adding seller';
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add New Seller</DialogTitle>
        <DialogDescription>
          Fill in the details to add a new seller.
        </DialogDescription>
      </DialogHeader>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {isLoading && <p>Loading sellers...</p>}
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Address
            </Label>
            <Input
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="number" className="text-right">
              Number
            </Label>
            <Input
              id="number"
              name="number"
              value={form.number}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Seller'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default AddSellerDialog;

