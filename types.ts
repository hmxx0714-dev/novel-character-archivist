
export interface Appearance {
  faceAndSkin: string;
  features: string;
  hair: string;
  bodyType: string;
  clothing: string;
}

export interface Clothing {
  title: string;
  style: string;
  main: string;
  accessories: string;
  shoes: string;
}

export interface CharacterProfile {
  id: string;
  name: string;
  genderAge: string;
  appearance: Appearance;
  clothingVersions: Clothing[];
  personalityKeywords: string[];
  aiPrompt: string;
}

export interface AnalysisResponse {
  characters: CharacterProfile[];
}
