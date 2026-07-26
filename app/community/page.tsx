'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageCircle, ThumbsUp, MessageSquare, Plus, Search } from 'lucide-react';
import { Header } from '@/components/layouts/header';
import { Footer } from '@/components/layouts/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockForumThreads } from '@/lib/mock-data';

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const threads = mockForumThreads || [];
  const filteredThreads = threads
    .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'popular') return (b.replies?.length || 0) - (a.replies?.length || 0);
      return (b.views || 0) - (a.views || 0);
    });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background border-b border-border py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2">Community Forum</h1>
              <p className="text-muted-foreground text-lg">Connect with engineers, suppliers, and fellow electronics enthusiasts</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Start Discussion
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-card border border-border rounded-lg p-4 sticky top-20">
                <h3 className="font-semibold mb-4">Filter & Sort</h3>
                <div className="space-y-3">
                  {['recent', 'popular', 'views'].map(option => (
                    <button
                      key={option}
                      onClick={() => setSortBy(option)}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${sortBy === option ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    >
                      {option === 'recent' && 'Most Recent'}
                      {option === 'popular' && 'Most Popular'}
                      {option === 'views' && 'Most Viewed'}
                    </button>
                  ))}
                </div>

                <div className="border-t border-border mt-4 pt-4">
                  <h4 className="font-semibold text-sm mb-3">Popular Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Microcontroller', 'Sensor', 'Battery'].map(tag => (
                      <button key={tag} className="bg-muted text-xs px-2 py-1 rounded-full hover:bg-primary/20 transition-colors">
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="space-y-3">
                {filteredThreads.length > 0 ? (
                  filteredThreads.map((thread, idx) => (
                    <motion.div
                      key={thread.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer group"
                    >
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-2">
                            {thread.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {thread.content}
                          </p>
                          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                            <span>by {thread.authorName || 'Anonymous'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <MessageCircle className="h-4 w-4 mx-auto mb-1" />
                            <span className="font-semibold">{thread.replies?.length || 0}</span>
                          </div>
                          <div className="text-center">
                            <ThumbsUp className="h-4 w-4 mx-auto mb-1" />
                            <span className="font-semibold">{thread.views}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No discussions found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
