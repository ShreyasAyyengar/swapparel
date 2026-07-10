"use client";

import type { notificationSchema } from "@swapparel/contracts";
import { Badge } from "@swapparel/shad-ui/components/badge";
import { Button } from "@swapparel/shad-ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@swapparel/shad-ui/components/popover";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftRight, Bell, BellRing, Check, CheckCheck, ChevronDown, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { z } from "zod";
import { webClientORPC } from "../../../../lib/orpc-web-client";

type Notification = z.infer<typeof notificationSchema>;

const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const DAYS_PER_WEEK = 7;
const MAX_UNREAD_BADGE_COUNT = 9;
const MILLISECONDS_PER_SECOND = 1000;

function formatRelativeTime(date: Date | string) {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffSecs = Math.floor(diffMs / MILLISECONDS_PER_SECOND);
  const diffMins = Math.floor(diffSecs / SECONDS_PER_MINUTE);
  const diffHours = Math.floor(diffMins / MINUTES_PER_HOUR);
  const diffDays = Math.floor(diffHours / HOURS_PER_DAY);

  if (diffSecs < SECONDS_PER_MINUTE) return "just now";
  if (diffMins < MINUTES_PER_HOUR) return `${diffMins}m ago`;
  if (diffHours < HOURS_PER_DAY) return `${diffHours}h ago`;
  if (diffDays < DAYS_PER_WEEK) return `${diffDays}d ago`;
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

const notificationsInfiniteOptions = webClientORPC.notifications.getNotifications.infiniteOptions({
  input: (cursor) => ({ limit: 20, cursor: cursor ?? undefined }),
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  initialPageParam: undefined as string | undefined,
});

export default function NotificationButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(notificationsInfiniteOptions);

  const notifications = data?.pages.flatMap((page) => page.notifications) ?? [];
  const unreadCount = data?.pages[0]?.unreadCount ?? 0;

  const markAsReadByTransactionIdMutation = useMutation(
    webClientORPC.notifications.markAsReadByTransactionId.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: notificationsInfiniteOptions.queryKey,
        });
      },
    })
  );

  const markAllReadMutation = useMutation(
    webClientORPC.notifications.markAllRead.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: notificationsInfiniteOptions.queryKey,
        });
      },
    })
  );

  const { data: notificationData = [] } = useQuery(webClientORPC.notifications.streamNotifications.experimental_streamedOptions());

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: notificationsInfiniteOptions.queryKey,
    });
  }, [notificationData]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read && notification.transactionId) {
      markAsReadByTransactionIdMutation.mutate({ transactionId: notification.transactionId });
    }

    if (notification.transactionId) {
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: webClientORPC.transaction.getTransactions.queryOptions().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: [["transaction", "getTransactionsByInterlocutor"]],
      });
      queryClient.invalidateQueries({
        queryKey: webClientORPC.transaction.getInterlocutors.queryOptions().queryKey,
      });
      // TODO: find a way to do this using nuqs
      router.push(`/trades?trade=${notification.transactionId}`);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllReadMutation.mutateAsync({});
  };

  // TODO: clicking on a "trade completed" notification should take the user to the exact trade conversation, not just the trades page.
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="relative duration-100 ease-in hover:scale-110 hover:cursor-pointer" aria-label="Notifications">
          {unreadCount > 0 ? (
            <>
              <BellRing width={37.5} height={37.5} />
              <Badge
                className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-destructive! p-0 text-[12px] leading-none tracking-tighter"
                variant="destructive"
              >
                {unreadCount > MAX_UNREAD_BADGE_COUNT ? "9+" : unreadCount}
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
          // <ScrollArea className="h-80">
          <div className="flex h-80 flex-col overflow-y-auto">
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
                  <p className={`line-clamp-2 break-words leading-tight ${!notification.read ? "font-medium" : ""}`}>
                    {getNotificationPreview(notification)}
                  </p>
                  <p className="mt-1 text-muted-foreground text-xs">{formatRelativeTime(notification.createdAt)}</p>
                </div>
                {!notification.read && <div className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
              </button>
            ))}
            {hasNextPage && (
              <button
                type="button"
                className="flex w-full items-center justify-center gap-1 px-4 py-3 text-muted-foreground text-sm transition-colors hover:bg-accent/50"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                <ChevronDown className="size-4" />
                {isFetchingNextPage ? "Loading..." : "Load more"}
              </button>
            )}
          </div>
          // </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
