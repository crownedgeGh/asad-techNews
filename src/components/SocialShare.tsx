import React from 'react';
import { FiLink, FiTwitter, FiFacebook, FiLinkedin } from 'react-icons/fi';

export default function SocialShare({ url, title }: { url: string, title: string }) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="flex items-center gap-4 py-6 border-t border-b border-slate-200 dark:border-slate-800 my-8">
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
    </div>
  );
}
