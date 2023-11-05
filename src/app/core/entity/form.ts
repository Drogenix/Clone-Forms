import { Question } from './question';

export interface Form {
  id: string;
  uid?: string;
  title: string;
  description: string;
  questions: Question[];
}
