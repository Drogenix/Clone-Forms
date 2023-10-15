import {AbstractControl, ValidationErrors, ValidatorFn} from "@angular/forms";
import {FormQuestionResponse} from "../entity/question-response";
import {Answer} from "../entity/answer";

export function questionRequiredValidator(): ValidatorFn {
  return (control:AbstractControl<FormQuestionResponse>) : ValidationErrors | null => {
    const value = control.value;

    if(value.answers.length > 0 && !containsEmptyAnswer(value.answers)) return null;

    return {questionRequired:true}
  }
}

function containsEmptyAnswer(answers:Answer[]):boolean{
  return !!answers.find((answer)=>answer.value === '');
}
