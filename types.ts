export interface Verse {
  reference: string; // e.g., "馬太福音 2:1"
  text: string;      // e.g., "當希律王的時候，耶穌生在猶太的伯利恆..."
}

export interface LocationData {
  id: string;
  name: string;          // Traditional Chinese name (e.g., "耶路撒冷")
  englishName: string;   // e.g., "Jerusalem"
  latitude: number;
  longitude: number;
  shortDescription: string;
}

export interface LocationDetails extends LocationData {
  fullDescription: string;
  historicalSignificance: string;
  verses: Verse[];
  googleMapsUrl: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING_LIST = 'LOADING_LIST',
  LOADING_DETAILS = 'LOADING_DETAILS',
  ERROR = 'ERROR',
}