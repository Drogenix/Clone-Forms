import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { debounceTime, finalize, fromEvent, Subject, takeUntil } from 'rxjs';
import { TuiHintModule } from '@taiga-ui/core';

@Component({
  selector: 'app-form-builder-menu',
  standalone: true,
  imports: [CommonModule, TuiHintModule],
  templateUrl: './form-builder-menu.component.html',
  styleUrls: ['./form-builder-menu.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormBuilderMenuComponent
  implements OnInit, AfterViewInit, AfterViewChecked
{
  @Input() selectedBlock: number;
  @Input() parentRef: ElementRef;
  @Output() onAddQuestion = new EventEmitter<void>();
  private _selectedBlockOffsetTop: number;
  private _attachedTo: number;
  private _stopMoveMenu$ = new Subject();
  private _isMovingEnable = false;
  tooltipDirection: 'left' | 'top';
  constructor(
    private _elRef: ElementRef,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.tooltipDirection = window.innerWidth > 950 ? 'left' : 'top';
  }
  ngAfterViewInit(): void {
    if (window.innerWidth > 950) this._addScrollListener();

    fromEvent(window, 'resize')
      .pipe(debounceTime(100))
      .subscribe(() => {
        if (window.innerWidth <= 950 && this._isMovingEnable) {
          this._stopMoveMenu$.next(null);
          this._setOffsetTop('auto');
          this.tooltipDirection = 'top';
        } else if (window.innerWidth > 950 && !this._isMovingEnable) {
          this._addScrollListener();
          this._attachToSelectedBlock();
          this.tooltipDirection = 'left';
        }

        this.cdr.markForCheck();
      });
  }
  ngAfterViewChecked(): void {
    if (this._attachedTo != this.selectedBlock && this._isMovingEnable)
      this._attachToSelectedBlock();
  }

  private _addScrollListener() {
    this._isMovingEnable = true;

    fromEvent(this.parentRef.nativeElement, 'scroll')
      .pipe(
        debounceTime(150),
        takeUntil(this._stopMoveMenu$.asObservable()),
        finalize(() => (this._isMovingEnable = false)),
      )
      .subscribe(() => {
        if (this._isTouchedParentTopWhenScroll()) {
          this._setOffsetTop(this.parentRef.nativeElement.scrollTop - 8);
        }

        if (this._isTouchedParentBottomWhenScroll()) {
          const currentOffsetTop = this._elRef.nativeElement.offsetTop;

          const parentBottom = this._getParentBottom();

          const elementBottom = this._getElementBottom();

          const newOffsetTop =
            currentOffsetTop - (elementBottom - parentBottom) - 32;

          this._setOffsetTop(newOffsetTop);
        }
      });
  }

  private _getElementBottom(): number {
    return (
      this._elRef.nativeElement.offsetTop +
      this._elRef.nativeElement.clientHeight
    );
  }

  private _getParentBottom(): number {
    return (
      this.parentRef.nativeElement.scrollTop +
      this.parentRef.nativeElement.clientHeight
    );
  }

  private _attachToSelectedBlock() {
    setTimeout(() => {
      const selectedBlock =
        this.parentRef.nativeElement.getElementsByClassName('selected')[0];

      this._selectedBlockOffsetTop = selectedBlock.offsetTop;

      this._setOffsetTop(this._selectedBlockOffsetTop);

      this._attachedTo = this.selectedBlock;

      if (selectedBlock instanceof HTMLElement)
        selectedBlock.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 50);
  }
  private _setOffsetTop(top: string | number) {
    this._elRef.nativeElement.style.top =
      typeof top === 'number' ? top + 'px' : top;
  }
  private _isTouchedParentTopWhenScroll() {
    return (
      this._selectedBlockOffsetTop < this.parentRef.nativeElement.scrollTop
    );
  }

  private _isTouchedParentBottomWhenScroll() {
    const elementBottom = this._getElementBottom();

    const parentBottom = this._getParentBottom();

    return parentBottom - 32 <= elementBottom;
  }
  onAddQuestionClick() {
    this.onAddQuestion.emit();
  }
}
