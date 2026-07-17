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

import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DatePickerModule } from 'primeng/datepicker';

import { CsTagComponent, CsTagTone } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';
import { AcquirerFacade } from '@features/facade/acquirer.facade';
import { NoFileDayFacade } from '@features/facade/no-file-day.facade';
import { ErrorMsgComponent } from '@shared/error-msg/error-msg.component';
import { BankingDomicileFacade } from '@features/facade/banking-domicile.facade';
import { FileGroupEnum, allFileGroupEnum, fileGroupEnumLabel } from '@models/enums/file-group.enum';
import {
  AcquirerFileTypeEnum,
  allAcquirerFileTypeEnum,
  acquirerFileTypeEnumLabel,
} from '@models/enums/acquirer-file-type.enum';
import {
  StatusEnum,
  allStatusEnum,
  statusEnumLabel,
  statusEnumSeverity,
  normalizeStatusEnum,
} from '@models/enums/status.enum';
import {
  NoFileDayTypeEnum,
  allNoFileDayTypeEnum,
  noFileDayTypeEnumLabel,
} from '@models/enums/no-file-day-type.enum';
import {
  NoFileDayModel,
  NoFileDayCreateInput,
  NoFileDayUpdateInput,
} from '@models/no-file-day.models';

@Component({
  standalone: true,
  selector: 'app-no-file-day-create-dialog',
  templateUrl: './no-file-day-create-dialog.component.html',
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    CsTagComponent,
    InputTextModule,
    TranslateModule,
    FloatLabelModule,
    DatePickerModule,
    ErrorMsgComponent,
    ReactiveFormsModule,
  ],
})
export class NoFileDayCreateDialogComponent {
  visible = input.required<boolean>();
  noFileDay = input<NoFileDayModel | null>(null);

  @Output() saved = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();
  @Output() visibleChange = new EventEmitter<boolean>();

  readonly saving = signal(false);
  readonly i18n = inject(I18nService);
  readonly facade = inject(NoFileDayFacade);
  readonly acquirerFacade = inject(AcquirerFacade);
  readonly bankingDomicileFacade = inject(BankingDomicileFacade);

  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly lastBoundId = signal<string | null>(null);
  private readonly lastVisibleState = signal(false);

  readonly isEdit = computed(() => !!this.noFileDay()?.id);

  private readonly _fileGroupValue = signal<FileGroupEnum | null>(null);
  readonly showBankingDomicileField = computed(() => this._fileGroupValue() === FileGroupEnum.BANK);
  readonly showAcquirerField = computed(() => this._fileGroupValue() === FileGroupEnum.ADQ);

