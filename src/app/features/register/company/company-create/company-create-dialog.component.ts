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
import { CompanyFacade } from '@features/facade/company.facade';
import { cpfCnpjValidator } from '@shared/validators/cpf-cnpj.validator';
import { ErrorMsgComponent } from '@shared/error-msg/error-msg.component';
import { CpfCnpjMaskDirective } from '@shared/directives/cpf-cnpj-mask.directive';
import {
  StatusEnum,
  allStatusEnum,
  statusEnumLabel,
  normalizeStatusEnum,
} from '@models/enums/status.enum';
import { CompanyCreateInput, CompanyModel, CompanyUpdateInput } from '@models/company.models';
import {
  TypeCompanyEnum,
  allTypeCompanyEnum,
  typeCompanyEnumLabel,
  normalizeTypeCompanyEnum,
} from '@models/enums/type-company.enum';

@Component({
  standalone: true,
  selector: 'app-company-create-dialog',
  styleUrl: './company-create-dialog.component.scss',
  templateUrl: './company-create-dialog.component.html',
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
export class CompanyCreateDialogComponent {
  visible = input.required<boolean>();
  company = input<CompanyModel | null>(null);

  @Output() saved = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();
  @Output() visibleChange = new EventEmitter<boolean>();

  readonly saving = signal(false);
  readonly i18n = inject(I18nService);
  readonly facade = inject(CompanyFacade);
  readonly loadingCompany = signal(false);

  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly lastBoundCompanyId = signal<string | null>(null);
  private readonly lastVisibleState = signal(false);

  readonly isEdit = computed(() => !!this.company()?.id);

  readonly typeOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allTypeCompanyEnum().map((value) => ({
      label: typeCompanyEnumLabel(value, this.i18n),
      value,
    }));
  });

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
    type: [null as TypeCompanyEnum | null, [Validators.required]],
    status: [null as StatusEnum | null],
  });

  constructor() {
    effect(() => {
      const visible = this.visible();
      const company = this.company();

      const wasVisible = this.lastVisibleState();
      const companyId = company?.id ?? null;
      const lastCompanyId = this.lastBoundCompanyId();

      this.lastVisibleState.set(visible);

      if (!visible) {
        return;
      }

      const justOpened = !wasVisible && visible;
      const companyChanged = companyId !== lastCompanyId;

      if (!justOpened && !companyChanged) {
        return;
      }

      this.loadingCompany.set(true);

      if (!company) {
        this.resetFormForCreate();
        this.lastBoundCompanyId.set(null);
        this.loadingCompany.set(false);
        return;
      }

      const digitsDoc = String(company.cnpj ?? '').replace(/\D+/g, '');

      this.form.reset({
        fantasyName: company.fantasyName ?? '',
        socialReason: company.socialReason ?? '',
        cnpj: digitsDoc,
        type: normalizeTypeCompanyEnum(company.type),
        status: normalizeStatusEnum(company.status),
      });

      this.lastBoundCompanyId.set(companyId);
      this.loadingCompany.set(false);
    });
  }

  onHide() {
    this.close();
  }

  close() {
    this.saving.set(false);
    this.loadingCompany.set(false);
    this.lastBoundCompanyId.set(null);
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

    const createPayload: CompanyCreateInput = {
      fantasyName: (v.fantasyName ?? '').trim(),
      socialReason: (v.socialReason ?? '').trim(),
      cnpj: String(v.cnpj ?? '').replace(/\D+/g, ''),
      type: v.type as TypeCompanyEnum,
    };

    const updatePayload: CompanyUpdateInput = {
      fantasyName: (v.fantasyName ?? '').trim(),
      socialReason: (v.socialReason ?? '').trim(),
      cnpj: String(v.cnpj ?? '').replace(/\D+/g, ''),
      type: v.type ?? undefined,
      status: this.isEdit() ? (v.status ?? undefined) : undefined,
    };

    this.saving.set(true);

    const id = this.company()?.id;
    const req$ = id ? this.facade.update(id, updatePayload) : this.facade.create(createPayload);

    req$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);

        const isEdit = !!id;
        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: isEdit
            ? this.i18n.tUi('company.form.updated')
            : this.i18n.tUi('company.form.created'),
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
          detail: this.i18n.tUi('company.form.saveError'),
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
      type: null,
      status: null,
    });
  }
}
