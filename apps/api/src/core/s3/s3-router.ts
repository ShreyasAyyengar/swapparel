import { v7 as uuidv7 } from "uuid";
import { protectedProcedure } from "../../libs/orpc-procedures";
import { R2 } from "../../libs/r2-client";
import { isTransactionParticipant } from "../messaging/messaging-router";
import { TransactionService } from "../swap/transaction-service";

export const s3Router = {
  requestAttachmentUploadURL: protectedProcedure.s3.requestAttachmentUploadURL.handler(
    async ({ input, context, errors: { NOT_FOUND, INTERNAL_SERVER_ERROR } }) => {
      const transaction = await TransactionService.findById(input.transactionId).select("buyer seller").lean();

      if (!transaction) {
        throw NOT_FOUND({
          data: { message: `Transaction ${input.transactionId} not found.` },
        });
      }

      if (!isTransactionParticipant(transaction, context.user.id)) {
        // masking FORBIDDEN error to NOT_FOUND
        throw NOT_FOUND({
          data: { message: `Transaction ${input.transactionId} not found.` },
        });
      }

      const fileRefs = input.fileInfo.map((fileInfo, index) => {
        const key = `chat/${input.transactionId}/${uuidv7()}/${index}`;
        const fileRef = R2.file(key);

        const uploadUrl = fileRef.presign({
          method: "PUT",
          expiresIn: 60,
          type: fileInfo.contentType,
        });

        return {
          key,
          uploadUrl,
          headers: {
            "Content-Type": fileInfo.contentType,
            "If-None-Match": "*",
          },
        };
      });

      return { presignedUrls: fileRefs };
    }
  ),
};
