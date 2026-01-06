import type {qaEntrySchema} from "@swapparel/contracts";
import type {z} from "zod";
import FollowUpAnswer from "./followup-answer";
import FollowUpQuestion from "./followup-question";
import RootAnswer from "./root-answer";
import RootQuestion from "./root-question";

export default function Comments({ qaEntries }: { qaEntries?: z.infer<typeof qaEntrySchema>[] }) {
  const entries = qaEntries?.map((entry, index) => (
    <div key={index}>
      <RootQuestion question={entry.question} />
      <div className="pl-7">
        {entry.answer && <RootAnswer answer={entry.answer} />}
        {entry.followUps?.map((followUp, indexFollowUp) => (
          <div key={indexFollowUp}>
            <FollowUpQuestion question={followUp.question} />
            {followUp.answer && <FollowUpAnswer answer={followUp.answer} />}
          </div>
        ))}
      </div>
    </div>
  ));
  return entries;
}
