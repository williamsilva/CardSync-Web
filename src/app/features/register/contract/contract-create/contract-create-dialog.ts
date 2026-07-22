
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

import { of, forkJoin } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TranslateModule } from '@ngx-translate/core';
import { DatePickerModule } from 'primeng/datepicker';

import { CsTagComponent } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';
import { CompanyFacade } from '@features/facade/company.facade';
import { CsDocumentPipe } from '@shared/pipes/cs-document.pipe';
import { ContractFacade } from '@features/facade/contract.facade';
import { ErrorMsgComponent } from '@shared/error-msg/error-msg.component';
import { ContractLookupFacade } from '@features/facade/contract-lookup.facade';
import {
  ModalityEnum,
  allModalityEnum,
  modalityEnumLabel,
  modalityEnumSeverity,
} from '@models/enums/modality.enum';
import {
  ContractModel,
  ContractRateInput,
  ContractFlagInput,
  ContractUpdateInput,
  ContractCreateInput,
} from '@models/contract.models';

import {
  TypeEstablishmentEnum,
  typeEstablishmentEnumLabel,
  typeEstablishmentEnumSeverity,
} from '@models/enums/type-establishment.enum';
import {
  ContractEnum,
  allContractEnum,
  contractEnumLabel,
  normalizeContractEnum,
} from '@models/enums/contract.enum';

type ContractRateForm = FormGroup<{
  rate: FormControl<number | null>;
  rateEcommerce: FormControl<number | null>;
  modality: FormControl<ModalityEnum | null>;
  paymentTermDays: FormControl<number | null>;
  paymentTermDaysEcommerce: FormControl<number | null>;
}>;

type ContractFlagForm = FormGroup<{
  flagId: FormControl<string | null>;
  contractRates: FormArray<ContractRateForm>;
}>;

type ContractForm = FormGroup<{
  endDate: FormControl<string>;
  id: FormControl<string | null>;
  startDate: FormControl<string>;
  description: FormControl<string>;
  status: FormControl<ContractEnum>;
  companyId: FormControl<string | null>;
  acquirerId: FormControl<string | null>;
  contractFlags: FormArray<ContractFlagForm>;
  establishmentId: FormControl<string | null>;
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
    ToastModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    DividerModule,
    TooltipModule,
    CsDocumentPipe,
    CsTagComponent,
    InputTextModule,
    TranslateModule,
    DatePickerModule,
    FloatLabelModule,
    ErrorMsgComponent,
    ReactiveFormsModule
],
})
export class ContractCreateDialogComponent {
  readonly visible = input.required<boolean>();
  readonly contract = input<ContractModel | null>(null);

  @Output() readonly saved = new EventEmitter<void>();
  @Output() readonly updated = new EventEmitter<void>();
  @Output() readonly created = new EventEmitter<void>();
  @Output() readonly visibleChange = new EventEmitter<boolean>();

  readonly isEditMode = computed(() => !!this.contract()?.id);

  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18nService = inject(I18nService);
  private readonly companyFacade = inject(CompanyFacade);
  private readonly contractFacade = inject(ContractFacade);
  private readonly contractLookupFacade = inject(ContractLookupFacade);

  readonly saving = signal(false);
  readonly i18n = this.i18nService;
  readonly submitted = signal(false);
  readonly loadingContract = signal(false);

  private companyLookupVersion = 0;
  private dialogInitialized = false;
  private dependentLookupVersion = 0;
  private patchingDescription = false;
  private suppressCascadeReset = false;
  private descriptionTouchedByUser = false;
  private lastLoadedId: string | null = null;
  private suppressDescriptionTracking = false;

  private expandedFlagCards = new Set<number>();

  readonly companyOptions = this.companyFacade.options;
  readonly flagOptions = this.contractLookupFacade.flagOptions;
  readonly acquirerOptions = this.contractLookupFacade.acquirerOptions;
  readonly establishmentOptions = this.contractLookupFacade.establishmentOptions;

  readonly newFlagIdControl = new FormControl<string | null>({
    value: null,
    disabled: true,
  });

  readonly form: ContractForm = this.fb.group(
    {
      id: this.fb.control<string | null>(null),
      description: this.fb.nonNullable.control('', [Validators.required]),
      companyId: this.fb.control<string | null>(null, [Validators.required]),
      acquirerId: this.fb.control<string | null>({ value: null, disabled: true }, [
        Validators.required,
      ]),
      establishmentId: this.fb.control<string | null>({ value: null, disabled: true }),
      endDate: this.fb.nonNullable.control('', [Validators.required]),
      startDate: this.fb.nonNullable.control('', [Validators.required]),
      status: this.fb.nonNullable.control(ContractEnum.VALIDITY),
      contractFlags: this.fb.array<ContractFlagForm>([]),
    },
    {
      validators: [this.dateRangeValidator],
    },
  );

