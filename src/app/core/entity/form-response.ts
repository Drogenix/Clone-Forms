import { FormResponseAnswer } from './form-response-answer';

export interface FormResponse {
  id: string;
  formId: string;
  responseAnswers: FormResponseAnswer[];
}
