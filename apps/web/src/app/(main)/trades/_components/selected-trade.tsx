import { PUBLIC_LOCATIONS, type postSchema, type transactionSchema } from "@swapparel/contracts";
import { Button } from "@swapparel/shad-ui/components/button";
import { Calendar } from "@swapparel/shad-ui/components/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@swapparel/shad-ui/components/dialog";
import { Input } from "@swapparel/shad-ui/components/input";
import { Label } from "@swapparel/shad-ui/components/label";
import { cn } from "@swapparel/shad-ui/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Check, Clock3, Eye, LoaderCircle, MapPin, Pencil, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { z } from "zod";
import { authClient } from "../../../../lib/auth-client";
import { socketClientORPC } from "../../../../lib/orpc-socket-web-client";
import { webClientORPC } from "../../../../lib/orpc-web-client";
import MasonryLayout from "../../feed/_components/post/masonry-layout";
import PostDialog from "../../feed/_components/shadcn-post/post-dialog";
import Chat from "./chat";
import RatingDialog from "./dialogs/rating-dialog";

const publicLocationNames = Object.values(PUBLIC_LOCATIONS).map(({ name }) => name);

export default function SelectedTrade({
  interlocutorId,
  transaction,
}: {
  interlocutorId: string;
  transaction: z.infer<typeof transactionSchema>;
}) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [viewItemsOpen, setViewItemsOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedEditPosts, setSelectedEditPosts] = useState<z.infer<typeof postSchema>[]>([]);
  const [draftDate, setDraftDate] = useState<Date>(new Date(transaction.scheduledFor));
  const [draftLocation, setDraftLocation] = useState(transaction.location ?? "");
  const [customLocation, setCustomLocation] = useState(
    transaction.location && !publicLocationNames.includes(transaction.location) ? transaction.location : ""
  );
  const [errorMessage, setErrorMessage] = useState("");
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user.id;

  const scheduledFor = new Date(transaction.scheduledFor);
  const isCustomLocation = !!draftLocation && !publicLocationNames.includes(draftLocation);
  const selectedLocation = isCustomLocation ? customLocation : draftLocation;
  const hasChanges = draftDate.getTime() !== scheduledFor.getTime() || selectedLocation.trim() !== (transaction.location ?? "");

  const isCurrentUserBuyer = currentUserId === transaction.buyer.userId;
  const email = isCurrentUserBuyer ? transaction.buyer.emailSnapshot : transaction.seller.emailSnapshot;

  const allPostIds = useMemo(
    () => [...transaction.sellerPosts.map((p) => p.postId), ...transaction.buyerPosts.map((p) => p.postId)],
    [transaction]
  );

  const { data: viewItemsPosts } = useQuery(
    webClientORPC.posts.getPostsByIds.queryOptions({
      input: { ids: allPostIds },
      enabled: viewItemsOpen,
    })
  );

  const { data: userAllPosts } = useQuery(
    webClientORPC.posts.getPosts.queryOptions({
      input: { createdBy: email ?? "" },
      enabled: editing,
    })
  );

  const sellerViewItems = useMemo(
    () =>
      transaction.sellerPosts.map((sp) => viewItemsPosts?.find((p) => p._id === sp.postId)).filter((p): p is z.infer<typeof postSchema> => !!p),
    [transaction.sellerPosts, viewItemsPosts]
  );

  const buyerViewItems = useMemo(
    () =>
      transaction.buyerPosts.map((bp) => viewItemsPosts?.find((p) => p._id === bp.postId)).filter((p): p is z.infer<typeof postSchema> => !!p),
    [transaction.buyerPosts, viewItemsPosts]
  );

  const editMutation = useMutation(
    webClientORPC.transaction.updateTransaction.mutationOptions({
      onSuccess: async () => {
        setEditing(false);
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: webClientORPC.transaction.getTransactions.queryOptions().queryKey,
          }),
          queryClient.invalidateQueries({
            queryKey: webClientORPC.transaction.getTransactionsByInterlocutor.queryOptions({
              input: { interlocutorId },
            }).queryKey,
          }),
        ]);
        socketClientORPC.messaging.publishTransactionDataChange({ transactionId: transaction._id });
      },
      onError: () => {
        setErrorMessage("Failed to save items. Please try again.");
      },
    })
  );

  useEffect(() => {
    setDraftDate(new Date(transaction.scheduledFor));
    setDraftLocation(transaction.location ?? "");
    setCustomLocation(transaction.location && !publicLocationNames.includes(transaction.location) ? transaction.location : "");
  }, [transaction.scheduledFor, transaction.location]);

  useEffect(() => {
    let cancelled = false;
    if (transaction.status !== "ongoing") return;

    const watchUpdates = async () => {
      try {
        for await (const _ of await socketClientORPC.messaging.subscribeTransactionDataChange({ transactionId: transaction._id })) {
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: webClientORPC.transaction.getTransactions.queryOptions().queryKey,
            }),
            queryClient.invalidateQueries({
              queryKey: webClientORPC.transaction.getTransactionsByInterlocutor.queryOptions({
                input: { interlocutorId },
              }).queryKey,
            }),
          ]);

          if (cancelled) break;
        }
      } catch {
        // The subscription is expected to close when the selected trade changes.
      }
    };

    watchUpdates();

    return () => {
      cancelled = true;
    };
  }, [interlocutorId, queryClient, transaction._id]);

  const updateTransactionMutation = useMutation(
    webClientORPC.transaction.updateTransaction.mutationOptions({
      onSuccess: async () => {
        setEditorOpen(false);
        setErrorMessage("");
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: webClientORPC.transaction.getTransactions.queryOptions().queryKey,
          }),
          queryClient.invalidateQueries({
            queryKey: webClientORPC.transaction.getTransactionsByInterlocutor.queryOptions({
              input: { interlocutorId },
            }).queryKey,
          }),
        ]);
        socketClientORPC.messaging.publishTransactionDataChange({ transactionId: transaction._id });
      },
      onError: () => {
        setErrorMessage("The meetup could not be updated. Please try again.");
      },
    })
  );

  const resetDraft = () => {
    const currentDate = new Date(transaction.scheduledFor);
    const currentLocation = transaction.location ?? "";
    setDraftDate(currentDate);
    setDraftLocation(currentLocation);
    setCustomLocation(currentLocation && !publicLocationNames.includes(currentLocation) ? currentLocation : "");
    setErrorMessage("");
  };

  const saveMeetup = () => {
    const location = selectedLocation.trim();
    if (!location) {
      setErrorMessage("Choose a meetup location or enter a custom place.");
      return;
    }
    if (draftDate.getTime() < Date.now()) {
      setErrorMessage("Choose a meetup time in the future.");
      return;
    }

    updateTransactionMutation.mutate({
      _id: transaction._id,
      scheduledFor: draftDate,
      location,
    });
  };

  const handleStartEdit = () => {
    const userPostIds = isCurrentUserBuyer ? transaction.buyerPosts.map((p) => p.postId) : transaction.sellerPosts.map((p) => p.postId);
    const preSelected = viewItemsPosts?.filter((p) => userPostIds.includes(p._id)) ?? [];
    setSelectedEditPosts(preSelected);
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setSelectedEditPosts([]);
  };

  const handleSaveEdit = () => {
    const updatedPosts = selectedEditPosts.map((p) => ({ postId: p._id, titleSnapshot: p.title }));
    editMutation.mutate({
      _id: transaction._id,
      ...(isCurrentUserBuyer ? { updatedBuyerPosts: updatedPosts } : { updatedSellerPosts: updatedPosts }),
    });
  };

  const handleTradeSelection = (post: z.infer<typeof postSchema>) => {
    setSelectedEditPosts((prev) => {
      if (prev.some((p) => p._id === post._id)) {
        return prev.filter((p) => p._id !== post._id);
      }
      return [...prev, post];
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="border-border border-b px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold">Trade conversation</p>
            <p className="text-muted-foreground text-xs">Messages and meetup details are specific to this trade.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setViewItemsOpen(true)}>
              <Eye />
              View items
            </Button>
            {transaction.status === "ongoing" ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  resetDraft();
                  setEditorOpen(true);
                }}
              >
                <Pencil />
                Edit meetup
              </Button>
            ) : transaction.status === "completed" ? (
              <RatingDialog transaction={transaction} />
            ) : (
              <p className="text-muted-foreground text-sm">Trade was cancelled</p>
            )}
          </div>
        </div>
        <div className="mt-3 grid gap-2 rounded-xl border border-border bg-muted/30 p-3 sm:grid-cols-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="rounded-lg bg-background p-2">
              <CalendarDays className="size-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs">Date & time</p>
              <p className="truncate font-medium text-sm">
                {scheduledFor.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} at{" "}
                {scheduledFor.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              </p>
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="rounded-lg bg-background p-2">
              <MapPin className="size-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs">Meetup place</p>
              <p className="truncate font-medium text-sm">{transaction.location || "Not selected yet"}</p>
            </div>
          </div>
        </div>
      </header>

      <Chat transaction={transaction} />

      <Dialog open={viewItemsOpen} onOpenChange={setViewItemsOpen}>
        <DialogContent className="flex max-h-[90dvh] flex-col overflow-y-auto sm:max-h-[90dvh] sm:max-w-[90vw]">
          <DialogHeader>
            <DialogTitle>Items in this trade</DialogTitle>
          </DialogHeader>
          <div className="grid flex-1 gap-6 md:grid-cols-2">
            <section className="flex flex-col items-center justify-start rounded-lg border border-border p-3">
              <h3 className="mb-3 font-semibold text-sm">{transaction.seller.emailSnapshot} offers</h3>
              {editing && !isCurrentUserBuyer ? (
                <div className="min-h-0 w-full flex-1 overflow-auto rounded-md border border-border bg-card p-3">
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {userAllPosts?.map((post) => {
                      const isSelected = selectedEditPosts.some((p) => p._id === post._id);
                      return (
                        <button
                          key={post._id}
                          type="button"
                          aria-pressed={isSelected}
                          className={cn(
                            "group relative aspect-square overflow-hidden rounded-md border-2 text-left transition-all",
                            isSelected ? "border-success" : "border-transparent hover:border-muted-foreground"
                          )}
                          onClick={() => handleTradeSelection(post)}
                        >
                          <Image src={post.images[0] ?? ""} alt={post.title} fill className="object-cover" sizes="160px" unoptimized />
                          <span className="absolute inset-x-0 bottom-0 line-clamp-2 bg-black/60 px-2 py-1 font-medium text-[11px] text-white leading-tight">
                            {post.title}
                          </span>
                          {isSelected && (
                            <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                              <span className="rounded-full bg-background p-1">
                                <Check className="size-5 text-success" />
                              </span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <>
                  <MasonryLayout gap={12}>
                    {sellerViewItems.map((post) => (
                      <PostDialog key={post._id} postData={post} className="border border-border bg-card" />
                    ))}
                  </MasonryLayout>
                  {sellerViewItems.length === 0 && (
                    <div className="flex h-full w-full flex-1 items-center justify-center border border-lime-500">
                      <p className="text-muted-foreground text-sm">No items to display.</p>
                    </div>
                  )}
                </>
              )}
            </section>
            <section className="flex flex-col items-center justify-start rounded-lg border border-border p-3">
              <h3 className="mb-3 font-semibold text-sm">{transaction.buyer.emailSnapshot} offers</h3>
              {editing && isCurrentUserBuyer ? (
                <div className="min-h-0 w-full flex-1 overflow-auto rounded-md border border-border bg-card p-3">
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {userAllPosts?.map((post) => {
                      const isSelected = selectedEditPosts.some((p) => p._id === post._id);
                      return (
                        <button
                          key={post._id}
                          type="button"
                          aria-pressed={isSelected}
                          className={cn(
                            "group relative aspect-square overflow-hidden rounded-md border-2 text-left transition-all",
                            isSelected ? "border-success" : "border-transparent hover:border-muted-foreground"
                          )}
                          onClick={() => handleTradeSelection(post)}
                        >
                          <Image src={post.images[0] ?? ""} alt={post.title} fill className="object-cover" sizes="160px" unoptimized />
                          <span className="absolute inset-x-0 bottom-0 line-clamp-2 bg-black/60 px-2 py-1 font-medium text-[11px] text-white leading-tight">
                            {post.title}
                          </span>
                          {isSelected && (
                            <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                              <span className="rounded-full bg-background p-1">
                                <Check className="size-5 text-success" />
                              </span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <>
                  <MasonryLayout gap={12}>
                    {buyerViewItems.map((post) => (
                      <PostDialog key={post._id} postData={post} className="border border-border bg-card" />
                    ))}
                  </MasonryLayout>
                  {buyerViewItems.length === 0 && (
                    <div className="flex h-full w-full flex-1 items-center justify-center">
                      <p className="text-muted-foreground text-sm">No items to display.</p>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
          <DialogFooter>
            {editing ? (
              <>
                <Button type="button" variant="ghost" onClick={handleCancelEdit} disabled={editMutation.isPending}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSaveEdit} disabled={editMutation.isPending}>
                  {editMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}
                  Save changes
                </Button>
              </>
            ) : (
              transaction.status === "ongoing" && (
                <Button type="button" variant="outline" onClick={handleStartEdit}>
                  <Pencil />
                  Edit items
                </Button>
              )
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editorOpen}
        onOpenChange={(open) => {
          if (!open && !updateTransactionMutation.isPending) resetDraft();
          setEditorOpen(open);
        }}
      >
        <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Update meetup</DialogTitle>
            <DialogDescription>Choose the date, time, and place, then save them together.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-[auto_minmax(0,1fr)]">
            <div className="">
              <Label className="mb-2 block">Date</Label>
              <div className="w-fit rounded-xl border border-border p-1">
                <Calendar
                  mode="single"
                  selected={draftDate}
                  hidden={{ before: new Date() }}
                  onSelect={(selectedDate) => {
                    if (!selectedDate) return;
                    const nextDate = new Date(selectedDate);
                    nextDate.setHours(draftDate.getHours(), draftDate.getMinutes(), 0, 0);
                    setDraftDate(nextDate);
                    setErrorMessage("");
                  }}
                />
              </div>
              <Label htmlFor="meetup-time" className="mt-4 mb-2 block">
                Time
              </Label>
              <div className="relative">
                <Clock3 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="meetup-time"
                  type="time"
                  step="300"
                  value={`${String(draftDate.getHours()).padStart(2, "0")}:${String(draftDate.getMinutes()).padStart(2, "0")}`}
                  className="pl-9"
                  onChange={(event) => {
                    const [hoursText = "", minutesText = ""] = event.currentTarget.value.split(":");
                    const hours = Number(hoursText);
                    const minutes = Number(minutesText);
                    if (Number.isNaN(hours) || Number.isNaN(minutes)) return;
                    const nextDate = new Date(draftDate);
                    nextDate.setHours(hours, minutes, 0, 0);
                    setDraftDate(nextDate);
                    setErrorMessage("");
                  }}
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Meetup place</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {publicLocationNames.map((location) => {
                  const selected = draftLocation === location;
                  return (
                    <button
                      key={location}
                      type="button"
                      className={cn(
                        "flex min-h-12 items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                        selected ? "border-primary bg-primary/10 text-foreground" : "border-border hover:border-primary/40 hover:bg-muted/50"
                      )}
                      onClick={() => {
                        setDraftLocation(location);
                        setErrorMessage("");
                      }}
                    >
                      <MapPin className="size-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1">{location}</span>
                      {selected && <Check className="size-4 text-primary" />}
                    </button>
                  );
                })}
              </div>

              <div className="my-4 flex items-center gap-3 text-muted-foreground text-xs">
                <div className="h-px flex-1 bg-border" />
                <span>or use another place</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <Input
                value={customLocation}
                placeholder="e.g. McHenry Library entrance"
                onFocus={() => setDraftLocation(customLocation || "__custom__")}
                onChange={(event) => {
                  setCustomLocation(event.target.value);
                  setDraftLocation(event.target.value || "__custom__");
                  setErrorMessage("");
                }}
              />

              <div className="mt-4 rounded-xl bg-muted/50 p-3">
                <p className="font-medium text-xs uppercase tracking-wide">New meetup</p>
                <p className="mt-1 text-sm">
                  {draftDate.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })} at{" "}
                  {draftDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-muted-foreground text-sm">
                  <MapPin className="size-3.5" />
                  {selectedLocation.trim() || "Choose a location"}
                </p>
              </div>
            </div>
          </div>

          {errorMessage && <p className="text-destructive text-sm">{errorMessage}</p>}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={resetDraft} disabled={updateTransactionMutation.isPending || !hasChanges}>
              <RefreshCw />
              Reset
            </Button>
            <Button type="button" onClick={saveMeetup} disabled={updateTransactionMutation.isPending || !hasChanges}>
              {updateTransactionMutation.isPending ? <LoaderCircle className="animate-spin" /> : <Check />}
              Save meetup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
