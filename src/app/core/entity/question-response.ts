import { Answer } from './answer';

export interface FormQuestionResponse {
  id: number;
  questionId: number;
  required: boolean;
  answers: Answer[];
}
