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
    <div className="flex items-center flex-wrap gap-4 py-6 border-t border-b border-slate-200 dark:border-slate-800 my-8">
      <span className="font-bold text-slate-900 dark:text-white">Share:</span>
      <button 
        onClick={copyToClipboard}
        className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
        title="Copy Link"
      >
        <FiLink className="w-5 h-5" />
      </button>
      <a 
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-[#1DA1F2] hover:text-white dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-[#1DA1F2] dark:hover:text-white transition-colors"
      >
        <FiTwitter className="w-5 h-5" />
      </a>
      <a 
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-[#4267B2] hover:text-white dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-[#4267B2] dark:hover:text-white transition-colors"
      >
        <FiFacebook className="w-5 h-5" />
      </a>
      <a 
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-[#0077b5] hover:text-white dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-[#0077b5] dark:hover:text-white transition-colors"
      >
        <FiLinkedin className="w-5 h-5" />
      </a>

      <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>

      <button 
        onClick={handleLike}
        className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all duration-300 cursor-pointer ${
          liked 
            ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400 font-bold scale-105' 
            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white'
        }`}
        title={liked ? "Unlike" : "Like"}
      >
        <FiHeart className={`w-4 h-4 transition-transform ${liked ? 'fill-current scale-110' : ''}`} />
        <span className="text-sm font-semibold">{likesCount}</span>
      </button>
    </div>
  );
}
