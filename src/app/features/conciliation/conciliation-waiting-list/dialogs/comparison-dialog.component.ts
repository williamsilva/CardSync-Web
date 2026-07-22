
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';

import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';

import { CsTagComponent } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { CsNumberPipe } from '@shared/pipes/cs-number.pipe';
import { CsCurrencyPipe } from '@shared/pipes/cs-currency.pipe';

import {
  ErpAcquirerTruthSource,
  ErpAcquirerFieldDiffModel,
  ErpAcquirerComparisonModel,
} from '@models/conciliation-waiting.model';

@Component({
  standalone: true,
  selector: 'cs-comparison-dialog',
  templateUrl: './comparison-dialog.component.html',
  providers: [CsDatePipe, CsCurrencyPipe, CsNumberPipe],
  imports: [
    CsDatePipe,
    TableModule,
    DialogModule,
    ButtonModule,
    CsTagComponent,
    CsCurrencyPipe,
    TranslateModule
],
})
export class ErpVsAcquirerComparisonDialogComponent {
  protected readonly i18n = inject(I18nService);
  private readonly csDatePipe = inject(CsDatePipe);
  private readonly csNumberPipe = inject(CsNumberPipe);
  private readonly csCurrencyPipe = inject(CsCurrencyPipe);

  @Input() visible = false;
  @Input() comparing = false;
  @Input() resolving = false;
  @Input() row: any | null = null;
  @Input() comparison: ErpAcquirerComparisonModel | null = null;

  @Output() closeDialog = new EventEmitter<void>();
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() reconcile = new EventEmitter<ErpAcquirerTruthSource>();

  protected divergentFields(): ErpAcquirerFieldDiffModel[] {
    return this.comparison?.fields?.filter((field) => field.different) ?? [];
  }

  protected fieldLabel(field: string): string {
    const labels: Record<string, string> = {
      tid: this.i18n.tUi('transactions.fields.tid'),
      flag: this.i18n.tUi('transactions.fields.flag'),
      nsu: this.i18n.tUi('transactions.fields.cvNsu'),
      cvNsu: this.i18n.tUi('transactions.fields.cvNsu'),
      company: this.i18n.tUi('transactions.fields.company'),
      capture: this.i18n.tUi('transactions.fields.capture'),
      saleDate: this.i18n.tUi('transactions.fields.saleDate'),
      acquirer: this.i18n.tUi('transactions.fields.acquirer'),
      modality: this.i18n.tUi('transactions.fields.modality'),
      grossValue: this.i18n.tUi('transactions.fields.grossValue'),
      liquidValue: this.i18n.tUi('transactions.fields.liquidValue'),
      installment: this.i18n.tUi('transactions.fields.installment'),
      authorization: this.i18n.tUi('transactions.fields.authorization'),
      discountValue: this.i18n.tUi('transactions.fields.discountValue'),
      establishment: this.i18n.tUi('transactions.fields.establishment'),
      adjustmentValue: this.i18n.tUi('transactions.fields.adjustmentValue'),
    };

    return labels[field] ?? field;
  }

  protected formatDiffValue(field: ErpAcquirerFieldDiffModel, side: 'erp' | 'acquirer'): string {
    const value = side === 'erp' ? field.erpValue : field.acquirerValue;
    return this.formatValueByField(field.field, value);
  }

  protected onVisibleChange(visible: boolean): void {
    this.visibleChange.emit(visible);

    if (!visible) {
      this.closeDialog.emit();
    }
  }

  protected close(): void {
    this.visibleChange.emit(false);
    this.closeDialog.emit();
  }

  protected reconcileUsing(truthSource: ErpAcquirerTruthSource): void {
    this.reconcile.emit(truthSource);
  }

  private formatValueByField(fieldName: string, value: unknown): string {
    if (this.isBlank(value)) {
      return '-';
    }

    switch (fieldName) {
      case 'saleDate':
      case 'paymentDate':
      case 'expectedPaymentDate':
      case 'saleReconciliationDate':
        return this.csDatePipe.transform(value as string | Date | number, 'short');

      case 'grossValue':
      case 'liquidValue':
      case 'discountValue':
      case 'adjustmentValue':
      case 'netValue':
      case 'feeValue':
      case 'mdrValue':
        return this.csCurrencyPipe.transform(value as number | string);

      case 'installment':
      case 'installments':
      case 'nsu':
      case 'cvNsu':
        return this.csNumberPipe.transform(value as number | string, {
          maximumFractionDigits: 0,
        });

      default:
        return this.formatGeneric(value);
    }
  }

  private formatGeneric(value: unknown): string {
    if (this.isBlank(value)) {
      return '-';
    }

    if (typeof value === 'object') {
      return this.extractObjectLabel(value);
    }

    return String(value);
  }

  private extractObjectLabel(value: unknown): string {
    if (!value || typeof value !== 'object') {
      return '-';
    }

    const obj = value as Record<string, unknown>;

    const label =
      obj['fantasyName'] ??
      obj['socialReason'] ??
      obj['name'] ??
      obj['description'] ??
      obj['label'] ??
      obj['pvNumber'] ??
      obj['cnpj'] ??
      obj['id'];

    return this.isBlank(label) ? '-' : String(label);
  }

  private isBlank(value: unknown): boolean {
    return value === null || value === undefined || value === '';
  }
}
