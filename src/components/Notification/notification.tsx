'use client'

import { Bell } from 'lucide-react'
import { useEffect, useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import NotificationItem from "./NotificationItem"
import { groupNotificationsByDate } from "@/lib/notificationUtils"
import Link from 'next/link'
import { useUser } from '@clerk/nextjs';
import { Skeleton } from '@/components/ui/skeleton';

interface Notification {
  id: number
  message: string
  read: boolean
  createdAt: string
}

const Notification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useUser();

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/notifications?page=1&pageSize=20`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user && user.id) {
      fetchNotifications();
    }
  }, [user]);

  const unreadCount = notifications?.filter(
    (notification) => !notification.read
  ).length || 0;

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PUT",
      })
      if (response.ok) {
        setNotifications(
          notifications.map((notification) =>
            notification.id === id ? { ...notification, read: true } : notification
          )
        )
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const groupedNotifications = groupNotificationsByDate(notifications)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-[10px]"
            >
              {unreadCount}
            </Badge>
          )}
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0">
        <div className="flex items-center justify-between px-4 py-2 bg-primary text-primary-foreground">
          <h4 className="text-xs font-medium">Notifications</h4>
        </div>
        <ScrollArea className="h-[300px] p-4 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          ) : notifications && notifications.length > 0 ? (
            Object.entries(groupedNotifications).map(([date, notifications]) => (
              <div key={date} className="mb-4">
                <h5 className="text-xs font-medium text-muted-foreground mb-2">{date}</h5>
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onDelete={() => {}}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-muted-foreground p-4">
              No notifications
            </div>
          )}
        </ScrollArea>
        <div className="p-2 flex justify-center">
          <Link href="/Admin/notifications">
            <Button variant="link">View All</Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default Notification