import { Directive } from '@angular/core';
import { TUI_ANIMATION_OPTIONS } from '@taiga-ui/core';

@Directive({
  selector: '[disableAnimation]',
  providers: [
    {
      provide: TUI_ANIMATION_OPTIONS,
      useValue: {
        value: '',
        params: { duration: 0 },
      },
    },
  ],
  standalone: true,
})
export class DisableAnimationDirective {}
