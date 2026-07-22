
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
import { CompanyFacade } from '@features/facade/company.facade';
import { ErrorMsgComponent } from '@shared/error-msg/error-msg.component';
import { BankingDomicileFacade } from '@features/facade/banking-domicile.facade';
import {
  StatusEnum,
  allStatusEnum,
  statusEnumLabel,
  normalizeStatusEnum,
} from '@models/enums/status.enum';
import {
  BankingDomicileModel,
  BankingDomicileCreateInput,
  BankingDomicileUpdateInput,
} from '@models/banking-domicile.models';

@Component({
  standalone: true,
  selector: 'app-banking-domicile-create-dialog',
  templateUrl: './banking-domicile-create-dialog.component.html',
  imports: [
    DialogModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    TranslateModule,
    FloatLabelModule,
    DatePickerModule,
    ErrorMsgComponent,
    ReactiveFormsModule
],
})
export class BankingDomicileCreateDialogComponent {
  visible = input.required<boolean>();
  bankingDomicile = input<BankingDomicileModel | null>(null);

  @Output() saved = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();
  @Output() visibleChange = new EventEmitter<boolean>();

  readonly saving = signal(false);
  readonly i18n = inject(I18nService);
  readonly bankFacade = inject(BankFacade);
  readonly companyFacade = inject(CompanyFacade);
  readonly facade = inject(BankingDomicileFacade);

  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly lastVisibleState = signal(false);
  private readonly lastBoundId = signal<string | null>(null);

  readonly isEdit = computed(() => !!this.bankingDomicile()?.id);

  readonly bankOptions = computed(() =>
    this.bankFacade.options().map((b) => ({
      label: `${b.code ?? ''} - ${b.name ?? ''}`,
      value: b.id,
    })),
  );

  readonly companyOptions = computed(() =>
    this.companyFacade.options().map((c) => ({
      label: c.fantasyName,
      value: c.id,
    })),
  );

  readonly statusOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allStatusEnum().map((value) => ({
      label: statusEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly expectsFileOptions = computed(() => {
    this.i18n.getAppliedLang();
    return [
      { label: this.i18n.tUi('common.yes'), value: true },
      { label: this.i18n.tUi('common.no'), value: false },
    ];
  });

  readonly form = this.fb.group({
    agency: [null as number | null, [Validators.required, Validators.min(0)]],
    agencyDigit: ['', [Validators.maxLength(5)]],
    currentAccount: [null as number | null, [Validators.required, Validators.min(0)]],
    accountDigit: ['', [Validators.maxLength(20)]],
    accountOpeningDate: [null as Date | null, [Validators.required]],
    accountClosingDate: [null as Date | null],
    expectsFile: [null as boolean | null, [Validators.required]],
    bankId: [null as string | null, [Validators.required]],
    companyId: [null as string | null, [Validators.required]],
    status: [null as StatusEnum | null],
  });

  constructor() {
    this.bankFacade.loadBankOptionsFilter();
    this.companyFacade.loadCompanyOptionsFilter();

    effect(() => {
      const visible = this.visible();
      const domicile = this.bankingDomicile();

      const wasVisible = this.lastVisibleState();
      const id = domicile?.id ?? null;
      const lastId = this.lastBoundId();

      this.lastVisibleState.set(visible);

      if (!visible) return;

      const justOpened = !wasVisible && visible;
      const changed = id !== lastId;

      if (!justOpened && !changed) return;

      if (!domicile) {
        this.resetFormForCreate();
        this.lastBoundId.set(null);
        return;
      }

      this.form.reset({
        agency: domicile.agency,
        agencyDigit: domicile.agencyDigit ?? '',
        currentAccount: domicile.currentAccount,
        accountDigit: domicile.accountDigit ?? '',
        accountOpeningDate: domicile.accountOpeningDate
          ? new Date(domicile.accountOpeningDate + 'T00:00:00')
          : null,
        accountClosingDate: domicile.accountClosingDate
          ? new Date(domicile.accountClosingDate + 'T00:00:00')
          : null,
        expectsFile: domicile.expectsFile,
        bankId: domicile.bank?.id ?? domicile.bankId ?? null,
        companyId: domicile.company?.id ?? null,
        status: normalizeStatusEnum(domicile.status),
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

    const toIsoDate = (d: Date | null) => {
      if (!d) return '';
      const dt = d instanceof Date ? d : new Date(d);
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    };

    const createPayload: BankingDomicileCreateInput = {
      agency: v.agency as number,
      agencyDigit: v.agencyDigit?.trim() || undefined,
      currentAccount: v.currentAccount as number,
      accountDigit: v.accountDigit?.trim() || undefined,
      accountOpeningDate: toIsoDate(v.accountOpeningDate),
      accountClosingDate: toIsoDate(v.accountClosingDate) || undefined,
      expectsFile: v.expectsFile as boolean,
      bankId: v.bankId as string,
      companyId: v.companyId as string,
    };

    const updatePayload: BankingDomicileUpdateInput = {
      agency: v.agency ?? undefined,
      agencyDigit: v.agencyDigit?.trim() || undefined,
      currentAccount: v.currentAccount ?? undefined,
      accountDigit: v.accountDigit?.trim() || undefined,
      accountOpeningDate: toIsoDate(v.accountOpeningDate) || undefined,
      accountClosingDate: toIsoDate(v.accountClosingDate) || undefined,
      expectsFile: v.expectsFile ?? undefined,
      bankId: v.bankId ?? undefined,
      companyId: v.companyId ?? undefined,
      status: this.isEdit() ? (v.status ?? undefined) : undefined,
    };

    this.saving.set(true);

    const id = this.bankingDomicile()?.id;
    const req$ = id ? this.facade.update(id, updatePayload) : this.facade.create(createPayload);

    req$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: id
            ? this.i18n.tUi('bankingDomicile.form.updated')
            : this.i18n.tUi('bankingDomicile.form.created'),
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
      agency: null,
      agencyDigit: '',
      currentAccount: null,
      accountDigit: '',
      accountOpeningDate: null,
      accountClosingDate: null,
      expectsFile: null,
      bankId: null,
      companyId: null,
      status: null,
    });
  }
}
