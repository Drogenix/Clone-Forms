import {UserService} from "../services/user.service";
import {AbstractControl, AsyncValidatorFn} from "@angular/forms";
import {map, shareReplay, Subject, switchMap,  takeUntil, tap, timer} from "rxjs";

const _stopTimerSub = new Subject<null>();

const stopTimer$ = _stopTimerSub.asObservable().pipe(shareReplay({bufferSize:1, refCount:true}))

let validationStarted = false;

export function userExistsValidator(userService: UserService):AsyncValidatorFn  {
  return (control: AbstractControl) => {
    if(validationStarted) _stopTimerSub.next(null);

    validationStarted = true;

    return timer(400).pipe(
      switchMap(()=> userService.userExists(control.value)),
      map(user => user ? {userExists:true} : null),
      tap(()=> {
        validationStarted = false;
        control.markAsTouched();
      }),
      takeUntil(stopTimer$)
    )
  }
}