  readonly statusOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allContractEnum().map((value) => ({
      label: contractEnumLabel(value, this.i18n),
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
    return this.acquirerOptions().find((item) => item.id === acquirerId) ?? null;
  });

  readonly selectedEstablishment = computed(() => {
    const establishmentId = this.form.controls.establishmentId.value;
    if (!establishmentId) return null;
    return this.establishmentOptions().find((item) => item.id === establishmentId) ?? null;
  });

  constructor() {
    this.companyFacade.loadCompanyOptionsFilter();

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
        if (this.patchingDescription || this.suppressDescriptionTracking) return;
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

  modalityEnumLabel(modality: ModalityEnum | null | undefined) {
    return modalityEnumLabel(modality, this.i18n);
  }

  severityModalityEnum(modality: ModalityEnum | null) {
    return modalityEnumSeverity(modality);
  }

  typeEstablishmentEnumLabel(status: TypeEstablishmentEnum | null) {
    return typeEstablishmentEnumLabel(status, this.i18n);
  }

  severityTypeEstablishmentEnum(status: TypeEstablishmentEnum | null) {
    return typeEstablishmentEnumSeverity(status);
  }

  isFlagCardExpanded(flagIndex: number): boolean {
    return this.expandedFlagCards.has(flagIndex);
  }

  toggleFlagCard(flagIndex: number): void {
    if (this.expandedFlagCards.has(flagIndex)) {
      this.expandedFlagCards.delete(flagIndex);
      return;
    }

    this.expandedFlagCards.add(flagIndex);
  }

  onFlagHeaderSpace(event: Event, flagIndex: number): void {
    event.preventDefault();
    this.toggleFlagCard(flagIndex);
  }

  collapsedRateSummary(flagIndex: number): { visible: string[]; remaining: number } {
    const labels = this.ratesAt(flagIndex)
      .controls.map((group) => this.modalityEnumLabel(group.controls.modality.value))
      .filter((label): label is string => !!label && label.trim().length > 0);

    const uniqueLabels = Array.from(new Set(labels));
    const visible = uniqueLabels.slice(0, 3);

    return {
      visible,
      remaining: Math.max(uniqueLabels.length - visible.length, 0),
    };
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
    this.contractLookupFacade.clearAll();
    this.resetFormForCreate();
    this.visibleChange.emit(false);
  }

  canManageFlags(): boolean {
    const companyId = this.form.controls.companyId.value;
    const acquirerId = this.form.controls.acquirerId.value;
    return !!companyId && !!acquirerId;
  }

  canAddSelectedFlag(): boolean {
    return this.canManageFlags() && !!this.newFlagIdControl.value;
  }

  addSelectedFlag(): void {
    const flagId = this.newFlagIdControl.value;
    if (!flagId || !this.canManageFlags()) return;

    this.contractFlags.push(
      this.createFlagGroup({
        flagId,
        contractRates: [],
      }),
    );

    const newIndex = this.contractFlags.length - 1;
    this.expandedFlagCards.add(newIndex);
    this.newFlagIdControl.setValue(null, { emitEvent: false });
  }

  removeFlag(index: number): void {
    this.contractFlags.removeAt(index);
    this.syncExpandedFlagCards();
  }

  addRate(flagIndex: number): void {
    if (!this.canAddRate(flagIndex)) {
      return;
    }

    this.ratesAt(flagIndex).push(
      this.createRateGroup({
        modality: undefined,
        rate: null,
        paymentTermDays: null,
        rateEcommerce: null,
        paymentTermDaysEcommerce: null,
      }),
    );

    this.expandedFlagCards.add(flagIndex);
  }

  removeRate(flagIndex: number, rateIndex: number): void {
    this.ratesAt(flagIndex).removeAt(rateIndex);
  }

  ratesAt(flagIndex: number): FormArray<ContractRateForm> {
    return this.contractFlags.at(flagIndex).controls.contractRates;
  }

  availableFlags(currentIndex?: number) {
    const selectedFlagIds = this.contractFlags.controls
      .map((group, index) => (index === currentIndex ? null : group.controls.flagId.value))
      .filter((flagId): flagId is string => !!flagId);

    return this.flagOptions().filter((flag) => !selectedFlagIds.includes(flag.id));
  }

  availableModalities(flagIndex: number, currentRateIndex?: number) {
    const selectedModalities = this.ratesAt(flagIndex)
      .controls.map((group, index) =>
        index === currentRateIndex ? null : group.controls.modality.value,
      )
      .filter((modality): modality is ModalityEnum => !!modality);

    return this.availableModalitiesForRates(selectedModalities);
  }

  canAddRate(flagIndex: number): boolean {
    const hasEmptyRate = this.ratesAt(flagIndex).controls.some(
      (group) => !group.controls.modality.value,
    );

    if (hasEmptyRate) {
      return false;
    }

    return this.availableModalities(flagIndex).length > 0;
  }

  selectedFlagName(flagId: string | null | undefined): string {
    if (!flagId) return this.i18n.tUi('common.notInformed');
    return (
      this.flagOptions().find((item) => item.id === flagId)?.name ??
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
      },
    });
  }

