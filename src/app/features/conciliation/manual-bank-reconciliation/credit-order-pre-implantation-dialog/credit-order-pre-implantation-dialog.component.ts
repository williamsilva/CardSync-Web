import { Input, Output, Component, EventEmitter } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { CreditOrderPreImplantationLinkingPreviewResult } from '@features/models/credit-order.model';

@Component({
  standalone: true,
  selector: 'cs-credit-order-pre-implantation-dialog',
  templateUrl: './credit-order-pre-implantation-dialog.component.html',
  imports: [ButtonModule, DialogModule, TranslateModule],
})
export class CreditOrderPreImplantationDialogComponent {
  @Input() visible = false;
  @Input() applying = false;
  @Input() preview: CreditOrderPreImplantationLinkingPreviewResult | null = null;

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
