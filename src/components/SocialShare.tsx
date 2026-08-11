import React, { useState } from 'react';
import { FiLink, FiFacebook, FiLinkedin, FiHeart } from 'react-icons/fi';
import { FaXTwitter } from 'react-icons/fa6';

interface SocialShareProps {
  url: string;
  title: string;
  slug: string;
  initialLikes: number;
  initialLiked: boolean;
}

export default function SocialShare({ url, title, slug, initialLikes, initialLiked }: SocialShareProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [pending, setPending] = useState(false);

  const handleLike = async () => {
    if (pending) return;
    setPending(true);
    const prevLiked = liked;
    const prevCount = likesCount;
    // Optimistic update, rolled back on failure.
    setLiked(!prevLiked);
    setLikesCount(prevCount + (prevLiked ? -1 : 1));
    try {
      const res = await fetch(`/api/articles/${slug}/like`, { method: 'POST' });
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      setLiked(data.liked);
      setLikesCount(data.likes);
    } catch {
      setLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      setPending(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4 py-3 px-4 sm:py-4 sm:px-6 bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/80 rounded-xl sm:rounded-2xl my-4 sm:my-6 backdrop-blur-sm">
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-[10px] sm:text-xs font-bold tracking-wide uppercase text-slate-400 dark:text-slate-500 whitespace-nowrap">Share:</span>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={copyToClipboard}
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white dark:bg-slate-800 text-slate-600 hover:text-primary border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow dark:text-slate-400 dark:hover:text-primary transition-all duration-200 cursor-pointer"
            title="Copy Link"
          >
            <FiLink className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
          </button>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white dark:bg-slate-800 text-slate-600 hover:bg-black hover:text-white border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow dark:text-slate-400 dark:hover:bg-black dark:hover:text-white transition-all duration-200"
          >
            <FaXTwitter className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white dark:bg-slate-800 text-slate-600 hover:bg-[#4267B2] hover:text-white border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow dark:text-slate-400 dark:hover:bg-[#4267B2] dark:hover:text-white transition-all duration-200"
          >
            <FiFacebook className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
          </a>
          <a
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white dark:bg-slate-800 text-slate-600 hover:bg-[#0077b5] hover:text-white border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow dark:text-slate-400 dark:hover:bg-[#0077b5] dark:hover:text-white transition-all duration-200"
          >
            <FiLinkedin className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
          </a>
        </div>
      </div>

      <button
        onClick={handleLike}
        className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-5 sm:py-2 rounded-lg sm:rounded-xl border shadow-sm hover:shadow transition-all duration-300 cursor-pointer ${
          liked
            ? 'bg-rose-50 border-rose-200/80 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/60 dark:text-rose-400 font-bold scale-105'
            : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-rose-500 dark:bg-slate-800 dark:border-slate-700/80 dark:text-slate-400 dark:hover:bg-slate-750 dark:hover:text-rose-400'
        }`}
        title={liked ? "Unlike" : "Like"}
      >
        <FiHeart className={`w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 transition-transform ${liked ? 'fill-current scale-110 text-rose-600 dark:text-rose-400' : 'group-hover:text-rose-500'}`} />
        <span className="text-xs sm:text-sm font-semibold">{likesCount} likes</span>
      </button>
    </div>
  );
}
