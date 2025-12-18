
import React, { useState } from 'react';
import { CharacterProfile } from '../types';

interface CharacterCardProps {
  character: CharacterProfile;
  onUpdateCharacter: (id: string, updated: CharacterProfile) => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, onUpdateCharacter }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<CharacterProfile>({ ...character });

  const handleSave = () => {
    onUpdateCharacter(character.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({ ...character });
    setIsEditing(false);
  };

  const updateNestedAppearance = (field: keyof CharacterProfile['appearance'], value: string) => {
    setEditData({
      ...editData,
      appearance: { ...editData.appearance, [field]: value }
    });
  };

  const updateClothing = (index: number, field: string, value: string) => {
    const newClothing = [...editData.clothingVersions];
    newClothing[index] = { ...newClothing[index], [field]: value };
    setEditData({ ...editData, clothingVersions: newClothing });
  };

  if (!character.genderAge) {
    // Placeholder while loading details
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-stone-200 animate-pulse flex items-center justify-center gap-4">
        <div className="w-8 h-8 border-4 border-stone-300 border-t-stone-800 rounded-full animate-spin"></div>
        <span className="text-stone-500 font-bold text-xl">正在为 {character.name} 构建深度档案...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden flex flex-col h-full transition-all hover:shadow-2xl">
      {/* Header Section */}
      <div className="bg-stone-50 px-8 py-6 border-b border-stone-100 flex flex-wrap justify-between items-start gap-4">
        <div className="flex-1 min-w-[200px]">
          {isEditing ? (
            <div className="space-y-2">
              <input 
                className="text-2xl font-bold text-stone-900 border-b-2 border-stone-300 w-full outline-none focus:border-stone-800 bg-transparent py-1"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                placeholder="角色姓名"
              />
              <input 
                className="text-stone-600 font-medium border-b border-stone-300 w-full outline-none focus:border-stone-800 bg-transparent"
                value={editData.genderAge}
                onChange={(e) => setEditData({ ...editData, genderAge: e.target.value })}
                placeholder="性别与年龄"
              />
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-stone-400 font-black text-xl">#</span>
                <h2 className="text-2xl font-bold text-stone-900">人物档案：{character.name}</h2>
              </div>
              <p className="text-stone-600 font-medium ml-6">{character.genderAge}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="bg-stone-900 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-stone-800 transition-all active:scale-95">保存档案</button>
                <button onClick={handleCancel} className="bg-stone-200 text-stone-600 px-6 py-2 rounded-lg text-sm font-bold hover:bg-stone-300 transition-all">取消</button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-white text-stone-600 px-6 py-2 rounded-lg text-sm font-bold border border-stone-200 hover:border-stone-400 hover:text-stone-900 transition-all flex items-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                修改档案
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            {character.personalityKeywords.map((tag, idx) => (
              <span key={idx} className="bg-stone-100 text-stone-500 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest border border-stone-200">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto space-y-10">
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-stone-800"></div>
            <h3 className="text-xl font-bold text-stone-900 tracking-tight">外貌特征描述</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: '脸型与肤色', key: 'faceAndSkin' },
              { label: '五官特征', key: 'features' },
              { label: '发型与发饰', key: 'hair' },
              { label: '身材体态', key: 'bodyType' },
              { label: '核心服装', key: 'clothing' }
            ].map((item) => (
              <div key={item.key} className="bg-stone-50 p-4 rounded-xl border border-stone-100 group transition-colors hover:border-stone-300">
                <p className="font-bold text-stone-500 text-xs mb-2 uppercase tracking-wider">{item.label}</p>
                {isEditing ? (
                  <textarea 
                    className="w-full p-2 bg-white border border-stone-200 rounded-lg text-stone-700 text-sm focus:ring-2 focus:ring-stone-200 outline-none"
                    rows={2}
                    value={(editData.appearance as any)[item.key]}
                    onChange={(e) => updateNestedAppearance(item.key as any, e.target.value)}
                  />
                ) : (
                  <p className="text-stone-800 leading-relaxed font-serif">{(character.appearance as any)[item.key]}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {editData.clothingVersions.length > 0 && editData.clothingVersions.map((cloth, idx) => (
          <section key={idx} className="opacity-80">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-stone-400"></div>
              <h3 className="text-lg font-bold text-stone-700 tracking-tight">
                详细服装版本：{isEditing ? (
                  <input 
                    className="bg-stone-50 border-b border-stone-300 outline-none px-2 py-1 rounded" 
                    value={cloth.title} 
                    onChange={(e) => updateClothing(idx, 'title', e.target.value)} 
                  />
                ) : cloth.title}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: '风格/参考', key: 'style' },
                { label: '主要服装', key: 'main' },
                { label: '配饰细节', key: 'accessories' },
                { label: '鞋履选择', key: 'shoes' }
              ].map((item) => (
                <div key={item.key} className="bg-stone-50/50 p-4 rounded-xl border border-stone-100 transition-colors hover:border-stone-300">
                  <p className="font-bold text-stone-400 text-[10px] mb-2 uppercase tracking-widest">{item.label}</p>
                  {isEditing ? (
                    <textarea 
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg text-stone-700 text-xs focus:ring-2 focus:ring-stone-200 outline-none"
                      rows={3}
                      value={(cloth as any)[item.key]}
                      onChange={(e) => updateClothing(idx, item.key, e.target.value)}
                    />
                  ) : (
                    <p className="text-stone-600 text-sm leading-relaxed font-serif">{(character.clothingVersions[idx] as any)[item.key]}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* AI Prompt Section - High Visibility */}
        <section className="mt-8">
          <div className="bg-stone-900 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-stone-700 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-stone-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                  </div>
                  <h4 className="text-stone-100 font-black text-sm uppercase tracking-[0.2em]">即梦绘图提示词 (纯净主体 · 无动作)</h4>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(isEditing ? editData.aiPrompt : character.aiPrompt);
                    alert('提示词已复制到剪贴板');
                  }}
                  className="text-stone-400 hover:text-white text-[10px] font-bold uppercase tracking-widest border border-stone-700 px-3 py-1 rounded hover:bg-stone-800 transition-all"
                >
                  点击复制
                </button>
              </div>
              
              {isEditing ? (
                <textarea 
                  className="w-full p-4 bg-stone-800 border border-stone-700 rounded-xl text-stone-200 text-lg leading-relaxed font-serif focus:ring-2 focus:ring-stone-500 outline-none"
                  rows={4}
                  value={editData.aiPrompt}
                  onChange={(e) => setEditData({ ...editData, aiPrompt: e.target.value })}
                  placeholder="输入全中文绘图提示词..."
                />
              ) : (
                <p className="text-stone-100 text-xl leading-relaxed font-serif italic text-center px-4">
                  “{character.aiPrompt}”
                </p>
              )}
              
              <p className="text-stone-500 text-[10px] mt-6 text-center italic">
                * 该提示词专为视觉模型优化，已包含角色所有核心视觉锚点。已去除所有动作描述，仅保留纯净的人物主体展示。
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CharacterCard;
