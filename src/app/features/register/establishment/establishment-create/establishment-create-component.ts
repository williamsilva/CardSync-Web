import { CommonModule } from '@angular/common';
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
import { TranslateModule } from '@ngx-translate/core';

import { I18nService } from '@core/i18n/i18n.service';
import { CompanyFacade } from '@features/facade/company.facade';
import { CsDocumentPipe } from '@shared/pipes/cs-document.pipe';
import { AcquirerFacade } from '@features/facade/acquirer.facade';
import { ErrorMsgComponent } from '@shared/error-msg/error-msg.component';
import { EstablishmentFacade } from '@features/facade/establishment.facade';
import {
  EstablishmentModel,
  EstablishmentCreateInput,
  EstablishmentUpdateInput,
} from '@models/establishment.models';
import {
  StatusEnum,
  allStatusEnum,
  statusEnumLabel,
  normalizeStatusEnum,
} from '@models/enums/status.enum';
import {
  TypeEstablishmentEnum,
  allTypeEstablishmentEnum,
  typeEstablishmentEnumLabel,
  normalizeTypeEstablishmentEnum,
} from '@models/enums/type-establishment.enum';

@Component({
  standalone: true,
  selector: 'app-establishment-create-dialog',
  templateUrl: './establishment-create-component.html',
  imports: [
    CommonModule,
    ToastModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    CsDocumentPipe,
    InputTextModule,
    TranslateModule,
    FloatLabelModule,
    ErrorMsgComponent,
    ReactiveFormsModule,
  ],
})
export class EstablishmentCreateDialogComponent {
  visible = input.required<boolean>();
  establishment = input<EstablishmentModel | null>(null);

  @Output() saved = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();
  @Output() visibleChange = new EventEmitter<boolean>();

  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly i18n = inject(I18nService);
  readonly companyFacade = inject(CompanyFacade);
  readonly acquirerFacade = inject(AcquirerFacade);
  readonly establishmentFacade = inject(EstablishmentFacade);

  readonly loadedEstablishment = signal<EstablishmentModel | null>(null);
  readonly isEditMode = computed(() => !!this.establishment());

  readonly saving = signal(false);
  readonly submitted = signal(false);
  readonly loadingEstablishment = signal(false);

  readonly companyOptions = this.companyFacade.options;
  readonly acquirerOptions = this.acquirerFacade.options;

  private dialogInitialized = false;
  private lastLoadedId: string | null = null;

  readonly statusOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allStatusEnum().map((value) => ({
      label: statusEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly typeEstablishmentOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allTypeEstablishmentEnum().map((value) => ({
      label: typeEstablishmentEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly form = this.fb.group({
    status: this.fb.control<StatusEnum | null>(null, [Validators.required]),
    type: this.fb.control<TypeEstablishmentEnum | null>(null, [Validators.required]),
    pvNumber: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(20),
    ]),
    company: this.fb.control<string | null>(null, [Validators.required]),
    acquirer: this.fb.control<string | null>(null, [Validators.required]),
  });

  constructor() {
    this.companyFacade.loadCompanyOptionsFilter();
    this.acquirerFacade.loadAcquirerOptionsFilter();

    effect(() => {
      const visible = this.visible();

      if (!visible) {
        this.dialogInitialized = false;
        this.lastLoadedId = null;
        return;
      }

      if (this.dialogInitialized) return;
      this.dialogInitialized = true;

      const establishment = this.establishment();

      if (!establishment) {
        this.resetFormForCreate();
        return;
      }

      this.loadEstablishmentIntoForm(establishment);
    });

    effect(() => {
      if (!this.visible()) return;

      const establishment = this.establishment();
      if (!establishment?.id) return;

      if (this.lastLoadedId === establishment.id) return;

      this.loadEstablishmentIntoForm(establishment);
    });
  }

  onHide() {
    this.close();
  }

  close() {
    this.dialogInitialized = false;
    this.lastLoadedId = null;
    this.loadedEstablishment.set(null);
    this.submitted.set(false);
    this.saving.set(false);
    this.loadingEstablishment.set(false);
    this.resetFormForCreate();
    this.visibleChange.emit(false);
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

    const id = this.establishment()?.id;

    const createPayload: EstablishmentCreateInput = {
      pvNumber: String(v.pvNumber ?? '').replace(/\D+/g, ''),
      companyId: v.company ?? undefined,
      acquirerId: v.acquirer ?? undefined,
      status: v.status ?? undefined,
      type: v.type ?? undefined,
    };

    const updatePayload: EstablishmentUpdateInput = {
      pvNumber: String(v.pvNumber ?? '').replace(/\D+/g, ''),
      companyId: v.company ?? undefined,
      acquirerId: v.acquirer ?? undefined,
      status: v.status ?? undefined,
      type: v.type ?? undefined,
    };

    this.saving.set(true);

    const req$ = id
      ? this.establishmentFacade.update(id, updatePayload)
      : this.establishmentFacade.create(createPayload);

    req$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);

        const isEdit = !!id;
        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: isEdit
            ? this.i18n.tUi('establishment.form.updated')
            : this.i18n.tUi('establishment.form.created'),
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
          detail: this.i18n.tUi('establishment.form.saveError'),
        });
      },
    });
  }

  private loadEstablishmentIntoForm(establishment: EstablishmentModel) {
    this.lastLoadedId = establishment.id;
    this.loadedEstablishment.set(establishment);
    this.loadingEstablishment.set(true);

    const digitsDoc = String(establishment.pvNumber ?? '').replace(/\D+/g, '');

    this.form.reset({
      pvNumber: digitsDoc,
      company: establishment.company?.id ?? null,
      acquirer: establishment.acquirer?.id ?? null,
      status: normalizeStatusEnum(establishment.status),
      type: normalizeTypeEstablishmentEnum(establishment.type),
    });

    this.submitted.set(false);
    this.loadingEstablishment.set(false);
  }

  private resetFormForCreate() {
    this.loadedEstablishment.set(null);
    this.form.reset({
      pvNumber: '',
      company: null,
      acquirer: null,
      status: null,
      type: null,
    });
    this.submitted.set(false);
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
