export type LanguageCode = 'vi' | 'en';

export type LayoutType = 'classic-stacked' | 'split-modern' | 'image-focus' | 'custom';
export type IllustrationLayout = 'single' | 'split-2-horizontal' | 'split-2-vertical' | 'overlay';
export type AnswerLayout = 'vertical-list' | 'grid-2x2' | 'compact-pills';
export type CountdownStyle = 'clean-text' | 'bar-horizontal' | 'circle-radial' | 'pill-timer' | 'badge';
export type TransitionType = 'fade' | 'slide' | 'zoom' | 'wipe';
export type AnimationType = 'fade' | 'slide-up' | 'pop' | 'scale-in' | 'bounce';
export type MotionDirection = 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'pan-up' | 'pan-down';
export type MotionEffect =
  | 'random-motion'
  | 'zoom-in'
  | 'zoom-out'
  | 'pan-left'
  | 'pan-right'
  | 'pan-up'
export type HorizontalAlign = 'left' | 'center' | 'right';
export type VerticalAlign = 'top' | 'center' | 'bottom';
export type OptionKey = 'A' | 'B' | 'C';

export type NeonPresetId =
  | 'neon-gradient'
  | 'cyber-glow'
  | 'light-waves'
  | 'neon-grid'
  | 'energy-lines'
  | 'light-particles'
  | 'geometric-neon'
  | 'aurora-neon'
  | 'particles'
  | 'light-streaks'
  | 'gradient-motion';

export type ComponentShape =
  | 'rectangle'
  | 'rounded'
  | 'pill'
  | 'capsule'
  | 'bubble'
  | 'speech-bubble'
  | 'hud'
  | 'doodle'
  | 'minimal'
  | 'color-block'
  | 'glass'
  | 'circle'
  | 'ellipse'
  | 'hexagon'
  | 'diamond'
  | 'blob'
  | 'ticket'
  | 'badge';

export type ComponentBorderStyle = 'solid' | 'dashed' | 'dotted' | 'double' | 'doodle' | 'none';

export interface ComponentStyle {
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  width: number;
  height: number;
  horizontalAlign?: HorizontalAlign;
  verticalAlign?: VerticalAlign;
  textAlign?: HorizontalAlign;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  lineHeight?: number | string;
  color?: string;
  textColor?: string;
  backgroundColor?: string;
  bgOpacity?: number;
  backdropBlur?: number;
  opacity?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: ComponentBorderStyle;
  boxShadow?: string;
  padding?: number;
  animation?: AnimationType;
  animationDelay?: number;
  enabled?: boolean;
  shape?: ComponentShape;
  glowColor?: string;
  glowRadius?: number;
  popShadow?: boolean;
  popShadowOffset?: number;
  popShadowColor?: string;
  chamferSize?: number;
  markerHighlight?: boolean;
  textStrokeWidth?: number;
  textStrokeColor?: string;
  textShadow?: string;
  rotation?: number;
}

export type AnswerLayoutComposition =
  | 'stacked'
  | 'grid-2-top-1-bottom'
  | 'split-left-right'
  | 'triangle'
  | 'one-right-two-left'
  | 'circular-arc'
  | 'floating'
  | 'staggered'
  | 'asymmetric'
  | 'custom';

export type OptionBadgeShape = 'circle' | 'square' | 'pill' | 'hexagon' | 'diamond' | 'badge';

export interface IndividualOptionConfig extends ComponentStyle {
  enabled?: boolean;
  labelColor?: string;
  labelBgColor?: string;
  labelShape?: OptionBadgeShape;
  labelSize?: number;
}

export interface AnswerButtonsConfig extends ComponentStyle {
  gap?: number;
  optionBadgeShape?: OptionBadgeShape;
  readTts?: boolean;
  layoutComposition?: AnswerLayoutComposition;
  useIndividualStyles?: boolean;
  dimWrongAnswers?: boolean;
  wrongAnswerOpacity?: number;
  activeOptionTab?: OptionKey;
  options?: {
    A?: IndividualOptionConfig;
    B?: IndividualOptionConfig;
    C?: IndividualOptionConfig;
    D?: IndividualOptionConfig;
  };
}

