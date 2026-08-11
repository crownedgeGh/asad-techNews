import React, { useState } from 'react';
import { FiMessageSquare, FiClock } from 'react-icons/fi';
import { getRelativeTime } from '../lib/format';

interface Comment {
  id: number;
  name: string | null;
  body: string;
  upvotes: number;
  createdAt: string | Date;
  upvoted: boolean;
}

const AVATAR_COLORS = ['bg-indigo-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-violet-600', 'bg-sky-600'];

function avatarColor(seed: string) {
  const idx = seed.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export default function Comments({ slug, initialComments }: { slug: string; initialComments: Comment[] }) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [name, setName] = useState('');
  const [newComment, setNewComment] = useState('');
  const [website, setWebsite] = useState(''); // honeypot; left blank by real users
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/articles/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, body: newComment, website }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Failed to post comment');
      }
      const created: Comment = await res.json();
      if (created.id) {
        setComments((prev) => [created, ...prev]);
      }
      setNewComment('');
      setName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (id: number) => {
    const target = comments.find((c) => c.id === id);
    if (!target) return;
    const prevUpvoted = target.upvoted;
    const prevUpvotes = target.upvotes;
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, upvoted: !prevUpvoted, upvotes: prevUpvotes + (prevUpvoted ? -1 : 1) } : c))
    );
    try {
      const res = await fetch(`/api/articles/${slug}/comments/${id}/upvote`, { method: 'POST' });
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, upvoted: data.upvoted, upvotes: data.upvotes } : c)));
    } catch {
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, upvoted: prevUpvoted, upvotes: prevUpvotes } : c)));
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3 mb-8">
        <FiMessageSquare className="w-6 h-6 text-primary" />
        <h3 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
          Discussion ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-10 bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">Leave a reply</h4>
        <div className="grid grid-cols-1 gap-4 mb-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name (optional)"
            maxLength={60}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow text-sm"
          />
          {/* Honeypot field: hidden from real users via CSS, bots tend to fill every field */}
          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            name="website"
            tabIndex={-1}
            autoComplete="off"
            className="absolute -left-[9999px] w-px h-px opacity-0"
            aria-hidden="true"
          />
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="What are your thoughts on this article?"
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow text-sm"
            rows={4}
            maxLength={2000}
            required
          />
        </div>
        {error && <p className="text-sm text-rose-500 mb-3">{error}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-secondary transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Posting…' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-8">
        {comments.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">No comments yet. Be the first to share your thoughts.</p>
        )}
        {comments.map((comment) => {
          const displayName = comment.name?.trim() || 'Anonymous Reader';
          return (
            <div key={comment.id} className="flex gap-4 items-start">
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full ${avatarColor(displayName)} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-inner`}>
                {displayName.charAt(0).toUpperCase()}
              </div>

              {/* Content Area */}
              <div className="flex-1">
                <div className="mb-1">
                  <span className="font-bold text-slate-900 dark:text-white text-base">{displayName}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-[15px] leading-relaxed whitespace-pre-wrap mb-2">
                  {comment.body}
                </p>

                {/* Action Buttons Row */}
                <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-xs flex-wrap">
                  <button
                    onClick={() => handleUpvote(comment.id)}
                    className={`flex items-center gap-1.5 py-1.5 rounded transition-colors duration-200 cursor-pointer hover:text-primary ${
                      comment.upvoted ? 'text-primary font-bold' : ''
                    }`}
                  >
                    <svg
                      className={`w-4.5 h-4.5 ${comment.upvoted ? 'fill-primary/10' : ''}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <polyline points="16 14 12 10 8 14" />
                    </svg>
                    <span>Upvote{comment.upvotes > 0 ? ` (${comment.upvotes})` : ''}</span>
                  </button>

                  {/* Time Display */}
                  <span className="flex items-center gap-1.5 py-1.5 text-slate-400">
                    <FiClock className="w-4 h-4" />
                    <span>{getRelativeTime(comment.createdAt)}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
