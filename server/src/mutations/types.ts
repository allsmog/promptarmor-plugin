export interface MutationStrategy {
  id: string;
  name: string;
  description: string;
  mutate(prompt: string): string | string[];
  isMultiTurn?: boolean;
}
