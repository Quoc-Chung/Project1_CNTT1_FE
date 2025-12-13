"use client";

import React, { useState } from 'react';
import { Post, Reaction } from '@/types/SocialMedia/Post';
import CommentForm from '../CommentForm';
import ShareButton from '../ShareButton';
import Image from 'next/image';

interface PostCardProps {
  post: Post;
  onReaction: (postId: string, type: 'like' | 'love' | 'haha' | 'sad' | 'angry') => Promise<void>;
  onComment: (postId: string, content: string) => Promise<void>;
  onShare: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onReaction, onComment, onShare }) => {
  const [showComments, setShowComments] = useState(false);
  const [isReacting, setIsReacting] = useState(false);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  };

  const getReactionCounts = () => {
    const counts = post.reactions.reduce((acc, reaction) => {
      acc[reaction.type] = (acc[reaction.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return counts;
  };

  const getReactionEmoji = (type: string) => {
    const emojiMap = {
      like: '👍',
      love: '❤️',
      haha: '😂',
      sad: '😢',
      angry: '😡'
    };
    return emojiMap[type as keyof typeof emojiMap] || '👍';
  };

  const handleReaction = async (type: 'like' | 'love' | 'haha' | 'sad' | 'angry') => {
    setIsReacting(true);
    try {
      await onReaction(post.id, type);
    } finally {
      setIsReacting(false);
    }
  };

  const reactionCounts = getReactionCounts();
  const totalReactions = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {post.author.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{post.author.name}</h3>
            <p className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className="mb-4">
          {post.images.length === 1 ? (
            <Image
              src={post.images[0]}
              alt="Post image"
              width={800}
              height={384}
              className="w-full max-h-96 object-cover rounded-lg"
              style={{ width: "auto", height: "auto" }}
              unoptimized
            />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {post.images.slice(0, 4).map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  alt={`Post image ${index + 1}`}
                  width={400}
                  height={192}
                  className="w-full h-48 object-cover rounded-lg"
                  style={{ width: "auto", height: "auto" }}
                  unoptimized
                />
              ))}
              {post.images.length > 4 && (
                <div className="relative">
                  <Image
                    src={post.images[4]}
                    alt="Post image 5"
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover rounded-lg"
                    style={{ width: "auto", height: "auto" }}
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">+{post.images.length - 4}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Videos */}
      {post.videos && post.videos.length > 0 && (
        <div className="mb-4">
          {post.videos.map((video, index) => (
            <video
              key={index}
              src={video}
              controls
              className="w-full max-h-96 rounded-lg"
            />
          ))}
        </div>
      )}

      {/* Reaction Stats */}
      {totalReactions > 0 && (
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-1">
            {Object.entries(reactionCounts).map(([type, count]) => (
              <span key={type} className="text-lg">
                {getReactionEmoji(type)}
              </span>
            ))}
            <span className="text-sm text-gray-600 ml-2">{totalReactions}</span>
          </div>
          <div className="text-sm text-gray-600">
            {post.comments.length} bình luận • {post.shares} chia sẻ
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center space-x-6">
          {/* Reaction Button */}
          <div className="relative group">
            <button
              onClick={() => handleReaction('like')}
              disabled={isReacting}
              className={`flex items-center space-x-2 px-4 py-1 rounded-md transition-colors ${
                post.isLiked ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              } disabled:opacity-50`}
            >
              <span className="text-lg">👍</span>
              <span className="text-sm font-medium">Thích</span>
            </button>
            
            {/* Reaction Options */}
            <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex space-x-1 bg-white rounded-full shadow-lg p-1">
                {['like', 'love', 'haha', 'sad', 'angry'].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleReaction(type as any)}
                    disabled={isReacting}
                    className="text-2xl hover:scale-125 transition-transform disabled:opacity-50"
                  >
                    {getReactionEmoji(type)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Comment Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 px-4 py-1 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm font-medium">Bình luận</span>
          </button>

          {/* Share Button */}
          <ShareButton postId={post.id} onShare={onShare} />
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 border-t pt-4">
          {/* Comment Form */}
          <CommentForm postId={post.id} onSubmit={onComment} />

          {/* Comments List */}
          {post.comments.length > 0 && (
            <div className="mt-4 space-y-3">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {comment.author.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-sm text-gray-800">{comment.author.name}</span>
                        <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
                      </div>
                      <p className="text-gray-800 text-sm">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
