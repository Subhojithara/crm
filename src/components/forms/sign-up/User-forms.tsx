'use client'

import * as React from "react"
import { format } from "date-fns"
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ToastAction } from "@/components/ui/toast"
import { User } from "@/types/User-forms";
import { useUser } from '@clerk/nextjs';
import { Skeleton } from '@/components/ui/skeleton';
import Image from "next/image";

export default function UserForm() {
  const [step, setStep] = React.useState(1)
  const [formData, setFormData] = React.useState<User>({
    id: 0,
    name: '',
    username: '',
    number: '',
    bio: '',
    dateOfBirth: undefined,
  })
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [profileExists, setProfileExists] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();

  React.useEffect(() => {
    const checkUserProfile = async () => {
      try {
        const response = await fetch('/api/users/profile');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.profile) {
          setProfileExists(true);
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
        toast({
          title: "Error",
          description: "Failed to check user profile. Please try again later.",
          variant: "destructive",
        });
      }
    };

    checkUserProfile();
  }, [toast]);

  if (profileExists) {
    return <div>You have already filled out your profile.</div>;
  }

  const updateFormData = (field: keyof User, value: string | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const progressPercentage = (step / 2) * 100

  const renderStep = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      );
    }

    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">Enter your full name as it appears on official documents.</p>
            </div>
            <div className="space-y-2">
              <Label>Profile Image</Label>
              <div className="flex items-center">
                {user?.imageUrl ? (
                  <Image src={user.imageUrl} alt="Profile" width={80} height={80} className="rounded-full" />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gray-200" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">Upload a profile image.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="johndoe123"
                value={formData.username}
                onChange={(e) => updateFormData('username', e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">Choose a unique username for your account.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="number">Phone Number</Label>
              <Input
                id="number"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.number}
                onChange={(e) => updateFormData('number', e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">Enter your contact number including country code.</p>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself"
                value={formData.bio}
                onChange={(e) => updateFormData('bio', e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">Write a brief description about yourself (max 200 characters).</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={date ? format(date, "yyyy-MM-dd") : ''}
                onChange={(e) => {
                  const selectedDate = e.target.value ? new Date(e.target.value) : undefined;
                  setDate(selectedDate);
                  updateFormData('dateOfBirth', selectedDate);
                }}
                required
              />
              <p className="text-sm text-muted-foreground">Select your date of birth.</p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...formData, role: 'MEMBER' })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Navigate to the dashboard page upon successful submission
      router.push('/dashboard');

      // Show success toast
      toast({
        title: "Success",
        description: "User profile created successfully.",
        action: (
          <ToastAction altText="Go to dashboard">Go</ToastAction>
        ),
      });
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      console.error(err);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">User Profile</h2>
        <p className="text-muted-foreground">Please fill out your profile information</p>
      </div>

      <Progress value={progressPercentage} className="w-full" />

      <form onSubmit={handleSubmit} className="space-y-8">
        {renderStep()}

        {error && <p className="text-red-500">{error}</p>}

        <div className="flex justify-between">
          {step > 1 && (
            <Button type="button" onClick={() => setStep(step - 1)}>
              Previous
            </Button>
          )}
          {step < 2 ? (
            <Button type="button" onClick={() => setStep(step + 1)} className="ml-auto">
              Next
            </Button>
          ) : (
            <Button type="submit" className="ml-auto" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}