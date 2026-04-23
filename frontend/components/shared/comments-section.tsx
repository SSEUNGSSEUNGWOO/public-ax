"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Comment {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
}

interface CommentsSectionProps {
  contentType: "insight" | "guide";
  contentId: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export function CommentsSection({ contentType, contentId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetch(`/api/comments?content_type=${contentType}&content_id=${contentId}`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments ?? []));

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const name =
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          data.user.email?.split("@")[0] ||
          "익명";
        setUser({ id: data.user.id, name });
      }
    });
  }, [contentType, contentId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || !user) return;
    setLoading(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content_type: contentType,
        content_id: contentId,
        author_name: user.name,
        body,
      }),
    });
    const data = await res.json();
    if (data.comment) {
      setComments((prev) => [...prev, data.comment]);
      setBody("");
    }
    setLoading(false);
  }

  return (
    <div className="mt-12 pt-8 border-t">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
        댓글 {comments.length > 0 ? `(${comments.length})` : ""}
      </h2>

      {comments.length > 0 && (
        <div className="flex flex-col gap-4 mb-8">
          {comments.map((c) => (
            <div key={c.id} className="rounded-xl bg-muted/40 px-4 py-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm font-medium">{c.author_name}</span>
                <span className="text-xs text-muted-foreground/60">{formatDate(c.created_at)}</span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{c.body}</p>
            </div>
          ))}
        </div>
      )}

      {user ? (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{user.name}</span>
            <span>으로 댓글 작성</span>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="댓글을 남겨보세요"
            rows={3}
            required
            className="px-3 py-2.5 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30 transition resize-none"
          />
          <button
            type="submit"
            disabled={loading || !body.trim()}
            className="self-end h-10 px-5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {loading ? "등록 중..." : "등록"}
          </button>
        </form>
      ) : (
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border border-border bg-muted/40 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          로그인하고 댓글 남기기
        </Link>
      )}
    </div>
  );
}