export interface BackgroundMotionConfig {
  enabled?: boolean;
  direction?: MotionDirection; // legacy single-direction support
  effects?: MotionEffect[];    // multi-effects e.g. ['random-motion', 'zoom-in', 'pan-left']
  intensity?: number;          // translation intensity/distance (e.g. 10 to 40, default 20)
  zoomScale?: number;          // additional zoom level (e.g. 1.05 to 1.25, default 1.15)
  speed?: number;              // animation speed multiplier (e.g. 0.5 to 2.0, default 1.0)
  movement?: number;           // dynamic wave/drift amplitude
  opacity?: number;            // overlay/effect opacity
  blur?: number;               // blur amount in px
  color1?: string;             // primary dynamic color
  color2?: string;             // secondary dynamic color
  color3?: string;             // tertiary dynamic color
  aiWatermarkZoom?: boolean;   // default true: +20% base zoom from center to eliminate AI watermarks
  zoomStart?: number;          // legacy
  zoomEnd?: number;            // legacy
  panX?: number;               // legacy
  panY?: number;               // legacy
}

export interface ExplanationConfig extends ComponentStyle {
  enabled?: boolean;           // Show Explanation: ON/OFF
  readTts?: boolean;           // Explanation TTS: ON/OFF
  displayDurationSec?: number; // Display duration when TTS is OFF (default 3s)
  showIcon?: boolean;          // Show bulb icon
  titleText?: string;          // Optional title above explanation
}

export const DEFAULT_EXPLANATION_CONFIG: ExplanationConfig = {
  enabled: true,
  readTts: true,
  displayDurationSec: 3.0,
  showIcon: true,
  x: 6,
  y: 84,
  width: 88,
  height: 9,
  fontSize: 15,
  fontWeight: '600',
  color: '#1e293b',
  textColor: '#1e293b',
  backgroundColor: '#ffffff',
  bgOpacity: 0.98,
  borderRadius: 16,
  borderWidth: 2,
  borderColor: '#22c55e',
  boxShadow: '0 8px 25px rgba(22, 163, 74, 0.18)',
  padding: 12,
  textAlign: 'left'
};

export interface VideoTemplate {
  id: string;
  name: string;
  layoutType: LayoutType;
  illustrationLayout: IllustrationLayout;
  answerLayout: AnswerLayout;
  countdownStyle: CountdownStyle;
  transitionType: TransitionType;
  timing: {
    countdownSeconds: number;
    revealSeconds: number;
    transitionFrames: number;
    endBufferSeconds?: number; // Time to hold final screen before video ends
    explanationDisplayDuration?: number; // Default display duration when explanation TTS is OFF
  };
  components: {
    background: ComponentStyle & {
      type?: 'solid' | 'gradient' | 'mesh' | 'pattern' | 'image' | 'neon';
      gradientAngle?: number;
      secondaryColor?: string;
      imageUrl?: string;
      overlayColor?: string;
      overlayOpacity?: number;
      motion?: BackgroundMotionConfig;
      neonPresetId?: NeonPresetId;
      neonSpeed?: number;
      neonIntensity?: number;
      neonColor1?: string;
      neonColor2?: string;
      neonColor3?: string;
      blur?: number;
      gradient?: string;
    };
    header?: ComponentStyle & {
      showTitle?: boolean;
      badgeStyle?: boolean;
      enabled?: boolean;
      text?: string;
    };
    quizTitle?: ComponentStyle & {
      enabled?: boolean;
      text?: string;
      badgeStyle?: boolean;
    };
    questionNumber?: ComponentStyle & { format?: 'câu-n' | 'q-n' | 'badge' | 'n-total' };
    illustration?: ComponentStyle & { objectFit?: 'cover' | 'contain'; zoomEffect?: boolean; paddingFrame?: number };
    questionBox: ComponentStyle & { glassmorphism?: boolean };
    answerButtons: AnswerButtonsConfig;
    countdown: ComponentStyle & {
      strokeWidth?: number;
      showSeconds?: boolean;
      showIcon?: boolean;
      iconSize?: number;
      fontSize?: number;
      hideBox?: boolean;
      countdownStyle?: CountdownStyle;
      warningColor?: string;
    };
    progressBar?: ComponentStyle & { thickness?: number };
    explanation?: ExplanationConfig;
    logo?: ComponentStyle & {
      watermark?: boolean;
      showLogo?: boolean;
      showChannelName?: boolean;
      channelName?: string;
      logoSize?: number;
    };
  };
}

