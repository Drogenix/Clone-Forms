import { Question } from './question';

export interface Form {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}
