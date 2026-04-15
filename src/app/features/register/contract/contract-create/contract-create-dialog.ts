import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormGroup,
  FormArray,
  Validators,
  FormBuilder,
  FormControl,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  input,
  inject,
  Output,
  effect,
  signal,
  computed,
  Component,
  DestroyRef,
  EventEmitter,
} from '@angular/core';

import { of } from 'rxjs';
import { TagModule } from 'primeng/tag';
import { catchError } from 'rxjs/operators';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TranslateModule } from '@ngx-translate/core';
import { DatePickerModule } from 'primeng/datepicker';

import { FlagModel } from '@models/flag.models';
import { I18nService } from '@core/i18n/i18n.service';
import { CompanyFacade } from '@features/facade/company.facade';
import { CsDocumentPipe } from '@shared/pipes/cs-document.pipe';
import { AcquirerFacade } from '@features/facade/acquirer.facade';
import { EstablishmentModel } from '@models/establishment.models';
import { ContractFacade } from '@features/facade/contract.facade';
import { FlagApiService } from '@features/service/flag.api.service';
import { ErrorMsgComponent } from '@shared/error-msg/error-msg.component';
import { EstablishmentApiService } from '@features/service/establishment.api.service';
import { allModalityEnum, modalityEnumLabel, ModalityEnum } from '@models/modality.enum';
import {
  ContractModel,
  ContractRateInput,
  ContractFlagInput,
  ContractUpdateInput,
  ContractCreateInput,
} from '@models/contract.models';

import {
  StatusEnum,
  allStatusEnum,
  statusEnumLabel,
  normalizeStatusEnum,
} from '@models/enums/status.enum';

type ContractRateForm = FormGroup<{
  modality: FormControl<ModalityEnum | null>;
  rate: FormControl<number | null>;
  paymentTermDays: FormControl<number | null>;
  rateEcommerce: FormControl<number | null>;
  paymentTermDaysEcommerce: FormControl<number | null>;
}>;

type ContractFlagForm = FormGroup<{
  flagId: FormControl<string | null>;
  contractRates: FormArray<ContractRateForm>;
}>;

type ContractForm = FormGroup<{
  id: FormControl<string | null>;
  description: FormControl<string>;
  companyId: FormControl<string | null>;
  acquirerId: FormControl<string | null>;
  establishmentId: FormControl<string | null>;
  startDate: FormControl<string>;
  endDate: FormControl<string | null>;
  status: FormControl<StatusEnum>;
  contractFlags: FormArray<ContractFlagForm>;
}>;

type ContractFlagFormValue = {
  flagId?: string | null;
  contractRates?: Partial<ContractRateInput>[] | null;
};

@Component({
  standalone: true,
  selector: 'app-contract-create-dialog',
  styleUrl: './contract-create-dialog.scss',
  templateUrl: './contract-create-dialog.html',
  imports: [
    CommonModule,
    TagModule,
    ToastModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    DividerModule,
    CsDocumentPipe,
    InputTextModule,
    TranslateModule,
    DatePickerModule,
    FloatLabelModule,
    ErrorMsgComponent,
    ReactiveFormsModule,
  ],
})
export class ContractCreateDialogComponent {
  readonly visible = input.required<boolean>();
  readonly contract = input<ContractModel | null>(null);

  @Output() readonly saved = new EventEmitter<void>();
  @Output() readonly updated = new EventEmitter<void>();
  @Output() readonly created = new EventEmitter<void>();
  @Output() readonly visibleChange = new EventEmitter<boolean>();

  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly flagApi = inject(FlagApiService);
  private readonly contractFacade = inject(ContractFacade);
  private readonly companyFacade = inject(CompanyFacade);
  private readonly acquirerFacade = inject(AcquirerFacade);
  private readonly establishmentApi = inject(EstablishmentApiService);

  readonly i18n = inject(I18nService);

  readonly saving = signal(false);
  readonly submitted = signal(false);
  readonly loadingContract = signal(false);
  readonly allFlags = signal<FlagModel[]>([]);
  readonly allEstablishments = signal<EstablishmentModel[]>([]);

  private dialogInitialized = false;
  private lastLoadedId: string | null = null;
  private descriptionTouchedByUser = false;
  private patchingDescription = false;
  private suppressCascadeReset = false;

  readonly companyOptions = this.companyFacade.options;
  readonly allAcquirerOptions = this.acquirerFacade.options;
  readonly isEditMode = computed(() => !!this.contract()?.id);

