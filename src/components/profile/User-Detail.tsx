'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Toast } from "@/components/ui/toast"
import { Pencil, X, Check } from 'lucide-react'
import Image from 'next/image'

const UserDetail: React.FC = () => {
  const { user } = useUser()
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    imageUrl: ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.emailAddresses[0].emailAddress,
        imageUrl: user.imageUrl || ''
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Update user details via API
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      setIsEditing(false)
      Toast({
        title: "Profile updated",
      })
    } catch (error) {
      console.error('Error updating user:', error)
      Toast({
        title: "Update failed", 
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          User Details
          {!isEditing && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {formData.imageUrl ? (
                <Image
                  src={formData.imageUrl}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-primary"
                />
              ) : (
                <Skeleton className="w-32 h-32 rounded-full" />
              )}
              {isEditing && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled
                  />
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? (
                      <Skeleton className="h-5 w-5 rounded-full" />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p><strong>First Name:</strong> {formData.firstName}</p>
                <p><strong>Last Name:</strong> {formData.lastName}</p>
                <p><strong>Email:</strong> {formData.email}</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserDetail
