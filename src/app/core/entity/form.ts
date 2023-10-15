import { Question } from './question';

export interface Form {
  id: string;
  userId?: string;
  title: string;
  description: string;
  questions: Question[];
}
