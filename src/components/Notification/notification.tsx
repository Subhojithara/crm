'use client'

import { Bell, Check, Loader2, RefreshCw, Filter } from 'lucide-react'
import { useEffect, useState, useRef } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import NotificationItem from "./NotificationItem"
import { groupNotificationsByDate } from "@/lib/notificationUtils"
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from 'framer-motion'

interface Notification {
  id: number
  message: string
  read: boolean
  createdAt: string
  type?: 'info' | 'success' | 'warning' | 'error'
}

const NotificationBell = ({ count }: { count: number }) => (
  <div className="relative">
    <Bell className="h-5 w-5" />
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="absolute -top-1 -right-1"
        >
          <Badge
            variant="destructive"
            className="h-5 w-5 flex items-center justify-center text-[10px]"
          >
            {count}
          </Badge>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
)

const EmptyState = ({ message }: { message: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center h-full p-8 text-center"
  >
    <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
    <p className="text-sm font-medium text-muted-foreground">{message}</p>
    <p className="text-xs text-muted-foreground/75 mt-1">
      We&apos;ll notify you when something important happens
    </p>
  </motion.div>
)

const Notification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [filter, setFilter] = useState<string | null>(null)
  const { user } = useUser()
  const refreshTimeout = useRef<NodeJS.Timeout>()

  const fetchNotifications = async (showLoading = true) => {
    if (showLoading) setIsLoading(true)
    try {
      const response = await fetch(`/api/notifications?page=1&pageSize=20${filter ? `&type=${filter}` : ''}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }

  const refreshNotifications = async () => {
    setIsRefreshing(true)
    await fetchNotifications(false)
    setIsRefreshing(false)
  }

  useEffect(() => {
    if (user?.id) {
      fetchNotifications()
    }
  }, [user, filter])

  useEffect(() => {
    if (isOpen) {
      refreshTimeout.current = setInterval(refreshNotifications, 30000)
    }
    return () => clearInterval(refreshTimeout.current)
  }, [isOpen])

  const unreadCount = notifications?.filter(
    (notification) => !notification.read
  ).length || 0

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread') return !notification.read
    if (activeTab === 'read') return notification.read
    return true
  })

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

  const markAllAsRead = async () => {
    setIsMarkingAllRead(true)
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT'
      })
      if (response.ok) {
        setNotifications(
          notifications.map(notification => ({ ...notification, read: true }))
        )
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    } finally {
      setIsMarkingAllRead(false)
    }
  }

  const deleteNotification = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setNotifications(
          notifications.filter((notification) => notification.id !== id)
        )
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  const groupedNotifications = groupNotificationsByDate(filteredNotifications)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-secondary transition-colors duration-200"
        >
          <NotificationBell count={unreadCount} />
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[450px] p-0" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
          <div className="flex items-center gap-3">
            <h4 className="text-sm font-medium">Notifications</h4>
            {isRefreshing && (
              <RefreshCw className="h-3 w-3 animate-spin" />
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-primary-foreground hover:text-primary-foreground/80"
                onClick={markAllAsRead}
                disabled={isMarkingAllRead}
              >
                {isMarkingAllRead ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Check className="h-3 w-3 mr-1" />
                )}
                Mark all as read
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filter by type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilter(null)}>
                  All notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('info')}>
                  Information
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('success')}>
                  Success
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('warning')}>
                  Warnings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('error')}>
                  Errors
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => refreshNotifications()}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start rounded-none border-b p-0 h-auto">
            <TabsTrigger
              value="all"
              className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="unread"
              className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary"
            >
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="read"
              className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary"
            >
              Read
            </TabsTrigger>
          </TabsList>
          <ScrollArea className="h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg animate-pulse">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length > 0 ? (
              <AnimatePresence mode="sync">
                <div className="p-4">
                  {Object.entries(groupedNotifications).map(([date, notifications]) => (
                    <motion.div
                      key={date}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mb-6 last:mb-0"
                    >
                      <h5 className="text-xs font-medium text-muted-foreground mb-3 sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10">
                        {date}
                      </h5>
                      <div className="space-y-3">
                        {notifications.map((notification) => (
                          <motion.div
                            key={notification.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                            <NotificationItem
                              notification={notification}
                              onMarkAsRead={markAsRead}
                              onDelete={deleteNotification}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            ) : (
              <EmptyState
                message={
                  filter
                    ? "No notifications match the selected filter"
                    : activeTab === 'unread'
                      ? "No unread notifications"
                      : activeTab === 'read'
                        ? "No read notifications"
                        : "No notifications yet"
                }
              />
            )}
          </ScrollArea>
        </Tabs>
        <div className="p-2 border-t">
          <Link href="/Admin/notifications" className="w-full">
            <Button variant="ghost" className="w-full text-sm">
              View All Notifications
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default Notification