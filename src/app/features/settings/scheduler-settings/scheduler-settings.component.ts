import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

import { I18nService } from '@core/i18n/i18n.service';
import { PERMISSIONS } from '@core/auth/permissions.constants';
import { PermissionService } from '@core/auth/permission.service';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { SchedulerSettingsApiService } from '@features/service/scheduler-settings.api.service';

@Component({
  standalone: true,
  selector: 'cs-scheduler-settings',
  templateUrl: './scheduler-settings.component.html',
  imports: [
    CardModule,
    ButtonModule,
    TooltipModule,
    TranslateModule,
    InputTextModule,
    FloatLabelModule,
    ToggleSwitchModule,
    ReactiveFormsModule,
    PageHeaderComponent,
  ],
})
export class SchedulerSettingsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(MessageService);
  private readonly perms = inject(PermissionService);
  private readonly service = inject(SchedulerSettingsApiService);

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);

  protected readonly canEdit = computed(() =>
    this.perms.hasSupportOr(PERMISSIONS.SETTINGS.SCHEDULER_CHANGE),
  );

  readonly form = this.fb.group({
    enabled: [false],
    completePipelineEnabled: [true],
    completePipelineCron: ['0 0/30 * * * *', [Validators.required, Validators.maxLength(100)]],
    completePipelineStopOnStepError: [true],
    logIdleCycles: [false],
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.service.getSettings().subscribe({
      next: (s) => {
        this.form.patchValue(s);
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
        enabled: v.enabled ?? false,
        completePipelineEnabled: v.completePipelineEnabled ?? true,
        completePipelineCron: v.completePipelineCron ?? '0 0/30 * * * *',
        completePipelineStopOnStepError: v.completePipelineStopOnStepError ?? true,
        logIdleCycles: v.logIdleCycles ?? false,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.toast.add({
            severity: 'success',
            summary: this.i18n.tUi('common.success'),
            detail: this.i18n.tUi('conciliation.settings.schedulerSaved'),
          });
        },
        error: () => {
          this.saving.set(false);
          this.toast.add({
            severity: 'error',
            summary: this.i18n.tUi('common.error'),
            detail: this.i18n.tUi('conciliation.settings.schedulerSaveError'),
          });
        },
      });
  }
}
