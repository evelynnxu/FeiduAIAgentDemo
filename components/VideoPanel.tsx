import React from "react";

const VideoPanel: React.FC = () => (
  <div className="relative w-full h-full overflow-hidden">
    <video
      className="w-full h-full object-cover"
      src="/videos/agent-demo.mp4"
      autoPlay
      loop
      muted
      playsInline
    />
    {/* 黑色渐变遮罩 */}
    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent pointer-events-none" />
  </div>
);

export default VideoPanel; 