export interface ChannelBranding {
  identity: {
    channelName: string;
    description?: string;
    avatarUrl?: string;
    logoUrl?: string;
    watermarkUrl?: string;
    watermarkOpacity?: number;
    watermarkPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    showWatermark?: boolean;
    showLogo?: boolean;
    showChannelName?: boolean;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    cardBg: string;
    text: string;
    textMuted?: string;
    correct: string;
    wrong: string;
    buttonBg?: string;
    border?: string;
  };
  fonts?: {
    primary: string;
    secondary: string;
    headingWeight: string;
    bodyWeight: string;
  };
  typography?: {
    headingFont?: string;
    bodyFont?: string;
    scaleRatio?: number;
  };
  effects?: {
    shadowStyle: 'none' | 'subtle' | 'elevated' | 'glow' | 'neon';
    borderRadius: number;
    glassmorphism: boolean;
  };
}

export interface LanguageConfig {
  language: LanguageCode;
  voice: string;
  rate: string;
  pitch: string;
  volume: string;
  readOptions: boolean;
  readAnswer?: boolean;
  introScript: string;
  outroScript: string;
  revealScript: string;
}

export interface AudioProfile {
  bgmTrack: string;
  bgmVolume: number;
  duckingIntensity: number;
  sfx: {
    tick: string;
    finish: string;
    reveal: string;
    correct: string;
    transition: string;
  };
  volumes: {
    tick: number;
    finish: number;
    reveal: number;
    correct: number;
    transition: number;
  };
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  branding: ChannelBranding;
  languages: {
    vi: LanguageConfig;
    en: LanguageConfig;
  };
  audio: AudioProfile;
  activeTemplateId: string;
  templates: VideoTemplate[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
  };
  correctAnswer: OptionKey;
  explanation: string;
  illustrations: string[]; // 0, 1 or 2 images attached to this question (optional!)
  ttsUrls?: {
    question?: string;
    options?: string;
    reveal?: string;
  };
  durations?: {
    questionTts: number;
    optionsTts: number;
    countdown: number;
    reveal: number;
    explanationTts: number;
  };
}

export interface Quiz {
  id: string;
  title: string;
  language: LanguageCode;
  channelId: string;
  questions: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface TimelinePhases {
  introStart: number;
  questionTtsStart: number;
  questionTtsEnd: number;
  optionsTtsStart?: number;
  optionsTtsEnd?: number;
  countdownStart: number;
  countdownEnd: number;
  revealStart: number;
  answerTtsStart?: number;
  answerTtsEnd?: number;
  explanationTtsStart: number;
  explanationTtsEnd: number;
}

export interface AudioCue {
  type: 'tts' | 'sfx' | 'bgm-duck';
  url: string;
  startFrame: number;
  durationFrames: number;
  volume: number;
}

export interface TimelineQuestionCue {
  questionIndex: number;
  startFrame: number;
  endFrame: number;
  durationFrames: number;
  phases: TimelinePhases;
  audioCues: AudioCue[];
}

export interface VideoCompositionProps {
  channel: Channel;
  template: VideoTemplate;
  quiz: Quiz;
  language: LanguageCode;
  totalDurationFrames: number;
  cues: TimelineQuestionCue[];
  fps: number;
  width: number;
  height: number;
}

export * from './presets.js';
export * from '../utils/answerLayoutHelper.js';
