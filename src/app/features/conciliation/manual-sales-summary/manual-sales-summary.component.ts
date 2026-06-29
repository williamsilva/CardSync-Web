import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { forkJoin, from, of, Observable } from 'rxjs';
import { concatMap, toArray, catchError, switchMap } from 'rxjs/operators';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';

import { I18nService } from '@core/i18n/i18n.service';
import { AcquirerApiService } from '@features/service/acquirer.api.service';
import { CompanyApiService } from '@features/service/company.api.service';
import { EstablishmentApiService } from '@features/service/establishment.api.service';
import { FlagApiService } from '@features/service/flag.api.service';
import { FlagMinimalModel } from '@features/models/flag-minimal.models';
import { SaleSummaryApiService } from '@features/service/sales-summary.api.service';
import { CreditOrderApiService } from '@features/service/credit-order.api.service';
import { CreditOrderManualResult } from '@features/models/credit-order.model';
import { SalesSummaryManualTransactionInput } from '@features/models/sales-summary.model';
import { AcquirerMinimalModel } from '@features/models/acquirer-minimal.models';
import { CompanyMinimalModel } from '@features/models/company-minimal.models';
import { EstablishmentMinimalModel } from '@features/models/establishment-minimal.models';
import { isActive } from '@features/models/enums/status.enum';
import { ModalityEnum, modalityEnumLabel, STATUS_CODE_MAP } from '@features/models/enums/modality.enum';

interface SelectOption<T = string> {
  value: T;
  label: string;
}

interface CsvSummaryGroup {
  key: string;
  pvNumber: string;
  rvNumber: number;
  rvDate: Date;
  grossValue: number;
  discountValue: number;
  liquidValue: number;
  numberCvNsu: number;
  establishmentName: string;
  establishmentId: string | null;
  transactions: SalesSummaryManualTransactionInput[];
  submitStatus: 'pending' | 'submitting' | 'success' | 'error';
}

