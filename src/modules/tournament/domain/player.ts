export interface Player {
  id: string;
  name: string;
  nickname: string;
  tournaments: string[];

  // Profile fields
  position?: string; // e.g., "Goalkeeper", "Defender", "Midfielder", "Forward"
  height?: number; // in centimeters
  weight?: number; // in kilograms
  photoUrl?: string; // URL to player photo
  socialMedia?: SocialMedia;
  statistics?: PlayerStatistics;
}

export interface SocialMedia {
  instagram?: string;
  twitter?: string;
  facebook?: string;
}

export interface PlayerStatistics {
  matchesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
}
