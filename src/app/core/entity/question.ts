import { Answer } from './answer';
import { QuestionType } from './question-type';

export interface Question {
  id: number;
  title: string;
  questionType: QuestionType;
  answers: {
    offeredAnswers: Answer[];
    anotherAnswer?: Answer;
  };
  order: number;
  required: boolean;
}