@Component({
  standalone: true,
  selector: 'cs-manual-sales-summary',
  styleUrl: './manual-sales-summary.component.scss',
  templateUrl: './manual-sales-summary.component.html',
  imports: [
    CardModule,
    ButtonModule,
    SelectModule,
    TranslateModule,
    FloatLabelModule,
    InputNumberModule,
    DatePickerModule,
    DividerModule,
    InputTextModule,
    ReactiveFormsModule,
    FormsModule,
  ],
})
export class ManualSalesSummaryComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(MessageService);
  private readonly service = inject(SaleSummaryApiService);
  private readonly acquirerService = inject(AcquirerApiService);
  private readonly companyService = inject(CompanyApiService);
  private readonly establishmentService = inject(EstablishmentApiService);
  private readonly flagService = inject(FlagApiService);
  private readonly creditOrderService = inject(CreditOrderApiService);

  protected readonly saving = signal(false);
  protected readonly loadingOptions = signal(true);
  protected readonly importMode = signal<'manual' | 'csv'>('manual');

  protected readonly csvGroups = signal<CsvSummaryGroup[]>([]);
  protected readonly csvAcquirerId = signal<string | null>(null);
  protected readonly csvParsing = signal(false);
  protected readonly csvSubmitting = signal(false);

  protected readonly csvPendingCount = computed(() =>
    this.csvGroups().filter(g => g.submitStatus === 'pending').length
  );
  protected readonly csvHasErrors = computed(() =>
    this.csvGroups().some(g => g.submitStatus === 'error')
  );

  // Getter/setter bridge for [(ngModel)] on the CSV acquirer select
  protected get csvAcquirerIdValue(): string | null {
    return this.csvAcquirerId();
  }
  protected set csvAcquirerIdValue(v: string | null | undefined) {
    this.csvAcquirerId.set(v ?? null);
  }

  private readonly rawEstablishments = signal<EstablishmentMinimalModel[]>([]);
  private readonly rawAcquirers = signal<AcquirerMinimalModel[]>([]);
  private readonly rawCompanies = signal<CompanyMinimalModel[]>([]);
  private readonly rawFlags = signal<FlagMinimalModel[]>([]);

  readonly establishmentOptions = computed<SelectOption[]>(() =>
    this.rawEstablishments().map(e => ({
      value: e.id,
      label: e.company?.fantasyName
        ? `${e.pvNumber} — ${e.company.fantasyName}`
        : e.pvNumber,
    }))
  );

  readonly acquirerOptions = computed<SelectOption[]>(() =>
    this.rawAcquirers().map(a => ({
      value: a.id,
      label: a.fantasyName || a.socialReason,
    }))
  );

  readonly companyOptions = computed<SelectOption[]>(() =>
    this.rawCompanies().map(c => ({
      value: c.id,
      label: c.fantasyName || c.socialReason,
    }))
  );

  readonly flagOptions = computed<SelectOption[]>(() =>
    this.rawFlags().map(f => ({ value: f.id, label: f.name }))
  );

  readonly captureOptions: SelectOption<number>[] = [
    { value: 1, label: 'POS' },
    { value: 2, label: 'PDV' },
    { value: 3, label: 'Manual' },
    { value: 4, label: 'E-commerce' },
  ];

  readonly modalityOptions: SelectOption<number>[] = Object.entries(STATUS_CODE_MAP)
    .filter(([, mod]) => mod !== ModalityEnum.NULL)
    .map(([code, mod]) => ({
      value: Number(code),
      label: modalityEnumLabel(mod, this.i18n),
    }));

  readonly form = this.fb.group({
    establishmentId: [null as string | null, [Validators.required]],
    acquirerId: [null as string | null, [Validators.required]],
    companyId: [null as string | null],
    rvNumber: [null as number | null, [Validators.required, Validators.min(1)]],
    rvDate: [null as Date | null, [Validators.required]],
    grossValue: [null as number | null, [Validators.required, Validators.min(0.01)]],
    discountValue: [null as number | null],
    liquidValue: [null as number | null],
    tipValue: [null as number | null],
    rejectedValue: [null as number | null],
    adjustedValue: [null as number | null],
    numberCvNsu: [null as number | null],
    firstInstallmentCreditDate: [null as Date | null],
    summaryType: [null as string | null],
    transactions: this.fb.array([this.buildTransactionGroup()]),
  });

  get transactions(): FormArray {
    return this.form.get('transactions') as FormArray;
  }

  transactionAt(index: number): FormGroup {
    return this.transactions.at(index) as FormGroup;
  }

  ngOnInit(): void {
    this.form.get('establishmentId')!.valueChanges.subscribe(id => {
      if (!id) return;
      const establishment = this.rawEstablishments().find(e => e.id === id);
      if (!establishment) return;
      const patch: { acquirerId?: string; companyId?: string } = {};
      if (establishment.acquirer?.id) patch.acquirerId = establishment.acquirer.id;
      if (establishment.company?.id) patch.companyId = establishment.company.id;
      if (Object.keys(patch).length) {
        this.form.patchValue(patch, { emitEvent: false });
      }
    });

    forkJoin({
      establishments: this.establishmentService.getOptions(),
      acquirers: this.acquirerService.getOptions(),
      companies: this.companyService.getOptions(),
      flags: this.flagService.getOptions(),
    }).subscribe({
      next: ({ establishments, acquirers, companies, flags }) => {
        const activeEstablishments = (establishments._embedded?.content ?? []).filter(e => isActive(e.status));
        const activeAcquirers = (acquirers._embedded?.content ?? []).filter(a => isActive(a.status));
        const activeCompanies = (companies._embedded?.content ?? []).filter(c => isActive(c.status));

        this.rawEstablishments.set(activeEstablishments);
        this.rawAcquirers.set(activeAcquirers);
        this.rawCompanies.set(activeCompanies);
        this.rawFlags.set(flags._embedded?.content ?? []);

        if (activeEstablishments.length === 1) {
          this.form.patchValue({ establishmentId: activeEstablishments[0].id });
        }
        if (activeAcquirers.length === 1 && !this.form.value.acquirerId) {
          this.form.patchValue({ acquirerId: activeAcquirers[0].id });
          this.csvAcquirerId.set(activeAcquirers[0].id);
        }
        if (activeCompanies.length === 1 && !this.form.value.companyId) {
          this.form.patchValue({ companyId: activeCompanies[0].id });
        }

        this.loadingOptions.set(false);
      },
      error: () => this.loadingOptions.set(false),
    });
  }

  protected setImportMode(mode: 'manual' | 'csv'): void {
    this.importMode.set(mode);
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.csvParsing.set(true);
    this.csvGroups.set([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        this.csvGroups.set(this.parseCsvToGroups(text));
      } finally {
        this.csvParsing.set(false);
      }
    };
    reader.readAsText(file, 'ISO-8859-1');
    input.value = '';
  }

  private parseCsvToGroups(csv: string): CsvSummaryGroup[] {
    const lines = csv.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];

    const groupMap = new Map<string, CsvSummaryGroup>();

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(';');
      if (cols.length < 22) continue;

      const status = (cols[2] ?? '').trim().toLowerCase();
      if (status !== 'aprovada') continue;

      const pvNumber = (cols[21] ?? '').trim();
      const rvNumberStr = (cols[19] ?? '').trim();
      const rvNumber = parseInt(rvNumberStr, 10);
      if (!pvNumber || isNaN(rvNumber)) continue;

      const key = `${pvNumber}_${rvNumber}`;
      const saleDate = this.parseBrDate((cols[0] ?? '').trim());
      const saleTimeStr = (cols[1] ?? '').trim() || '00:00:00';
      const grossValue = this.parseBrDecimal(cols[3]);
      const discountValue = this.parseBrDecimal(cols[11]);
      const liquidValue = this.parseBrDecimal(cols[16]);
      const installment = parseInt(cols[8], 10) || 1;
      const modality = this.mapRedeModality(
        (cols[5] ?? '').trim(),
        (cols[6] ?? '').trim(),
        installment,
      );

      const transaction: SalesSummaryManualTransactionInput = {
        nsu: parseInt(cols[17], 10) || null,
        cardNumber: (cols[24] ?? '').trim() || null,
        authorization: (cols[20] ?? '').trim() || null,
        referenceNumber: (cols[29] ?? '').trim() || null,
        grossValue,
        discountValue,
        liquidValue,
        tipValue: null,
        saleDate: saleDate ? `${formatDate(saleDate, 'yyyy-MM-dd', 'pt-BR')}T${saleTimeStr}` : null,
        creditDate: null,
        installment,
        modality,
        flagName: (cols[9] ?? '').trim() || null,
        tid: null,
        capture: null,
      };

      const establishment = this.rawEstablishments().find(e => e.pvNumber === pvNumber);

      if (groupMap.has(key)) {
        const g = groupMap.get(key)!;
        g.grossValue = Math.round((g.grossValue + grossValue) * 100) / 100;
        g.discountValue = Math.round((g.discountValue + discountValue) * 100) / 100;
        g.liquidValue = Math.round((g.liquidValue + liquidValue) * 100) / 100;
        g.numberCvNsu++;
        g.transactions.push(transaction);
      } else {
        groupMap.set(key, {
          key,
          pvNumber,
          rvNumber,
          rvDate: saleDate ?? new Date(),
          grossValue,
          discountValue,
          liquidValue,
          numberCvNsu: 1,
          establishmentName: (cols[22] ?? '').trim() || pvNumber,
          establishmentId: establishment?.id ?? null,
          transactions: [transaction],
          submitStatus: 'pending',
        });
      }
    }

    return Array.from(groupMap.values());
  }

  private parseBrDate(s: string): Date | null {
    if (!s) return null;
    const parts = s.split('/');
    if (parts.length !== 3) return null;
    const d = Number(parts[0]);
    const m = Number(parts[1]);
    const y = Number(parts[2]);
    if (!d || !m || !y) return null;
    return new Date(y, m - 1, d);
  }

  private parseBrDecimal(s: string): number {
    if (!s || s === '-') return 0;
    return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
  }

  private mapRedeModality(modalidade: string, tipo: string, parcelas: number): number {
    if (modalidade.toLowerCase().startsWith('d')) return 1; // débito → CASH_DEBIT
    if (tipo.toLowerCase().includes('vista')) return 2;      // crédito à vista → CASH_CREDIT
    if (parcelas <= 6) return 3;                             // INSTALLMENT_CREDIT_2_6
    if (parcelas <= 12) return 4;                            // INSTALLMENT_CREDIT_7_12
    return 5;                                                // INSTALLMENT_CREDIT_13_21
  }

  protected submitCsv(): void {
    const acquirerId = this.csvAcquirerId();
    if (!acquirerId) return;

    const pending = this.csvGroups().filter(g => g.submitStatus === 'pending');
    if (!pending.length) return;

    this.csvSubmitting.set(true);

    const submitNext = (index: number) => {
      if (index >= pending.length) {
        this.csvSubmitting.set(false);
        if (!this.csvGroups().some(g => g.submitStatus === 'error')) {
          this.toast.add({
            severity: 'success',
            summary: this.i18n.tUi('common.success'),
            detail: this.i18n.tUi('conciliation.manualSalesSummary.csv.importSuccess'),
          });
        }
        return;
      }

      const group = pending[index];
      this.csvGroups.update(gs =>
        gs.map(g => g.key === group.key ? { ...g, submitStatus: 'submitting' } : g)
      );

      const establishment = this.rawEstablishments().find(e => e.pvNumber === group.pvNumber);

      const installmentTotal = group.transactions.length > 0
        ? Math.max(...group.transactions.map(tx => tx.installment ?? 1))
        : 1;

      this.service.createManual({
        pvNumber: parseInt(group.pvNumber, 10),
        acquirerId,
        companyId: establishment?.company?.id ?? null,
        rvNumber: group.rvNumber,
        rvDate: formatDate(group.rvDate, 'yyyy-MM-dd', 'pt-BR'),
        grossValue: group.grossValue,
        discountValue: group.discountValue > 0 ? group.discountValue : null,
        liquidValue: group.liquidValue > 0 ? group.liquidValue : null,
        numberCvNsu: group.numberCvNsu,
        summaryType: 'CSV',
        transactions: group.transactions.map(tx => ({
          nsu: tx.nsu ?? null,
          cardNumber: tx.cardNumber ?? null,
          authorization: tx.authorization ?? null,
          referenceNumber: tx.referenceNumber ?? null,
          grossValue: tx.grossValue ?? null,
          discountValue: (tx.discountValue != null && tx.discountValue > 0) ? tx.discountValue : null,
          liquidValue: (tx.liquidValue != null && tx.liquidValue > 0) ? tx.liquidValue : null,
          tipValue: null,
          saleDate: tx.saleDate ?? null,
          creditDate: null,
          installment: tx.installment ?? 1,
          modality: tx.modality ?? 2,
          flagName: tx.flagName ?? null,
          tid: tx.tid ?? null,
          capture: tx.capture ?? null,
        })),
      }).pipe(
        switchMap(created =>
          this.createCreditOrders(created.id, installmentTotal).pipe(catchError(() => of([])))
        )
      ).subscribe({
        next: () => {
          this.csvGroups.update(gs =>
            gs.map(g => g.key === group.key ? { ...g, submitStatus: 'success' } : g)
          );
          submitNext(index + 1);
        },
        error: () => {
          this.csvGroups.update(gs =>
            gs.map(g => g.key === group.key ? { ...g, submitStatus: 'error' } : g)
          );
          submitNext(index + 1);
        },
      });
    };

    submitNext(0);
  }

  protected retryFailedCsv(): void {
    this.csvGroups.update(gs =>
      gs.map(g => g.submitStatus === 'error' ? { ...g, submitStatus: 'pending' } : g)
    );
    this.submitCsv();
  }

  private createCreditOrders(summaryId: string, installmentTotal: number): Observable<CreditOrderManualResult[]> {
    const total = Math.max(installmentTotal, 1);
    return from(Array.from({ length: total })).pipe(
      concatMap(() =>
        this.creditOrderService.createManual({ summaryIds: [summaryId] })
      ),
      toArray(),
    );
  }

  protected formatDisplayDate(date: Date): string {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${d}/${m}/${date.getFullYear()}`;
  }

  protected formatCurrency(v: number): string {
    return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  protected addTransaction(): void {
    this.transactions.push(this.buildTransactionGroup());
  }

  protected removeTransaction(index: number): void {
    if (this.transactions.length > 1) {
      this.transactions.removeAt(index);
    }
  }

  private buildTransactionGroup(): FormGroup {
    return this.fb.group({
      nsu: [null as number | null],
      cardNumber: [null as string | null],
      authorization: [null as string | null],
      referenceNumber: [null as string | null],
      grossValue: [null as number | null],
      discountValue: [null as number | null],
      liquidValue: [null as number | null],
      tipValue: [null as number | null],
      saleDate: [null as Date | null],
      creditDate: [null as Date | null],
      installment: [1 as number | null],
      modality: [2 as number | null],
      flagId: [null as string | null],
      tid: [null as string | null],
      capture: [null as number | null],
    });
  }

  private mapTransaction(
    tx: ReturnType<typeof this.buildTransactionGroup>['value'],
  ): SalesSummaryManualTransactionInput {
    const flagName = tx.flagId
      ? (this.rawFlags().find(f => f.id === tx.flagId)?.name ?? null)
      : null;
    return {
      nsu: tx.nsu,
      cardNumber: tx.cardNumber,
      authorization: tx.authorization,
      referenceNumber: tx.referenceNumber,
      grossValue: tx.grossValue,
      discountValue: tx.discountValue,
      liquidValue: tx.liquidValue,
      tipValue: tx.tipValue,
      saleDate: tx.saleDate ? `${formatDate(tx.saleDate, 'yyyy-MM-dd', 'pt-BR')}T00:00:00` : null,
      creditDate: tx.creditDate ? formatDate(tx.creditDate, 'yyyy-MM-dd', 'pt-BR') : null,
      installment: tx.installment,
      modality: tx.modality,
      flagName,
      tid: tx.tid ?? null,
      capture: tx.capture ?? null,
    };
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    const establishment = this.rawEstablishments().find(e => e.id === v.establishmentId);
    const transactions = v.transactions ?? [];
    const installmentTotal = transactions.length > 0
      ? Math.max(...transactions.map(tx => (tx['installment'] as number | null) ?? 1))
      : 1;
    this.saving.set(true);

    this.service
      .createManual({
        pvNumber: parseInt(establishment!.pvNumber, 10),
        acquirerId: v.acquirerId!,
        companyId: v.companyId,
        rvNumber: v.rvNumber!,
        rvDate: formatDate(v.rvDate!, 'yyyy-MM-dd', 'pt-BR'),
        grossValue: v.grossValue!,
        discountValue: v.discountValue,
        liquidValue: v.liquidValue,
        tipValue: v.tipValue,
        rejectedValue: v.rejectedValue,
        adjustedValue: v.adjustedValue,
        numberCvNsu: v.numberCvNsu,
        firstInstallmentCreditDate: v.firstInstallmentCreditDate
          ? formatDate(v.firstInstallmentCreditDate, 'yyyy-MM-dd', 'pt-BR')
          : null,
        summaryType: v.summaryType,
        transactions: transactions.map(tx => this.mapTransaction(tx)),
      })
      .pipe(
        switchMap(created =>
          this.createCreditOrders(created.id, installmentTotal).pipe(catchError(() => of([])))
        )
      )
      .subscribe({
        next: () => {
          this.toast.add({
            severity: 'success',
            summary: this.i18n.tUi('common.success'),
            detail: this.i18n.tUi('conciliation.manualSalesSummary.saved'),
          });
          this.resetForm();
        },
        error: () => this.saving.set(false),
        complete: () => this.saving.set(false),
      });
  }

  private resetForm(): void {
    this.form.reset({
      establishmentId: null,
      acquirerId: null,
      companyId: null,
      rvNumber: null,
      rvDate: null,
      grossValue: null,
    });
    while (this.transactions.length > 1) {
      this.transactions.removeAt(this.transactions.length - 1);
    }
    this.transactionAt(0).reset({ installment: 1, modality: 2 });
  }
}
