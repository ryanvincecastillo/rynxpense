"use client";

import { useState } from "react";
import { Check, Copy, Facebook, Share2 } from "lucide-react";

type ShareButtonsProps = {
  url: string;
  title: string;
  text?: string;
  compact?: boolean;
};

function twitterIntent(url: string, text: string) {
  const u = new URL("https://twitter.com/intent/tweet");
  u.searchParams.set("url", url);
  u.searchParams.set("text", text);
  return u.toString();
}

function facebookIntent(url: string) {
  const u = new URL("https://www.facebook.com/sharer/sharer.php");
  u.searchParams.set("u", url);
  return u.toString();
}

export function ShareButtons({ url, title, text, compact }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const shareText = text ?? title;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const nativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url });
        return;
      } catch {
        /* user cancelled */
      }
    }
    await copy();
  };

  const btn =
    "inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition";

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "" : "mt-1"}`}>
      <button
        type="button"
        onClick={copy}
        className={`${btn} bg-primary/10 text-primary hover:bg-primary/15`}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy link"}
      </button>
      <a
        href={facebookIntent(url)}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btn} bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/15`}
      >
        <Facebook className="h-4 w-4" />
        Facebook
      </a>
      <a
        href={twitterIntent(url, shareText)}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btn} bg-text/5 text-text hover:bg-text/10`}
      >
        <span className="text-xs font-black">𝕏</span>
        Post
      </a>
      <button
        type="button"
        onClick={nativeShare}
        className={`${btn} bg-accent/10 text-accent hover:bg-accent/15`}
      >
        <Share2 className="h-4 w-4" />
        More
      </button>
    </div>
  );
}
