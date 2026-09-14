import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export function MarkdownContent({ content, className }: { content: string; className?: string }) {
  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none prose-pre:bg-muted prose-pre:text-foreground prose-code:before:content-none prose-code:after:content-none",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
