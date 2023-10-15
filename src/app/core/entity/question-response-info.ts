import {QuestionResponseAnswerInfo} from "./question-response-answer-info";

export interface QuestionResponseInfo{
  questionId:number,
  totalAnswers:number,
  questionAnswers:QuestionResponseAnswerInfo[]
}
