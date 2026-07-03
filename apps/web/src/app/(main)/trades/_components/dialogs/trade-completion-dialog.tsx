import { Button } from "@swapparel/shad-ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@swapparel/shad-ui/components/dialog";

export default function TradeCompletionDialog({ children, onConfirm }: { children: React.ReactNode; onConfirm: () => void }) {
  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel completion request?</DialogTitle>
          <DialogDescription>The other party will be notified that you have withdrawn your confirmation.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>
            <Button type="button" variant="outline">
              Go back
            </Button>
          </DialogClose>
          <DialogClose>
            <Button
              type="button"
              variant="destructive"
              className="hover:bg-destructive/50!"
              onClick={() => {
                onConfirm();
              }}
            >
              Cancel request
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
