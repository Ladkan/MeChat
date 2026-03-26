import sanitizeHtml from "sanitize-html";
import { db } from "../db/client";
import { poll } from "../db/schema";
import { eq } from "drizzle-orm";

export async function extractMentionedUsers(content: string): Promise<string[]> {
    const matches = content.match(/@([\w\s]+?)(?=\s|$|[^a-zA-Z0-9\s])/g);
  if (!matches) return [];

  return matches.map((m) => m.slice(1).trim().toLowerCase());
}

export function cleanInput(input: string) {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

export async function buildPollPayload(pollId: string, userId?: string) {
  const pollData = await db.query.poll.findFirst({
    where: eq(poll.id, pollId),
    with: { options: true, votes: true },
  });

  if (!pollData) return null;

  const options = pollData.options
    .sort((a, b) => a.order - b.order)
    .map((opt) => ({
      id: opt.id,
      text: opt.text,
      order: opt.order,
      votes: pollData.votes.filter((v) => v.optionId === opt.id).length,
    }));

  return {
    id: pollData.id,
    question: pollData.question,
    createdBy: pollData.createdBy,
    closed: pollData.closed,
    options,
    totalVotes: pollData.votes.length,
    userVote: userId
      ? (pollData.votes.find((v) => v.userId === userId)?.optionId ?? null)
      : null,
  };
}