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
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { TranslateModule } from '@ngx-translate/core';
import { RadioButtonModule } from 'primeng/radiobutton';

import { I18nService } from '@core/i18n/i18n.service';
import {
  DeleteErpReasonEnum,
  deleteErpReasonEnumLabel,
  allDeleteErpReasonStatusEnum,
} from '@models/enums/delete-erp-reason.enum';

export type ErpVsAcquirerConfirmAction =
  | 'CREATE_ERP_SINGLE'
  | 'MARK_ERP_DELETED_SINGLE'
  | 'MANUAL_RECONCILE'
  | null;

export interface DeleteErpConfirmPayload {
  reason: DeleteErpReasonEnum;
  observations: string;
}

@Component({
  standalone: true,
  selector: 'cs-action-dialog',
  styleUrl: './action-dialog.component.scss',
  templateUrl: './action-dialog.component.html',
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    TextareaModule,
    TranslateModule,
    RadioButtonModule,
  ],
})
export class ErpVsAcquirerActionDialogComponent implements OnChanges {
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
  @Output() confirmDelete = new EventEmitter<DeleteErpConfirmPayload>();
  @Output() visibleChange = new EventEmitter<boolean>();

  protected observations = '';
  protected reasonTouched = false;
  protected reason: DeleteErpReasonEnum | null = null;

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

  /* protected reasonI18nKey(reason: DeleteErpReasonEnum): string {
    const map: Record<DeleteErpReasonEnum, string> = {
      [DeleteErpReasonEnum.DUPLICITY]: 'enum.deleteErpReasonEnum.duplicity',
      [DeleteErpReasonEnum.UNDONE]: 'enum.deleteErpReasonEnum.undone',
      [DeleteErpReasonEnum.CV_NOT_FOUND_ADQ]: 'enum.deleteErpReasonEnum.cvNotFoundAdq',
      [DeleteErpReasonEnum.CV_NOT_FOUND_ERP]: 'enum.deleteErpReasonEnum.cvNotFoundErp',
      [DeleteErpReasonEnum.TRANSACTION_ALREADY_CONCILIATED]:
        'enum.deleteErpReasonEnum.transaction_already_conciliated',
      [DeleteErpReasonEnum.INVALID_DATA]: 'enum.deleteErpReasonEnum.invalid_data',
      [DeleteErpReasonEnum.CANCELED]: 'enum.deleteErpReasonEnum.canceled',
      [DeleteErpReasonEnum.DELETED]: 'enum.deleteErpReasonEnum.deleted',
      [DeleteErpReasonEnum.OTHER]: 'enum.deleteErpReasonEnum.other',
    };
    return map[reason];
  } */

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
}
