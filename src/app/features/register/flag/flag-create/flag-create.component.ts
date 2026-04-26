import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TranslateModule } from '@ngx-translate/core';

import { I18nService } from '@core/i18n/i18n.service';
import { FlagFacade } from '@features/facade/flag.facade';
import { ErrorMsgComponent } from '@shared/error-msg/error-msg.component';
import { FlagCreateInput, FlagModel, FlagUpdateInput } from '@models/flag.models';
import {
  StatusEnum,
  allStatusEnum,
  statusEnumLabel,
  normalizeStatusEnum,
} from '@models/enums/status.enum';

@Component({
  standalone: true,
  selector: 'app-flag-create-dialog',
  templateUrl: './flag-create.component.html',
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
  ],
})
export class FlagCreateDialogComponent {
  visible = input.required<boolean>();
  flag = input<FlagModel | null>(null);

  @Output() saved = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();
  @Output() visibleChange = new EventEmitter<boolean>();

  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly i18n = inject(I18nService);
  readonly facade = inject(FlagFacade);

  readonly saving = signal(false);
  readonly submitted = signal(false);
  readonly loadingFlag = signal(false);
  readonly isEditMode = computed(() => !!this.flag());

  private dialogInitialized = false;
  private lastLoadedId: string | null = null;

  readonly statusOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allStatusEnum().map((value) => ({
      label: statusEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly form = this.fb.group({
    erpCode: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(999),
    ]),
    name: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100),
    ]),
    status: this.fb.control<StatusEnum | null>(StatusEnum.ACTIVE, [Validators.required]),
  });

  constructor() {
    effect(() => {
      const visible = this.visible();

      if (!visible) {
        this.dialogInitialized = false;
        this.lastLoadedId = null;
        return;
      }

      if (this.dialogInitialized) return;
      this.dialogInitialized = true;

      const row = this.flag();

      if (!row) {
        this.resetFormForCreate();
        return;
      }

      this.loadFlagIntoForm(row);
    });

    effect(() => {
      if (!this.visible()) return;

      const row = this.flag();
      if (!row?.id) return;
      if (this.lastLoadedId === row.id) return;

      this.loadFlagIntoForm(row);
    });
  }

  onHide() {
    this.close();
  }

  close() {
    this.dialogInitialized = false;
    this.lastLoadedId = null;
    this.submitted.set(false);
    this.saving.set(false);
    this.loadingFlag.set(false);
    this.resetFormForCreate();
    this.visibleChange.emit(false);
  }

  save() {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();

    if (this.form.invalid) return;

    const id = this.flag()?.id;
    const v = this.form.getRawValue();

    const createPayload: FlagCreateInput = {
      name: (v.name ?? '').trim(),
      status: v.status ?? undefined,
      erpCode: v.erpCode === null || v.erpCode === undefined ? undefined : Number(v.erpCode),
    };

    const updatePayload: FlagUpdateInput = {
      name: (v.name ?? '').trim(),
      status: v.status ?? undefined,
      erpCode: v.erpCode === null || v.erpCode === undefined ? undefined : Number(v.erpCode),
    };

    this.saving.set(true);

    const req$ = id ? this.facade.update(id, updatePayload) : this.facade.create(createPayload);

    req$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);

        const isEdit = !!id;
        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: isEdit ? this.i18n.tUi('flag.form.updated') : this.i18n.tUi('flag.form.created'),
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

  private loadFlagIntoForm(row: FlagModel) {
    this.lastLoadedId = row.id;
    this.loadingFlag.set(true);

    this.form.reset({
      name: row.name ?? '',
      erpCode: row.erpCode ?? null,
      status: normalizeStatusEnum(row.status),
    });

    this.submitted.set(false);
    this.loadingFlag.set(false);
  }

  private resetFormForCreate() {
    this.form.reset({
      name: '',
      erpCode: null,
      status: StatusEnum.ACTIVE,
    });
    this.submitted.set(false);
  }
}
