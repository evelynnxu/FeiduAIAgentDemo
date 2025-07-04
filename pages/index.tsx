import React, { useState } from "react";
import VideoPanel from "../components/VideoPanel";
import AgentChat from "../components/AgentChat";

export default function Home() {
  const [agentFull, setAgentFull] = useState(false);

  return (
    <div className="min-h-screen w-full bg-black flex flex-row">
      {/* 左侧视频区 */}
      <div className={`relative transition-all duration-500 ${agentFull ? "w-0" : "w-[60vw] min-w-[320px]"} h-screen overflow-hidden`}>
        {!agentFull && <VideoPanel />}
      </div>
      {/* 右侧 Agent 聊天区 */}
      <div className={`relative flex-1 h-screen flex items-center justify-center transition-all duration-500 ${agentFull ? "w-screen" : "w-[40vw] min-w-[320px]"}`}>
        <AgentChat
          fullScreen={agentFull}
          onToggleFull={() => setAgentFull((v) => !v)}
        />
      </div>
    </div>
  );
} 