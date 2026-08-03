import React, { useState, useEffect } from 'react';
import { FiLink, FiTwitter, FiFacebook, FiLinkedin, FiHeart } from 'react-icons/fi';

export default function SocialShare({ url, title }: { url: string, title: string }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(42);

  useEffect(() => {
    const savedLiked = localStorage.getItem(`liked_${url}`) === 'true';
    const savedCount = localStorage.getItem(`likesCount_${url}`);
    if (savedLiked) {
      setLiked(true);
    }
    if (savedCount !== null) {
      setLikesCount(parseInt(savedCount, 10));
    } else {
      const initialLikes = (title.length * 3) % 45 + 12;
      setLikesCount(initialLikes);
      localStorage.setItem(`likesCount_${url}`, initialLikes.toString());
    }
  }, [url, title]);

  const handleLike = () => {
    const newLiked = !liked;
    const newCount = likesCount + (newLiked ? 1 : -1);
    setLiked(newLiked);
    setLikesCount(newCount);
    localStorage.setItem(`liked_${url}`, newLiked.toString());
    localStorage.setItem(`likesCount_${url}`, newCount.toString());
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="flex items-center justify-between flex-wrap gap-4 py-4 px-6 bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl my-6 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold tracking-wide uppercase text-slate-400 dark:text-slate-500">Share article:</span>
        <div className="flex items-center gap-2">
          <button 
            onClick={copyToClipboard}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 hover:text-primary border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow dark:text-slate-400 dark:hover:text-primary transition-all duration-200 cursor-pointer"
            title="Copy Link"
          >
            <FiLink className="w-4.5 h-4.5" />
          </button>
          <a 
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 hover:bg-[#1DA1F2] hover:text-white border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow dark:text-slate-400 dark:hover:bg-[#1DA1F2] dark:hover:text-white transition-all duration-200"
          >
            <FiTwitter className="w-4.5 h-4.5" />
          </a>
          <a 
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 hover:bg-[#4267B2] hover:text-white border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow dark:text-slate-400 dark:hover:bg-[#4267B2] dark:hover:text-white transition-all duration-200"
          >
            <FiFacebook className="w-4.5 h-4.5" />
          </a>
          <a 
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 hover:bg-[#0077b5] hover:text-white border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow dark:text-slate-400 dark:hover:bg-[#0077b5] dark:hover:text-white transition-all duration-200"
          >
            <FiLinkedin className="w-4.5 h-4.5" />
          </a>
        </div>
      </div>

      <button 
        onClick={handleLike}
        className={`flex items-center gap-2 px-5 py-2 rounded-xl border shadow-sm hover:shadow transition-all duration-300 cursor-pointer ${
          liked 
            ? 'bg-rose-50 border-rose-200/80 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/60 dark:text-rose-400 font-bold scale-105' 
            : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-rose-500 dark:bg-slate-800 dark:border-slate-700/80 dark:text-slate-400 dark:hover:bg-slate-750 dark:hover:text-rose-400'
        }`}
        title={liked ? "Unlike" : "Like"}
      >
        <FiHeart className={`w-4.5 h-4.5 transition-transform ${liked ? 'fill-current scale-110 text-rose-600 dark:text-rose-400' : 'group-hover:text-rose-500'}`} />
        <span className="text-sm font-semibold">{likesCount} likes</span>
      </button>
    </div>
  );
}
