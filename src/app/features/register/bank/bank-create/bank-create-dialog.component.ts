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

import { I18nService } from '@core/i18n/i18n.service';
import { BankFacade } from '@features/facade/bank.facade';
import { ErrorMsgComponent } from '@shared/error-msg/error-msg.component';
import { BankCreateInput, BankModel, BankUpdateInput } from '@models/bank.models';
import { StatusEnum, allStatusEnum, statusEnumLabel, normalizeStatusEnum } from '@models/enums/status.enum';

@Component({
  standalone: true,
  selector: 'app-bank-create-dialog',
  templateUrl: './bank-create-dialog.component.html',
  imports: [
    CommonModule,
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
export class BankCreateDialogComponent {
  visible = input.required<boolean>();
  bank = input<BankModel | null>(null);

  @Output() saved = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();
  @Output() visibleChange = new EventEmitter<boolean>();

  readonly saving = signal(false);
  readonly i18n = inject(I18nService);
  readonly facade = inject(BankFacade);

  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly lastBoundId = signal<string | null>(null);
  private readonly lastVisibleState = signal(false);

  readonly isEdit = computed(() => !!this.bank()?.id);

  readonly statusOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allStatusEnum().map((value) => ({
      label: statusEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly form = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(10)]],
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    status: [null as StatusEnum | null],
  });

  constructor() {
    effect(() => {
      const visible = this.visible();
      const bank = this.bank();

      const wasVisible = this.lastVisibleState();
      const id = bank?.id ?? null;
      const lastId = this.lastBoundId();

      this.lastVisibleState.set(visible);

      if (!visible) return;

      const justOpened = !wasVisible && visible;
      const changed = id !== lastId;

      if (!justOpened && !changed) return;

      if (!bank) {
        this.resetFormForCreate();
        this.lastBoundId.set(null);
        return;
      }

      this.form.reset({
        code: bank.code ?? '',
        name: bank.name ?? '',
        status: normalizeStatusEnum(bank.status),
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

    const createPayload: BankCreateInput = {
      code: (v.code ?? '').trim(),
      name: (v.name ?? '').trim(),
    };

    const updatePayload: BankUpdateInput = {
      code: (v.code ?? '').trim(),
      name: (v.name ?? '').trim(),
      status: this.isEdit() ? (v.status ?? undefined) : undefined,
    };

    this.saving.set(true);

    const id = this.bank()?.id;
    const req$ = id ? this.facade.update(id, updatePayload) : this.facade.create(createPayload);

    req$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: id
            ? this.i18n.tUi('bank.form.updated')
            : this.i18n.tUi('bank.form.created'),
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
    this.form.reset({ code: '', name: '', status: null });
  }
}
