import {Answer} from "./answer";

export interface QuestionResponseGroup{
  questionId:number,
  answers:Answer[],
  totalRepeats:number
}
