import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Check, 
  Trash2, 
  Bell,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
  userName?: string;
  type?: string;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting] = useState(false);
  const { user } = useUser();

  const isAdminOrModerator = user && user.publicMetadata && 
    ['ADMIN', 'MODERATOR'].includes(user.publicMetadata.role as string);

  const handleMarkAsRead = () => {
    onMarkAsRead(notification.id);
  };

  const handleDelete = () => {
    onDelete(notification.id);
  };

  const getTypeIcon = () => {
    switch (notification.type?.toLowerCase()) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInHours = Math.abs(now.getTime() - notificationDate.getTime()) / 36e5;
    
    if (diffInHours < 24) {
      if (diffInHours < 1) {
        const minutes = Math.floor(diffInHours * 60);
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
      }
      const hours = Math.floor(diffInHours);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    return notificationDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div
      className={cn(
        "group relative flex items-start gap-4 p-4 rounded-lg transition-all duration-200",
        !notification.read && "bg-primary/5",
        isHovered && "bg-accent",
        isDeleting && "opacity-50"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex-shrink-0 mt-1">
        {getTypeIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm leading-relaxed break-words",
          !notification.read && "font-medium"
        )}>
          {notification.message}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {notification.userName && (
            <>
              <span className="text-xs font-medium text-muted-foreground">
                {notification.userName}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
            </>
          )}
          <time className="text-xs text-muted-foreground">
            {formatDate(notification.createdAt)}
          </time>
        </div>
      </div>

      <div className={cn(
        "flex items-center gap-2 transition-opacity duration-200",
        !isHovered && !notification.read && "opacity-0 group-hover:opacity-100"
      )}>
        {!notification.read && (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 transition-transform hover:scale-105"
            onClick={handleMarkAsRead}
          >
            <Check className="h-4 w-4" />
            <span className="sr-only">Mark as read</span>
          </Button>
        )}
        {isAdminOrModerator && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 transition-transform hover:scale-105"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {!notification.read && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary rounded-full" />
      )}
    </div>
  );
};

export default NotificationItem;