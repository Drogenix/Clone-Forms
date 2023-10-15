import { QuestionTypeName } from '../enum/question-type-name';
import { QuestionTypeGroup } from '../enum/question-type-group';

export interface QuestionType {
  name: QuestionTypeName;
  group: QuestionTypeGroup;
}
