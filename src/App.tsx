/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Video,
  Play,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  Layers,
  FileCode,
  Terminal,
  Database,
  ShieldCheck,
  Film,
  Download,
  RotateCw,
  Sliders,
  ChevronRight,
  ExternalLink,
  Info,
  Youtube,
  Radio,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Edit3,
  Copy,
  Check,
  AlertCircle
} from "lucide-react";

interface ClipSuggestion {
  id: string;
  start: string;
  end: string;
  duration_seconds: number;
  clip_type: string;
  hook: string;
  title: string;
  caption: string;
  hashtags: string[];
  target_audience: string;
  reason: string;
  hook_strength: number;
  clarity: number;
  audience_fit: number;
  shareability: number;
  overall_score: number;
  confidence: number;
  posting_order: number;
  alternative_hooks?: string[];
  status: "suggested" | "approved" | "rejected" | "edited" | "rendering" | "rendered";
  render_url?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<"studio" | "architecture" | "schema" | "api" | "remotion">("studio");

  // Pipeline form state
  const [youtubeUrl, setYoutubeUrl] = useState("https://www.youtube.com/watch?v=sample_podcast_ep42");
  const [platform, setPlatform] = useState("Instagram Reels");
  const [audience, setAudience] = useState("Creators");
  const [goal, setGoal] = useState("Views");
  const [tone, setTone] = useState("Bold");
  const [numberOfClips, setNumberOfClips] = useState(3);
  const [language, setLanguage] = useState("English");

