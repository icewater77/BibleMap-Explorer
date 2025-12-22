
export interface Verse {
  reference: string; 
  text: string;      
  url?: string;      // Link to line.twgbr.org
}

export interface LocationData {
  id: string;
  name: string;          
  englishName: string;   
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
