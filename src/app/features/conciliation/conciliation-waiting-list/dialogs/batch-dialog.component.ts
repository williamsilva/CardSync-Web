import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  Input,
  inject,
  Output,
  computed,
  Component,
  OnChanges,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { DialogModule } from 'primeng/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { RadioButtonModule } from 'primeng/radiobutton';

import { I18nService } from '@core/i18n/i18n.service';
import { CsCurrencyPipe } from '@shared/pipes/cs-currency.pipe';
import { DeleteErpConfirmPayload } from './action-dialog.component';
import { ConciliationWaitingModel } from '@models/conciliation-waiting.model';
import {
  DeleteErpReasonEnum,
  deleteErpReasonEnumLabel,
  allDeleteErpReasonStatusEnum,
} from '@models/enums/delete-erp-reason.enum';

export type BatchAction = 'CREATE_ERP' | 'MARK_ERP_DELETED' | null;

@Component({
  standalone: true,
  selector: 'cs-batch-dialog',
  styleUrl: './batch-dialog.component.scss',
  templateUrl: './batch-dialog.component.html',
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    TextareaModule,
    CsCurrencyPipe,
    TranslateModule,
    RadioButtonModule,
  ],
})
export class BatchDialogComponent implements OnChanges {
  private readonly i18n = inject(I18nService);

  @Input() visible = false;
  @Input() resolving = false;

  @Input() description = '';
  @Input() actionSuffix = '';
  @Input() confirmLabel = '';

  @Input() action: BatchAction = null;
  @Input() rows: ConciliationWaitingModel[] = [];

  @Output() closeDialog = new EventEmitter<void>();
  @Output() confirmDialog = new EventEmitter<void>();
  @Output() confirmDelete = new EventEmitter<DeleteErpConfirmPayload>();
  @Output() visibleChange = new EventEmitter<boolean>();

  protected reason: DeleteErpReasonEnum | null = null;
  protected observations = '';
  protected reasonTouched = false;

  readonly deleteErpReasonEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allDeleteErpReasonStatusEnum().map((value) => ({
      label: deleteErpReasonEnumLabel(value, this.i18n),
      value,
    }));
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['action'] || (changes['visible'] && !this.visible)) {
      this.reason = null;
      this.observations = '';
      this.reasonTouched = false;
    }
  }

  protected get rowsCount(): number {
    return this.rows?.length ?? 0;
  }

  protected get grossTotal(): number {
    return this.rows.reduce((total, row) => total + this.numericValue(row.grossValue), 0);
  }

  protected get liquidTotal(): number {
    return this.rows.reduce((total, row) => total + this.numericValue(row.liquidValue), 0);
  }

  protected isCreateErp(): boolean {
    return this.action === 'CREATE_ERP';
  }

  protected isDeleteErp(): boolean {
    return this.action === 'MARK_ERP_DELETED';
  }

  protected titleKey(): string {
    if (this.isCreateErp()) {
      return 'conciliation.batchDialog.title.createErp';
    }

    if (this.isDeleteErp()) {
      return 'conciliation.batchDialog.title.deleteErp';
    }

    return 'conciliation.batchDialog.title.warning';
  }

  protected icon(): string {
    return this.isCreateErp() ? 'pi pi-plus-circle' : 'pi pi-exclamation-triangle';
  }

  protected titleClass(): string {
    return this.isCreateErp() ? 'text-green-600' : 'text-red-500';
  }

  protected mainTextKey(): string {
    const suffix = this.rowsCount === 1 ? 'one' : 'many';

    if (this.isCreateErp()) {
      return `conciliation.batchDialog.mainText.createErp.${suffix}`;
    }

    if (this.isDeleteErp()) {
      return `conciliation.batchDialog.mainText.deleteErp.${suffix}`;
    }

    return `conciliation.batchDialog.mainText.generic.${suffix}`;
  }

  protected defaultDescriptionKey(): string {
    if (this.isCreateErp()) {
      return 'conciliation.batchDialog.description.createErp';
    }

    if (this.isDeleteErp()) {
      return 'conciliation.batchDialog.description.deleteErp';
    }

    return 'conciliation.batchDialog.description.generic';
  }

  protected defaultConfirmLabelKey(): string {
    if (this.isCreateErp()) {
      return 'conciliation.batchDialog.confirm.createErp';
    }

    if (this.isDeleteErp()) {
      return 'conciliation.batchDialog.confirm.deleteErp';
    }

    return 'common.confirm';
  }

  protected confirmButtonClass(): string {
    return this.isDeleteErp() ? 'p-button-danger' : 'p-button-success';
  }

  protected confirmButtonLabel(): string {
    return this.confirmLabel?.trim() || this.i18n.tUi(this.defaultConfirmLabelKey() as never);
  }

  protected onConfirmClick(): void {
    if (this.isDeleteErp()) {
      this.reasonTouched = true;
      if (!this.reason) return;
      this.confirmDelete.emit({ reason: this.reason, observations: this.observations });
    } else {
      this.confirmDialog.emit();
    }
  }

  protected onVisibleChange(value: boolean): void {
    this.visibleChange.emit(value);
  }

  private numericValue(value: number | string | null | undefined): number {
    if (value == null || value === '') {
      return 0;
    }

    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0;
    }

    const normalized = String(value).trim().replace(/\./g, '').replace(',', '.');

    const parsed = Number(normalized);

    return Number.isFinite(parsed) ? parsed : 0;
  }
}
