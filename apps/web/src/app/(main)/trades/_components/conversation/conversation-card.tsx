import { Avatar, AvatarFallback, AvatarImage } from "@swapparel/shad-ui/components/avatar";
import { Badge } from "@swapparel/shad-ui/components/badge";
import { Skeleton } from "@swapparel/shad-ui/components/skeleton";
import { cn } from "@swapparel/shad-ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { webClientORPC } from "../../../../../lib/orpc-web-client";
import { useActiveConversationStore } from "../../_hooks/use-active-conversation-store";
import { useActiveTradeStore } from "../../_hooks/use-active-trade-store";

export default function ConversationCard({ interlocutorId }: { interlocutorId: string }) {
  const { data, isPending } = useQuery(
    webClientORPC.users.getUser.queryOptions({
      input: { id: interlocutorId },
      enabled: !!interlocutorId,
    })
  );

  const { data: interlocutorTransactions } = useQuery(
    webClientORPC.transaction.getTransactionsByInterlocutor.queryOptions({
      input: { interlocutorId },
      enabled: !!interlocutorId,
    })
  );

  const activeCount = interlocutorTransactions?.filter(({ status }) => status === "ongoing").length ?? 0;

  const { activeConversation, setActiveConversation } = useActiveConversationStore();
  const setActiveTradeId = useActiveTradeStore((state) => state.setActiveTradeId);
  const [, setTransactionIdURL] = useQueryState("trade", parseAsString);
  const isActive = activeConversation === interlocutorId;
  const initials =
    data?.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?";

  if (isPending) {
    return <ConversationCardSkeleton />;
  }

  return (
    <button
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border border-transparent p-3 text-left transition-colors",
        isActive ? "border-primary/30 bg-primary/10" : "hover:border-border hover:bg-background"
      )}
      type="button"
      onClick={() => {
        if (isActive) return;
        setActiveConversation(interlocutorId);
        setActiveTradeId(undefined);
        setTransactionIdURL(null);
      }}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={data?.image} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{data?.name}</div>
        {activeCount > 0 && (
          <Badge variant="secondary" className="mt-1 h-5 rounded-full px-2 font-medium text-xs">
            {activeCount} active
          </Badge>
        )}
      </div>
      <ChevronRight className={cn("size-4 text-muted-foreground transition-transform", isActive && "translate-x-0.5 text-primary")} />
    </button>
  );
}

export function ConversationCardSkeleton() {
  return (
    <div aria-hidden="true" className="flex w-full items-center gap-3 rounded-lg border border-transparent p-3">
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}
