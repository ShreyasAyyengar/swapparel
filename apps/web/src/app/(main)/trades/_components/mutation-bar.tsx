import { PUBLIC_LOCATIONS, type transactionSchema } from "@swapparel/contracts";
import { Button } from "@swapparel/shad-ui/components/button";
import { Input } from "@swapparel/shad-ui/components/input";
import { Popover, PopoverContent, PopoverTrigger } from "@swapparel/shad-ui/components/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger } from "@swapparel/shad-ui/components/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, CalendarIcon, ChevronDownIcon, Clock, LoaderCircle, MapPinPen } from "lucide-react";
import { useEffect, useState } from "react";
import type { z } from "zod";
import { socketClientORPC } from "../../../../lib/orpc-socket-web-client";
import { webClientORPC } from "../../../../lib/orpc-web-client";

export default function MutationBar({ transaction }: { transaction: z.infer<typeof transactionSchema> }) {
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

  // return (
  //   <div className="flex w-full items-center justify-between">
  //     <div className="flex w-fit gap-2 rounded-md text-center font-bold text-bold text-foreground">
  //       {/* Swap Date */}
  //       <Popover
  //         onOpenChange={(open) => {
  //           // When popover closes, save the date if it changed
  //           if (!open && changeableDate.getTime() !== new Date(transaction.dateToSwap).getTime()) {
  //             updateTransactionMutation.mutate({
  //               _id: transaction._id,
  //               dateToSwap: changeableDate,
  //             });
  //           }
  //         }}
  //       >
  //         <div className="flex items-center gap-2">
  //           <PopoverTrigger asChild>
  //             <div className="flex flex-col gap-1">
  //               <span>Swap Date</span>
  //               <Button
  //                 variant="outline"
  //                 id="date-picker"
  //                 className="justify-between border-secondary font-mono text-foreground-950"
  //                 disabled={updateTransactionMutation.isPending}
  //               >
  //                 {updateTransactionMutation.isPending ? <LoaderCircle className="animate-spin" /> : <CalendarIcon />}
  //
  //                 {changeableDate.toLocaleDateString()}
  //                 <ChevronDownIcon />
  //               </Button>
  //             </div>
  //           </PopoverTrigger>
  //           <PopoverContent className="w-auto overflow-hidden p-0" align="center">
  //             <Calendar
  //               mode="single"
  //               selected={changeableDate}
  //               captionLayout="dropdown"
  //               hidden={{ before: new Date() }}
  //               onSelect={(selectedDate) => {
  //                 if (selectedDate) setChangeableDate(selectedDate);
  //               }}
  //             />
  //           </PopoverContent>
  //         </div>
  //       </Popover>
  //
  //       {/* Swap Time */}
  //       <div className="flex flex-col gap-1">
  //         <span>Swap Time</span>
  //         <div
  //           className={"flex items-center justify-center rounded-md border border-secondary bg-background text-foreground-950 hover:bg-accent"}
  //         >
  //           <div className="flex items-center gap-2">
  //             {updateTransactionMutation.isPending ? (
  //               <LoaderCircle className="ml-3 animate-spin font-mono" />
  //             ) : (
  //               <Clock className="pointer-events-none ml-3 font-mono" />
  //             )}
  //
  //             <Input
  //               type="time"
  //               id="time-picker"
  //               step="60"
  //               value={changeableDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
  //               className="border-0 bg-transparent font-mono font-normal shadow-none outline-none ring-0 focus:border-transparent focus:shadow-none focus:outline-none focus:ring-0 focus-visible:border-transparent focus-visible:shadow-none focus-visible:outline-none focus-visible:ring-0 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
  //               onChange={(e) => {
  //                 const time = e.currentTarget.value;
  //                 const [hours, minutes] = time.split(":").map(Number);
  //                 const newDate = new Date(changeableDate);
  //                 newDate.setHours(hours, minutes);
  //                 setChangeableDate(newDate);
  //               }}
  //               onBlur={(e) => {
  //                 e.preventDefault();
  //                 const time = e.currentTarget.value;
  //                 const [hours, minutes] = time.split(":").map(Number);
  //
  //                 // Create the new date immediately
  //                 const newDate = new Date(changeableDate);
  //                 newDate.setHours(hours, minutes);
  //
  //                 // Update state AND send the new date in the same call
  //                 setChangeableDate(newDate);
  //                 updateTransactionMutation.mutate({
  //                   _id: transaction._id,
  //                   dateToSwap: newDate, // Send the NEW value, not the old one
  //                 });
  //               }}
  //               disabled={updateTransactionMutation.isPending}
  //             />
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //
  //     {/* Swap Location */}
  //     <div className="ml-2 flex w-fit flex-col gap-1 rounded-md text-center font-bold text-bold text-foreground">
  //       <span>Swap Location</span>
  //       <Select
  //         disabled={updateTransactionMutation.isPending}
  //         value={changeableLocation}
  //         onValueChange={(value) => setChangeableLocation(value)}
  //         onOpenChange={(open) => {
  //           if (!open && changeableLocation !== transaction.locationToSwap) {
  //             updateTransactionMutation.mutate({
  //               _id: transaction._id,
  //               locationToSwap: changeableLocation,
  //             });
  //           }
  //         }}
  //       >
  //         <div className="flex items-center gap-2">
  //           <SelectTrigger className="truncate border border-secondary bg-background hover:bg-accent">
  //             {updateTransactionMutation.isPending ? <LoaderCircle className="animate-spin font-mono" /> : <MapPinPen className="font-mono" />}
  //             <div className="max-w-[32ch] truncate pr-2 font-mono font-normal text-foreground-950">
  //               {changeableLocation || "No Location Set"}
  //             </div>
  //           </SelectTrigger>
  //           <SelectContent>
  //             <SelectGroup>
  //               <SelectLabel>UCSC Locations</SelectLabel>
  //               {Object.entries(PUBLIC_LOCATIONS).map(([value, label]) => (
  //                 <SelectItem key={value} value={label.name} onSelect={() => setChangeableLocation(label.name)}>
  //                   {label.name}
  //                 </SelectItem>
  //               ))}
  //             </SelectGroup>
  //             <SelectGroup>
  //               <SelectLabel>Other</SelectLabel>
  //               <Input
  //                 className="max-w-[32ch] truncate"
  //                 type="text"
  //                 placeholder="Enter a custom location"
  //                 value={changeableLocation}
  //                 onChange={(e) => setChangeableLocation(e.target.value)}
  //                 onKeyDown={(e) => {
  //                   e.stopPropagation();
  //                 }}
  //               />
  //             </SelectGroup>
  //           </SelectContent>
  //         </div>
  //       </Select>
  //     </div>
  //   </div>
  // );

  const CONTROL_W = "w-40"; // change once, all 3 match

  return (
    <div className="my-5 mr-5 flex flex-col justify-end gap-2 rounded-md text-center font-bold text-foreground">
      <div className="flex flex-col gap-2">
        {/* Swap Date */}
        <Popover
          onOpenChange={(open) => {
            if (!open && changeableDate.getTime() !== new Date(transaction.dateToSwap).getTime()) {
              updateTransactionMutation.mutate({
                _id: transaction._id,
                dateToSwap: changeableDate,
              });
            }
          }}
        >
          <div className="flex flex-col gap-1">
            <span>Swap Date</span>

            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date-picker"
                className={`${CONTROL_W} justify-between border-secondary font-mono text-foreground-950`}
                disabled={updateTransactionMutation.isPending}
              >
                {updateTransactionMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CalendarIcon className="h-4 w-4" />}

                <span className="mx-2 flex-1 text-center">{changeableDate.toLocaleDateString()}</span>

                <ChevronDownIcon className="h-4 w-4" />
              </Button>
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
          </div>
        </Popover>

        {/* Swap Time */}
        <div className="flex flex-col gap-1">
          <span>Swap Time</span>

          <div
            className={`${CONTROL_W} flex items-center rounded-md border border-secondary bg-background px-3 py-2 text-foreground-950 hover:bg-accent`}
          >
            {updateTransactionMutation.isPending ? (
              <LoaderCircle className="h-4 w-4 animate-spin font-mono" />
            ) : (
              <Clock className="pointer-events-none h-4 w-4 font-mono" />
            )}

            <Input
              type="time"
              step="60"
              value={changeableDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              className="ml-2 h-auto w-full border-0 bg-transparent p-0 font-mono font-normal text-foreground-950 shadow-none outline-none ring-0 focus:border-transparent focus:shadow-none focus:outline-none focus:ring-0 focus-visible:ring-0 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              onChange={(e) => {
                const [hours, minutes] = e.currentTarget.value.split(":").map(Number);
                const newDate = new Date(changeableDate);
                newDate.setHours(hours, minutes);
                setChangeableDate(newDate);
              }}
              onBlur={(e) => {
                e.preventDefault();
                const [hours, minutes] = e.currentTarget.value.split(":").map(Number);
                const newDate = new Date(changeableDate);
                newDate.setHours(hours, minutes);
                setChangeableDate(newDate);
                updateTransactionMutation.mutate({
                  _id: transaction._id,
                  dateToSwap: newDate,
                });
              }}
              disabled={updateTransactionMutation.isPending}
            />
          </div>
        </div>

        {/* Swap Location */}
        <div className="flex flex-col gap-1">
          <span>Swap Location</span>

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
            <SelectTrigger className={`${CONTROL_W} flex items-center gap-2 border-secondary bg-background hover:bg-accent`}>
              {updateTransactionMutation.isPending ? (
                <LoaderCircle className="h-4 w-4 animate-spin font-mono" />
              ) : (
                <MapPinPen className="h-4 w-4 font-mono" />
              )}

              {/* critical: min-w-0 allows truncation inside flex */}
              <div className="min-w-0 flex-1">
                <span className="block truncate font-mono font-normal text-foreground-950">{changeableLocation || "No Location Set"}</span>
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
                  className="max-w-[32ch]"
                  type="text"
                  placeholder="Enter a custom location"
                  value={changeableLocation}
                  onChange={(e) => setChangeableLocation(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