  readonly form: ContractForm = this.fb.group(
    {
      id: this.fb.control<string | null>(null),
      description: this.fb.nonNullable.control('', [Validators.required]),
      companyId: this.fb.control<string | null>(null),
      acquirerId: this.fb.control<string | null>({ value: null, disabled: true }, [
        Validators.required,
      ]),
      establishmentId: this.fb.control<string | null>({ value: null, disabled: true }),
      startDate: this.fb.nonNullable.control('', [Validators.required]),
      endDate: this.fb.control<string | null>(null),
      status: this.fb.nonNullable.control(StatusEnum.ACTIVE),
      contractFlags: this.fb.array<ContractFlagForm>([]),
    },
    {
      validators: [this.dateRangeValidator],
    },
  );

  readonly statusOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allStatusEnum().map((value) => ({
      label: statusEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly modalityOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allModalityEnum().map((value) => ({
      label: modalityEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly selectedCompany = computed(() => {
    const companyId = this.form.controls.companyId.value;
    if (!companyId) return null;
    return this.companyOptions().find((item: any) => item.id === companyId) ?? null;
  });

  readonly selectedAcquirer = computed(() => {
    const acquirerId = this.form.controls.acquirerId.value;
    if (!acquirerId) return null;
    return this.allAcquirerOptions().find((item: any) => item.id === acquirerId) ?? null;
  });

  readonly selectedEstablishment = computed(() => {
    const establishmentId = this.form.controls.establishmentId.value;
    if (!establishmentId) return null;
    return this.establishmentOptions().find((item) => item.id === establishmentId) ?? null;
  });

  readonly acquirerOptions = computed(() => {
    const companyId = this.form.controls.companyId.value;
    if (!companyId) return [];

    return this.allAcquirerOptions().filter((item: any) => {
      const isActive = normalizeStatusEnum(item?.status) === StatusEnum.ACTIVE;

      const linkedCompanyIds = this.extractLinkedIds(item, [
        'companies',
        'companyRelations',
        'acquirerCompanies',
      ]);

      const matchesCompany =
        !linkedCompanyIds.length ||
        linkedCompanyIds.includes(companyId) ||
        item?.company?.id === companyId ||
        item?.companyId === companyId;

      return isActive && matchesCompany;
    });
  });

  readonly establishmentOptions = computed(() => {
    const companyId = this.form.controls.companyId.value;
    const acquirerId = this.form.controls.acquirerId.value;

    if (!companyId || !acquirerId) return [];

    return this.allEstablishments().filter((item) => {
      const companyMatches = item.company?.id === companyId;
      const acquirerMatches = item.acquirer?.id === acquirerId;
      return companyMatches && acquirerMatches;
    });
  });

  readonly flagOptions = computed(() => {
    const companyId = this.form.controls.companyId.value;
    const acquirerId = this.form.controls.acquirerId.value;

    if (!companyId || !acquirerId) return [];

    return this.allFlags().filter((flag: any) => {
      const relationCompanyIds = this.extractLinkedIds(flag, ['companies', 'companyRelations']);
      const relationAcquirerIds = this.extractLinkedIds(flag, ['acquirers', 'acquirerRelations']);

      const matchesCompany =
        !relationCompanyIds.length ||
        relationCompanyIds.includes(companyId) ||
        flag?.company?.id === companyId ||
        flag?.companyId === companyId;

      const matchesAcquirer =
        !relationAcquirerIds.length ||
        relationAcquirerIds.includes(acquirerId) ||
        flag?.acquirer?.id === acquirerId ||
        flag?.acquirerId === acquirerId;

      return matchesCompany && matchesAcquirer;
    });
  });

  constructor() {
    this.companyFacade.loadCompanyOptionsFilter();
    this.acquirerFacade.loadAcquirerOptionsFilter();
    this.loadFlags();
    this.loadEstablishments();

    effect(() => {
      const visible = this.visible();

      if (!visible) {
        this.dialogInitialized = false;
        this.lastLoadedId = null;
        return;
      }

      if (this.dialogInitialized) return;
      this.dialogInitialized = true;

      const row = this.contract();
      if (!row?.id) {
        this.resetFormForCreate();
        return;
      }

      this.loadContractIntoForm(row.id);
    });

    this.form.controls.description.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.patchingDescription) return;
        this.descriptionTouchedByUser = true;
      });

    this.form.controls.companyId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((companyId) => {
        this.handleCompanyChange(companyId);
      });

    this.form.controls.acquirerId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((acquirerId) => {
        this.handleAcquirerChange(acquirerId);
      });

    this.form.controls.establishmentId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.suggestDescription();
      });
  }

  get contractFlags(): FormArray<ContractFlagForm> {
    return this.form.controls.contractFlags;
  }

  onHide(): void {
    this.close();
  }

  close(): void {
    this.dialogInitialized = false;
    this.lastLoadedId = null;
    this.submitted.set(false);
    this.saving.set(false);
    this.loadingContract.set(false);
    this.resetFormForCreate();
    this.visibleChange.emit(false);
  }

  addFlag(): void {
    if (this.form.controls.acquirerId.disabled) return;
    this.contractFlags.push(this.createFlagGroup());
  }

  removeFlag(index: number): void {
    this.contractFlags.removeAt(index);
  }

  addRate(flagIndex: number): void {
    this.ratesAt(flagIndex).push(this.createRateGroup());
  }

  removeRate(flagIndex: number, rateIndex: number): void {
    this.ratesAt(flagIndex).removeAt(rateIndex);
  }

  ratesAt(flagIndex: number): FormArray<ContractRateForm> {
    return this.contractFlags.at(flagIndex).controls.contractRates;
  }

  selectedFlagName(flagId: string | null | undefined): string {
    if (!flagId) return this.i18n.tUi('common.notInformed');
    return (
      this.allFlags().find((item) => item.id === flagId)?.name ??
      this.i18n.tUi('common.notInformed')
    );
  }

  save(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();

    if (this.form.invalid) return;

    const id = this.contract()?.id;
    const payload = this.buildPayload();
    if (!payload) return;

    this.saving.set(true);
    const req$ = id
      ? this.contractFacade.update(id, payload as ContractUpdateInput)
      : this.contractFacade.create(payload as ContractCreateInput);

    req$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        const isEdit = !!id;

        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: isEdit
            ? this.i18n.tUi('contract.form.updated')
            : this.i18n.tUi('contract.form.created'),
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
          detail: this.i18n.tUi('contract.form.saveError'),
        });
      },
    });
  }

  private handleCompanyChange(companyId: string | null): void {
    if (this.suppressCascadeReset) return;

    const acquirerControl = this.form.controls.acquirerId;
    const establishmentControl = this.form.controls.establishmentId;

    if (!companyId) {
      acquirerControl.setValue(null, { emitEvent: false });
      acquirerControl.disable({ emitEvent: false });

      establishmentControl.setValue(null, { emitEvent: false });
      establishmentControl.disable({ emitEvent: false });

      this.setFlagsDisabled(true);
      this.clearFlagSelections();
      this.suggestDescription();
      return;
    }

    acquirerControl.enable({ emitEvent: false });

    const currentAcquirerId = acquirerControl.value;
    const validAcquirer = this.acquirerOptions().some((item: any) => item.id === currentAcquirerId);

    if (!validAcquirer) {
      acquirerControl.setValue(null, { emitEvent: false });
    }

    if (!acquirerControl.value) {
      establishmentControl.setValue(null, { emitEvent: false });
      establishmentControl.disable({ emitEvent: false });
      this.setFlagsDisabled(true);
      this.clearFlagSelections();
    } else {
      establishmentControl.enable({ emitEvent: false });
      this.setFlagsDisabled(false);
    }

    const selectedEstablishment = establishmentControl.value;
    const validEstablishment = this.establishmentOptions().some(
      (item) => item.id === selectedEstablishment,
    );

    if (!validEstablishment) {
      establishmentControl.setValue(null, { emitEvent: false });
    }

    this.removeInvalidFlagSelections();
    this.suggestDescription();
  }

  private handleAcquirerChange(acquirerId: string | null): void {
    if (this.suppressCascadeReset) return;

    const establishmentControl = this.form.controls.establishmentId;

    if (!acquirerId) {
      establishmentControl.setValue(null, { emitEvent: false });
      establishmentControl.disable({ emitEvent: false });
      this.setFlagsDisabled(true);
      this.clearFlagSelections();
      this.suggestDescription();
      return;
    }

    establishmentControl.enable({ emitEvent: false });
    this.setFlagsDisabled(false);

    const selectedEstablishment = establishmentControl.value;
    const validEstablishment = this.establishmentOptions().some(
      (item) => item.id === selectedEstablishment,
    );

    if (!validEstablishment) {
      establishmentControl.setValue(null, { emitEvent: false });
    }

    this.removeInvalidFlagSelections();
    this.suggestDescription();
  }

  private loadFlags(): void {
    this.flagApi
      .searchPaged({ page: 0, size: 300, sort: [{ field: 'name', order: 1 }] })
      .pipe(
        catchError(() => of({ _embedded: { content: [] } })),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res: any) => {
        this.allFlags.set(res?._embedded?.content ?? []);
      });
  }

  private loadEstablishments(): void {
    this.establishmentApi
      .searchPaged({ page: 0, size: 500, sort: [{ field: 'pvNumber', order: 1 }] })
      .pipe(
        catchError(() => of({ _embedded: { content: [] } })),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res: any) => {
        this.allEstablishments.set(res?._embedded?.content ?? []);
      });
  }

  private loadContractIntoForm(id: string): void {
    if (this.lastLoadedId === id) return;

    this.lastLoadedId = id;
    this.loadingContract.set(true);

    this.contractFacade
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (row) => {
          this.descriptionTouchedByUser = true;
          this.suppressCascadeReset = true;

          this.form.reset({
            id: row.id ?? null,
            description: row.description ?? '',
            startDate: this.toInputDate(row.startDate),
            endDate: this.toNullableInputDate(row.endDate),
            companyId: row.company?.id ?? null,
            acquirerId: row.acquirer?.id ?? null,
            establishmentId: row.establishment?.id ?? null,
            status: normalizeStatusEnum(row.status) ?? StatusEnum.ACTIVE,
          });

          if (row.company?.id) {
            this.form.controls.acquirerId.enable({ emitEvent: false });
          } else {
            this.form.controls.acquirerId.disable({ emitEvent: false });
          }

          if (row.company?.id && row.acquirer?.id) {
            this.form.controls.establishmentId.enable({ emitEvent: false });
            this.setFlagsDisabled(false);
          } else {
            this.form.controls.establishmentId.disable({ emitEvent: false });
            this.setFlagsDisabled(true);
          }

          this.contractFlags.clear();

          (row.contractFlags ?? []).forEach((flag) => {
            const flagGroup = this.createFlagGroup(
              {
                flagId: flag.flag?.id ?? null,
                contractRates: (flag.contractRates ?? []).map((rate) => ({
                  modality: rate.modality ?? undefined,
                  rate: rate.rate ?? null,
                  paymentTermDays: rate.paymentTermDays ?? null,
                  rateEcommerce: rate.rateEcommerce ?? null,
                  paymentTermDaysEcommerce: rate.paymentTermDaysEcommerce ?? null,
                })),
              },
              !(row.company?.id && row.acquirer?.id),
            );

            this.contractFlags.push(flagGroup);
          });

          if (!this.contractFlags.length) {
            this.contractFlags.push(
              this.createFlagGroup(undefined, !(row.company?.id && row.acquirer?.id)),
            );
          }

          this.suppressCascadeReset = false;
          this.submitted.set(false);
          this.loadingContract.set(false);
        },
        error: () => {
          this.suppressCascadeReset = false;
          this.loadingContract.set(false);
          this.toast.add({
            severity: 'error',
            summary: this.i18n.tUi('common.error'),
            detail: this.i18n.tUi('contract.form.loadError'),
          });
        },
      });
  }

  private resetFormForCreate(): void {
    this.descriptionTouchedByUser = false;
    this.suppressCascadeReset = true;

    this.form.reset({
      id: null,
      description: '',
      companyId: null,
      acquirerId: null,
      establishmentId: null,
      startDate: '',
      endDate: null,
      status: StatusEnum.ACTIVE,
    });

    this.form.controls.acquirerId.disable({ emitEvent: false });
    this.form.controls.establishmentId.disable({ emitEvent: false });

    this.contractFlags.clear();
    this.contractFlags.push(this.createFlagGroup(undefined, true));

    this.suppressCascadeReset = false;
    this.submitted.set(false);
  }

  private createFlagGroup(
    value?: ContractFlagFormValue,
    disabled = this.form.controls.acquirerId.disabled,
  ): ContractFlagForm {
    return this.fb.group({
      flagId: this.fb.control<string | null>({ value: value?.flagId ?? null, disabled }, [
        Validators.required,
      ]),
      contractRates: this.fb.array<ContractRateForm>(
        (value?.contractRates?.length ? value.contractRates : [undefined]).map((rate) =>
          this.createRateGroup(rate),
        ),
      ),
    });
  }

  private createRateGroup(value?: Partial<ContractRateInput>): ContractRateForm {
    return this.fb.group({
      modality: this.fb.control<ModalityEnum | null>(value?.modality ?? null, [
        Validators.required,
      ]),
      rate: this.fb.control<number | null>(value?.rate ?? null, [Validators.min(0)]),
      paymentTermDays: this.fb.control<number | null>(value?.paymentTermDays ?? null, [
        Validators.min(0),
      ]),
      rateEcommerce: this.fb.control<number | null>(value?.rateEcommerce ?? null, [
        Validators.min(0),
      ]),
      paymentTermDaysEcommerce: this.fb.control<number | null>(
        value?.paymentTermDaysEcommerce ?? null,
        [Validators.min(0)],
      ),
    });
  }

  private setFlagsDisabled(disabled: boolean): void {
    this.contractFlags.controls.forEach((group) => {
      if (disabled) {
        group.controls.flagId.disable({ emitEvent: false });
      } else {
        group.controls.flagId.enable({ emitEvent: false });
      }
    });
  }

  private buildPayload(): ContractCreateInput | ContractUpdateInput | null {
    const value = this.form.getRawValue();

    const contractFlags: ContractFlagInput[] = this.contractFlags.controls
      .map((group) => {
        const raw = group.getRawValue();

        const rates: ContractRateInput[] = (raw.contractRates ?? [])
          .filter((rate): rate is typeof rate & { modality: ModalityEnum } => !!rate.modality)
          .map((rate) => ({
            modality: rate.modality,
            rate: this.numberOrNull(rate.rate),
            paymentTermDays: this.numberOrNull(rate.paymentTermDays),
            rateEcommerce: this.numberOrNull(rate.rateEcommerce),
            paymentTermDaysEcommerce: this.numberOrNull(rate.paymentTermDaysEcommerce),
          }));

        return {
          flagId: raw.flagId,
          contractRates: rates,
        };
      })
      .filter((item): item is ContractFlagInput => !!item.flagId);

    return {
      description: value.description.trim(),
      startDate: value.startDate,
      endDate: value.endDate ?? null,
      companyId: value.companyId ?? null,
      acquirerId: value.acquirerId ?? '',
      establishmentId: value.establishmentId ?? null,
      status: value.status ?? StatusEnum.ACTIVE,
      contractFlags,
    };
  }

  private suggestDescription(): void {
    if (this.descriptionTouchedByUser) return;
    if (this.isEditMode()) return;

    const company = this.selectedCompany();
    const acquirer = this.selectedAcquirer();
    const establishment = this.selectedEstablishment();

    const parts = [
      this.extractFirstName(company?.fantasyName),
      acquirer?.fantasyName?.trim(),
      establishment?.pvNumber?.trim(),
    ].filter((value): value is string => !!value);

    this.patchingDescription = true;
    this.form.controls.description.setValue(parts.join(' ').trim(), { emitEvent: false });
    this.patchingDescription = false;
  }

  private extractFirstName(value?: string | null): string {
    return (value ?? '').trim().split(/\s+/).filter(Boolean)[0] ?? '';
  }

  private clearFlagSelections(): void {
    this.contractFlags.controls.forEach((group) => {
      group.controls.flagId.setValue(null, { emitEvent: false });
    });
  }

  private removeInvalidFlagSelections(): void {
    const validFlagIds = new Set(this.flagOptions().map((item) => item.id));

    this.contractFlags.controls.forEach((group) => {
      const currentFlagId = group.controls.flagId.value;
      if (currentFlagId && !validFlagIds.has(currentFlagId)) {
        group.controls.flagId.setValue(null, { emitEvent: false });
      }
    });
  }

  private extractLinkedIds(source: any, keys: string[]): string[] {
    const ids = new Set<string>();

    for (const key of keys) {
      const value = source?.[key];
      if (!Array.isArray(value)) continue;

      value.forEach((item: any) => {
        if (item?.id) ids.add(item.id);
        if (item?.company?.id) ids.add(item.company.id);
        if (item?.acquirer?.id) ids.add(item.acquirer.id);
        if (item?.companyId) ids.add(item.companyId);
        if (item?.acquirerId) ids.add(item.acquirerId);
      });
    }

    return [...ids];
  }

  private dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;

    if (!startDate || !endDate) return null;
    if (String(endDate) >= String(startDate)) return null;

    return { invalidDateRange: true };
  }

  private toInputDate(value?: string | null): string {
    if (!value) return '';
    return String(value).slice(0, 10);
  }

  private toNullableInputDate(value?: string | null): string | null {
    if (!value) return null;
    return String(value).slice(0, 10);
  }

  private numberOrNull(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  }
}
