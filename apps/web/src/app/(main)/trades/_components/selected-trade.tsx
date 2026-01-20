import { PUBLIC_LOCATIONS, type transactionSchema } from "@swapparel/contracts";
import { Button } from "@swapparel/shad-ui/components/button";
import { Calendar } from "@swapparel/shad-ui/components/calendar";
import { Input } from "@swapparel/shad-ui/components/input";
import { Popover, PopoverContent, PopoverTrigger } from "@swapparel/shad-ui/components/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger } from "@swapparel/shad-ui/components/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarIcon, ChevronDownIcon, Clock, LoaderCircle, MapPinPen } from "lucide-react";
import { useEffect, useState } from "react";
import type { z } from "zod";
import { socketClientORPC } from "../../../../lib/orpc-socket-web-client";
import { webClientORPC } from "../../../../lib/orpc-web-client";
import Chat from "./chat";

export default function SelectedTrade({ transaction }: { transaction: z.infer<typeof transactionSchema> }) {
  const [changeableDate, setChangeableDate] = useState<Date>(new Date(transaction.dateToSwap));
  const [changeableLocation, setChangeableLocation] = useState<string>(transaction.locationToSwap ?? "");
  const queryClient = useQueryClient();

  useEffect(() => {
    setChangeableDate(new Date(transaction.dateToSwap));
    setChangeableLocation(transaction.locationToSwap ?? "");
  }, [transaction.dateToSwap, transaction.locationToSwap]);

  useEffect(() => {
    let cancelled = false;

    const watchUpdates = async () => {
      try {
        for await (const _ of await socketClientORPC.subscribeToDataChange({ transactionId: transaction._id })) {
          await queryClient.invalidateQueries({
            queryKey: webClientORPC.transaction.getTransactions.queryOptions().queryKey,
          });

          if (cancelled) break;
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error watching transaction:", error);
        }
      }
    };

    watchUpdates();

    return () => {
      cancelled = true;
    };
  }, [transaction._id]);

  // Create mutation for updating transaction
  const updateTransactionMutation = useMutation(
    webClientORPC.transaction.updateTransaction.mutationOptions({
      onSuccess: () => {
        // Invalidate and refetch the transactions query
        queryClient.invalidateQueries({
          queryKey: webClientORPC.transaction.getTransactions.queryOptions().queryKey,
        });

        socketClientORPC.publishDataChange({ transactionId: transaction._id });
      },
      onError: (error) => {
        console.error("Failed to update transaction:", error);
        // todo: show error toast/notification
        setChangeableDate(new Date(transaction.dateToSwap));
      },
    })
  );

  return (
    <div className={"flex h-full flex-col"}>
      <div className="mx-5 mt-5 flex items-center justify-between">
        {/* Swap Date */}
        <div className="w-fit rounded-md border border-secondary/50 bg-accent p-2 text-center font-bold text-bold text-foreground">
          <Popover
            onOpenChange={(open) => {
              // When popover closes, save the date if it changed
              if (!open && changeableDate.getTime() !== new Date(transaction.dateToSwap).getTime()) {
                updateTransactionMutation.mutate({
                  _id: transaction._id,
                  dateToSwap: changeableDate,
                });
              }
            }}
          >
            <div className="flex items-center gap-2">
              <div>Swap Date</div>
              <PopoverTrigger asChild>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="outline"
                    id="date-picker"
                    className="justify-between border-secondary font-mono text-foreground-950"
                    disabled={updateTransactionMutation.isPending}
                  >
                    {updateTransactionMutation.isPending ? <LoaderCircle className="animate-spin" /> : <CalendarIcon />}

                    {changeableDate.toLocaleDateString()}
                    <ChevronDownIcon />
                  </Button>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="center">
                <Calendar
                  mode="single"
                  selected={changeableDate}
                  captionLayout="dropdown"
                  hidden={{ before: new Date() }}
                  onSelect={(selectedDate) => {
                    if (selectedDate) setChangeableDate(selectedDate);
                  }}
                />
              </PopoverContent>
              <div
                className={
                  "flex items-center justify-center rounded-md border border-secondary bg-background text-foreground-950 hover:bg-accent"
                }
              >
                {updateTransactionMutation.isPending ? (
                  <LoaderCircle className="ml-3 animate-spin font-mono" />
                ) : (
                  <Clock className="pointer-events-none ml-3 font-mono" />
                )}

                <Input
                  type="time"
                  id="time-picker"
                  step="60"
                  value={changeableDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  className="border-0 bg-transparent font-mono font-normal shadow-none outline-none ring-0 focus:border-transparent focus:shadow-none focus:outline-none focus:ring-0 focus-visible:border-transparent focus-visible:shadow-none focus-visible:outline-none focus-visible:ring-0 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  onChange={(e) => {
                    const time = e.currentTarget.value;
                    const [hours, minutes] = time.split(":").map(Number);
                    const newDate = new Date(changeableDate);
                    newDate.setHours(hours, minutes);
                    setChangeableDate(newDate);
                  }}
                  onBlur={(e) => {
                    e.preventDefault();
                    const time = e.currentTarget.value;
                    const [hours, minutes] = time.split(":").map(Number);

                    // Create the new date immediately
                    const newDate = new Date(changeableDate);
                    newDate.setHours(hours, minutes);

                    // Update state AND send the new date in the same call
                    setChangeableDate(newDate);
                    updateTransactionMutation.mutate({
                      _id: transaction._id,
                      dateToSwap: newDate, // Send the NEW value, not the old one
                    });
                  }}
                  disabled={updateTransactionMutation.isPending}
                />
              </div>
            </div>
          </Popover>
        </div>

        {/* Swap Location */}
        <div className="w-fit rounded-md border border-secondary/50 bg-accent p-2 text-center font-bold text-bold text-foreground">
          <Select
            disabled={updateTransactionMutation.isPending}
            value={changeableLocation}
            onValueChange={(value) => setChangeableLocation(value)}
            onOpenChange={(open) => {
              if (!open && changeableLocation !== transaction.locationToSwap) {
                updateTransactionMutation.mutate({
                  _id: transaction._id,
                  locationToSwap: changeableLocation,
                });
              }
            }}
          >
            <div className="flex items-center gap-2">
              <div>{updateTransactionMutation.isPending ? "Updating..." : "Swap Location: "}</div>
              <SelectTrigger className="truncate border border-secondary bg-background hover:bg-accent">
                {updateTransactionMutation.isPending ? <LoaderCircle className="animate-spin font-mono" /> : <MapPinPen className="font-mono" />}
                <div className="max-w-[32ch] truncate pr-2 font-mono font-normal text-foreground-950">
                  {changeableLocation || "No Location Set"}
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>UCSC Locations</SelectLabel>
                  {Object.entries(PUBLIC_LOCATIONS).map(([value, label]) => (
                    <SelectItem key={value} value={label.name} onSelect={() => setChangeableLocation(label.name)}>
                      {label.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Other</SelectLabel>
                  <Input
                    className="max-w-[32ch] truncate"
                    type="text"
                    placeholder="Enter a custom location"
                    value={changeableLocation}
                    onChange={(e) => setChangeableLocation(e.target.value)}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                    }}
                  />
                </SelectGroup>
              </SelectContent>
            </div>
          </Select>
        </div>
      </div>
      <Chat transaction={transaction} />
    </div>
  );
}
