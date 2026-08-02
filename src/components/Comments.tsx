import React, { useState } from 'react';

export default function Comments() {
  const [comments, setComments] = useState([
    { id: 1, author: 'Jane Doe', text: 'This is a great read! Really insightful on how the new hardware operates under load.', date: '2 hours ago' },
    { id: 2, author: 'John Smith', text: 'I agree, but I think the thermal throttling issues might still be present in the smaller models.', date: '5 hours ago' }
  ]);
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      setComments([{
        id: Date.now(),
        author: 'Guest User',
        text: newComment,
        date: 'Just now'
      }, ...comments]);
      setNewComment('');
    }
  };

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mb-6">Comments ({comments.length})</h3>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Leave a comment..."
          className="w-full p-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
          rows={3}
        />
        <div className="mt-2 flex justify-end">
          <button type="submit" className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-secondary transition-colors">
            Post Comment
          </button>
        </div>
      </form>

      <div className="space-y-6">
        {comments.map(comment => (
          <div key={comment.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-slate-900 dark:text-white">{comment.author}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">{comment.date}</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300">{comment.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
