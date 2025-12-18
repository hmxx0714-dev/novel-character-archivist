
import React, { useState, useEffect, useRef } from 'react';
import { CharacterProfile } from './types';
import { identifyCharacters, generateCharacterDetail } from './services/geminiService';
import CharacterCard from './components/CharacterCard';

const App: React.FC = () => {
  const [novelText, setNovelText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [analyzingStatus, setAnalyzingStatus] = useState('');
  const [characters, setCharacters] = useState<CharacterProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Track progress for pause/resume
  const [allNames, setAllNames] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Use a ref to store the text to avoid dependency issues in the effect
  const novelTextRef = useRef(novelText);
  useEffect(() => {
    novelTextRef.current = novelText;
  }, [novelText]);

  // Main processing effect
  useEffect(() => {
    const processNextCharacter = async () => {
      if (!isAnalyzing || isPaused || currentIndex < 0 || currentIndex >= allNames.length) {
        if (currentIndex >= allNames.length && allNames.length > 0) {
          setIsAnalyzing(false);
          setAnalyzingStatus('所有人物档案构建完成。');
        }
        return;
      }

      const name = allNames[currentIndex];
      setAnalyzingStatus(`正在为第 ${currentIndex + 1}/${allNames.length} 位角色 [${name}] 构建深度档案...`);

      try {
        const detail = await generateCharacterDetail(name, novelTextRef.current);
        setCharacters(prev => prev.map((c, idx) => 
          idx === currentIndex ? { ...c, ...detail } : c
        ));
        // Move to next
        setCurrentIndex(prev => prev + 1);
      } catch (charErr) {
        console.error(`Failed to load details for ${name}`, charErr);
        // Even if one fails, try to move to the next after a delay
        setTimeout(() => setCurrentIndex(prev => prev + 1), 2000);
      }
    };

    processNextCharacter();
  }, [isAnalyzing, isPaused, currentIndex, allNames]);

  const handleStartAnalysis = async () => {
    if (!novelText.trim()) {
      alert('请先输入小说全文内容');
      return;
    }

    setIsAnalyzing(true);
    setIsPaused(false);
    setError(null);
    setCharacters([]);
    setAllNames([]);
    setCurrentIndex(-1);
    setAnalyzingStatus('正在扫描文本以识别关键角色...');

    try {
      const names = await identifyCharacters(novelText);
      
      if (names.length === 0) {
        throw new Error('未能从小说明显提取到角色，请尝试提供更多内容。');
      }

      // Add missing 'clothing' property to the appearance object to satisfy CharacterProfile interface
      const placeholders: CharacterProfile[] = names.map((name, idx) => ({
        id: `char-${idx}-${Date.now()}`,
        name,
        genderAge: '',
        appearance: { faceAndSkin: '', features: '', hair: '', bodyType: '', clothing: '' },
        clothingVersions: [],
        personalityKeywords: [],
        aiPrompt: ''
      }));
      
      setCharacters(placeholders);
      setAllNames(names);
      setAnalyzingStatus('“已收到您提供的小说全文。我将严格遵循指令，为您构建所有关键人物的可视化档案。”');
      
      // Trigger the first character processing
      setCurrentIndex(0);
    } catch (err: any) {
      setError(err.message || '分析过程中出现错误');
      setIsAnalyzing(false);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (isPaused) {
      setAnalyzingStatus(`已恢复分析任务...`);
    } else {
      setAnalyzingStatus(`任务已暂停，您可以随时继续或修改已生成的档案。`);
    }
  };

  const handleUpdateCharacter = (id: string, updated: CharacterProfile) => {
    setCharacters(prev => prev.map(c => c.id === id ? updated : c));
  };

  return (
    <div className="min-h-screen pb-20 bg-[#fdfaf7]">
      {/* Header */}
      <header className="bg-stone-900 text-stone-100 py-16 px-4 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/paper.png')]"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-block px-4 py-1 bg-stone-700 text-stone-300 text-[10px] uppercase tracking-[0.3em] font-bold rounded-full mb-6">
            专业小说人物分析
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-tight">
            小说可视化人物档案架构师
          </h1>
          <p className="text-stone-400 text-lg md:text-2xl font-light font-serif max-w-2xl mx-auto leading-relaxed">
            从文字迷雾中剥离视觉锚点，构建具备高度一致性的角色艺术档案。
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto mt-[-50px] px-4 space-y-16">
        {/* Input Section */}
        <section className="bg-white rounded-[2rem] shadow-2xl p-8 md:p-12 border border-stone-200 relative">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-2 h-10 bg-stone-900 rounded-full"></div>
            <label className="text-3xl font-black text-stone-900 tracking-tight">导入小说原稿</label>
          </div>
          
          <textarea
            value={novelText}
            onChange={(e) => setNovelText(e.target.value)}
            disabled={isAnalyzing}
            placeholder="在此粘贴小说全文内容（推荐 2000-8000 字）..."
            className={`w-full h-96 p-8 text-stone-800 bg-stone-50 rounded-3xl border border-stone-200 focus:ring-8 focus:ring-stone-100 focus:border-stone-800 outline-none transition-all resize-none mb-10 font-serif leading-relaxed text-xl shadow-inner ${isAnalyzing ? 'opacity-50' : ''}`}
          />
          
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-wrap justify-center items-center gap-6">
              {!isAnalyzing || (isAnalyzing && currentIndex === -1) ? (
                <button
                  onClick={handleStartAnalysis}
                  disabled={isAnalyzing}
                  className={`group relative px-20 py-6 rounded-full text-2xl font-black shadow-2xl transition-all transform hover:scale-105 active:scale-95 ${
                    isAnalyzing 
                      ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none' 
                      : 'bg-stone-900 text-white hover:bg-stone-800'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    开始角色架构 <span className="group-hover:translate-x-2 transition-transform">→</span>
                  </span>
                </button>
              ) : (
                <div className="flex flex-wrap justify-center items-center gap-4">
                  <button
                    onClick={togglePause}
                    className={`px-14 py-5 rounded-full text-xl font-bold shadow-xl transition-all transform active:scale-95 flex items-center gap-3 ${
                      isPaused 
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                        : 'bg-amber-600 text-white hover:bg-amber-700'
                    }`}
                  >
                    {isPaused ? (
                      <>
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                        恢复生成进程
                      </>
                    ) : (
                      <>
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        暂停架构任务
                      </>
                    )}
                  </button>
                  
                  {isPaused && (
                    <button
                      onClick={() => setIsAnalyzing(false)}
                      className="px-10 py-5 rounded-full text-xl font-bold border-4 border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white transition-all shadow-lg"
                    >
                      中止并保存当前
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {isAnalyzing && (
              <div className="flex flex-col items-center gap-4 w-full">
                <p className={`text-stone-600 font-serif italic text-lg text-center max-w-xl px-4 ${!isPaused ? 'animate-pulse' : ''}`}>
                  {analyzingStatus}
                </p>
                {currentIndex >= 0 && !isPaused && (
                  <div className="w-full max-w-md h-2 bg-stone-100 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-stone-900 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(0,0,0,0.2)]" 
                      style={{ width: `${(currentIndex / allNames.length) * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Error Feedback */}
        {error && (
          <div className="bg-red-50 border-l-8 border-red-600 text-red-900 px-8 py-6 rounded-2xl shadow-xl font-medium flex items-center gap-5">
            <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            <div className="flex-1">
              <h5 className="font-black text-lg">架构出现阻碍</h5>
              <p className="text-red-700 opacity-80">{error}</p>
            </div>
          </div>
        )}

        {/* Dynamic Character List */}
        {characters.length > 0 && (
          <div className="space-y-20 mt-16 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b-4 border-stone-900 pb-6 gap-4">
              <div>
                <h2 className="text-4xl font-black text-stone-900 tracking-tight">已识别核心角色档案库</h2>
                <p className="text-stone-500 font-serif mt-1">每个档案都已为您生成专属的全中文 AI 绘图提示词。</p>
              </div>
              <span className="bg-stone-900 text-white px-6 py-2 rounded-full text-lg font-black shadow-lg self-start">
                {characters.filter(c => c.genderAge).length} / {characters.length} 深度分析就绪
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-20">
              {characters.map((char) => (
                <CharacterCard 
                  key={char.id} 
                  character={char} 
                  onUpdateCharacter={handleUpdateCharacter}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer Decoration */}
      <footer className="mt-40 py-24 border-t border-stone-200 text-center bg-stone-50">
        <div className="max-w-xl mx-auto px-6">
           <div className="w-16 h-1 bg-stone-300 mx-auto mb-10"></div>
           <p className="text-stone-900 font-black text-2xl mb-4 tracking-tighter uppercase">Novel Visual Archivist</p>
           <p className="text-stone-500 text-sm font-serif leading-relaxed opacity-60">
             基于深度文本语义分析的人物视觉特征提取系统<br/>
             Gemini 3 Pro 深度解构引擎驱动<br/>
             专注于为 AI 绘画（如即梦、Midjourney）提供一致性提示词锚点
           </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
