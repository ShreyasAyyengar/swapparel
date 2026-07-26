import { postReportSchema, userReportSchema } from "@swapparel/contracts";
import { v7 as uuidv7 } from "uuid";
import { protectedProcedure } from "../../libs/orpc-procedures";
import { PostService } from "../post/post-service";
import { UserService } from "../users/user-service";
import { PostReportService } from "./post-report-service";
import { UserReportService } from "./user-report-service";

const TIMEFRAME_TIMEOUT_MILLISECONDS = 10 * 24 * 60 * 60 * 1000;

export const postReportRouter = {
  createReport: protectedProcedure.postReport.createReport.handler(
    async ({ input, context, errors: { NOT_FOUND, CONFLICT, INTERNAL_SERVER_ERROR } }) => {
      const targetPost = await PostService.findById(input.reportedPostId);
      if (!targetPost) {
        throw NOT_FOUND({
          data: { message: "Post not found" },
        });
      }

      const targetUser = await UserService.findOne({ email: targetPost.createdBy });
      if (!targetUser) {
        throw NOT_FOUND({
          data: { message: "Post author not found" },
        });
      }

      const tenDaysAgo = new Date(Date.now() - TIMEFRAME_TIMEOUT_MILLISECONDS);
      const existingReport = await PostReportService.findOne({
        reporterId: context.user.id,
        reportedPostId: input.reportedPostId,
        createdAt: { $gt: tenDaysAgo },
      });

      if (existingReport) {
        throw CONFLICT({
          data: { message: "You've already reported this post recently. Please wait before reporting again." },
        });
      }

      const id = uuidv7();
      const reportData = {
        _id: id,
        reporterId: context.user.id,
        reportedUserId: targetUser._id,
        reportedPostId: input.reportedPostId,
        reason: input.reason,
        description: input.description,
        createdAt: new Date(),
      };

      const tryParse = postReportSchema.safeParse(reportData);
      if (!tryParse.success) {
        throw INTERNAL_SERVER_ERROR({
          data: { message: `Invalid report data: ${tryParse.error.issues.map((issue) => issue.message).join(", ")}` },
        });
      }

      try {
        await PostReportService.insertOne(tryParse.data);
      } catch (error) {
        throw INTERNAL_SERVER_ERROR({
          data: { message: `Failed to insert report: ${error}` },
        });
      }

      const webhookUrl = process.env.DISCORD_POST_REPORT_WEBHOOK_URL;
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              embeds: [
                {
                  title: "New Post Report",
                  description: input.description || "(no additional details)",
                  fields: [
                    { name: "Reason", value: input.reason, inline: true },
                    { name: "Reported Post", value: input.reportedPostId, inline: false },
                    { name: "Reported By", value: context.user.email, inline: false },
                  ],
                  color: 0xef_44_44,
                  timestamp: new Date().toISOString(),
                },
              ],
            }),
          });
        } catch {
          // Discord notification is best-effort; failure must not break the report
        }
      }

      return { id };
    }
  ),
};

export const userReportRouter = {
  createReport: protectedProcedure.userReport.createReport.handler(
    async ({ input, context, errors: { NOT_FOUND, CONFLICT, INTERNAL_SERVER_ERROR } }) => {
      const targetUser = await UserService.findById(input.reportedUserId);
      if (!targetUser) {
        throw NOT_FOUND({
          data: { message: "User not found" },
        });
      }

      const tenDaysAgo = new Date(Date.now() - TIMEFRAME_TIMEOUT_MILLISECONDS);
      const existingReport = await UserReportService.findOne({
        reporterId: context.user.id,
        reportedUserId: input.reportedUserId,
        createdAt: { $gt: tenDaysAgo },
      });

      if (existingReport) {
        throw CONFLICT({
          data: { message: "You've already reported this user recently. Please wait before reporting again." },
        });
      }

      const id = uuidv7();
      const reportData = {
        _id: id,
        reporterId: context.user.id,
        reportedUserId: input.reportedUserId,
        reason: input.reason,
        description: input.description,
        createdAt: new Date(),
      };

      const tryParse = userReportSchema.safeParse(reportData);
      if (!tryParse.success) {
        throw INTERNAL_SERVER_ERROR({
          data: { message: `Invalid report data: ${tryParse.error.issues.map((issue) => issue.message).join(", ")}` },
        });
      }

      try {
        await UserReportService.insertOne(tryParse.data);
      } catch (error) {
        throw INTERNAL_SERVER_ERROR({
          data: { message: `Failed to insert report: ${error}` },
        });
      }

      return { id };
    }
  ),
};
