import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';

import { I18nService } from '@core/i18n/i18n.service';
import { PERMISSIONS } from '@core/auth/permissions.constants';
import { PermissionService } from '@core/auth/permission.service';
import { ReconciliationSettingsApiService } from '@features/service/reconciliation-settings.api.service';

@Component({
  standalone: true,
  selector: 'cs-reconciliation-settings',
  styleUrl: './reconciliation-settings.component.scss',
  templateUrl: './reconciliation-settings.component.html',
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TranslateModule,
    FloatLabelModule,
    InputNumberModule,
    ReactiveFormsModule,
  ],
})
export class ReconciliationSettingsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(MessageService);
  private readonly perms = inject(PermissionService);
  private readonly service = inject(ReconciliationSettingsApiService);

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);

  protected readonly canEdit = computed(() =>
    this.perms.hasSupportOr(PERMISSIONS.FILE_PROCESSING.PROCESS),
  );

  readonly form = this.fb.group({
    erpAcquirerPreviousDaysLookback: [0, [Validators.required, Validators.min(0), Validators.max(365)]],
    erpAcquirerFutureDaysLookback: [0, [Validators.required, Validators.min(0), Validators.max(365)]],
    reconciliationLookbackMonths: [6, [Validators.required, Validators.min(1), Validators.max(36)]],
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
        reconciliationLookbackMonths: v.reconciliationLookbackMonths ?? 6,
      })
      .subscribe({
        next: () => {
          this.toast.add({
            severity: 'success',
            summary: this.i18n.tUi('common.success'),
            detail: this.i18n.tUi('conciliation.settings.saved'),
          });
        },
        error: () => this.saving.set(false),
        complete: () => this.saving.set(false),
      });
  }
}
