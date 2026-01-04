
export interface VideoContent {
  videoUrl: string;
  voiceUrl: string;
  subtitleText: string;
  title?: string;
}

export interface PlayerData {
  contents: VideoContent[];
}

export enum PlayerState {
  PLAYING = 'playing',
  PAUSED = 'paused',
  ENDED = 'ended',
  LOADING = 'loading'
}
