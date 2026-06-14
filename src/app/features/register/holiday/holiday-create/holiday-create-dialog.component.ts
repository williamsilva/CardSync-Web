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
import { HolidayFacade } from '@features/facade/holiday.facade';
import { ErrorMsgComponent } from '@shared/error-msg/error-msg.component';
import { HolidayCreateInput, HolidayModel, HolidayUpdateInput } from '@models/holiday.models';
import { StatusEnum, allStatusEnum, statusEnumLabel, normalizeStatusEnum } from '@models/enums/status.enum';

@Component({
  standalone: true,
  selector: 'app-holiday-create-dialog',
  templateUrl: './holiday-create-dialog.component.html',
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
export class HolidayCreateDialogComponent {
  visible = input.required<boolean>();
  holiday = input<HolidayModel | null>(null);

  @Output() saved = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();
  @Output() visibleChange = new EventEmitter<boolean>();

  readonly saving = signal(false);
  readonly i18n = inject(I18nService);
  readonly facade = inject(HolidayFacade);

  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly lastBoundId = signal<string | null>(null);
  private readonly lastVisibleState = signal(false);

  readonly isEdit = computed(() => !!this.holiday()?.id);

  readonly statusOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allStatusEnum().map((value) => ({
      label: statusEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    holidayDate: [null as Date | null, [Validators.required]],
    status: [null as StatusEnum | null],
  });

  constructor() {
    effect(() => {
      const visible = this.visible();
      const holiday = this.holiday();

      const wasVisible = this.lastVisibleState();
      const id = holiday?.id ?? null;
      const lastId = this.lastBoundId();

      this.lastVisibleState.set(visible);

      if (!visible) return;

      const justOpened = !wasVisible && visible;
      const changed = id !== lastId;

      if (!justOpened && !changed) return;

      if (!holiday) {
        this.resetFormForCreate();
        this.lastBoundId.set(null);
        return;
      }

      this.form.reset({
        name: holiday.name ?? '',
        holidayDate: holiday.holidayDate ? new Date(holiday.holidayDate + 'T00:00:00') : null,
        status: normalizeStatusEnum(holiday.status),
      });

      this.lastBoundId.set(id);
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
    const dateVal = v.holidayDate instanceof Date ? v.holidayDate : new Date(v.holidayDate as any);
    const isoDate = `${dateVal.getFullYear()}-${String(dateVal.getMonth() + 1).padStart(2, '0')}-${String(dateVal.getDate()).padStart(2, '0')}`;

    const createPayload: HolidayCreateInput = {
      name: (v.name ?? '').trim(),
      holidayDate: isoDate,
    };

    const updatePayload: HolidayUpdateInput = {
      name: (v.name ?? '').trim(),
      holidayDate: isoDate,
      status: this.isEdit() ? (v.status ?? undefined) : undefined,
    };

    this.saving.set(true);

    const id = this.holiday()?.id;
    const req$ = id ? this.facade.update(id, updatePayload) : this.facade.create(createPayload);

    req$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: id
            ? this.i18n.tUi('holiday.form.updated')
            : this.i18n.tUi('holiday.form.created'),
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
    this.form.reset({ name: '', holidayDate: null, status: null });
  }
}
