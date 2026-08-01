import { Input, Output, Component, EventEmitter } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { CsCurrencyPipe } from '@shared/pipes/cs-currency.pipe';
import { SalesSummaryPreImplantationPreviewResultModel } from '@models/conciliation-waiting.model';

@Component({
  standalone: true,
  selector: 'cs-sales-summary-pre-implantation-dialog',
  templateUrl: './sales-summary-pre-implantation-dialog.component.html',
  imports: [ButtonModule, DialogModule, CsCurrencyPipe, TranslateModule],
})
export class SalesSummaryPreImplantationDialogComponent {
  @Input() visible = false;
  @Input() applying = false;
  @Input() preview: SalesSummaryPreImplantationPreviewResultModel | null = null;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() applyClick = new EventEmitter<void>();

  protected onVisibleChange(value: boolean): void {
    this.visibleChange.emit(value);
  }

  protected onCancel(): void {
    this.visibleChange.emit(false);
  }

  protected onApply(): void {
    this.applyClick.emit();
  }
}
