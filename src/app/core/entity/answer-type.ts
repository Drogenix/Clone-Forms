import {AnswerTypeName} from "../enum/answer-type-name";
import {AnswerTypeGroup} from "../enum/answer-type-group";

export interface AnswerType {
  name:AnswerTypeName,
  group:AnswerTypeGroup
}
