import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { InputTextModule } from 'primeng/inputtext';
import { TranslateModule } from '@ngx-translate/core';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

import { I18nService } from '@core/i18n/i18n.service';
import { PERMISSIONS } from '@core/auth/permissions.constants';
import { PermissionService } from '@core/auth/permission.service';
import { EmailSettingsApiService } from '@features/service/email-settings.api.service';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';

export const EMAIL_IMPL_OPTIONS = [
  { label: 'FAKE', value: 'FAKE' },
  { label: 'SMTP', value: 'SMTP' },
  { label: 'BREVO', value: 'BREVO' },
];

@Component({
  standalone: true,
  selector: 'cs-email-settings',
  templateUrl: './email-settings.component.html',
  imports: [
    CardModule,
    ButtonModule,
    SelectModule,
    DividerModule,
    TooltipModule,
    CheckboxModule,
    TextareaModule,
    TranslateModule,
    InputTextModule,
    InputNumberModule,
    FloatLabelModule,
    ToggleSwitchModule,
    ReactiveFormsModule,
    PageHeaderComponent,
  ],
})
export class EmailSettingsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(MessageService);
  private readonly perms = inject(PermissionService);
  private readonly service = inject(EmailSettingsApiService);

  protected readonly saving = signal(false);
  protected readonly loading = signal(false);
  protected readonly implOptions = EMAIL_IMPL_OPTIONS;

  protected readonly canEdit = computed(() =>
    this.perms.hasSupportOr(PERMISSIONS.FILE_PROCESSING.PROCESS),
  );

  readonly form = this.fb.group({
    impl: ['FAKE', Validators.required],
    fromName: ['', [Validators.required, Validators.maxLength(255)]],
    fromEmail: ['', [Validators.required, Validators.maxLength(255)]],
    brevoApiKey: ['', Validators.maxLength(500)],
    brevoBaseUrl: ['', Validators.maxLength(255)],
    brevoPort: [587],
    brevoUsername: ['', Validators.maxLength(255)],
    chargebackRecipients: [''],
    smtpHost: ['', Validators.maxLength(255)],
    smtpPort: [587],
    smtpUsername: ['', Validators.maxLength(255)],
    smtpPassword: ['', Validators.maxLength(500)],
    smtpAuth: [true],
    smtpStarttls: [false],
    smtpSsl: [false],
  });

  constructor() {
    this.load();
  }

  protected get implValue(): string {
    return this.form.get('impl')?.value ?? '';
  }

  protected load(): void {
    this.loading.set(true);
    this.service.getSettings().subscribe({
      next: (s) => {
        this.form.patchValue({
          impl: s.impl ?? 'FAKE',
          fromName: s.fromName ?? '',
          fromEmail: s.fromEmail ?? '',
          brevoApiKey: s.brevoApiKey ?? '',
          brevoBaseUrl: s.brevoBaseUrl ?? '',
          brevoPort: s.brevoPort ?? 587,
          brevoUsername: s.brevoUsername ?? '',
          chargebackRecipients: s.chargebackRecipients ?? '',
          smtpHost: s.smtpHost ?? '',
          smtpPort: s.smtpPort ?? 587,
          smtpUsername: s.smtpUsername ?? '',
          smtpPassword: s.smtpPassword ?? '',
          smtpAuth: s.smtpAuth ?? true,
          smtpStarttls: s.smtpStarttls ?? false,
          smtpSsl: s.smtpSsl ?? false,
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
        impl: v.impl ?? 'FAKE',
        fromName: v.fromName ?? '',
        fromEmail: v.fromEmail ?? '',
        brevoApiKey: v.brevoApiKey || null,
        brevoBaseUrl: v.brevoBaseUrl || null,
        brevoPort: v.brevoPort ?? null,
        brevoUsername: v.brevoUsername || null,
        chargebackRecipients: v.chargebackRecipients || null,
        smtpHost: v.smtpHost || null,
        smtpPort: v.smtpPort ?? null,
        smtpUsername: v.smtpUsername || null,
        smtpPassword: v.smtpPassword || null,
        smtpAuth: v.smtpAuth ?? null,
        smtpStarttls: v.smtpStarttls ?? null,
        smtpSsl: v.smtpSsl ?? null,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.toast.add({
            severity: 'success',
            summary: this.i18n.tUi('common.success'),
            detail: this.i18n.tUi('email.settings.saved'),
          });
        },
        error: () => {
          this.saving.set(false);
          this.toast.add({
            severity: 'error',
            summary: this.i18n.tUi('common.error'),
            detail: this.i18n.tUi('email.settings.saveError'),
          });
        },
      });
  }
}
