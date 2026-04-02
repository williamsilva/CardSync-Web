import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  input,
  Output,
  inject,
  effect,
  signal,
  computed,
  Component,
  DestroyRef,
  EventEmitter,
} from '@angular/core';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';

import { I18nService } from '@core/i18n/i18n.service';
import { AcquirerFacade } from '@features/facade/acquirer.facade';
import { cpfCnpjValidator } from '@shared/validators/cpf-cnpj.validator';
import { ErrorMsgComponent } from '@shared/error-msg/error-msg.component';
import { CpfCnpjMaskDirective } from '@shared/directives/cpf-cnpj-mask.directive';
import {
  StatusEnum,
  allStatusEnum,
  statusEnumLabel,
  normalizeStatusEnum,
} from '@models/enums/status.enum';
import { AcquirerCreateInput, AcquirerModel, AcquirerUpdateInput } from '@models/acquirer.models';

@Component({
  standalone: true,
  selector: 'app-acquirer-create-dialog',
  templateUrl: './acquirer-create-component.html',
  imports: [
    CommonModule,
    ToastModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    TranslateModule,
    FloatLabelModule,
    ErrorMsgComponent,
    ReactiveFormsModule,
    CpfCnpjMaskDirective,
  ],
})
export class AcquirerCreateDialogComponent {
  visible = input.required<boolean>();
  acquirer = input<AcquirerModel | null>(null);

  @Output() saved = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();
  @Output() visibleChange = new EventEmitter<boolean>();

  readonly saving = signal(false);
  readonly i18n = inject(I18nService);
  readonly facade = inject(AcquirerFacade);
  readonly loadingAcquirer = signal(false);

  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly lastBoundAcquirerId = signal<string | null>(null);
  private readonly lastVisibleState = signal(false);

  readonly isEdit = computed(() => !!this.acquirer()?.id);

  readonly statusOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allStatusEnum().map((value) => ({
      label: statusEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly form = this.fb.group({
    fantasyName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    socialReason: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
    cnpj: ['', [Validators.required, cpfCnpjValidator()]],
    status: [null as StatusEnum | null],
  });

  constructor() {
    effect(() => {
      const visible = this.visible();
      const acquirer = this.acquirer();

      const wasVisible = this.lastVisibleState();
      const acquirerId = acquirer?.id ?? null;
      const lastAcquirerId = this.lastBoundAcquirerId();

      this.lastVisibleState.set(visible);

      if (!visible) {
        return;
      }

      const justOpened = !wasVisible && visible;
      const acquirerChanged = acquirerId !== lastAcquirerId;

      if (!justOpened && !acquirerChanged) {
        return;
      }

      this.loadingAcquirer.set(true);

      if (!acquirer) {
        this.resetFormForCreate();
        this.lastBoundAcquirerId.set(null);
        this.loadingAcquirer.set(false);
        return;
      }

      const digitsDoc = String(acquirer.cnpj ?? '').replace(/\D+/g, '');

      this.form.reset({
        fantasyName: acquirer.fantasyName ?? '',
        socialReason: acquirer.socialReason ?? '',
        cnpj: digitsDoc,
        status: normalizeStatusEnum(acquirer.status),
      });

      this.lastBoundAcquirerId.set(acquirerId);
      this.loadingAcquirer.set(false);
    });
  }

  onHide() {
    this.close();
  }

  close() {
    this.saving.set(false);
    this.loadingAcquirer.set(false);
    this.lastBoundAcquirerId.set(null);
    this.lastVisibleState.set(false);
    this.resetFormForCreate();
    this.visibleChange.emit(false);
  }

  save() {
    if (!this.isEdit()) {
      this.form.controls.status.setValue(null);
    }

    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();

    if (this.form.invalid) {
      this.focusFirstInvalid();
      return;
    }

    const v = this.form.getRawValue();

    const createPayload: AcquirerCreateInput = {
      fantasyName: (v.fantasyName ?? '').trim(),
      socialReason: (v.socialReason ?? '').trim(),
      cnpj: String(v.cnpj ?? '').replace(/\D+/g, ''),
    };

    const updatePayload: AcquirerUpdateInput = {
      fantasyName: (v.fantasyName ?? '').trim(),
      socialReason: (v.socialReason ?? '').trim(),
      cnpj: String(v.cnpj ?? '').replace(/\D+/g, ''),
      status: this.isEdit() ? (v.status ?? undefined) : undefined,
    };

    this.saving.set(true);

    const id = this.acquirer()?.id;
    const req$ = id ? this.facade.update(id, updatePayload) : this.facade.create(createPayload);

    req$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);

        const isEdit = !!id;
        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: isEdit
            ? this.i18n.tUi('acquirer.form.updated')
            : this.i18n.tUi('acquirer.form.created'),
        });

        if (isEdit) this.updated.emit();
        else this.created.emit();

        this.saved.emit();
        this.close();
      },
      error: () => {
        this.saving.set(false);
        this.toast.add({
          severity: 'error',
          summary: this.i18n.tUi('common.error'),
          detail: this.i18n.tUi('acquirer.form.saveError'),
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

  private resetFormForCreate() {
    this.form.reset({
      fantasyName: '',
      socialReason: '',
      cnpj: '',
      status: null,
    });
  }
}