  readonly statusOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allStatusEnum().map((value) => ({
      label: statusEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly fileGroupOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allFileGroupEnum().map((value) => ({
      label: fileGroupEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly dayTypeOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allNoFileDayTypeEnum().map((value) => ({
      label: noFileDayTypeEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly bankingDomicileOptions = computed(() =>
    this.bankingDomicileFacade.options().map((d) => {
      const agency = `${d.agency}${d.agencyDigit ? '-' + d.agencyDigit : ''}`;
      const account = `${d.currentAccount}${d.accountDigit ? '-' + d.accountDigit : ''}`;
      const company = d.company?.fantasyName ?? '';
      return {
        label: `Ag. ${agency} / Cc. ${account}${company ? ' - ' + company : ''}`,
        value: d.id,
        bankName: d.bank?.name ?? '—',
        agencyAccount: `Ag. ${agency} / Cc. ${account}`,
        companyName: company || null,
        status: d.status,
      };
    }),
  );

  readonly acquirerOptions = computed(() =>
    this.acquirerFacade.activeOptions().map((a) => ({
      label: a.fantasyName ?? a.socialReason ?? a.cnpj,
      value: a.id,
    })),
  );

  readonly acquirerFileTypeOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allAcquirerFileTypeEnum().map((value) => ({
      label: acquirerFileTypeEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly form = this.fb.group({
    description: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
    noFileDate: [null as Date | null, [Validators.required]],
    fileGroup: [null as FileGroupEnum | null, [Validators.required]],
    dayType: [null as NoFileDayTypeEnum | null, [Validators.required]],
    bankingDomicileId: [null as string | null],
    acquirerId: [null as string | null],
    acquirerFileType: [null as AcquirerFileTypeEnum | null],
    status: [null as StatusEnum | null],
  });

  constructor() {
    this.acquirerFacade.loadAcquirerOptionsFilter();
    this.bankingDomicileFacade.loadBankingDomicileOptionsFilter();

    effect(() => {
      const visible = this.visible();
      const noFileDay = this.noFileDay();

      const wasVisible = this.lastVisibleState();
      const id = noFileDay?.id ?? null;
      const lastId = this.lastBoundId();

      this.lastVisibleState.set(visible);

      if (!visible) return;

      const justOpened = !wasVisible && visible;
      const changed = id !== lastId;

      if (!justOpened && !changed) return;

      if (!noFileDay) {
        this.resetFormForCreate();
        this.lastBoundId.set(null);
        return;
      }

      this.form.reset({
        description: noFileDay.description ?? '',
        noFileDate: noFileDay.noFileDate ? new Date(noFileDay.noFileDate + 'T00:00:00') : null,
        fileGroup: noFileDay.fileGroup ?? null,
        dayType: noFileDay.dayType ?? null,
        bankingDomicileId: noFileDay.bankingDomicile?.id ?? null,
        acquirerId: noFileDay.acquirer?.id ?? null,
        acquirerFileType: noFileDay.acquirerFileType ?? null,
        status: normalizeStatusEnum(noFileDay.status),
      });

      this._fileGroupValue.set(noFileDay.fileGroup ?? null);
      this.applyConditionalValidators(noFileDay.fileGroup ?? null);
      this.lastBoundId.set(id);
    });

    this.form.controls.fileGroup.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this._fileGroupValue.set(value);
        this.applyConditionalValidators(value);
        if (value !== FileGroupEnum.BANK) {
          this.form.controls.bankingDomicileId.setValue(null, { emitEvent: false });
        }
        if (value !== FileGroupEnum.ADQ) {
          this.form.controls.acquirerId.setValue(null, { emitEvent: false });
          this.form.controls.acquirerFileType.setValue(null, { emitEvent: false });
        }
      });
  }

  private applyConditionalValidators(group: FileGroupEnum | null): void {
    const { bankingDomicileId, acquirerId, acquirerFileType } = this.form.controls;

    if (group === FileGroupEnum.BANK) {
      bankingDomicileId.setValidators([Validators.required]);
      acquirerId.clearValidators();
      acquirerFileType.clearValidators();
    } else if (group === FileGroupEnum.ADQ) {
      bankingDomicileId.clearValidators();
      acquirerId.setValidators([Validators.required]);
      acquirerFileType.setValidators([Validators.required]);
    } else {
      bankingDomicileId.clearValidators();
      acquirerId.clearValidators();
      acquirerFileType.clearValidators();
    }

    bankingDomicileId.updateValueAndValidity({ emitEvent: false });
    acquirerId.updateValueAndValidity({ emitEvent: false });
    acquirerFileType.updateValueAndValidity({ emitEvent: false });
  }

  protected statusEnumLabel(value: StatusEnum | null | undefined): string {
    return statusEnumLabel(value ?? null, this.i18n);
  }

  protected statusEnumSeverity(value: StatusEnum | null | undefined): CsTagTone {
    return statusEnumSeverity(value ?? null);
  }

  onHide() {
    this.close();
  }

  close() {
    this.saving.set(false);
    this.lastBoundId.set(null);
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

    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    const dateVal = v.noFileDate instanceof Date ? v.noFileDate : new Date(v.noFileDate as any);
    const isoDate = `${dateVal.getFullYear()}-${String(dateVal.getMonth() + 1).padStart(2, '0')}-${String(dateVal.getDate()).padStart(2, '0')}`;

    const createPayload: NoFileDayCreateInput = {
      description: (v.description ?? '').trim(),
      noFileDate: isoDate,
      fileGroup: v.fileGroup!,
      dayType: v.dayType!,
      bankingDomicileId: v.bankingDomicileId ?? undefined,
      acquirerId: v.acquirerId ?? undefined,
      acquirerFileType: v.acquirerFileType ?? undefined,
    };

    const updatePayload: NoFileDayUpdateInput = {
      description: (v.description ?? '').trim(),
      noFileDate: isoDate,
      fileGroup: v.fileGroup ?? undefined,
      dayType: v.dayType ?? undefined,
      bankingDomicileId: v.bankingDomicileId ?? undefined,
      acquirerId: v.acquirerId ?? undefined,
      acquirerFileType: v.acquirerFileType ?? undefined,
      status: this.isEdit() ? (v.status ?? undefined) : undefined,
    };

    this.saving.set(true);

    const id = this.noFileDay()?.id;
    const req$ = id ? this.facade.update(id, updatePayload) : this.facade.create(createPayload);

    req$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: id
            ? this.i18n.tUi('noFileDay.form.updated')
            : this.i18n.tUi('noFileDay.form.created'),
        });

        if (id) this.updated.emit();
        else this.created.emit();

        this.saved.emit();
        this.close();
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }

  private resetFormForCreate() {
    this.applyConditionalValidators(null);
    this.form.reset({
      description: '',
      noFileDate: null,
      fileGroup: null,
      dayType: null,
      bankingDomicileId: null,
      acquirerId: null,
      acquirerFileType: null,
      status: null,
    });
    this._fileGroupValue.set(null);
  }
}
