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
import { DatePickerModule } from 'primeng/datepicker';
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
    DatePickerModule,
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

  protected readonly MIN_PENDING_DAYS = 1;
  protected readonly MIN_DAYS_LOOKBACK = 0;
  protected readonly MAX_PENDING_DAYS = 365;
  protected readonly MIN_DATE_TOLERANCE = 0;
  protected readonly MAX_DAYS_LOOKBACK = 365;
  protected readonly MIN_LOOKBACK_MONTHS = 1;
  protected readonly MAX_DATE_TOLERANCE = 60;
  protected readonly MIN_VALUE_TOLERANCE = 0;
  protected readonly MAX_VALUE_TOLERANCE = 10;
  protected readonly MAX_LOOKBACK_MONTHS = 120;
  protected readonly MIN_BANK_NOT_RECONCILED_DAYS = 0;
  protected readonly MAX_BANK_NOT_RECONCILED_DAYS = 60;
  protected readonly MIN_LEGACY_MARKING_MONTHS = 0;
  protected readonly MAX_LEGACY_MARKING_MONTHS = 120;

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
    enabledErpAcquirer: [true],
    enabledSalesSummaryTransactions: [true],
    enabledAcquirerSaleCancellations: [true],
    enabledErpAcquirerFees: [true],
    enabledAcquirerSaleSummary: [true],
    enabledSalesSummaryCreditOrder: [true],
    enabledBankAcquirer: [true],
    reprocessErpAcquirerSales: [false],
    reprocessSalesSummaryTransactions: [false],
    reprocessAcquirerSaleCancellations: [false],
    reprocessErpAcquirerFees: [false],
    reprocessAcquirerSaleSummary: [false],
    reprocessSalesSummaryCreditOrder: [false],
    reprocessBankAcquirer: [false],
    dateToleranceDaysBefore: [
      5,
      [
        Validators.required,
        Validators.min(this.MIN_DATE_TOLERANCE),
        Validators.max(this.MAX_DATE_TOLERANCE),
      ],
    ],
    dateToleranceDaysAfter: [
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
    goLiveDate: [null as Date | null, [Validators.required]],
    legacyMarkingMonths: [
      12,
      [
        Validators.required,
        Validators.min(this.MIN_LEGACY_MARKING_MONTHS),
        Validators.max(this.MAX_LEGACY_MARKING_MONTHS),
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
          enabledErpAcquirer: settings.enabledErpAcquirer,
          enabledSalesSummaryTransactions: settings.enabledSalesSummaryTransactions,
          enabledAcquirerSaleCancellations: settings.enabledAcquirerSaleCancellations,
          enabledErpAcquirerFees: settings.enabledErpAcquirerFees,
          enabledAcquirerSaleSummary: settings.enabledAcquirerSaleSummary,
          enabledSalesSummaryCreditOrder: settings.enabledSalesSummaryCreditOrder,
          enabledBankAcquirer: settings.enabledBankAcquirer,
          reprocessErpAcquirerSales: settings.reprocessErpAcquirerSales,
          reprocessSalesSummaryTransactions: settings.reprocessSalesSummaryTransactions,
          reprocessAcquirerSaleCancellations: settings.reprocessAcquirerSaleCancellations,
          reprocessErpAcquirerFees: settings.reprocessErpAcquirerFees,
          reprocessAcquirerSaleSummary: settings.reprocessAcquirerSaleSummary,
          reprocessSalesSummaryCreditOrder: settings.reprocessSalesSummaryCreditOrder,
          reprocessBankAcquirer: settings.reprocessBankAcquirer,
          dateToleranceDaysBefore: settings.dateToleranceDaysBefore,
          dateToleranceDaysAfter: settings.dateToleranceDaysAfter,
          valueTolerance: settings.valueTolerance,
          bankMarkNotReconciledAfterDays: settings.bankMarkNotReconciledAfterDays,
          goLiveDate: this.parseIsoDate(settings.goLiveDate),
          legacyMarkingMonths: settings.legacyMarkingMonths,
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
        enabledErpAcquirer: v.enabledErpAcquirer ?? true,
        enabledSalesSummaryTransactions: v.enabledSalesSummaryTransactions ?? true,
        enabledAcquirerSaleCancellations: v.enabledAcquirerSaleCancellations ?? true,
        enabledErpAcquirerFees: v.enabledErpAcquirerFees ?? true,
        enabledAcquirerSaleSummary: v.enabledAcquirerSaleSummary ?? true,
        enabledSalesSummaryCreditOrder: v.enabledSalesSummaryCreditOrder ?? true,
        enabledBankAcquirer: v.enabledBankAcquirer ?? true,
        reprocessErpAcquirerSales: v.reprocessErpAcquirerSales ?? false,
        reprocessSalesSummaryTransactions: v.reprocessSalesSummaryTransactions ?? false,
        reprocessAcquirerSaleCancellations: v.reprocessAcquirerSaleCancellations ?? false,
        reprocessErpAcquirerFees: v.reprocessErpAcquirerFees ?? false,
        reprocessAcquirerSaleSummary: v.reprocessAcquirerSaleSummary ?? false,
        reprocessSalesSummaryCreditOrder: v.reprocessSalesSummaryCreditOrder ?? false,
        reprocessBankAcquirer: v.reprocessBankAcquirer ?? false,
        dateToleranceDaysBefore: v.dateToleranceDaysBefore ?? 5,
        dateToleranceDaysAfter: v.dateToleranceDaysAfter ?? 10,
        valueTolerance: v.valueTolerance ?? 0.05,
        bankMarkNotReconciledAfterDays: v.bankMarkNotReconciledAfterDays ?? 3,
        goLiveDate: this.formatIsoDate(v.goLiveDate) ?? '2024-07-01',
        legacyMarkingMonths: v.legacyMarkingMonths ?? 12,
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

  private parseIsoDate(value: string | null): Date | null {
    if (!value) return null;
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  }

  private formatIsoDate(value: Date | null | undefined): string | null {
    if (!value) return null;
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${value.getFullYear()}-${month}-${day}`;
  }
}
