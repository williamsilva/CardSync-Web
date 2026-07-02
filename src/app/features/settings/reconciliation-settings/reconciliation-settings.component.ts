import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { InputNumberModule } from 'primeng/inputnumber';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

import { I18nService } from '@core/i18n/i18n.service';
import { PERMISSIONS } from '@core/auth/permissions.constants';
import { PermissionService } from '@core/auth/permission.service';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { ReconciliationSettingsApiService } from '@features/service/reconciliation-settings.api.service';

@Component({
  standalone: true,
  selector: 'cs-reconciliation-settings',
  templateUrl: './reconciliation-settings.component.html',
  imports: [
    CardModule,
    ButtonModule,
    DividerModule,
    TooltipModule,
    TranslateModule,
    InputNumberModule,
    FloatLabelModule,
    ToggleSwitchModule,
    ReactiveFormsModule,
    PageHeaderComponent,
  ],
})
export class ReconciliationSettingsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(MessageService);
  private readonly perms = inject(PermissionService);
  private readonly service = inject(ReconciliationSettingsApiService);

  protected readonly MIN_DAYS_LOOKBACK = 0;
  protected readonly MAX_DAYS_LOOKBACK = 365;
  protected readonly MIN_LOOKBACK_MONTHS = 1;
  protected readonly MAX_LOOKBACK_MONTHS = 120;
  protected readonly MIN_PENDING_DAYS = 1;
  protected readonly MAX_PENDING_DAYS = 365;
  protected readonly MIN_DATE_TOLERANCE = 0;
  protected readonly MAX_DATE_TOLERANCE = 60;
  protected readonly MIN_VALUE_TOLERANCE = 0;
  protected readonly MAX_VALUE_TOLERANCE = 10;
  protected readonly MIN_BANK_NOT_RECONCILED_DAYS = 0;
  protected readonly MAX_BANK_NOT_RECONCILED_DAYS = 60;

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);

  protected readonly canEdit = computed(() =>
    this.perms.hasSupportOr(PERMISSIONS.FILE_PROCESSING.PROCESS),
  );

  readonly form = this.fb.group({
    erpAcquirerPreviousDaysLookback: [
      this.MIN_DAYS_LOOKBACK,
      [
        Validators.required,
        Validators.min(this.MIN_DAYS_LOOKBACK),
        Validators.max(this.MAX_DAYS_LOOKBACK),
      ],
    ],
    erpAcquirerFutureDaysLookback: [
      this.MIN_DAYS_LOOKBACK,
      [
        Validators.required,
        Validators.min(this.MIN_DAYS_LOOKBACK),
        Validators.max(this.MAX_DAYS_LOOKBACK),
      ],
    ],
    reconciliationLookbackMonths: [
      this.MAX_LOOKBACK_MONTHS,
      [
        Validators.required,
        Validators.min(this.MIN_LOOKBACK_MONTHS),
        Validators.max(this.MAX_LOOKBACK_MONTHS),
      ],
    ],
    creditOrderPendingDays: [
      30,
      [
        Validators.required,
        Validators.min(this.MIN_PENDING_DAYS),
        Validators.max(this.MAX_PENDING_DAYS),
      ],
    ],
    reprocessErpAcquirerSales: [false],
    reprocessSalesSummaryTransactions: [false],
    reprocessAcquirerSaleCancellations: [false],
    reprocessErpAcquirerFees: [false],
    reprocessAcquirerSaleSummary: [false],
    reprocessSalesSummaryCreditOrder: [false],
    reprocessBankAcquirer: [false],
    dateToleranceDays: [
      10,
      [
        Validators.required,
        Validators.min(this.MIN_DATE_TOLERANCE),
        Validators.max(this.MAX_DATE_TOLERANCE),
      ],
    ],
    valueTolerance: [
      0.05,
      [
        Validators.required,
        Validators.min(this.MIN_VALUE_TOLERANCE),
        Validators.max(this.MAX_VALUE_TOLERANCE),
      ],
    ],
    bankMarkNotReconciledAfterDays: [
      3,
      [
        Validators.required,
        Validators.min(this.MIN_BANK_NOT_RECONCILED_DAYS),
        Validators.max(this.MAX_BANK_NOT_RECONCILED_DAYS),
      ],
    ],
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.service.getSettings().subscribe({
      next: (settings) => {
        this.form.patchValue({
          erpAcquirerPreviousDaysLookback: settings.erpAcquirerPreviousDaysLookback,
          erpAcquirerFutureDaysLookback: settings.erpAcquirerFutureDaysLookback,
          reconciliationLookbackMonths: settings.reconciliationLookbackMonths,
          creditOrderPendingDays: settings.creditOrderPendingDays,
          reprocessErpAcquirerSales: settings.reprocessErpAcquirerSales,
          reprocessSalesSummaryTransactions: settings.reprocessSalesSummaryTransactions,
          reprocessAcquirerSaleCancellations: settings.reprocessAcquirerSaleCancellations,
          reprocessErpAcquirerFees: settings.reprocessErpAcquirerFees,
          reprocessAcquirerSaleSummary: settings.reprocessAcquirerSaleSummary,
          reprocessSalesSummaryCreditOrder: settings.reprocessSalesSummaryCreditOrder,
          reprocessBankAcquirer: settings.reprocessBankAcquirer,
          dateToleranceDays: settings.dateToleranceDays,
          valueTolerance: settings.valueTolerance,
          bankMarkNotReconciledAfterDays: settings.bankMarkNotReconciledAfterDays,
        });
        if (!this.canEdit()) {
          this.form.disable();
        }
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  protected save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    this.saving.set(true);
    this.service
      .updateSettings({
        erpAcquirerPreviousDaysLookback: v.erpAcquirerPreviousDaysLookback ?? 0,
        erpAcquirerFutureDaysLookback: v.erpAcquirerFutureDaysLookback ?? 0,
        reconciliationLookbackMonths: v.reconciliationLookbackMonths ?? this.MAX_LOOKBACK_MONTHS,
        creditOrderPendingDays: v.creditOrderPendingDays ?? 30,
        reprocessErpAcquirerSales: v.reprocessErpAcquirerSales ?? false,
        reprocessSalesSummaryTransactions: v.reprocessSalesSummaryTransactions ?? false,
        reprocessAcquirerSaleCancellations: v.reprocessAcquirerSaleCancellations ?? false,
        reprocessErpAcquirerFees: v.reprocessErpAcquirerFees ?? false,
        reprocessAcquirerSaleSummary: v.reprocessAcquirerSaleSummary ?? false,
        reprocessSalesSummaryCreditOrder: v.reprocessSalesSummaryCreditOrder ?? false,
        reprocessBankAcquirer: v.reprocessBankAcquirer ?? false,
        dateToleranceDays: v.dateToleranceDays ?? 10,
        valueTolerance: v.valueTolerance ?? 0.05,
        bankMarkNotReconciledAfterDays: v.bankMarkNotReconciledAfterDays ?? 3,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.toast.add({
            severity: 'success',
            summary: this.i18n.tUi('common.success'),
            detail: this.i18n.tUi('conciliation.settings.saved'),
          });
        },
        error: () => {
          this.saving.set(false);
          this.toast.add({
            severity: 'error',
            summary: this.i18n.tUi('common.error'),
            detail: this.i18n.tUi('conciliation.settings.saveError'),
          });
        },
      });
  }
}
