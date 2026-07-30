import { FormsModule } from '@angular/forms';

import {
  Input,
  Output,
  Component,
  OnChanges,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DatePickerModule } from 'primeng/datepicker';
import { TranslateModule } from '@ngx-translate/core';

export interface CancellationReprocessPayload {
  year: number;
  month: number;
}

@Component({
  standalone: true,
  selector: 'cs-cancellation-reprocess-dialog',
  templateUrl: './cancellation-reprocess-dialog.component.html',
  styleUrl: './cancellation-reprocess-dialog.component.scss',
  imports: [
    FormsModule,
    DialogModule,
    ButtonModule,
    FloatLabelModule,
    DatePickerModule,
    TranslateModule
],
})
export class CancellationReprocessDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input() resolving = false;

  @Output() closeDialog = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<CancellationReprocessPayload>();
  @Output() visibleChange = new EventEmitter<boolean>();

  protected selectedDate: Date | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.selectedDate = null;
    }
  }

  protected onConfirmClick(): void {
    if (!this.selectedDate) return;
    this.confirm.emit({
      year: this.selectedDate.getFullYear(),
      month: this.selectedDate.getMonth() + 1,
    });
  }

  protected onVisibleChange(value: boolean): void {
    this.visibleChange.emit(value);
  }
}
