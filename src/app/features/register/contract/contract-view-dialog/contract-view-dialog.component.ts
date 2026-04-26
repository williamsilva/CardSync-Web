import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed } from '@angular/core';

import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { I18nService } from '@core/i18n/i18n.service';
import { ContractModel } from '@models/contract.models';
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
    DialogModule,
    TagModule,
    CsDatePipe,
    TableModule,
    ButtonModule,
    TranslateModule,
  ],
})
export class ContractViewDialogComponent {
  @Input({ required: true }) visible = false;
  @Input() contract: ContractModel | null = null;

  @Output() readonly visibleChange = new EventEmitter<boolean>();

  expandedFlags: Record<string, boolean> = {};

  constructor(private readonly i18n: I18nService) {}

  readonly flags = computed(() => this.contract?.contractFlags ?? []);

  close(): void {
    this.visibleChange.emit(false);
  }

  onHide(): void {
    this.resetExpandedFlags();
    this.visibleChange.emit(false);
  }

  toggleFlag(flagItem: any): void {
    const key = this.getFlagKey(flagItem);
    this.expandedFlags[key] = !this.expandedFlags[key];
  }

  isFlagExpanded(flagItem: any): boolean {
    return !!this.expandedFlags[this.getFlagKey(flagItem)];
  }

  private getFlagKey(flagItem: any): string {
    return String(flagItem?.id ?? flagItem?.flag?.id ?? flagItem?.flag?.name ?? Math.random());
  }

  private resetExpandedFlags(): void {
    this.expandedFlags = {};
  }

  trackByFlag = (_: number, item: any) => item?.id ?? item?.flag?.id ?? _;
  trackByRate = (_: number, item: any) => item?.id ?? item?.modality ?? _;

  contractEnumLabel(value: ContractEnum | null | undefined): string {
    return contractEnumLabel(value ?? null, this.i18n);
  }

  modalityEnumLabel(value: ModalityEnum | null | undefined): string {
    return modalityEnumLabel(value ?? null, this.i18n);
  }
}
