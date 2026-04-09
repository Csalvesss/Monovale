import React, { useState } from 'react';
import { useMB } from '../../store/gameStore';
import type { NewsPost } from '../../types';
import { cn } from '../../../../lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../../components/ui/tabs';
import { Badge } from '../../../../components/ui/badge';
import { Progress } from '../../../../components/ui/progress';
import {
  Globe, Camera, Bird, Newspaper, Shield,
  Heart, MessageCircle, Users, Star, Share2,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Filter = 'all' | 'instagram' | 'twitter' | 'report' | 'myteam';

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.0', '')}k`;
  return String(n);
}

function timeAgo(timestamp: number): string {
  const diff = Math.max(0, Date.now() - timestamp);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}sem`;
}

// ─── Card variants ────────────────────────────────────────────────────────────

function EngagementRow({ likes, comments }: { likes: number; comments: number }) {
  return (
    <div className="flex items-center gap-4 mt-2">
      <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors">
        <Heart size={12} /> {formatCount(likes)}
      </button>
      <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-400 transition-colors">
        <MessageCircle size={12} /> {formatCount(comments)}
      </button>
      <button className="ml-auto flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
        <Share2 size={11} />
      </button>
    </div>
  );
}

function AuthorRow({ post, platform }: { post: NewsPost; platform: string }) {
  const isInstagram = platform === 'instagram';
  const isTwitter   = platform === 'twitter';

  return (
    <div className="flex items-center gap-2.5 mb-2">
      {/* Avatar */}
      <div className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold',
        isInstagram ? 'bg-gradient-to-br from-purple-600 to-pink-600' :
        isTwitter   ? 'bg-sky-600/40' :
        'bg-blue-700/40'
      )}>
        {post.author.substring(0, 1).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-slate-100 truncate">{post.author}</span>
          {post.authorHandle && <span className="text-xs text-slate-500">{post.authorHandle}</span>}
          {post.isMyTeam && <Badge variant="default" className="text-[9px] px-1.5">Meu Time</Badge>}
        </div>
      </div>
      <span className="text-[10px] text-slate-600 shrink-0">{timeAgo(post.timestamp)}</span>
    </div>
  );
}

function InstagramCard({ post }: { post: NewsPost }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500" />
      <div className="p-4">
        <AuthorRow post={post} platform="instagram" />
        {post.imageEmoji && (
          <div className="my-3 rounded-xl bg-slate-900 py-6 text-center text-5xl leading-none">
            {post.imageEmoji}
          </div>
        )}
        <p className="text-sm text-slate-300 leading-relaxed">{post.content}</p>
        <EngagementRow likes={post.likes} comments={post.comments} />
      </div>
    </div>
  );
}

function TwitterCard({ post }: { post: NewsPost }) {
  return (
    <div className="rounded-xl border border-slate-700 border-l-4 border-l-sky-500 bg-slate-800 p-4">
      <AuthorRow post={post} platform="twitter" />
      <p className="text-sm text-slate-300 leading-relaxed">
        {post.imageEmoji && <span className="mr-1.5">{post.imageEmoji}</span>}
        {post.content}
      </p>
      <EngagementRow likes={post.likes} comments={post.comments} />
    </div>
  );
}

function ReportCard({ post }: { post: NewsPost }) {
  return (
    <div className="rounded-xl border border-slate-700 border-l-4 border-l-blue-500 bg-slate-800 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Newspaper size={13} className="text-blue-400 shrink-0" />
        <span className="text-xs font-black uppercase tracking-wide text-blue-400">{post.author}</span>
        {post.isMyTeam && <Badge variant="default" className="text-[9px] px-1.5">Meu Time</Badge>}
        <span className="ml-auto text-[10px] text-slate-600">{timeAgo(post.timestamp)}</span>
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">
        {post.imageEmoji && <span className="mr-1.5 text-base">{post.imageEmoji}</span>}
        {post.content}
      </p>
      <EngagementRow likes={post.likes} comments={post.comments} />
    </div>
  );
}

function NewsCard({ post }: { post: NewsPost }) {
  if (post.platform === 'instagram') return <InstagramCard post={post} />;
  if (post.platform === 'twitter')   return <TwitterCard post={post} />;
  return <ReportCard post={post} />;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SocialScreen() {
  const { state } = useMB();
  const { save }  = state;

  const [activeFilter, setActiveFilter] = useState<Filter>('all');

  if (!save) return null;

  const followerCount  = save.stadium.mediaLevel * 1000 + 5000;
  const mediaProgress  = (save.stadium.mediaLevel / 5) * 100;

  const filtered = save.newsFeed.filter(post => {
    if (activeFilter === 'all')    return true;
    if (activeFilter === 'myteam') return post.isMyTeam;
    return post.platform === activeFilter;
  });

  return (
    <div className="flex flex-col h-full bg-[#0f172a]">

      {/* ── Header ── */}
      <div className="shrink-0 bg-gradient-to-b from-slate-900 to-[#0f172a] border-b border-slate-800 px-4 pt-4 pb-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-black text-slate-100">Feed Social</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <Users size={11} className="text-slate-500" />
              <span className="text-xs text-slate-500">
                {formatCount(followerCount)} seguidores
              </span>
              <span className="text-slate-700">·</span>
              <span className="text-xs text-slate-500">
                Nível de mídia {save.stadium.mediaLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Media level progress */}
        <div className="mb-3 space-y-1">
          <Progress value={mediaProgress} color="linear-gradient(90deg, #0ea5e9, #6366f1)" />
        </div>

        {/* Filter tabs */}
        <Tabs value={activeFilter} onValueChange={v => setActiveFilter(v as Filter)}>
          <TabsList className="w-full overflow-x-auto flex-nowrap mb-4 bg-transparent p-0 gap-2 justify-start">
            {[
              { key: 'all',       label: 'Tudo',       icon: Globe },
              { key: 'instagram', label: 'Instagram',  icon: Camera },
              { key: 'twitter',   label: 'Twitter',    icon: Bird },
              { key: 'report',    label: 'Reportagem', icon: Newspaper },
              { key: 'myteam',    label: 'Meu Time',   icon: Shield },
            ].map(({ key, label, icon: Icon }) => (
              <TabsTrigger
                key={key}
                value={key}
                className="shrink-0 rounded-full bg-slate-800 border border-slate-700 data-active:border-blue-500"
              >
                <Icon size={12} />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* ── Feed ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-3 pt-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Globe size={40} className="text-slate-700" />
            <p className="text-sm text-slate-500">Nenhuma postagem nesta categoria ainda.</p>
          </div>
        ) : (
          filtered.map(post => <NewsCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
