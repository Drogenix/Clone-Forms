import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextInputComponent } from '../text-input/text-input.component';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject, takeUntil, tap } from 'rxjs';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { SpinnerComponent } from '../spinner/spinner.component';

interface ImageResponse {
  data: {
    url: string;
  };
}

const TABS_COUNT = 2;
const UPLOAD_API_URL = 'https://api.imgbb.com/1/upload';
const API_KEY = 'b17e30daead6797437aab70da81f62bd';

@Component({
  selector: 'app-input-image-dialog',
  standalone: true,
  providers: [TuiDestroyService],
  imports: [
    CommonModule,
    TextInputComponent,
    ReactiveFormsModule,
    SpinnerComponent,
  ],
  templateUrl: './input-image-dialog.component.html',
  styleUrls: ['./input-image-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputImageDialogComponent {
  private _activeTab = 1;
  urlInput = new FormControl('', {
    nonNullable: true,
    validators: Validators.required,
  });
  get active(): number {
    return this._activeTab;
  }
  private _uploadSub = new BehaviorSubject<boolean>(false);
  upload$ = this._uploadSub.asObservable();

  @ViewChild('fileInput') private _fileInput: ElementRef<HTMLInputElement>;

  constructor(
    private httpClient: HttpClient,
    @Inject(POLYMORPHEUS_CONTEXT)
    private context: TuiDialogContext<string, void>,
    private destroy$: TuiDestroyService,
  ) {}

  setActiveTab(index: number) {
    if (index < 0 || index > TABS_COUNT) return;

    this._activeTab = index;
  }

  submitInput() {
    if (this._fileInput.nativeElement.files) {
      const file = this._fileInput.nativeElement.files[0];

      const formData = new FormData();
      formData.append('image', file, file.name);

      this._uploadSub.next(true);
      this.httpClient
        .post<ImageResponse>(`${UPLOAD_API_URL}?key=${API_KEY}`, formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (image) => {
            this._uploadSub.next(false);
            this.context.completeWith(image.data.url);
          },
          error: () => this._uploadSub.next(false),
        });
    }
  }

  submitUrl() {
    if (this.urlInput.valid) this.context.completeWith(this.urlInput.value);
  }
}
