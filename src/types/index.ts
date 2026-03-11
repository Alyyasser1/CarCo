export interface Message {
  messageId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface RecommendationMetadata {
  budget: { min: number; max: number };
  carType: string;
  brand: string;
  fuelType: string;
  transmission: string;
}

export interface DiagnosisMetadata {
  problemText: string;
  severity: "low" | "medium" | "high";
}

export interface ChatSession {
  sessionId: string;
  userId: string; // this references Firebase's user.uid
  type: "recommendation" | "diagnosis";
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  metadata: RecommendationMetadata | DiagnosisMetadata;
}
