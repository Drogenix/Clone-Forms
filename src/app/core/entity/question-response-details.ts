import {Answer} from "./answer";

export interface FormResponsesDetails{
  id:string,
  totalResponses:number,
  responses:QuestionResponse[]
}
export interface QuestionResponse{
  id:string,
  questionId:number,
  answersGroups:AnswerGroup[]
  totalResponses:number
}

export interface AnswerGroup{
  answers:Answer[],
  totalRepeats:number
}
