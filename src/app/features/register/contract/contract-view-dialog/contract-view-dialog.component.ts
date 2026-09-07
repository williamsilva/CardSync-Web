import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, inject } from '@angular/core';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { CsTagComponent } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';
import { ContractModel, ContractFlagModel, ContractRateModel } from '@models/contract.models';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { ModalityEnum, modalityEnumLabel } from '@models/enums/modality.enum';
import { ContractEnum, contractEnumLabel } from '@models/enums/contract.enum';

@Component({
  standalone: true,
  selector: 'app-contract-view-dialog',
  templateUrl: './contract-view-dialog.component.html',
  styleUrls: ['./contract-view-dialog.component.scss'],
  imports: [
    CommonModule,
    CsDatePipe,
    TableModule,
    DialogModule,
    ButtonModule,
    CsTagComponent,
    TranslateModule,
  ],
})
export class ContractViewDialogComponent {
  private readonly i18n = inject(I18nService);

  @Input({ required: true }) visible = false;
  @Input() contract: ContractModel | null = null;

  @Output() readonly visibleChange = new EventEmitter<boolean>();

  expandedFlags: Record<string, boolean> = {};

  readonly flags = computed(() => this.contract?.contractFlags ?? []);

  close(): void {
    this.visibleChange.emit(false);
  }

  onHide(): void {
    this.resetExpandedFlags();
    this.visibleChange.emit(false);
  }

  toggleFlag(flagItem: ContractFlagModel): void {
    const key = this.getFlagKey(flagItem);
    this.expandedFlags[key] = !this.expandedFlags[key];
  }

  isFlagExpanded(flagItem: ContractFlagModel): boolean {
    return !!this.expandedFlags[this.getFlagKey(flagItem)];
  }

  private getFlagKey(flagItem: ContractFlagModel): string {
    return String(flagItem?.id ?? flagItem?.flag?.id ?? flagItem?.flag?.name ?? Math.random());
  }

  private resetExpandedFlags(): void {
    this.expandedFlags = {};
  }

  trackByFlag = (_: number, item: ContractFlagModel) => item?.id ?? item?.flag?.id ?? _;
  trackByRate = (_: number, item: ContractRateModel) => item?.id ?? item?.modality ?? _;

  contractEnumLabel(value: ContractEnum | null | undefined): string {
    return contractEnumLabel(value ?? null, this.i18n);
  }

  modalityEnumLabel(value: ModalityEnum | null | undefined): string {
    return modalityEnumLabel(value ?? null, this.i18n);
  }
}
