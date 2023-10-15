import { FormQuestionResponse } from './question-response';

export interface FormUserResponse {
  id: string;
  formId: string;
  userAnswers: FormQuestionResponse[];
}
