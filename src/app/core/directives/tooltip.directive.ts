import { Directive, Host, HostListener, Inject, Input } from '@angular/core';
import { TuiHintDirective } from '@taiga-ui/core';

@Directive({
  selector: '[tooltip]',
  standalone: true,
})
export class TooltipDirective {
  @HostListener('mouseenter')
  onMouseEnter() {
    if (this.showOn === 'hover') {
      this._toggleHint(true);
    }
  }
  @HostListener('mouseleave')
  onMouseLeave() {
    this._toggleHint(false);
  }
  @HostListener('click')
  onClick() {
    if (this.showOn === 'click') this._toggleHint(!this._showHint);
  }
  @Input() showOn: 'click' | 'hover' = 'hover';
  private _showHint = false;
  constructor(
    @Host() @Inject(TuiHintDirective) private hint: TuiHintDirective<any>,
  ) {}

  private _toggleHint(value: boolean) {
    this.hint.toggle(value);
    this._showHint = value;
  }
}
