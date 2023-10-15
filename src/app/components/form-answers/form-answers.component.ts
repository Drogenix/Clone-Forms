import {ChangeDetectionStrategy, Component, forwardRef, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TextInputComponent} from "../text-input/text-input.component";
import {ControlValueAccessor, FormBuilder, NG_VALUE_ACCESSOR} from "@angular/forms";
import {Answer} from "../../core/entity/answer";
import {AnswerType} from "../../core/entity/answer-type";
import {AnswerTypeGroup} from "../../core/enum/answer-type-group";
import {CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray} from "@angular/cdk/drag-drop";
import {AnswerTypeName} from "../../core/enum/answer-type-name";

interface QuestionAnswers{
  offeredAnswers:Answer[];
  anotherAnswer?:Answer;
}

const ANSWERS_MAX = 29;

@Component({
  selector: 'app-form-answers',
  standalone: true,
  imports: [CommonModule, TextInputComponent, CdkDropList, CdkDrag, CdkDragHandle],
  providers:[
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormAnswersComponent),
      multi: true
    }
  ],
  templateUrl: './form-answers.component.html',
  styleUrls: ['./form-answers.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormAnswersComponent implements ControlValueAccessor{
  form = this.fb.group({
    offeredAnswers:this.fb.array([]),
    anotherAnswer:this.fb.control<Answer | undefined>(undefined)
  })
  questionAnswers:QuestionAnswers;
  @Input()
  get answerType() : AnswerType{
    return this._answerType;
  }
  set answerType(value:AnswerType){
    if(this._answerType != value && this._answerType){
      if(this._answerType.group != value.group){

        if(value.group === AnswerTypeGroup.Text){
          this._createTextAnswer();
        }
        else if(value.group === AnswerTypeGroup.List){
          this._createListAnswer();
        }

        this._onChange(this.questionAnswers);
      }
    }

    this._answerType = value;
  }
  private _answerType:AnswerType;
  private _onChange:Function;
  private _onTouched:Function;

  constructor(private fb:FormBuilder) {}

  private _createTextAnswer(){
    this.questionAnswers = {
      anotherAnswer:undefined,
      offeredAnswers:[
        {
          id:0,
          value:''
        }
      ]
    }
  }
  private _createListAnswer(){
    this.questionAnswers = {
      anotherAnswer:undefined,
      offeredAnswers:[
        {
          id:0,
          value:'Вариант 1'
        }
      ]
    }
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  writeValue(obj: QuestionAnswers): void {
    this.questionAnswers = obj;

    this.questionAnswers.offeredAnswers.forEach((answer)=>{
      const answerControl = this.fb.control(answer);
      this.form.controls.offeredAnswers.push(answerControl);
    })

    const anotherAnswerControl = this.fb.control<Answer | undefined>(this.questionAnswers.anotherAnswer);

    this.form.controls.anotherAnswer = anotherAnswerControl;
  }

  addAnswer(){
    if(this.questionAnswers.offeredAnswers.length === ANSWERS_MAX) return;

    const answer:Answer = {
      id:this.questionAnswers.offeredAnswers.length + 1,
      value: 'Вариант ',
      order:this.questionAnswers.offeredAnswers.length + 1
    }

    answer.value += answer.id;
    this.questionAnswers.offeredAnswers.push(answer);

    this._onChange(this.questionAnswers);
  }

  addAnotherAnswer(){
    this.questionAnswers.anotherAnswer = {
      id: this.questionAnswers.offeredAnswers.length + 1,
      value: ''
    };
    this._onChange(this.questionAnswers);
  }

  removeAnswer(index:number){
    if(index === -1){
      this.questionAnswers.anotherAnswer = undefined;
      return;
    }
    this.questionAnswers.offeredAnswers.splice(index, 1);
    this._onChange(this.questionAnswers);
  }

  updateAnswer(newValue:string, index:number){
    this.questionAnswers.offeredAnswers[index].value = newValue;

    this._onChange(this.questionAnswers);
  }

  onDrop(event: CdkDragDrop<Answer[]>){
    if(event.previousIndex != event.currentIndex){
      this._changeAnswerOrder(event.previousIndex, event.currentIndex);
    }
  }

  private _changeAnswerOrder(previousIndex:number, currentIndex:number){
    const draggedItem = this.questionAnswers.offeredAnswers[previousIndex];

    const movedItem = this.questionAnswers.offeredAnswers[currentIndex];

    const oldOrder = draggedItem.order;

    draggedItem.order = movedItem.order;
    movedItem.order = oldOrder;

    moveItemInArray(this.questionAnswers.offeredAnswers, previousIndex, currentIndex)

    this._onChange(this.questionAnswers);
  }
}
