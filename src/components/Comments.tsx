import React, { useState } from 'react';
import { FiMessageSquare, FiClock } from 'react-icons/fi';

interface Comment {
  id: number;
  author: string;
  avatarColor: string;
  avatarImg?: string;
  text: string;
  date: string;
  upvotes: number;
  upvoted?: boolean;
}

export default function Comments() {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: 'Asad M.',
      avatarColor: 'bg-amber-950 border border-amber-900',
      text: "Logging the SQL the AI ran is the necessary half. The half I'd push on is whether you store the answer it gave in words right next to the query, because a correct query with a wrong summary on top is the failure that actually reaches a decision, and nobody goes back and re-reads the SQL to catch it. Six months later the artefact a re-view needs is the sentence someone acted on, not just the statement that produced it.",
      date: '4 hr ago',
      upvotes: 24,
      upvoted: false,
    },
    {
      id: 2,
      author: 'Kritish Puri',
      avatarColor: 'bg-slate-800',
      avatarImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100',
      text: 'Audit trails in BI tools are one of those things nobody misses until compliance asks. Timely add, congrats.',
      date: '1 hr ago',
      upvotes: 8,
      upvoted: false,
    },
    {
      id: 3,
      author: 'Sarah Jenkins',
      avatarColor: 'bg-indigo-600',
      text: 'This is an incredibly thorough analysis! The transition from syntax focus to architecture is already happening. AI tools are making us orchestrators rather than simple code-writers.',
      date: '2 hr ago',
      upvotes: 15,
      upvoted: false,
    },
    {
      id: 4,
      author: 'Marcus Chen',
      avatarColor: 'bg-emerald-600',
      text: 'I wonder how this impacts junior developers entering the industry. If AI generates all the boilerplate, how will they build the muscle memory for foundational coding concepts?',
      date: '5 hr ago',
      upvotes: 12,
      upvoted: false,
    }
  ]);
  const [newComment, setNewComment] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      const colors = ['bg-indigo-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-violet-600', 'bg-sky-600'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      const newCommentObj: Comment = {
        id: Date.now(),
        author: name.trim() || 'Anonymous Reader',
        avatarColor: randomColor,
        text: newComment,
        date: '1 mnt ago',
        upvotes: 0,
        upvoted: false
      };
      
      setComments([newCommentObj, ...comments]);
      setNewComment('');
      setName('');
    }
  };

  const handleUpvote = (id: number) => {
    setComments(prevComments =>
      prevComments.map(comment => {
        if (comment.id === id) {
          const upvoted = !comment.upvoted;
          return {
            ...comment,
            upvoted,
            upvotes: comment.upvotes + (upvoted ? 1 : -1)
          };
        }
        return comment;
      })
    );
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
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow text-sm"
          />
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="What are your thoughts on this article?"
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow text-sm"
            rows={4}
            required
          />
        </div>
        <div className="flex justify-end">
          <button 
            type="submit" 
            className="px-6 py-2.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-secondary transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg"
          >
            Post Comment
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-8">
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-4 items-start">
            {/* Avatar */}
            {comment.avatarImg ? (
              <img 
                src={comment.avatarImg} 
                alt={comment.author} 
                className="w-10 h-10 rounded-full shrink-0 object-cover shadow-sm"
              />
            ) : (
              <div className={`w-10 h-10 rounded-full ${comment.avatarColor} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-inner`}>
                {comment.author.charAt(0).toUpperCase()}
              </div>
            )}
            
            {/* Content Area */}
            <div className="flex-1">
              <div className="mb-1">
                <span className="font-bold text-slate-900 dark:text-white text-base">{comment.author}</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-[15px] leading-relaxed whitespace-pre-wrap mb-2">
                {comment.text}
              </p>
              
              {/* Action Buttons Row */}
              <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-xs flex-wrap">
                {/* Custom Upvote Box Icon */}
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
                  <span>{comment.date}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
