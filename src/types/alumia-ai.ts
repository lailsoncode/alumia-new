export type AlumiaIntent = "tasks" | "mindfulness" | "create_task" | "crisis" | "capabilities";

export interface AlumiaProposedAction {
  id: string;
  type: "create_task";
  title: string;
}

export interface AlumiaNavigation {
  label: string;
  to: "/tarefas" | "/mindfulness";
}

export interface AlumiaAssistantResult {
  text: string;
  tone: "default" | "safety";
  source: "editorial" | "generative";
  proposedAction?: AlumiaProposedAction;
  navigation?: AlumiaNavigation;
}

export interface AlumiaConversationMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  tone?: AlumiaAssistantResult["tone"];
  source?: AlumiaAssistantResult["source"];
  proposedAction?: AlumiaProposedAction;
  navigation?: AlumiaNavigation;
}
