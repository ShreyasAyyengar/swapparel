import { ATTACHMENT_MAX_IMAGE_SIZE_MB, BYTES_PER_MB, type messageSchema, type transactionSchema } from "@swapparel/contracts";
import { Button } from "@swapparel/shad-ui/components/button";
import {
  Dropzone,
  DropZoneArea,
  DropzoneFileList,
  DropzoneFileListItem,
  DropzoneMessage,
  DropzoneRemoveFile,
  DropzoneTrigger,
  useDropzone,
} from "@swapparel/shad-ui/components/dropzone";
import { ScrollArea } from "@swapparel/shad-ui/components/scroll-area";
import { Skeleton } from "@swapparel/shad-ui/components/skeleton";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MessageCircle, Paperclip, Send, Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { z } from "zod";
import { socketClientORPC } from "../../../../lib/orpc-socket-web-client";
import { webClientORPC } from "../../../../lib/orpc-web-client";
import Message from "./message";

// TODO, as soon as message is sent, do something optimistic, feels too slow.
export default function Chat({ transaction }: { transaction: z.infer<typeof transactionSchema> }) {
  const [messages, setMessages] = useState<z.infer<typeof messageSchema>[]>([]);
  const [messageText, setMessageText] = useState("");
  const { data: chatHistory, isPending } = useQuery(
    webClientORPC.transaction.getMessageHistory.queryOptions({ input: { transactionId: transaction._id } })
  );

  useEffect(() => {
    const sortedMessages = [...(chatHistory?.messages ?? [])].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    setMessages(sortedMessages);
  }, [chatHistory?.messages]);

  useEffect(() => {
    let aborted = false;

    const watchTransaction = async () => {
      try {
        for await (const msg of await socketClientORPC.messaging.subscribeTransactionChat({ transactionId: transaction._id })) {
          if (aborted) break;

          setMessages((prevState) => [...prevState, msg.incomingMessage]);
        }
      } catch {
        // The subscription is expected to close when the selected trade changes.
      }
    };

    watchTransaction();

    return () => {
      aborted = true;
    };
  }, [transaction._id]);

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messages.length === 0) return;
    const container = containerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "instant" });
    }
  }, [messages.length]);

  const dropzone = useDropzone({
    onDropFile: (file: File) =>
      Promise.resolve({
        status: "success",
        result: URL.createObjectURL(file),
      }),
    validation: {
      accept: {
        "image/*": [".png", ".jpg", ".jpeg"],
      },
      maxSize: ATTACHMENT_MAX_IMAGE_SIZE_MB * BYTES_PER_MB,
      maxFiles: 5,
    },
  });
  const hasFiles = dropzone.fileStatuses.length > 0;

  const requestAttachmentUploadUrlMutation = useMutation(webClientORPC.s3.requestAttachmentUploadURL.mutationOptions());

  const handleMessageSubmit = async () => {
    const message = messageText.trim();
    if (!message) return;

    if (dropzone.fileStatuses.length === 0) {
      await socketClientORPC.messaging.publishChatMessage({ transactionId: transaction._id, message });
      setMessageText("");
      return;
    }

    const files = dropzone.fileStatuses.map((fileStatus) => fileStatus.file);

    const uploadIntent =
      files.length > 0
        ? await requestAttachmentUploadUrlMutation.mutateAsync({
            transactionId: transaction._id,
            fileInfo: files.map((file) => ({
              contentType: file.type,
            })),
          })
        : { presignedUrls: [] };

    const uploadedAttachments = await Promise.all(
      uploadIntent.presignedUrls.map(async (presignedUrl, index) => {
        const file = files[index] as File;

        const response = await fetch(presignedUrl.uploadUrl, {
          method: "PUT",
          headers: presignedUrl.headers,
          body: file,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`);
        }

        return {
          key: presignedUrl.key,
          fileName: file.name,
          size: file.size,
          contentType: file.type || "application/octet-stream",
        };
      })
    );

    await socketClientORPC.messaging.publishChatMessage({
      transactionId: transaction._id,
      message,
      pendingAttachmentKeys: uploadedAttachments.map((a) => a.key),
    });

    setMessageText("");
    await Promise.all(dropzone.fileStatuses.map((fileStatus) => dropzone.onRemoveFile(fileStatus.id)));
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Dropzone {...dropzone}>
        <DropZoneArea className="min-h-0 flex-1 flex-col items-stretch justify-start rounded-none border-0 p-0">
          <div ref={containerRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            {isPending ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-2/5 rounded-2xl" />
                <Skeleton className="ml-auto h-16 w-1/2 rounded-2xl" />
                <Skeleton className="h-10 w-1/3 rounded-2xl" />
              </div>
            ) : messages.length > 0 ? (
              <div className="flex min-h-full flex-col justify-end gap-1">
                {messages.map((message, i) => (
                  <Message key={message._id} message={message} prevMessage={messages[i - 1]} transaction={transaction} />
                ))}
              </div>
            ) : (
              <div className="flex h-full min-h-52 flex-col items-center justify-center gap-3 text-center">
                <div className="rounded-full bg-muted p-3">
                  <MessageCircle className="size-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">No messages yet</p>
                  <p className="text-muted-foreground text-sm">Start the conversation about this trade.</p>
                </div>
              </div>
            )}
          </div>

          <form
            className="flex border-border border-t bg-background p-3 sm:p-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleMessageSubmit();
            }}
          >
            <div className="flex w-full flex-col gap-2">
              {hasFiles && (
                <ScrollArea className="pr-5">
                  <DropzoneFileList className="grid grid-cols-5 gap-3 p-0">
                    {dropzone.fileStatuses.map((fileStatus) => (
                      <DropzoneFileListItem className="overflow-hidden rounded-md bg-card p-0 shadow-sm" key={fileStatus.id} file={fileStatus}>
                        {fileStatus.status === "success" ? (
                          <Image
                            src={fileStatus.result}
                            alt={`uploaded-${fileStatus.fileName}`}
                            className="aspect-video object-cover"
                            width={2000}
                            height={1000}
                            unoptimized
                          />
                        ) : (
                          <div className="aspect-video animate-pulse bg-black/20" />
                        )}
                        <div className="ml-2 flex items-center justify-between">
                          <div className="min-w-0">
                            <p className="truncate text-sm">{fileStatus.fileName}</p>
                            {/*<p className="text-muted-foreground text-xs">{(fileStatus.file.size / BYTES_PER_MB).toFixed(2)} MB</p>*/}
                          </div>
                          <DropzoneRemoveFile
                            variant="ghost"
                            className="shrink-0 cursor-pointer hover:outline"
                            onClick={() => {
                              dropzone.onRemoveFile(fileStatus.id).then(undefined, () => undefined);
                            }}
                          >
                            <Trash2Icon className="size-4" />
                          </DropzoneRemoveFile>
                        </div>
                      </DropzoneFileListItem>
                    ))}
                  </DropzoneFileList>
                </ScrollArea>
              )}
              <div className="flex w-full items-end gap-2">
                <textarea
                  name="messageInput"
                  placeholder="Message about this trade..."
                  className="max-h-32 min-h-10 flex-1 resize-none rounded-xl border border-input bg-muted/30 px-3 py-2 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
                  required
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                  autoComplete="off"
                  rows={1}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="size-10 shrink-0 rounded-xl"
                  disabled={!messageText.trim()}
                  aria-label="Send message"
                >
                  <Send className="size-4" />
                </Button>
                <DropzoneTrigger
                  aria-label="Attach file"
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary p-0 text-primary-foreground hover:bg-primary/90"
                >
                  <Paperclip className="size-4" />
                </DropzoneTrigger>
              </div>

              {dropzone.rootError && <DropzoneMessage />}
            </div>
          </form>
        </DropZoneArea>
      </Dropzone>
    </div>
  );
}
