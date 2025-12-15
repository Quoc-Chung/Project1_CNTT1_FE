"use client";

import React, { useState, useEffect } from 'react';
import { Post, Notification, CreatePostRequest } from '@/types/SocialMedia/Post';
import { socialMediaAPI } from '@/utils/socialMediaAPI';
import PostForm from '@/components/client/SocialMedia/PostForm';
import PostCard from '@/components/client/SocialMedia/PostCard';
import NotificationBell from '@/components/client/SocialMedia/NotificationBell';
import { toast } from 'react-toastify';

const SocialMediaPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  useEffect(() => {
    document.title = "Mạng xã hội | Proshop";
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const data = await socialMediaAPI.getPosts();
      setPosts(data);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tải bài viết!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async (postData: CreatePostRequest) => {
    setIsCreatingPost(true);
    try {
      const newPost = await socialMediaAPI.createPost(postData);
      setPosts(prev => [newPost, ...prev]);
    } catch (error) {
      throw error; // Re-throw để PostForm xử lý
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleReaction = async (postId: string, type: 'like' | 'love' | 'haha' | 'sad' | 'angry') => {
    try {
      await socialMediaAPI.toggleReaction({ type, postId });

      // Update local state
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const existingReaction = post.reactions.find(r => r.user.id === '1'); // Current user ID

          if (existingReaction) {
            // Remove existing reaction
            return {
              ...post,
              reactions: post.reactions.filter(r => r.id !== existingReaction.id),
              isLiked: false
            };
          } else {
            // Add new reaction (simplified - in real app, you'd get the actual reaction from API)
            return {
              ...post,
              reactions: [...post.reactions, {
                id: Date.now().toString(),
                type,
                user: { id: '1', name: 'Current User', avatar: '', email: '' },
                postId,
                createdAt: new Date().toISOString()
              }],
              isLiked: type === 'like'
            };
          }
        }
        return post;
      }));
    } catch (error) {
      toast.error('Có lỗi xảy ra khi thả cảm xúc!');
    }
  };

  const handleComment = async (postId: string, content: string) => {
    try {
      await socialMediaAPI.createComment({ content, postId });

      // Reload posts to get updated comments
      await loadPosts();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi bình luận!');
    }
  };

  const handleShare = (postId: string) => {
    // This will be handled by ShareButton component
    console.log('Sharing post:', postId);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Navigate to the relevant post or comment
    if (notification.postId) {
      const postElement = document.getElementById(`post-${notification.postId}`);
      if (postElement) {
        postElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-800">Social Media</h1>
              <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
                <button className="hover:text-blue-600 transition-colors">Trang chủ</button>
                <button className="hover:text-blue-600 transition-colors">Khám phá</button>
                <button className="hover:text-blue-600 transition-colors">Tin nhắn</button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <NotificationBell onNotificationClick={handleNotificationClick} />

              {/* User Avatar */}
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                U
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Post Form */}
        <PostForm onSubmit={handleCreatePost} isLoading={isCreatingPost} />

        {/* Posts Feed */}
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có bài viết nào</h3>
            <p className="text-gray-600">Hãy là người đầu tiên chia sẻ điều gì đó!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} id={`post-${post.id}`}>
                <PostCard
                  post={post}
                  onReaction={handleReaction}
                  onComment={handleComment}
                  onShare={handleShare}
                />
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {!isLoading && posts.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={loadPosts}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Tải thêm bài viết
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialMediaPage;
