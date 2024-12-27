'use client';

import React, { useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";

interface UserProfile {
  name: string;
  username: string;
  number: string;
  bio: string;
  role: string;
  dateOfBirth: Date | undefined;
  profileImageUrl?: string;
}

const UserProfile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/users/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setProfile(data.profile);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error)
    return (
      <Alert variant="destructive" className="my-4 mx-auto">
        Error: {error}
      </Alert>
    );

  if (!profile) return <p>No profile found.</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Profile</h2>
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Username:</strong> {profile.username}</p>
      <p><strong>Number:</strong> {profile.number}</p>
      <p><strong>Bio:</strong> {profile.bio}</p>
      <p><strong>Role:</strong> {profile.role.charAt(0) + profile.role.slice(1).toLowerCase()}</p>
      <p><strong>Date of Birth:</strong> {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "N/A"}</p>
    </div>
  );
};

export default UserProfile;