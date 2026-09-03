import { formatDate } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { Tooltip } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { TranslateModule } from '@ngx-translate/core';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';

import { CsTagComponent, CsTagTone } from '@shared/ui';
import { DateInputMaskDirective } from '@williamsilva/nimbus-web-commons';
import { I18nService } from '@core/i18n/i18n.service';
import { FlagFacade } from '@features/facade/flag.facade';
import { CompanyFacade } from '@features/facade/company.facade';
import { CsDocumentPipe } from '@shared/pipes/cs-document.pipe';
import { AcquirerFacade } from '@features/facade/acquirer.facade';
import { EstablishmentFacade } from '@features/facade/establishment.facade';
import { AdjustmentManualCreateInput } from '@models/adjustment-manual.model';
import { AdjustmentManualFacade } from '@features/facade/adjustment-manual.facade';
import { StatusEnum, statusEnumLabel, statusEnumSeverity } from '@models/enums/status.enum';

interface SelectOption<T = string> {
  value: T;
  label: string;
  pvNumber?: string;
  companyName?: string | null;
  cnpj?: string | null;
  status?: StatusEnum | null;
}

interface CsvAdjustmentRow {
  key: string;
  rawAdjustmentCode: string | null;
  adjustmentDate: Date;
  creditDate: Date | null;
  debitType: string | null;
  adjustmentType: string | null;
  adjustmentDescription: string | null;
  adjustmentValue: number;
  transactionValue: number | null;
  totalDebitValue: number | null;
  pendingValue: number | null;
  flagName: string | null;
  rvNumberOriginal: number;
  pvNumberOriginal: number | null;
  originEstablishmentName: string | null;
  pvNumber: number;
  establishmentName: string | null;
  submitStatus: 'pending' | 'submitting' | 'success' | 'error';
}

