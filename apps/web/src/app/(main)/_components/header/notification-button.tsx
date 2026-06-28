"use client";

import { Badge } from "@swapparel/shad-ui/components/badge";
import { Button } from "@swapparel/shad-ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@swapparel/shad-ui/components/popover";
import { ScrollArea } from "@swapparel/shad-ui/components/scroll-area";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftRight, Bell, BellRing, Check, CheckCheck, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { webClientORPC } from "../../../../lib/orpc-web-client";

type Notification = ReturnType<typeof formatNotification>;

function formatRelativeTime(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "trade_request":
      return <ArrowLeftRight className="size-4 shrink-0" />;
    case "trade_completed":
      return <CheckCheck className="size-4 shrink-0 text-emerald-500" />;
    case "new_message":
      return <MessageSquare className="size-4 shrink-0" />;
    default:
      return <Bell className="size-4 shrink-0" />;
  }
}

function getNotificationPreview(notification: Notification) {
  switch (notification.type) {
    case "trade_request":
      return `Trade request from ${notification.actorName ?? "someone"}`;
    case "trade_completed":
      return `Trade completed with ${notification.actorName ?? "someone"}`;
    case "new_message":
      return `Message from ${notification.actorName ?? "someone"}: ${notification.messagePreview ?? ""}`;
    default:
      return "Unknown notification";
  }
}

function formatNotification(raw: {
  _id: string;
  recipientId: string;
  type: "trade_request" | "trade_completed" | "new_message";
  transactionId?: string;
  actorName?: string;
  actorAvatarUrl?: string;
  messagePreview?: string;
  read: boolean;
  createdAt: string;
}) {
  return {
    ...raw,
    createdAt: new Date(raw.createdAt),
  };
}

export default function NotificationButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery(webClientORPC.notifications.getNotifications.queryOptions());

  const notifications = data?.notifications.map(formatNotification) ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const markAsReadMutation = useMutation(
    webClientORPC.notifications.markAsRead.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: webClientORPC.notifications.getNotifications.queryOptions().queryKey,
        });
      },
    })
  );

  const markAllReadMutation = useMutation(
    webClientORPC.notifications.markAllRead.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: webClientORPC.notifications.getNotifications.queryOptions().queryKey,
        });
      },
    })
  );

  const { data: notificationData = [] } = useQuery(webClientORPC.notifications.subscribeNotifications.experimental_streamedOptions());

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: webClientORPC.notifications.getNotifications.queryOptions().queryKey,
    });
  }, [notificationData]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate({ id: notification._id });
    }

    if (notification.transactionId) {
      setOpen(false);
      router.push(`/trades?trade=${notification.transactionId}`);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllReadMutation.mutateAsync();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="relative duration-100 ease-in hover:scale-110 hover:cursor-pointer" aria-label="Notifications">
          {unreadCount > 0 ? (
            <>
              <BellRing width={37.5} height={37.5} />
              <Badge
                className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full p-0 text-[10px] leading-none"
                variant="destructive"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            </>
          ) : (
            <Bell width={37.5} height={37.5} />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-80 p-0">
        <div className="flex items-center justify-between border-border border-b px-4 py-3">
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <Button type="button" variant="ghost" size="xs" onClick={handleMarkAllRead} disabled={markAllReadMutation.isPending}>
              <Check className="size-3" />
              Mark all read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground text-sm">Loading...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <Bell className="size-6 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">No notifications yet</p>
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <button
                  key={notification._id}
                  type="button"
                  className={`flex items-start gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-accent/50 ${
                    !notification.read ? "bg-accent/20" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                  <div className="min-w-0 flex-1">
                    <p className={`line-clamp-2 leading-tight ${!notification.read ? "font-medium" : ""}`}>
                      {getNotificationPreview(notification)}
                    </p>
                    <p className="mt-1 text-muted-foreground text-xs">{formatRelativeTime(notification.createdAt)}</p>
                  </div>
                  {!notification.read && <div className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