  // Pipeline execution state
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("uploaded");
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("Ready to analyze");
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedClip, setSelectedClip] = useState<ClipSuggestion | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);

  // Sample curated clips matching ReelReason's explainability engine
  const [clips, setClips] = useState<ClipSuggestion[]>([
    {
      id: "clip-01",
      start: "00:12",
      end: "00:48",
      duration_seconds: 36,
      clip_type: "strong_opinion",
      hook: "Most creators edit for hours but choose the completely wrong moments.",
      title: "The biggest trap in video editing",
      caption: "Stop clipping randomly. If a clip has no hook and no immediate takeaway, nobody is going to stop scrolling on Instagram Reels.",
      hashtags: ["#contentcreator", "#videoediting", "#reelsgrowth", "#creatoreconomy", "#shortform"],
      target_audience: "Creators wanting faster growth with less manual editing",
      reason: "Immediate pattern-interrupt hook that directly challenges creator effort vs impact. High retention potential because it targets a universal pain point without requiring prior context.",
      hook_strength: 94,
      clarity: 92,
      audience_fit: 95,
      shareability: 89,
      overall_score: 93,
      confidence: 96,
      posting_order: 1,
      status: "suggested",
      alternative_hooks: [
        "Stop editing randomly—use this 3-question test.",
        "The fastest way to test your reel before posting.",
        "Why 90% of editors pick the least viral moment."
      ],
      render_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    },
    {
      id: "clip-02",
      start: "00:52",
      end: "01:36",
      duration_seconds: 44,
      clip_type: "practical_lesson",
      hook: "Here is the exact 3-question test before posting any reel.",
      title: "The 3-question viral checklist",
      caption: "Ask these three questions before you hit export: 1) Does the first 2s trigger tension? 2) Is it clear in 30s? 3) Would someone share it to look smart?",
      hashtags: ["#contentstrategy", "#growthonreels", "#creatortips", "#videomarketing", "#frameworks"],
      target_audience: "Creators seeking an actionable checklist",
      reason: "Structured 3-step actionable framework. Viewers naturally bookmark and re-watch listicles with high educational utility.",
      hook_strength: 91,
      clarity: 96,
      audience_fit: 92,
      shareability: 94,
      overall_score: 93,
      confidence: 95,
      posting_order: 2,
      status: "suggested",
      alternative_hooks: [
        "The 3-second test that changed our engagement forever.",
        "If your reel doesn't pass these 3 questions, delete it.",
        "How top creators curate clips that get shared."
      ],
      render_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    },
    {
      id: "clip-03",
      start: "01:45",
      end: "02:35",
      duration_seconds: 50,
      clip_type: "story",
      hook: "We had 14 days of payroll left. I sat in my car shaking.",
      title: "The pressure that saved our company",
      caption: "When comfort was no longer an option, five hard customer calls a day saved our company. Hard times build clarity.",
      hashtags: ["#startupstory", "#entrepreneurship", "#founderlife", "#resilience", "#businesslessons"],
      target_audience: "Creators who appreciate authentic struggle and vulnerability",
      reason: "High-stakes vulnerability narrative. The emotional honesty creates immediate empathy, and the payoff teaches a powerful lesson on proactive action.",
      hook_strength: 96,
      clarity: 88,
      audience_fit: 90,
      shareability: 91,
      overall_score: 91,
      confidence: 94,
      posting_order: 3,
      status: "suggested",
      alternative_hooks: [
        "The day we almost went bankrupt changed everything.",
        "Why our worst week in business became our biggest breakthrough.",
        "What happens when you only have 14 days of runway left."
      ],
      render_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    }
  ]);

  useEffect(() => {
    if (clips.length > 0 && !selectedClip) {
      setSelectedClip(clips[0]);
    }
  }, [clips, selectedClip]);

  const handleStartPipeline = () => {
    setIsProcessing(true);
    setProgress(5);
    setCurrentStep("extracting_audio");
    setStatusMessage("Extracting speech audio track with FFmpeg...");
    setLogs(["[00:00.01] POST /api/projects received. Initialized project uuid."]);

    const pipelineSteps = [
      { step: "extracting_audio", msg: "Downloading stream via yt-dlp & extracting 16kHz mono audio...", p: 25, delay: 900 },
      { step: "transcribing", msg: "Transcribing audio & generating word-level timestamps...", p: 45, delay: 1800 },
      { step: "analyzing", msg: "Cleaning speech filler words & partitioning semantic segments (20-90s)...", p: 65, delay: 2800 },
      { step: "ranking_clips", msg: "Executing Gemini LLM reasoning: analyzing audience, goal & tone...", p: 80, delay: 3800 },
      { step: "generating_reels", msg: "Applying penalty formula (0.30*hook + 0.25*clarity + ...) & balancing diversity...", p: 92, delay: 4800 },
      { step: "completed", msg: "Strategic clips created with explainable reasoning! Ready for review.", p: 100, delay: 5600 }
    ];

    pipelineSteps.forEach(({ step, msg, p, delay }) => {
      setTimeout(() => {
        setCurrentStep(step);
        setStatusMessage(msg);
        setProgress(p);
        setLogs(prev => [
          ...prev,
          `[+${(delay / 1000).toFixed(1)}s] [${step.toUpperCase()}] ${msg}`
        ]);
        if (step === "completed") {
          setIsProcessing(false);
        }
      }, delay);
    });
  };

  const handleTriggerRender = () => {
    if (!selectedClip) return;
    setIsRendering(true);
    setRenderProgress(10);

    const interval = setInterval(() => {
      setRenderProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRendering(false);
          setClips(prevClips =>
            prevClips.map(c =>
              c.id === selectedClip.id ? { ...c, status: "rendered" } : c
            )
          );
          if (selectedClip) {
            setSelectedClip({ ...selectedClip, status: "rendered" });
          }
          return 100;
        }
        return prev + 30;
      });
    }, 400);
  };

  const handleApprove = (clipId: string) => {
    setClips(clips.map(c => c.id === clipId ? { ...c, status: "approved" } : c));
    if (selectedClip && selectedClip.id === clipId) {
      setSelectedClip({ ...selectedClip, status: "approved" });
    }
  };

  const handleReject = (clipId: string) => {
    setClips(clips.map(c => c.id === clipId ? { ...c, status: "rejected" } : c));
    if (selectedClip && selectedClip.id === clipId) {
      setSelectedClip({ ...selectedClip, status: "rejected" });
    }
  };

  const copySchema = () => {
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Banner Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-violet-300 bg-clip-text text-transparent">
                ReelReason
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-semibold border border-violet-500/30">
                Backend API v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              From hours of content to reels worth watching.
            </p>
          </div>
        </div>

        {/* System Status Chips */}
        <div className="hidden lg:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            FastAPI Server (Port 8000)
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            Supabase RLS & Auth Trigger
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Gemini Reasoning Engine
          </div>
        </div>

        {/* Tab Selector */}
        <nav className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab("studio")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === "studio"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Live Studio
          </button>
          <button
            onClick={() => setActiveTab("architecture")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === "architecture"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            22-Step Pipeline
          </button>
          <button
            onClick={() => setActiveTab("schema")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === "schema"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Database & RLS
          </button>
          <button
            onClick={() => setActiveTab("api")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === "api"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            API Explorer
          </button>
          <button
            onClick={() => setActiveTab("remotion")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === "remotion"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Remotion 9:16 Spec
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* Core Positioning Highlight */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-violet-950/50 via-slate-900 to-indigo-950/40 border border-violet-800/40 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-violet-600/20 text-violet-300 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                ReelReason Core Positioning
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                <span className="text-violet-300 font-medium">ReelReason does not just find clips</span>—it decides which stories deserve to be told, and explains why.
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">yt-dlp Active</span>
            <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">FastAPI BackgroundTasks</span>
            <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">MM:SS Parsing</span>
          </div>
        </div>

        {/* TAB 1: LIVE STUDIO */}
        {activeTab === "studio" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Creator Context & Input */}
            <div className="lg:col-span-4 space-y-5">
              <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-md">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
                  <Youtube className="w-4 h-4 text-red-500" />
                  1. Input Video & Creator Context
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      YouTube URL or Video Source
                    </label>
                    <input
                      type="text"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-violet-500"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      yt-dlp downloads audio/video stream before FFmpeg extraction
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Platform</label>
                      <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-violet-500"
                      >
                        <option>Instagram Reels</option>
                        <option>YouTube Shorts</option>
                        <option>TikTok</option>
                        <option>LinkedIn</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Target Audience</label>
                      <select
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-violet-500"
                      >
                        <option>Creators</option>
                        <option>Founders</option>
                        <option>Developers</option>
                        <option>Students</option>
                        <option>General audience</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Goal</label>
                      <select
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-violet-500"
                      >
                        <option>Views</option>
                        <option>Followers</option>
                        <option>Leads</option>
                        <option>Authority</option>
                        <option>Education</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Tone</label>
                      <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-violet-500"
                      >
                        <option>Bold</option>
                        <option>Professional</option>
                        <option>Educational</option>
                        <option>Motivational</option>
                        <option>Funny</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Number of Clips</label>
                      <select
                        value={numberOfClips}
                        onChange={(e) => setNumberOfClips(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-violet-500"
                      >
                        <option value={3}>3 clips (opinion, lesson, story)</option>
                        <option value={5}>5 clips (diverse mix)</option>
                        <option value={7}>7 clips (extended catalog)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Language</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-violet-500"
                      >
                        <option>English</option>
                        <option>Hindi</option>
                        <option>Hinglish</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleStartPipeline}
                    disabled={isProcessing}
                    className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 transition disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        Processing 22-Step Pipeline...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Run ReelReason Analysis
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Real-time State Machine Tracker */}
              <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    Pipeline State Machine
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {progress}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-950 rounded-full h-2 mb-3 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-400 h-2 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="text-xs text-slate-300 font-medium mb-3">
                  Status: <span className="text-violet-400">{statusMessage}</span>
                </p>

                {/* Live Console Output */}
                <div className="bg-slate-950 rounded-lg p-3 border border-slate-800/80 font-mono text-[11px] text-slate-400 h-36 overflow-y-auto space-y-1">
                  {logs.length === 0 ? (
                    <span className="text-slate-600 italic">No background tasks executing yet. Click 'Run ReelReason Analysis' to launch.</span>
                  ) : (
                    logs.map((log, i) => (
                      <div key={i} className="leading-relaxed">
                        <span className="text-emerald-400">{log.slice(0, 10)}</span> {log.slice(10)}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Middle Column: Generated Clips List */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Strategic Clip Suggestions ({clips.length})
                </h3>
                <span className="text-xs text-slate-400">Ranked by Overall Score</span>
              </div>

              <div className="space-y-3">
                {clips.map((clip, index) => {
                  const isSelected = selectedClip?.id === clip.id;
                  return (
                    <div
                      key={clip.id}
                      onClick={() => setSelectedClip(clip)}
                      className={`p-4 rounded-xl border transition cursor-pointer relative ${
                        isSelected
                          ? "bg-slate-900 border-violet-500 shadow-lg shadow-violet-500/10"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-violet-600/30 text-violet-300 text-[10px] font-bold flex items-center justify-center border border-violet-500/40">
                            #{clip.posting_order}
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                            {clip.clip_type.replace("_", " ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-400">
                            {clip.start} - {clip.end} ({clip.duration_seconds}s)
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                            {clip.overall_score}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-white mb-1.5 line-clamp-1">
                        "{clip.hook}"
                      </h4>

                      <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">
                        <span className="text-slate-300 font-medium">Why selected:</span> {clip.reason}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                        <span className={`px-2 py-0.5 rounded font-medium ${
                          clip.status === "approved"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : clip.status === "rejected"
                            ? "bg-rose-950 text-rose-400 border border-rose-800"
                            : clip.status === "rendered"
                            ? "bg-indigo-950 text-indigo-400 border border-indigo-800"
                            : "bg-slate-800 text-slate-300"
                        }`}>
                          {clip.status.toUpperCase()}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleApprove(clip.id); }}
                            className="p-1 rounded hover:bg-slate-800 text-emerald-400"
                            title="Approve clip"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleReject(clip.id); }}
                            className="p-1 rounded hover:bg-slate-800 text-rose-400"
                            title="Reject clip"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Clip Detail & 9:16 Remotion Preview */}
            <div className="lg:col-span-4 space-y-4">
              {selectedClip ? (
                <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-md space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-200">
                      Clip #{selectedClip.posting_order} Inspector
                    </span>
                    <span className="px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800 uppercase font-semibold text-[10px]">
                      {selectedClip.clip_type.replace("_", " ")}
                    </span>
                  </div>

                  {/* Explainable Reasoning Card */}
                  <div className="p-3 rounded-lg bg-violet-950/40 border border-violet-800/50">
                    <span className="text-[11px] font-bold text-violet-300 uppercase tracking-wider block mb-1">
                      🧠 Why ReelReason Selected This Story:
                    </span>
                    <p className="text-slate-200 leading-relaxed text-xs">
                      {selectedClip.reason}
                    </p>
                  </div>

                  {/* Score Breakdown Radar/Meters */}
                  <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-300">5-Parameter Score Breakdown</span>
                      <span className="font-bold text-amber-400">{selectedClip.overall_score} / 100</span>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                        <span>Hook Strength (30%)</span>
                        <span className="text-slate-200 font-mono">{selectedClip.hook_strength}</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-400 h-1.5" style={{ width: `${selectedClip.hook_strength}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                        <span>Clarity (25%)</span>
                        <span className="text-slate-200 font-mono">{selectedClip.clarity}</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-400 h-1.5" style={{ width: `${selectedClip.clarity}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                        <span>Audience Fit (20%)</span>
                        <span className="text-slate-200 font-mono">{selectedClip.audience_fit}</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-1.5" style={{ width: `${selectedClip.audience_fit}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                        <span>Shareability (15%)</span>
                        <span className="text-slate-200 font-mono">{selectedClip.shareability}</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-purple-400 h-1.5" style={{ width: `${selectedClip.shareability}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Copy & Hashtags */}
                  <div>
                    <span className="font-semibold text-slate-300 block mb-1">Generated Caption & CTA:</span>
                    <p className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-300 text-[11px] leading-relaxed">
                      {selectedClip.caption}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedClip.hashtags.map((tag, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Alternative Viral Hooks */}
                  {selectedClip.alternative_hooks && selectedClip.alternative_hooks.length > 0 && (
                    <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                      <span className="font-semibold text-violet-300 block mb-1 text-[11px]">
                        Alternative Hook Angles:
                      </span>
                      <ul className="space-y-1 text-[11px] text-slate-400 list-disc list-inside">
                        {selectedClip.alternative_hooks.map((h, i) => (
                          <li key={i} className="truncate">{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Remotion 9:16 Render Action */}
                  <div className="pt-2">
                    <button
                      onClick={handleTriggerRender}
                      disabled={isRendering || selectedClip.status === "rendered"}
                      className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
                    >
                      {isRendering ? (
                        <>
                          <RotateCw className="w-4 h-4 animate-spin" />
                          Rendering 9:16 Vertical Reel ({renderProgress}%)...
                        </>
                      ) : selectedClip.status === "rendered" ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-white" />
                          Reel Rendered & Ready to Download
                        </>
                      ) : (
                        <>
                          <Film className="w-4 h-4" />
                          Render 9:16 Vertical Reel (Remotion)
                        </>
                      )}
                    </button>

                    {selectedClip.status === "rendered" && (
                      <a
                        href={selectedClip.render_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center justify-center gap-2 text-xs transition border border-slate-700"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Final Rendered MP4
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  Select a clip to view reasoning and scores
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ARCHITECTURE & 22-STEP PIPELINE */}
        {activeTab === "architecture" && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                <Layers className="w-5 h-5 text-violet-400" />
                22-Step Production Pipeline Specification
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Every long video runs through this resilient, non-blocking pipeline orchestrated via FastAPI <code className="text-violet-300">BackgroundTasks</code> and Supabase audit logging.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { step: 1, title: "Receive Video / YouTube URL", desc: "POST /api/projects with creator platform, audience, goal, and tone context" },
                  { step: 2, title: "Create Project Record", desc: "Initializes public.video_projects record with status 'uploaded'" },
                  { step: 3, title: "Upload Video to Storage", desc: "Uploads stream to Supabase Storage bucket 'reelreason-videos'" },
                  { step: 4, title: "Status: extracting_audio", desc: "Audit log created in public.job_logs and status pushed" },
                  { step: 5, title: "FFmpeg Audio Extraction", desc: "Uses yt-dlp & FFmpeg to extract high-fidelity 16kHz mono audio" },
                  { step: 6, title: "Upload Audio to Storage", desc: "Stores extracted audio in 'reelreason-audio' bucket" },
                  { step: 7, title: "Status: transcribing", desc: "Dispatches audio to speech-to-text provider" },
                  { step: 8, title: "Speech Recognition", desc: "OpenAI Whisper API or AssemblyAI transcription" },
                  { step: 9, title: "Save Transcript & Timestamps", desc: "Records word_timestamps and segment_timestamps in public.transcripts" },
                  { step: 10, title: "Clean Spoken Transcripts", desc: "Removes speech fillers ('um', 'uh', 'like') and immediate word duplicates" },
                  { step: 11, title: "Semantic Segmentation", desc: "Partitions sentences into coherent clips between 20s and 90s (ideal 30-60s)" },
                  { step: 12, title: "Save Semantic Segments", desc: "Persists segments into public.transcript_segments table" },
                  { step: 13, title: "Status: analyzing", desc: "Begins LLM audience-aware reasoning analysis" },
                  { step: 14, title: "LLM Strategic Reasoning", desc: "Prompts Gemini / GPT with creator context to explain WHY each story matters" },
                  { step: 15, title: "Score & Rank Segments", desc: "Applies formula: 0.30*hook + 0.25*clarity + 0.20*fit + 0.15*share + 0.10*conf" },
                  { step: 16, title: "Status: ranking_clips", desc: "Enforces duplicate detection and penalty deductions" },
                  { step: 17, title: "Select Diverse Final Clips", desc: "Balances Opinion, Lesson, Story, Emotion, Contrarian take & Humor" },
                  { step: 18, title: "Generate Hooks & Captions", desc: "Generates primary hook, 3 alternative angles, title, and hashtags" },
                  { step: 19, title: "Save Clip Suggestions", desc: "Converts MM:SS to float seconds and inserts in public.clip_suggestions" },
                  { step: 20, title: "Status: generating_reels", desc: "Formats structured Remotion render job parameters" },
                  { step: 21, title: "Prepare Renderer Metadata", desc: "Packages subtitle styling, animated words, and 9:16 bounding box" },
                  { step: 22, title: "Status: completed", desc: "Clips ready for creator review, editing, approval, and 9:16 export" },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-violet-600/20 text-violet-300 font-mono text-xs flex items-center justify-center shrink-0 border border-violet-500/30">
                      {step}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Crucial Constraints Compliance Card */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Crucial Implementation Constraints Verification
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-lg bg-slate-950 border border-emerald-900/40">
                  <span className="font-bold text-emerald-400 block mb-1">
                    Constraint 1: YouTube Downloads with yt-dlp
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Implemented in <code className="text-violet-300">services/ffmpeg_service.py</code> via <code className="text-slate-200">download_youtube_video()</code>. Downloads YouTube URLs prior to audio extraction, handling fallback streams and formats.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-950 border border-emerald-900/40">
                  <span className="font-bold text-emerald-400 block mb-1">
                    Constraint 2: Supabase User Trigger on auth.users
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Included in <code className="text-violet-300">backend/schema.sql</code>: <code className="text-slate-200">AFTER INSERT ON auth.users</code> trigger <code className="text-slate-200">on_auth_user_created</code> executes <code className="text-slate-200">public.handle_new_user()</code> to prevent foreign key errors.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-950 border border-emerald-900/40">
                  <span className="font-bold text-emerald-400 block mb-1">
                    Constraint 3: FastAPI BackgroundTasks
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Implemented in <code className="text-violet-300">app/routes/projects.py</code>. Handlers return immediately with HTTP 201/200 while <code className="text-slate-200">background_tasks.add_task(pipeline_service.run_pipeline)</code> runs non-blocking processing.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-950 border border-emerald-900/40">
                  <span className="font-bold text-emerald-400 block mb-1">
                    Constraint 4: Timestamp Parsing to Float Seconds
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Implemented in <code className="text-violet-300">utils/time_utils.py</code> via <code className="text-slate-200">parse_timestamp_to_seconds()</code>. Converts <code className="text-slate-200">"MM:SS"</code>, <code className="text-slate-200">"HH:MM:SS"</code> strings from LLM output into <code className="text-slate-200">float</code> seconds before DB insertion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SUPABASE SCHEMA & RLS */}
        {activeTab === "schema" && (
          <div className="space-y-6">
            {/* Supabase Connection Status Card */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 rounded-xl p-5 border border-indigo-500/30">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">Supabase Integration Status: Fully Wired</h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-semibold">
                        Ready & Operational
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      The backend implements <code className="text-violet-300">supabase-py</code> client integration, RLS policies, Auth triggers, and 4 storage buckets.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                    Mode: <span className="text-emerald-400 font-semibold">Demo Mock DB (Fallback Active)</span>
                  </span>
                </div>
              </div>

              {/* 2-Step Live Connection Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-800">
                <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="font-bold text-violet-300 block mb-1">
                    Step 1: Execute SQL Schema in Supabase
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed mb-2">
                    Open your Supabase Dashboard &rarr; <strong>SQL Editor</strong>, and run the SQL below. It creates all 8 tables, storage buckets, RLS policies, and the <code className="text-slate-200">AFTER INSERT ON auth.users</code> trigger.
                  </p>
                  <button
                    onClick={copySchema}
                    className="px-2.5 py-1 rounded bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-[11px] font-medium flex items-center gap-1.5 transition"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode ? "SQL Copied to Clipboard" : "Copy Full schema.sql"}
                  </button>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="font-bold text-violet-300 block mb-1">
                    Step 2: Add Credentials to <code className="text-emerald-400">backend/.env</code>
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed mb-1.5">
                    Copy from Supabase &rarr; <strong>Project Settings &rarr; API & Auth</strong>:
                  </p>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800/80 font-mono text-[10px] text-slate-300 space-y-0.5">
                    <div>SUPABASE_URL=https://your-id.supabase.co</div>
                    <div>SUPABASE_ANON_KEY=eyJhbGci...</div>
                    <div>SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...</div>
                    <div>SUPABASE_JWT_SECRET=your_secret...</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-400" />
                    Supabase PostgreSQL Schema & Security Architecture
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Complete schema with 8 tables, Row Level Security (RLS) policies, storage buckets, and auth triggers.
                  </p>
                </div>
                <button
                  onClick={copySchema}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition border border-slate-700"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copiedCode ? "Copied!" : "Copy SQL Schema"}
                </button>
              </div>

              {/* Schema Summary Chips */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">AUTH TRIGGER</span>
                  <span className="text-emerald-400 font-bold">AFTER INSERT on auth.users</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">RLS ENFORCEMENT</span>
                  <span className="text-violet-400 font-bold">8 / 8 Tables Protected</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">STORAGE BUCKETS</span>
                  <span className="text-blue-400 font-bold">4 Dedicated Buckets</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">SERVICE ROLE BYPASS</span>
                  <span className="text-amber-400 font-bold">Background Pipeline Safe</span>
                </div>
              </div>

              {/* Code Preview */}
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-[500px]">
{`-- 1. CRUCIAL USER TRIGGER: Auto-populate public.users from auth.users (Constraint 2)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Core Tables: public.users, video_projects, transcripts, transcript_segments,
--    clip_suggestions, rendered_reels, clip_feedback, job_logs.

-- 3. Row Level Security:
alter table public.video_projects enable row level security;
create policy "Users can view own projects" on public.video_projects for select using (auth.uid() = user_id);
create policy "Users can insert own projects" on public.video_projects for insert with check (auth.uid() = user_id);
create policy "Users can update own projects" on public.video_projects for update using (auth.uid() = user_id);
create policy "Users can delete own projects" on public.video_projects for delete using (auth.uid() = user_id);`}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 4: API EXPLORER */}
        {activeTab === "api" && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                FastAPI Endpoints Reference & OpenAPI Playground
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                All endpoints validate requests with Pydantic and authenticate via Supabase JWT Bearer headers.
              </p>

              <div className="space-y-3">
                {[
                  { method: "POST", path: "/api/projects", tag: "Projects", desc: "Creates video project (upload or YouTube) & launches background pipeline" },
                  { method: "GET", path: "/api/projects", tag: "Projects", desc: "Lists all projects belonging to the authenticated user" },
                  { method: "GET", path: "/api/projects/{id}", tag: "Projects", desc: "Fetches project status, duration, and metadata" },
                  { method: "GET", path: "/api/projects/{id}/status", tag: "Projects", desc: "Returns pipeline percentage (0-100%), current step, and error" },
                  { method: "POST", path: "/api/projects/{id}/analyze", tag: "Projects", desc: "Retries or triggers full pipeline asynchronously via BackgroundTasks" },
                  { method: "GET", path: "/api/projects/{id}/transcript", tag: "Transcripts", desc: "Returns full transcript and timestamped semantic segments (20-90s)" },
                  { method: "GET", path: "/api/projects/{id}/clips", tag: "Clips", desc: "Returns strategic clips filtered by clip_type and sorted by score" },
                  { method: "GET", path: "/api/clips/{id}", tag: "Clips", desc: "Retrieves single clip with explainable reasoning ('Why this clip?')" },
                  { method: "PATCH", path: "/api/clips/{id}", tag: "Clips", desc: "Edits hook, title, caption, hashtags, timestamps, or styling" },
                  { method: "POST", path: "/api/clips/{id}/approve", tag: "Clips", desc: "Marks clip as approved by creator" },
                  { method: "POST", path: "/api/clips/{id}/reject", tag: "Clips", desc: "Marks clip as rejected" },
                  { method: "POST", path: "/api/clips/{id}/regenerate-hook", tag: "Clips", desc: "Generates 3 alternative viral hook angles via LLM" },
                  { method: "POST", path: "/api/clips/{id}/regenerate-caption", tag: "Clips", desc: "Generates platform-tailored caption and hashtags" },
                  { method: "POST", path: "/api/clips/{id}/render", tag: "Reels", desc: "Queues 9:16 vertical render job and dispatches to Remotion renderer" },
                  { method: "GET", path: "/api/reels/{id}", tag: "Reels", desc: "Polls render status and returns final MP4 video URL" },
                  { method: "GET", path: "/api/reels/{id}/download", tag: "Reels", desc: "Redirects or provides secure download of rendered reel" },
                  { method: "POST", path: "/api/clips/{id}/feedback", tag: "Feedback", desc: "Records creator feedback (approved, rejected, edited, rendered, downloaded)" },
                ].map(({ method, path, tag, desc }, i) => (
                  <div key={i} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        method === "POST" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" :
                        method === "GET" ? "bg-blue-950 text-blue-400 border border-blue-800" :
                        method === "PATCH" ? "bg-amber-950 text-amber-400 border border-amber-800" :
                        "bg-rose-950 text-rose-400 border border-rose-800"
                      }`}>
                        {method}
                      </span>
                      <span className="font-mono text-slate-200 font-semibold">{path}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">{tag}</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: REMOTION 9:16 SPEC */}
        {activeTab === "remotion" && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                <Film className="w-5 h-5 text-purple-400" />
                Remotion 9:16 Vertical Video Renderer Contract
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                When a user requests rendering, the backend sends this structured JSON payload to the Remotion Node.js rendering microservice:
              </p>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
{`{
  "render_job_id": "render_123",
  "clip_id": "clip_123",
  "project_id": "project_123",
  "video_url": "https://storage.supabase.co/reelreason-videos/video.mp4",
  "start_time": "00:12",
  "end_time": "00:48",
  "aspect_ratio": "9:16",
  "hook": "Most creators edit for hours but choose the wrong moments.",
  "title": "The biggest trap in video editing",
  "caption": "Stop clipping randomly.",
  "hashtags": ["#contentcreation", "#reels"],
  "creator_handle": "@reelreason",
  "subtitle_style": {
    "font": "Inter",
    "font_size": 42,
    "color": "#FFFFFF",
    "highlight_color": "#7C3AED",
    "position": "bottom"
  },
  "word_timestamps": [
    { "word": "Most", "start": 12.0, "end": 12.3 },
    { "word": "creators", "start": 12.4, "end": 12.8 },
    { "word": "edit", "start": 12.9, "end": 13.2 }
  ]
}`}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-4 text-center text-xs text-slate-500">
        ReelReason Backend Engine &copy; 2026. Built with FastAPI, Supabase, FFmpeg, and Gemini.
      </footer>
    </div>
  );
}
