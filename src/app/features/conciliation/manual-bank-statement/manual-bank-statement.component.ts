import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

import { Card } from 'primeng/card';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { InputNumberModule } from 'primeng/inputnumber';

import { I18nService } from '@core/i18n/i18n.service';
import { FlagFacade } from '@features/facade/flag.facade';
import { CompanyFacade } from '@features/facade/company.facade';
import { AcquirerFacade } from '@features/facade/acquirer.facade';
import { ErrorMsgComponent } from '@shared/error-msg/error-msg.component';
import { EstablishmentFacade } from '@features/facade/establishment.facade';
import { BankStatementFacade } from '@features/facade/bank-statement.facade';
import { BankingDomicileFacade } from '@features/facade/banking-domicile.facade';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import {
  ReleaseCategoryEnum,
  releaseCategoryLabel,
  allReleaseCategoryEnum,
} from '@models/enums/release-category.enum';
import {
  ModalityPaymentBankEnum,
  modalityPaymentBankLabel,
  allModalityPaymentBankEnum,
} from '@models/enums/modality-payment-bank.enum';

@Component({
  standalone: true,
  selector: 'cs-manual-bank-statement',
  templateUrl: './manual-bank-statement.component.html',
  imports: [
    FormsModule,
    Card,
    Select,
    Button,
    Divider,
    FloatLabel,
    InputTextModule,
    TranslateModule,
    DatePickerModule,
    InputNumberModule,
    ErrorMsgComponent,
    ReactiveFormsModule,
    PageHeaderComponent,
  ],
})
export class ManualBankStatementComponent implements OnInit {
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(MessageService);

  readonly flagFacade = inject(FlagFacade);
  readonly companyFacade = inject(CompanyFacade);
  readonly acquirerFacade = inject(AcquirerFacade);
  readonly establishmentFacade = inject(EstablishmentFacade);
  readonly bankingDomicileFacade = inject(BankingDomicileFacade);
  private readonly bankStatementFacade = inject(BankStatementFacade);

  readonly saving = signal(false);

  // Campos obrigatórios — FormControls para validação + app-error-msg
  readonly companyIdCtrl = new FormControl<string | null>(null, Validators.required);
  readonly bankingDomicileIdCtrl = new FormControl<string | null>(
    { value: null, disabled: true },
    Validators.required,
  );
  readonly releaseDateCtrl = new FormControl<Date | null>(null, Validators.required);
  readonly acquirerIdCtrl = new FormControl<string | null>(null, Validators.required);
  readonly releaseValueCtrl = new FormControl<number | null>(null, Validators.required);
  readonly releaseCategoryCtrl = new FormControl<ReleaseCategoryEnum | null>(
    null,
    Validators.required,
  );
  readonly modalityPaymentBankCtrl = new FormControl<ModalityPaymentBankEnum | null>(
    null,
    Validators.required,
  );

  readonly form = new FormGroup({
    companyId: this.companyIdCtrl,
    bankingDomicileId: this.bankingDomicileIdCtrl,
    releaseDate: this.releaseDateCtrl,
    releaseValue: this.releaseValueCtrl,
    releaseCategory: this.releaseCategoryCtrl,
    modalityPaymentBank: this.modalityPaymentBankCtrl,
    acquirerId: this.acquirerIdCtrl,
  });

  // Campos opcionais — signals
  readonly description = signal('');
  readonly document = signal('');
  readonly historicalCodeBank = signal<number | null>(null);
  readonly establishmentId = signal<string | null>(null);
  readonly flagId = signal<string | null>(null);

  // Bridge companyId → signal para os computeds que dependem dele
  readonly companyId = toSignal(this.companyIdCtrl.valueChanges, {
    initialValue: null as string | null,
  });

  private readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });
  readonly isFormValid = computed(() => this.formStatus() === 'VALID');

  constructor() {
    this.companyIdCtrl.valueChanges.pipe(takeUntilDestroyed()).subscribe((cId) => {
      this.bankingDomicileIdCtrl.setValue(null, { emitEvent: false });
      this.establishmentId.set(null);
      if (cId) {
        this.bankingDomicileIdCtrl.enable();
      } else {
        this.bankingDomicileIdCtrl.disable();
      }
    });
  }

  readonly filteredDomiciles = computed(() => {
    const cId = this.companyId();
    return this.bankingDomicileFacade.options().filter((d) => !cId || d.company?.id === cId);
  });

  readonly bankingDomicileOptions = computed(() =>
    this.filteredDomiciles().map((d) => ({
      id: d.id,
      label: `${d.bank?.name ?? '—'} · Ag. ${d.agency} / CC. ${d.currentAccount}`,
    })),
  );

  readonly filteredEstablishments = computed(() => {
    const cId = this.companyId();
    return this.establishmentFacade.activeOptions().filter((e) => !cId || e.company?.id === cId);
  });

  readonly releaseCategoryOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allReleaseCategoryEnum().map((value) => ({
      label: releaseCategoryLabel(value, this.i18n),
      value,
    }));
  });

  readonly modalityOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allModalityPaymentBankEnum().map((value) => ({
      label: modalityPaymentBankLabel(value, this.i18n),
      value,
    }));
  });

  ngOnInit(): void {
    this.flagFacade.loadFlagOptionsFilter();
    this.companyFacade.loadCompanyOptionsFilter();
    this.acquirerFacade.loadAcquirerOptionsFilter();
    this.establishmentFacade.loadEstablishmentOptionsFilter();
    this.bankingDomicileFacade.loadBankingDomicileOptionsFilter();
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving()) return;

    const releaseDate = this.releaseDateCtrl.value!;
    const pad = (n: number) => String(n).padStart(2, '0');
    const releaseDateStr = `${releaseDate.getFullYear()}-${pad(releaseDate.getMonth() + 1)}-${pad(releaseDate.getDate())}`;

    this.saving.set(true);
    this.bankStatementFacade
      .createManual({
        companyId: this.companyIdCtrl.value!,
        bankingDomicileId: this.bankingDomicileIdCtrl.value!,
        releaseDate: releaseDateStr,
        releaseValue: this.releaseValueCtrl.value!,
        releaseCategory: this.releaseCategoryCtrl.value!,
        modalityPaymentBank: this.modalityPaymentBankCtrl.value!,
        acquirerId: this.acquirerIdCtrl.value!,
        description: this.description() || null,
        document: this.document() || null,
        historicalCodeBank: this.historicalCodeBank() || null,
        establishmentId: this.establishmentId() || null,
        flagId: this.flagId() || null,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.resetForm();
          this.toast.add({
            severity: 'success',
            summary: this.i18n.tUi('common.success'),
            detail: this.i18n.tUi('conciliation.manualBankStatement.saved'),
          });
        },
        error: () => {
          this.saving.set(false);
          this.toast.add({
            severity: 'error',
            summary: this.i18n.tUi('common.error'),
            detail: this.i18n.tUi('conciliation.manualBankStatement.saveError'),
          });
        },
      });
  }

  private resetForm(): void {
    this.form.reset();
    this.description.set('');
    this.document.set('');
    this.historicalCodeBank.set(null);
    this.establishmentId.set(null);
    this.flagId.set(null);
  }
}
