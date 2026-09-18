import React from 'react';

export const PostCardSkeleton = () => {
  return (
    <div className="coss-glass coss-card p-5 mb-4 flex gap-4 items-start">
      <div className="w-12 h-14 skeleton rounded-lg shrink-0"></div>
      <div className="flex-1">
        <div className="h-5 w-2/3 skeleton mb-2 rounded"></div>
        <div className="h-4 w-full skeleton mb-1 rounded"></div>
        <div className="h-4 w-4/5 skeleton mb-3 rounded"></div>
        <div className="flex gap-2">
          <div className="h-6 w-16 skeleton rounded-full"></div>
          <div className="h-6 w-20 skeleton rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export const KanbanSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((col) => (
        <div key={col} className="coss-glass p-4 rounded-xl border border-white/5 min-h-[500px]">
          <div className="h-6 w-1/2 skeleton mb-4 rounded"></div>
          <div className="space-y-4">
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        </div>
      ))}
    </div>
  );
};
