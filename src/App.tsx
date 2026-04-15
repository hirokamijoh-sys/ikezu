/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, History, Info, Settings2, ArrowRight, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { convertToIkezu, IkezuResult } from "./services/geminiService";

export default function App() {
  const [input, setInput] = useState("");
  const [level, setLevel] = useState([2]);
  const [result, setResult] = useState<IkezuResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<IkezuResult[]>([]);
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.omote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConvert = async () => {
    console.log("handleConvert triggered with input:", input);
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await convertToIkezu(input, level[0]);
      console.log("Conversion result:", res);
      setResult(res);
      setHistory((prev) => [res, ...prev].slice(0, 5));
    } catch (error) {
      console.error("Conversion failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-kyoto-bg flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-pattern opacity-50 pointer-events-none" />
      <div className="hidden lg:block side-text absolute left-10 top-1/2 -translate-y-1/2">IKEZU NO IROHA</div>
      <div className="hidden lg:block side-text absolute right-10 top-1/2 -translate-y-1/2">TRADITIONAL KYOTO ETIQUETTE</div>

      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 relative z-10"
      >
        <h1 className="text-4xl sm:text-5xl font-normal text-kyoto-ink mb-2 tracking-[0.2em]">
          いけずのいろは
        </h1>
        <p className="text-kyoto-moss font-sans text-[13px] tracking-[0.1em] opacity-70">
          あなたの率直なひとことを、はんなりいけずに整えますえ
        </p>
      </motion.header>

      <main className="w-full max-w-4xl relative z-10">
        <div className="ikezu-main-container grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {/* Input Section */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col">
              <div className="ikezu-label">率直な物言い</div>
              <textarea
                className="ikezu-textarea h-32"
                placeholder="例：仕事が遅い"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleConvert()}
              />
            </div>

            <div className="flex flex-col">
              <div className="ikezu-label">嫌味の加減</div>
              <div className="flex gap-3 mt-2">
                {[1, 2, 3].map((lv) => (
                  <button
                    key={lv}
                    onClick={() => setLevel([lv])}
                    className={`level-btn ${level[0] === lv ? "level-btn-active" : "hover:border-kyoto-ink/40"}`}
                  >
                    Lv{lv} {lv === 1 ? "やんわり" : lv === 2 ? "じんわり" : "しっかり"}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile CTA */}
            <div className="md:hidden mt-4">
              <button 
                className="convert-btn w-full flex items-center justify-center gap-3"
                onClick={handleConvert}
                disabled={loading || !input.trim()}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                言葉を包む
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="relative flex flex-col justify-center min-h-[240px]">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key={result.omote}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="output-card"
                >
                  <div className="flex flex-col gap-2">
                    <div className="ikezu-label border-none p-0 m-0">【表（京都）】</div>
                    <p className="text-2xl leading-relaxed text-kyoto-ink">
                      {result.omote}
                    </p>
                    <div className="flex justify-end mt-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-kyoto-moss hover:text-kyoto-accent gap-2 h-auto p-1"
                        onClick={handleCopy}
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span className="text-[9px] uppercase tracking-widest">{copied ? "コピーしました" : "写しを取る"}</span>
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="text-[10px] text-kyoto-accent font-sans mb-1 uppercase tracking-wider">【裏（本音）】</div>
                    <p className="text-sm italic text-kyoto-moss/70">
                      {result.ura}
                    </p>
                  </div>

                  <div className="seal absolute bottom-4 right-4">京印</div>
                </motion.div>
              ) : (
                <div className="output-card opacity-30 flex items-center justify-center italic text-kyoto-moss">
                  言葉を包むのをお待ちしております
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Convert Button - Absolute Positioned in Grid (Desktop Only) */}
          <div className="hidden md:flex md:absolute md:bottom-[-24px] md:left-1/2 md:-translate-x-1/2 justify-center w-full">
            <button 
              className="convert-btn disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              onClick={handleConvert}
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
              ) : (
                <Send className="w-4 h-4" />
              )}
              言葉を包む
            </button>
          </div>
        </div>

        {/* History & Info Footer */}
        <div className="mt-20 space-y-8">
          {history.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-kyoto-moss/40">
                <History className="w-3 h-3" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold">最近のいけず</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {history.map((item, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="px-4 py-2 bg-kyoto-washi border border-kyoto-line text-[11px] text-kyoto-moss hover:border-kyoto-accent transition-colors"
                    onClick={() => setResult(item)}
                  >
                    {item.omote.slice(0, 15)}...
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-kyoto-ink text-kyoto-bg p-8 font-sans text-sm leading-relaxed"
              >
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] mb-4 border-b border-kyoto-bg/20 pb-2">「いけず」のいろは</h3>
                <p className="mb-4">
                  京都の「いけず」とは、単なる意地悪ではなく、相手を直接傷つけないための「配慮」と「知性」が入り混じった独特の文化です。
                </p>
                <p>
                  言葉の裏に真意を隠し、相手に察してもらうことで、表面的には平穏を保ちつつ、必要なメッセージを伝えます。
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <footer className="text-center space-y-4 opacity-50">
            <div className="flex justify-center gap-8">
              <button 
                className="text-[11px] uppercase tracking-widest font-sans hover:text-kyoto-accent transition-colors"
                onClick={() => setShowInfo(!showInfo)}
              >
                INFO
              </button>
            </div>
            <p className="text-[10px] font-sans tracking-[0.4em]">
              &copy; 2026 かみじょーひろ
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
