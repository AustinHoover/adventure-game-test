export interface GameEvent {
  id: string;
  name: string;
  description: string;
  message: string;
  type: 'combat' | 'exploration' | 'minor' | 'nothing';
  weight: number; // For ticket system weighting
  callback: () => void | Promise<void>;
}

export interface EventRegistry {
  events: GameEvent[];
  addEvent: (event: GameEvent) => void;
  removeEvent: (eventId: string) => void;
  getEvent: (eventId: string) => GameEvent | undefined;
  getAllEvents: () => GameEvent[];
  clearEvents: () => void;
}
