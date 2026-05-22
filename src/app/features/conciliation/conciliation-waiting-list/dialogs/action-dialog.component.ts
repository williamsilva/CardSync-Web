import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { I18nService } from '@core/i18n/i18n.service';

export type ErpVsAcquirerConfirmAction =
  | 'CREATE_ERP_SINGLE'
  | 'MARK_ERP_DELETED_SINGLE'
  | 'MANUAL_RECONCILE'
  | null;

@Component({
  standalone: true,
  selector: 'cs-action-dialog',
  templateUrl: './action-dialog.component.html',
  imports: [CommonModule, DialogModule, ButtonModule, TranslateModule],
})
export class ErpVsAcquirerActionDialogComponent {
  private readonly i18n = inject(I18nService);

  @Input() visible = false;
  @Input() resolving = false;

  @Input() grossTotal = 0;
  @Input() liquidTotal = 0;

  @Input() description = '';
  @Input() actionSuffix = '';
  @Input() confirmLabel = '';
  @Input() confirmButtonClass = 'p-button-success';
  @Input() action: ErpVsAcquirerConfirmAction = null;

  @Output() closeDialog = new EventEmitter<void>();
  @Output() confirmDialog = new EventEmitter<void>();
  @Output() visibleChange = new EventEmitter<boolean>();

  protected isCreateErp(): boolean {
    return this.action === 'CREATE_ERP_SINGLE';
  }

  protected isDeleteErp(): boolean {
    return this.action === 'MARK_ERP_DELETED_SINGLE';
  }

  protected title(): string {
    if (this.isCreateErp()) {
      return this.i18n.tUi('conciliation.actionDialog.titles.createErp');
    }

    if (this.isDeleteErp()) {
      return this.i18n.tUi('conciliation.actionDialog.titles.deleteErp');
    }

    return this.i18n.tUi('conciliation.actionDialog.titles.warning');
  }

  protected icon(): string {
    return this.isCreateErp() ? 'pi pi-plus-circle' : 'pi pi-exclamation-triangle';
  }

  protected titleClass(): string {
    return this.isCreateErp() ? 'text-green-600' : 'text-red-500';
  }

  protected mainText(): string {
    if (this.isCreateErp()) {
      return this.i18n.tUi('conciliation.actionDialog.mainText.createErp');
    }

    if (this.isDeleteErp()) {
      return this.i18n.tUi('conciliation.actionDialog.mainText.deleteErp');
    }

    return this.i18n.tUi('conciliation.actionDialog.mainText.generic');
  }

  protected defaultDescription(): string {
    if (this.description?.trim()) {
      return this.description;
    }

    if (this.isCreateErp()) {
      return this.i18n.tUi('conciliation.actionDialog.description.createErp');
    }

    if (this.isDeleteErp()) {
      return this.i18n.tUi('conciliation.actionDialog.description.deleteErp');
    }

    return this.i18n.tUi('conciliation.actionDialog.description.generic');
  }

  protected defaultConfirmLabel(): string {
    if (this.isCreateErp()) {
      return this.i18n.tUi('conciliation.actionDialog.confirm.createErp');
    }

    if (this.isDeleteErp()) {
      return this.i18n.tUi('conciliation.actionDialog.confirm.deleteErp');
    }

    return this.i18n.tUi('common.confirm');
  }

  protected resolvedButtonClass(): string {
    if (this.isDeleteErp()) {
      return 'p-button-danger';
    }

    return this.confirmButtonClass || 'p-button-success';
  }

  protected formatCurrency(value: number | null | undefined): string {
    return this.i18n.formatBrlCurrency(Number(value) || 0);
  }

  protected onVisibleChange(value: boolean): void {
    this.visibleChange.emit(value);
  }
}