@Component({
  standalone: true,
  selector: 'cs-manual-adjustment',
  styleUrl: './manual-adjustment.component.scss',
  templateUrl: './manual-adjustment.component.html',
  imports: [
    CardModule,
    Tooltip,
    FormsModule,
    ButtonModule,
    SelectModule,
    DividerModule,
    CsTagComponent,
    CsDocumentPipe,
    TranslateModule,
    InputTextModule,
    FloatLabelModule,
    DatePickerModule,
    InputNumberModule,
    ReactiveFormsModule,
    DateInputMaskDirective,
  ],
})
export class ManualAdjustmentComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly i18n = inject(I18nService);
  private readonly toast = inject(MessageService);
  private readonly adjustmentManualFacade = inject(AdjustmentManualFacade);

  protected readonly flagFacade = inject(FlagFacade);
  protected readonly companyFacade = inject(CompanyFacade);
  protected readonly acquirerFacade = inject(AcquirerFacade);
  protected readonly establishmentFacade = inject(EstablishmentFacade);

  protected readonly saving = signal(false);
  protected readonly importMode = signal<'manual' | 'csv'>('csv');

  protected readonly csvParsing = signal(false);
  protected readonly csvSubmitting = signal(false);
  protected readonly csvRows = signal<CsvAdjustmentRow[]>([]);
  protected readonly csvFileCount = signal(0);
  protected readonly csvAcquirerId = signal<string | null>(null);

  protected readonly loadingOptions = computed(
    () =>
      !this.establishmentFacade.optionsLoadedOnce() ||
      !this.acquirerFacade.optionsLoadedOnce() ||
      !this.companyFacade.optionsLoadedOnce() ||
      !this.flagFacade.optionsLoadedOnce(),
  );

  protected readonly csvPendingCount = computed(
    () => this.csvRows().filter((r) => r.submitStatus === 'pending').length,
  );
  protected readonly csvHasErrors = computed(() =>
    this.csvRows().some((r) => r.submitStatus === 'error'),
  );

  protected get csvAcquirerIdValue(): string | null {
    return this.csvAcquirerId();
  }
  protected set csvAcquirerIdValue(v: string | null | undefined) {
    this.csvAcquirerId.set(v ?? null);
  }

  readonly establishmentOptions = computed<SelectOption[]>(() =>
    this.establishmentFacade.activeOptions().map((e) => ({
      value: e.id,
      label: e.company?.fantasyName ? `${e.pvNumber} — ${e.company.fantasyName}` : e.pvNumber,
      pvNumber: e.pvNumber,
      companyName: e.company?.fantasyName ?? null,
      cnpj: e.company?.cnpj ?? null,
      status: e.status,
    })),
  );

  readonly acquirerOptions = computed<SelectOption[]>(() =>
    this.acquirerFacade.activeOptions().map((a) => ({
      value: a.id,
      label: a.fantasyName || a.socialReason,
      cnpj: a.cnpj,
      status: a.status,
    })),
  );

  readonly companyOptions = computed<SelectOption[]>(() =>
    this.companyFacade.activeOptions().map((c) => ({
      value: c.id,
      label: c.fantasyName || c.socialReason,
      cnpj: c.cnpj,
      status: c.status,
    })),
  );

  readonly flagOptions = computed<SelectOption[]>(() =>
    this.flagFacade.options().map((f) => ({ value: f.id, label: f.name })),
  );

  readonly debitTypeOptions = computed<SelectOption[]>(() => {
    this.i18n.getAppliedLang();
    return [
      { value: 'D', label: this.i18n.tUi('conciliation.manualAdjustment.debitTypeDebit') },
      { value: 'C', label: this.i18n.tUi('conciliation.manualAdjustment.debitTypeCredit') },
    ];
  });

  readonly form = this.fb.group({
    establishmentId: [null as string | null, [Validators.required]],
    acquirerId: [null as string | null, [Validators.required]],
    companyId: [null as string | null],
    rvNumberOriginal: [null as number | null, [Validators.required, Validators.min(1)]],
    pvNumberOriginal: [null as number | null],
    adjustmentDate: [null as Date | null, [Validators.required]],
    creditDate: [null as Date | null],
    debitType: [null as string | null],
    adjustmentType: [null as string | null],
    adjustmentDescription: [null as string | null],
    adjustmentValue: [null as number | null, [Validators.required, Validators.min(0.01)]],
    transactionValue: [null as number | null],
    totalDebitValue: [null as number | null],
    pendingValue: [null as number | null],
    flagId: [null as string | null],
    rawAdjustmentCode: [null as string | null],
  });

  ngOnInit(): void {
    this.establishmentFacade.loadEstablishmentOptionsFilter();
    this.acquirerFacade.loadAcquirerOptionsFilter();
    this.companyFacade.loadCompanyOptionsFilter();
    this.flagFacade.loadFlagOptionsFilter();
  }

  protected statusEnumLabel(value: StatusEnum | null | undefined): string {
    return statusEnumLabel(value ?? null, this.i18n);
  }

  protected statusEnumSeverity(value: StatusEnum | null | undefined): CsTagTone {
    return statusEnumSeverity(value ?? null);
  }

  protected setImportMode(mode: 'manual' | 'csv'): void {
    this.importMode.set(mode);
  }

  protected async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;

    this.csvParsing.set(true);
    this.csvRows.set([]);
    this.csvFileCount.set(0);

    const rows: CsvAdjustmentRow[] = [];
    let parsedCount = 0;
    let rowSeq = 0;

    for (const file of files) {
      try {
        const text = await this.readFileAsText(file);
        rowSeq = this.parseCsvRows(text, rows, rowSeq);
        parsedCount++;
      } catch {
        this.toast.add({
          severity: 'warn',
          summary: this.i18n.tUi('conciliation.manualAdjustment.csv.fileErrorTitle'),
          detail: this.i18n.tUi('conciliation.manualAdjustment.csv.fileErrorDetail', {
            fileName: file.name,
          }),
        });
      }
    }

    this.csvRows.set(rows);
    this.csvFileCount.set(parsedCount);
    this.csvParsing.set(false);
    input.value = '';
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file, 'ISO-8859-1');
    });
  }

  private parseCsvRows(csv: string, target: CsvAdjustmentRow[], startSeq: number): number {
    const lines = csv
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) return startSeq;

    let seq = startSeq;

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(';');
      if (cols.length < 17) continue;

      const adjustmentDate = this.parseBrDate((cols[0] ?? '').trim());
      if (!adjustmentDate) continue;

      const rvNumberOriginal = parseInt((cols[12] ?? '').trim(), 10);
      const pvNumber = parseInt((cols[16] ?? '').trim(), 10);
      if (isNaN(rvNumberOriginal) || isNaN(pvNumber)) continue;

      const creditDate = this.parseBrDate((cols[1] ?? '').trim());
      const rawAdjustmentCode = (cols[2] ?? '').trim() || null;
      const debitType = this.mapDebitType((cols[3] ?? '').trim());
      const adjustmentType = (cols[4] ?? '').trim() || null;
      const adjustmentDescription = (cols[5] ?? '').trim() || null;
      const originalAdjustmentValue = this.parseBrDecimal(cols[6]);
      const chargedValue = this.parseBrDecimal(cols[7]);
      const totalDebitValue = this.parseBrDecimal(cols[8]);
      const pendingValueRaw = this.parseBrDecimal(cols[9]);
      const creditedValue = this.parseBrDecimal(cols[10]);
      const flagName = (cols[11] ?? '').trim() || null;
      const originEstablishmentName = (cols[13] ?? '').trim() || null;
      const pvNumberOriginalRaw = parseInt((cols[14] ?? '').trim(), 10);
      const establishmentName = (cols[15] ?? '').trim() || null;

      seq++;

      target.push({
        key: `${rawAdjustmentCode ?? 'row'}_${seq}`,
        rawAdjustmentCode,
        adjustmentDate,
        creditDate,
        debitType,
        adjustmentType,
        adjustmentDescription,
        // "valor cobrado nesta data" é o que efetivamente deduz desta RV agora — "valor total
        // original do ajuste" pode incluir parcelas futuras ainda não cobradas ("valor ainda
        // pendente"), e usar o total original aqui gerava ordem de crédito com valor negativo
        // quando a tarifa é cobrada em mais de uma RV (confirmado com dados reais: RV 82730892,
        // total R$15,00, cobrado R$9,77 nesta RV, R$5,23 pendente pra uma RV futura).
        adjustmentValue: chargedValue > 0 ? chargedValue : originalAdjustmentValue,
        transactionValue: originalAdjustmentValue > 0 ? originalAdjustmentValue : creditedValue > 0 ? creditedValue : null,
        totalDebitValue: totalDebitValue > 0 ? totalDebitValue : null,
        pendingValue: pendingValueRaw > 0 ? pendingValueRaw : null,
        flagName,
        rvNumberOriginal,
        pvNumberOriginal: isNaN(pvNumberOriginalRaw) ? null : pvNumberOriginalRaw,
        originEstablishmentName,
        pvNumber,
        establishmentName,
        submitStatus: 'pending',
      });
    }

    return seq;
  }

  private mapDebitType(raw: string): string | null {
    const v = raw.trim().toLowerCase();
    if (!v) return null;
    if (v.startsWith('cobr') || v.startsWith('deb') || v.startsWith('déb')) return 'D';
    if (v.startsWith('cred') || v.startsWith('créd')) return 'C';
    return raw.charAt(0).toUpperCase();
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

  protected submitCsv(): void {
    const acquirerId = this.csvAcquirerId();
    if (!acquirerId) return;

    const pending = this.csvRows().filter((r) => r.submitStatus === 'pending');
    if (!pending.length) return;

    this.csvSubmitting.set(true);

    const submitNext = (index: number) => {
      if (index >= pending.length) {
        this.csvSubmitting.set(false);
        if (!this.csvRows().some((r) => r.submitStatus === 'error')) {
          this.toast.add({
            severity: 'success',
            summary: this.i18n.tUi('common.success'),
            detail: this.i18n.tUi('conciliation.manualAdjustment.csv.importSuccess'),
          });
        }
        return;
      }

      const row = pending[index];
      this.csvRows.update((rs) =>
        rs.map((r) => (r.key === row.key ? { ...r, submitStatus: 'submitting' } : r)),
      );

      const input: AdjustmentManualCreateInput = {
        pvNumber: row.pvNumber,
        acquirerId,
        pvNumberOriginal: row.pvNumberOriginal,
        rvNumberOriginal: row.rvNumberOriginal,
        adjustmentDate: formatDate(row.adjustmentDate, 'yyyy-MM-dd', 'pt-BR'),
        creditDate: row.creditDate ? formatDate(row.creditDate, 'yyyy-MM-dd', 'pt-BR') : null,
        adjustmentValue: row.adjustmentValue,
        transactionValue: row.transactionValue,
        totalDebitValue: row.totalDebitValue,
        pendingValue: row.pendingValue,
        debitType: row.debitType,
        adjustmentType: row.adjustmentType,
        adjustmentDescription: row.adjustmentDescription,
        flagName: row.flagName,
        rawAdjustmentCode: row.rawAdjustmentCode,
      };

      this.adjustmentManualFacade.createManual(input).subscribe({
        next: () => {
          this.csvRows.update((rs) =>
            rs.map((r) => (r.key === row.key ? { ...r, submitStatus: 'success' } : r)),
          );
          submitNext(index + 1);
        },
        error: () => {
          this.csvRows.update((rs) =>
            rs.map((r) => (r.key === row.key ? { ...r, submitStatus: 'error' } : r)),
          );
          submitNext(index + 1);
        },
      });
    };

    submitNext(0);
  }

  protected retryFailedCsv(): void {
    this.csvRows.update((rs) =>
      rs.map((r) => (r.submitStatus === 'error' ? { ...r, submitStatus: 'pending' } : r)),
    );
    this.submitCsv();
  }

  protected formatDisplayDate(date: Date | null): string {
    if (!date) return '-';
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${d}/${m}/${date.getFullYear()}`;
  }

  protected formatCurrency(v: number | null): string {
    return (v ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    const establishment = this.establishmentFacade
      .activeOptions()
      .find((e) => e.id === v.establishmentId);
    if (!establishment) return;

    const flagName = v.flagId
      ? (this.flagFacade.options().find((f) => f.id === v.flagId)?.name ?? null)
      : null;

    this.saving.set(true);

    const input: AdjustmentManualCreateInput = {
      pvNumber: parseInt(establishment.pvNumber, 10),
      acquirerId: v.acquirerId!,
      companyId: v.companyId,
      pvNumberOriginal: v.pvNumberOriginal,
      rvNumberOriginal: v.rvNumberOriginal!,
      adjustmentDate: formatDate(v.adjustmentDate!, 'yyyy-MM-dd', 'pt-BR'),
      creditDate: v.creditDate ? formatDate(v.creditDate, 'yyyy-MM-dd', 'pt-BR') : null,
      adjustmentValue: v.adjustmentValue!,
      transactionValue: v.transactionValue,
      totalDebitValue: v.totalDebitValue,
      pendingValue: v.pendingValue,
      debitType: v.debitType,
      adjustmentType: v.adjustmentType,
      adjustmentDescription: v.adjustmentDescription,
      flagName,
      rawAdjustmentCode: v.rawAdjustmentCode,
    };

    this.adjustmentManualFacade.createManual(input).subscribe({
      next: () => {
        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: this.i18n.tUi('conciliation.manualAdjustment.saved'),
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
      pvNumberOriginal: null,
      rvNumberOriginal: null,
      adjustmentDate: null,
      creditDate: null,
      debitType: null,
      adjustmentType: null,
      adjustmentDescription: null,
      adjustmentValue: null,
      transactionValue: null,
      totalDebitValue: null,
      pendingValue: null,
      flagId: null,
      rawAdjustmentCode: null,
    });
  }
}