  private handleCompanyChange(companyId: string | null): void {
    if (this.suppressCascadeReset) return;

    const acquirerControl = this.form.controls.acquirerId;
    const establishmentControl = this.form.controls.establishmentId;

    this.companyLookupVersion += 1;
    const requestVersion = this.companyLookupVersion;

    acquirerControl.setValue(null, { emitEvent: false });
    establishmentControl.setValue(null, { emitEvent: false });
    acquirerControl.disable({ emitEvent: false });
    establishmentControl.disable({ emitEvent: false });

    this.contractLookupFacade.clearAcquirers();
    this.contractLookupFacade.clearEstablishments();
    this.contractLookupFacade.clearFlags();
    this.contractFlags.clear();

    this.newFlagIdControl.setValue(null, { emitEvent: false });
    this.newFlagIdControl.disable({ emitEvent: false });

    this.expandedFlagCards.clear();
    this.suggestDescription();

    if (!companyId) {
      return;
    }

    this.contractLookupFacade
      .loadAcquirersByCompany(companyId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (requestVersion !== this.companyLookupVersion) return;
          acquirerControl.enable({ emitEvent: false });
        },
        error: () => {
          if (requestVersion !== this.companyLookupVersion) return;
          this.toast.add({
            severity: 'error',
            summary: this.i18n.tUi('common.error'),
            detail: this.i18n.tUi('contract.form.loadError'),
          });
        },
      });
  }

  private handleAcquirerChange(acquirerId: string | null): void {
    if (this.suppressCascadeReset) return;

    const companyId = this.form.controls.companyId.value;
    const establishmentControl = this.form.controls.establishmentId;

    this.dependentLookupVersion += 1;
    const requestVersion = this.dependentLookupVersion;

    establishmentControl.setValue(null, { emitEvent: false });
    establishmentControl.disable({ emitEvent: false });

    this.contractLookupFacade.clearEstablishments();
    this.contractLookupFacade.clearFlags();
    this.contractFlags.clear();

    this.newFlagIdControl.setValue(null, { emitEvent: false });
    this.newFlagIdControl.disable({ emitEvent: false });

    this.expandedFlagCards.clear();
    this.suggestDescription();

    if (!companyId || !acquirerId) {
      return;
    }

    forkJoin({
      establishments: this.contractLookupFacade.loadEstablishments(companyId, acquirerId),
      flags: this.contractLookupFacade.loadFlags(companyId, acquirerId),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (requestVersion !== this.dependentLookupVersion) return;
          establishmentControl.enable({ emitEvent: false });
          this.newFlagIdControl.enable({ emitEvent: false });
        },
        error: () => {
          if (requestVersion !== this.dependentLookupVersion) return;
          this.toast.add({
            severity: 'error',
            summary: this.i18n.tUi('common.error'),
            detail: this.i18n.tUi('contract.form.loadError'),
          });
        },
      });
  }

  private loadContractIntoForm(id: string): void {
    if (this.lastLoadedId === id) return;

    this.lastLoadedId = id;
    this.loadingContract.set(true);
    this.contractLookupFacade.clearAll();

    this.contractFacade
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (row) => {
          const companyId = row.company?.id ?? null;
          const acquirerId = row.acquirer?.id ?? null;

          forkJoin({
            acquirers: companyId
              ? this.contractLookupFacade.loadAcquirersByCompany(companyId)
              : of([]),
            establishments:
              companyId && acquirerId
                ? this.contractLookupFacade.loadEstablishments(companyId, acquirerId)
                : of([]),
            flags:
              companyId && acquirerId
                ? this.contractLookupFacade.loadFlags(companyId, acquirerId)
                : of([]),
          })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                this.suppressCascadeReset = true;
                this.suppressDescriptionTracking = true;

                this.form.reset({
                  id: row.id ?? null,
                  description: row.description ?? '',
                  startDate: this.toInputDate(row.startDate),
                  endDate: this.toInputDate(row.endDate),
                  companyId,
                  acquirerId,
                  establishmentId: row.establishment?.id ?? null,
                  status: normalizeContractEnum(row.status) ?? ContractEnum.VALIDITY,
                });

                this.descriptionTouchedByUser = !!row.description?.trim();

                if (companyId) {
                  this.form.controls.acquirerId.enable({ emitEvent: false });
                } else {
                  this.form.controls.acquirerId.disable({ emitEvent: false });
                }

                if (companyId && acquirerId) {
                  this.form.controls.establishmentId.enable({ emitEvent: false });
                } else {
                  this.form.controls.establishmentId.disable({ emitEvent: false });
                }

                this.contractFlags.clear();

                (row.contractFlags ?? []).forEach((flag) => {
                  const flagGroup = this.createFlagGroup({
                    flagId: flag.flag?.id ?? null,
                    contractRates: (flag.contractRates ?? []).map((rate) => ({
                      modality: rate.modality ?? undefined,
                      rate: rate.rate ?? null,
                      paymentTermDays: rate.paymentTermDays ?? null,
                      rateEcommerce: rate.rateEcommerce ?? null,
                      paymentTermDaysEcommerce: rate.paymentTermDaysEcommerce ?? null,
                    })),
                  });

                  this.contractFlags.push(flagGroup);
                });

                this.syncExpandedFlagCards();
                this.newFlagIdControl.setValue(null, { emitEvent: false });

                this.suppressCascadeReset = false;

                if (!row.description?.trim()) {
                  this.suggestDescription(true);
                }

                this.submitted.set(false);
                this.loadingContract.set(false);
                this.suppressDescriptionTracking = false;
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
    this.suppressCascadeReset = true;
    this.suppressDescriptionTracking = true;
    this.contractLookupFacade.clearAll();

    this.form.reset({
      id: null,
      description: '',
      companyId: null,
      acquirerId: null,
      establishmentId: null,
      startDate: '',
      endDate: '',
      status: ContractEnum.VALIDITY,
    });

    this.descriptionTouchedByUser = false;

    this.form.controls.acquirerId.disable({ emitEvent: false });
    this.form.controls.establishmentId.disable({ emitEvent: false });

    this.contractFlags.clear();
    this.newFlagIdControl.setValue(null, { emitEvent: false });
    this.expandedFlagCards.clear();

    this.suppressDescriptionTracking = false;
    this.suppressCascadeReset = false;
    this.submitted.set(false);
  }

  private createFlagGroup(value?: ContractFlagFormValue): ContractFlagForm {
    const rates: Partial<ContractRateInput>[] = value?.contractRates?.length
      ? value.contractRates
      : [];

    return this.fb.group({
      flagId: this.fb.control<string | null>(value?.flagId ?? null, [Validators.required]),
      contractRates: this.fb.array<ContractRateForm>(
        rates.map((rate) => this.createRateGroup(rate)),
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

  private availableModalitiesForRates(selectedModalities: ModalityEnum[]) {
    return this.modalityOptions().filter((option) => !selectedModalities.includes(option.value));
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
      status: value.status ?? ContractEnum.VALIDITY,
      contractFlags,
    };
  }

  private extractFirstName(value?: string | null): string {
    return (value ?? '').trim().split(/\s+/).filter(Boolean)[0] ?? '';
  }

  private syncExpandedFlagCards(): void {
    const indexes = this.contractFlags.controls.map((_, index) => index);
    this.expandedFlagCards = new Set(indexes);
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

  private numberOrNull(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  }

  private suggestDescription(force = false): void {
    const control = this.form.controls.description;
    const currentValue = (control.value ?? '').trim();

    if (!force && this.descriptionTouchedByUser) return;
    if (!force && this.isEditMode() && currentValue) return;

    const companyId = this.form.controls.companyId.value;
    const acquirerId = this.form.controls.acquirerId.value;
    const establishmentId = this.form.controls.establishmentId.value;

    const company = companyId
      ? (this.companyOptions().find((item) => item.id === companyId) ?? null)
      : null;

    const acquirer = acquirerId
      ? (this.acquirerOptions().find((item) => item.id === acquirerId) ?? null)
      : null;

    const establishment = establishmentId
      ? (this.establishmentOptions().find((item) => item.id === establishmentId) ?? null)
      : null;

    const companyName = this.extractFirstName(
      company?.fantasyName?.trim() || company?.socialReason?.trim() || '',
    );

    const acquirerName = acquirer?.fantasyName?.trim() || acquirer?.socialReason?.trim() || '';
    const pvNumber = establishment?.pvNumber?.trim() || '';

    const parts = [companyName, acquirerName, pvNumber].filter(Boolean);

    this.patchingDescription = true;
    control.setValue(parts.join(' - '), { emitEvent: false });
    this.patchingDescription = false;
  }

  get contractFlags(): FormArray<ContractFlagForm> {
    return this.form.controls.contractFlags;
  }
}
