
import { GoogleGenAI, Type } from "@google/genai";
import { CharacterProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: "AIzaSyBGai0Z6a4w5fKn9L6ONTqKkqx9VAckaVo" });

/**
 * Step 1: Just identify the list of important characters.
 */
export async function identifyCharacters(text: string): Promise<string[]> {
  const prompt = `
    你是一个专业的小说内容分析员。请阅读以下小说片段，并列出所有核心及重要配角的名字。
    重要角色指出现三次及以上、或对情节有推动作用的角色。
    
    小说内容：
    """
    ${text.substring(0, 10000)} 
    """

    请仅以 JSON 数组格式返回角色姓名列表，例如: ["张三", "李四"]。
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Failed to identify characters:", error);
    return [];
  }
}

/**
 * Step 2: Generate detailed profile for a specific character.
 */
export async function generateCharacterDetail(name: string, novelText: string): Promise<Omit<CharacterProfile, 'id'>> {
  const prompt = `
    你是一个专业的可视化人物档案架构师。请针对小说中的角色“${name}”，构建完整的、结构化的可视化人物档案。
    
    小说背景参考：
    """
    ${novelText.substring(0, 8000)}
    """

    请严格按照 JSON 格式返回。描述必须具体、可视觉化。
    字段要求：
    - name: "${name}"
    - genderAge: 性别与年龄（例如 "24岁女性"）
    - appearance: {
        faceAndSkin: "脸型与肤色",
        features: "五官细节（眼、眉、鼻、唇、特殊标记）",
        hair: "发型与发饰",
        bodyType: "身材体态",
        clothing: "角色的核心/标志性服装描述"
      }
    - clothingVersions: [
        {
          title: "服装时期（如：默认/时期A）",
          style: "服装风格与参考",
          main: "主要服装样式",
          accessories: "配饰细节",
          shoes: "鞋履"
        }
      ]
    - personalityKeywords: ["性格特质1", "性格特质2", "性格特质3"]
    - aiPrompt: "即梦绘画提示词（必须基于以上细节，合成一段精简、流畅、可直接用于AI绘画的提示词。**必须全部使用中文描述**。包含：年龄、性别、关键外貌特征、发型、服装、主要配饰。**要求人物无动作，不需要任何动作描述，仅展示一个纯净的人物主体**。不描述背景，固定使用'纯白色背景'。）"
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          genderAge: { type: Type.STRING },
          appearance: {
            type: Type.OBJECT,
            properties: {
              faceAndSkin: { type: Type.STRING },
              features: { type: Type.STRING },
              hair: { type: Type.STRING },
              bodyType: { type: Type.STRING },
              clothing: { type: Type.STRING }
            }
          },
          clothingVersions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                style: { type: Type.STRING },
                main: { type: Type.STRING },
                accessories: { type: Type.STRING },
                shoes: { type: Type.STRING }
              }
            }
          },
          personalityKeywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          aiPrompt: { type: Type.STRING }
        },
        required: ["name", "genderAge", "appearance", "clothingVersions", "personalityKeywords", "aiPrompt"]
      }
    }
  });

  return JSON.parse(response.text);
}
