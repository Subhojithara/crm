"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Building2, Phone, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from '@clerk/nextjs';
import { Progress } from "@/components/ui/progress";

// Define the Company type if not already defined
interface Company {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  gst: string;
  upi: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  extraDetails: string;
  fssai: string;
  clerkUserId: string;
  [key: string]: string; // Index signature for dynamic access
}

export default function AddCompany() {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);
  const [formProgress, setFormProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState<Company>({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    gst: "",
    upi: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    extraDetails: "",
    fssai: "",
    clerkUserId: "", // Initialize clerkUserId as empty string
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/users/profile', {
          credentials: 'include',
        });
        if (response.ok) {
          await response.json();
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (userId) {
      setFormData(prev => ({
        ...prev,
        clerkUserId: userId,
      }));
    }
  }, [userId]);

  useEffect(() => {
    const requiredFields = ['name', 'email', 'phone'];
    const completedFields = requiredFields.filter(field => formData[field]?.length > 0);
    setFormProgress((completedFields.length / requiredFields.length) * 100);
  }, [formData]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(e.target.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!userId) {
      toast({ title: "Error", description: "User not authenticated." });
      return;
    }

    // Handle logo upload (if a logo is selected)
    if (logo) {
      const formDataWithLogo = new FormData();
      formDataWithLogo.append('logo', logo);

      // Append other form data to formDataWithLogo
      for (const key in formData) {
        formDataWithLogo.append(key, formData[key]);
      }

      try {
        const logoUploadResponse = await fetch('/api/upload-logo', { // Assuming you have an endpoint to handle logo uploads
          method: 'POST',
          body: formDataWithLogo,
        });

        if (!logoUploadResponse.ok) {
          const errorData = await logoUploadResponse.json();
          throw new Error(errorData.error || 'Failed to upload logo');
        }

        // Optionally update formData with the URL of the uploaded logo
        // const logoUrl = await logoUploadResponse.json();
        // setFormData(prev => ({ ...prev, logoUrl: logoUrl }));
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "An unknown error occurred during logo upload"
        });
        console.error('Logo Upload Error:', error);
        return; // Stop the form submission if logo upload fails
      }
    }

    try {
      const response = await fetch('/api/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save company');
      }

      toast({
        title: "Success",
        description: "Company saved successfully"
      });
      setIsOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
      console.error('Save Company Error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      gst: "",
      upi: "",
      bankName: "",
      accountNumber: "",
      ifsc: "",
      extraDetails: "",
      fssai: "",
      clerkUserId: "",
    });
    setLogo(null);
    setActiveTab("basic");
  };

  if (loading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="w-full flex justify-center my-2">
          <Button
            variant="outline"
            className="w-[90%] gap-2 hover:bg-primary hover:text-white transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            Add Company
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[920px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add Company</DialogTitle>
          <DialogDescription>
            Complete the company profile by filling in all sections
          </DialogDescription>
          <Progress value={formProgress} className="h-2 mt-2" />
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Financial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the company&lsquo;s basic details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logo">Company Logo</Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter company name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    placeholder="Enter company address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Enter the company&lsquo;s contact details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Enter contact number"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    placeholder="Enter company email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    placeholder="Enter company website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial">
            <Card>
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
                <CardDescription>Enter the company&lsquo;s financial details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gst">GST Number</Label>
                  <Input
                    id="gst"
                    name="gst"
                    placeholder="Enter GST number"
                    value={formData.gst}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upi">UPI ID</Label>
                  <Input
                    id="upi"
                    name="upi"
                    placeholder="Enter UPI ID"
                    value={formData.upi}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    name="bankName"
                    placeholder="Enter bank name"
                    value={formData.bankName}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    name="accountNumber"
                    placeholder="Enter account number"
                    value={formData.accountNumber}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifsc">IFSC Code</Label>
                  <Input
                    id="ifsc"
                    name="ifsc"
                    placeholder="Enter IFSC code"
                    value={formData.ifsc}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fssai">FSSAI Number</Label>
                  <Input
                    id="fssai"
                    name="fssai"
                    placeholder="Enter FSSAI number"
                    value={formData.fssai}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extraDetails">Additional Details</Label>
                  <Textarea
                    id="extraDetails"
                    name="extraDetails"
                    placeholder="Enter additional details"
                    value={formData.extraDetails}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6 space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={formProgress < 100}
          >
            Save Company
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) 
}