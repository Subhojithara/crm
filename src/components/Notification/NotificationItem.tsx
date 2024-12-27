import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { ScrollArea } from "../ui/scroll-area";

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
  const { user } = useUser();

  const isAdminOrModerator = user && user.publicMetadata && ['ADMIN', 'MODERATOR'].includes(user.publicMetadata.role as string);

  const handleMarkAsRead = () => {
    onMarkAsRead(notification.id);
  };

  const handleDelete = () => {
    onDelete(notification.id);
  };

  return (
    <ScrollArea>
    <div className="flex items-center justify-between p-4 rounded-md hover:bg-accent">
      <div className="flex-1">
        <p className="text-sm">{notification.message}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(notification.createdAt).toLocaleString()}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        {!notification.read && (
          <Button variant="outline" size="icon" onClick={handleMarkAsRead}>
            <span className="sr-only">Mark as read</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </Button>
        )}
        {isAdminOrModerator && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDelete}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
    </ScrollArea>
  );
};

export default NotificationItem; 