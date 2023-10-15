import {Answer} from "./answer";
import {AnswerType} from "./answer-type";

export interface Question{
  id:number;
  title:string;
  answerType: AnswerType;
  answers:{
    offeredAnswers:Answer[];
    anotherAnswer?:Answer;
  };
  order:number
  required:boolean;
}
