import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';

import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ErrorMsgComponent } from '@shared/error-msg/error-msg.component';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { I18nService } from '@core/i18n/i18n.service';
import { UsersFacade } from '@features/facade/users.facade';
import { GroupsFacade } from '@features/facade/groups.facade';
import { UserCreateInput, UserModel, UserUpdateInput } from '@models/users.models';
import { UserStatus } from '@models/enums/user-status.enum';
import { cpfCnpjValidator } from '@shared/validators/cpf-cnpj.validator';

@Component({
  standalone: true,
  selector: 'app-users-form',
  styleUrl: './companies-form.component.scss',
  templateUrl: './companies-create.component.html',
  imports: [
    CommonModule,
    CardModule,
    FloatLabel,
    ToastModule,
    ButtonModule,
    SelectModule,
    PasswordModule,
    InputTextModule,
    TranslateModule,
    ErrorMsgComponent,
    MultiSelectModule,
    ReactiveFormsModule,
    PageHeaderComponent,
  ],
  providers: [MessageService, ConfirmationService],
})
export class CompaniesFormComponent {
  readonly submitted = signal(false);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly i18n = inject(I18nService);
  readonly facade = inject(UsersFacade);

  private readonly groupsFacade = inject(GroupsFacade);
  readonly groupOptions = this.groupsFacade.options;

  private readonly toast = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);

  readonly saving = signal(false);
  readonly userId = signal<string | null>(null);
  readonly isEdit = computed(() => !!this.userId());
  readonly loadedUser = signal<UserModel | null>(null);

  readonly canResendSetPasswordEmail = computed(() => {
    const u = this.loadedUser();
    return !!this.userId() && u?.hasPassword === false;
  });

  readonly statusOptions = computed(() => [
    { label: this.i18n.tUi('users.status.active'), value: 'ACTIVE' as UserStatus },
    { label: this.i18n.tUi('users.status.inactive'), value: 'INACTIVE' as UserStatus },
    { label: this.i18n.tUi('users.status.blocked'), value: 'BLOCKED' as UserStatus },
    { label: this.i18n.tUi('users.status.disabled'), value: 'DISABLED' as UserStatus },
    {
      label: this.i18n.tUi('users.status.pending_password'),
      value: 'PENDING_PASSWORD' as UserStatus,
    },
  ]);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    userName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
    // guarda SOMENTE dígitos (mask directive)
    document: ['', [Validators.required, cpfCnpjValidator()]],
    status: ['ACTIVE' as UserStatus, [Validators.required]],
    groupIds: [[] as string[]],
  });

  constructor() {
    this.groupsFacade.loadGroupOptions();

    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((pm) => {
      const id = pm.get('id');
      const resolved = id && id !== 'new' ? id : null;

      this.userId.set(resolved);
      this.loadedUser.set(null);

      if (resolved) {
        this.loadEdit(resolved);
      } else {
        this.form.reset({
          name: '',
          userName: '',
          document: '',
          //status: 'ACTIVE',
          groupIds: [],
        });
      }
    });
  }

  private loadEdit(id: string) {
    this.facade
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (u) => {
          this.loadedUser.set(u);

          const groupIds = Array.isArray(u.groups)
            ? u.groups.map((g: any) => (typeof g === 'string' ? g : g.id)).filter(Boolean)
            : [];

          this.form.patchValue({
            name: u.name ?? '',
            userName: u.userName ?? '',
            document: u.document ?? '',
            status: (u.status ?? 'ACTIVE') as UserStatus,
            groupIds,
          });
        },
        error: () => {
          this.toast.add({
            severity: 'error',
            summary: this.i18n.tUi('common.error'),
            detail: this.i18n.tUi('users.form.loadError'),
          });
          this.router.navigate(['/users']);
        },
      });
  }

  cancel() {
    this.router.navigate(['/users']);
  }

  save() {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();

    if (this.form.invalid) {
      this.focusFirstInvalid();
      return;
    }

    const v = this.form.getRawValue();
    this.saving.set(true);

    const base = {
      name: v.name.trim(),
      userName: v.userName.trim(),
      document: String(v.document ?? '').replace(/\D+/g, ''),
      status: v.status,
      groupIds: v.groupIds?.length ? v.groupIds : undefined,
    };

    const req$ = this.isEdit()
      ? this.facade.update(this.userId()!, base satisfies UserUpdateInput)
      : this.facade.create(base satisfies UserCreateInput);

    req$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: this.isEdit()
            ? this.i18n.tUi('users.form.updated')
            : this.i18n.tUi('users.form.created'),
        });
        this.submitted.set(false);
        this.router.navigate(['/users']);
      },
      error: () => {
        this.saving.set(false);
        this.toast.add({
          severity: 'error',
          summary: this.i18n.tUi('common.error'),
          detail: this.i18n.tUi('users.form.saveError'),
        });
      },
    });
  }

  resendSetPasswordEmail() {
    const id = this.userId();
    if (!id) return;

    this.confirm.confirm({
      header: this.i18n.tUi('users.form.resend.header'),
      message: this.i18n.tUi('users.form.resend.message'),
      icon: 'pi pi-envelope',
      acceptLabel: this.i18n.tUi('common.send'),
      rejectLabel: this.i18n.tUi('common.cancel'),
      accept: () => {
        this.toast.add({
          severity: 'info',
          summary: this.i18n.tUi('common.info'),
          detail: this.i18n.tUi('users.form.resend.todoServer'),
        });
      },
    });
  }

  private focusFirstInvalid() {
    const firstInvalidName = Object.keys(this.form.controls).find(
      (key) => this.form.controls[key as keyof typeof this.form.controls].invalid,
    );
    if (!firstInvalidName) return;

    const el =
      document.getElementById(firstInvalidName) ||
      document.querySelector<HTMLElement>(`[inputId="${firstInvalidName}"]`) ||
      document.querySelector<HTMLElement>(`[formcontrolname="${firstInvalidName}"]`);

    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const focusTarget =
      el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
        ? el
        : ((el.querySelector('input,textarea,[tabindex],button') as HTMLElement | null) ?? el);

    setTimeout(() => focusTarget.focus(), 80);
  }
}
