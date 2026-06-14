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

import { I18nService } from '@core/i18n/i18n.service';
import { BankFacade } from '@features/facade/bank.facade';
import { AcquirerFacade } from '@features/facade/acquirer.facade';
import { NoFileDayFacade } from '@features/facade/no-file-day.facade';
import { ErrorMsgComponent } from '@shared/error-msg/error-msg.component';
import { FileGroupEnum, allFileGroupEnum, fileGroupEnumLabel } from '@models/enums/file-group.enum';
import {
  StatusEnum,
  allStatusEnum,
  statusEnumLabel,
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
  readonly bankFacade = inject(BankFacade);
  readonly acquirerFacade = inject(AcquirerFacade);

  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly lastBoundId = signal<string | null>(null);
  private readonly lastVisibleState = signal(false);

  readonly isEdit = computed(() => !!this.noFileDay()?.id);

  private readonly _fileGroupValue = signal<FileGroupEnum | null>(null);
  readonly showBankField = computed(() => this._fileGroupValue() === FileGroupEnum.BANK);
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

  readonly bankOptions = computed(() =>
    this.bankFacade.options().map((b) => ({
      label: `${b.code ?? ''} - ${b.name ?? ''}`.trim().replace(/^-\s*/, ''),
      value: b.id,
    })),
  );

  readonly acquirerOptions = computed(() =>
    this.acquirerFacade.options().map((a) => ({
      label: a.fantasyName ?? a.socialReason ?? a.cnpj,
      value: a.id,
    })),
  );

  readonly form = this.fb.group({
    description: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
    noFileDate: [null as Date | null, [Validators.required]],
    fileGroup: [null as FileGroupEnum | null, [Validators.required]],
    dayType: [null as NoFileDayTypeEnum | null, [Validators.required]],
    bankId: [null as string | null],
    acquirerId: [null as string | null],
    status: [null as StatusEnum | null],
  });

  constructor() {
    this.bankFacade.loadBankOptionsFilter();
    this.acquirerFacade.loadAcquirerOptionsFilter();

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
        bankId: noFileDay.bank?.id ?? null,
        acquirerId: noFileDay.acquirer?.id ?? null,
        status: normalizeStatusEnum(noFileDay.status),
      });

      this.lastBoundId.set(id);
    });

    this.form.controls.fileGroup.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this._fileGroupValue.set(value);
        if (value !== FileGroupEnum.BANK) {
          this.form.controls.bankId.setValue(null, { emitEvent: false });
        }
        if (value !== FileGroupEnum.ADQ) {
          this.form.controls.acquirerId.setValue(null, { emitEvent: false });
        }
      });
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
      bankId: v.bankId ?? undefined,
      acquirerId: v.acquirerId ?? undefined,
    };

    const updatePayload: NoFileDayUpdateInput = {
      description: (v.description ?? '').trim(),
      noFileDate: isoDate,
      fileGroup: v.fileGroup ?? undefined,
      dayType: v.dayType ?? undefined,
      bankId: v.bankId ?? undefined,
      acquirerId: v.acquirerId ?? undefined,
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
    this.form.reset({
      description: '',
      noFileDate: null,
      fileGroup: null,
      dayType: null,
      bankId: null,
      acquirerId: null,
      status: null,
    });
  }
}
