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
import { Tooltip } from 'primeng/tooltip';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';

import { CsTagComponent, CsTagTone } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';
import { FlagFacade } from '@features/facade/flag.facade';
import { CompanyFacade } from '@features/facade/company.facade';
import { CsDocumentPipe } from '@shared/pipes/cs-document.pipe';
import { AcquirerFacade } from '@features/facade/acquirer.facade';
import { ErrorMsgComponent } from '@shared/error-msg/error-msg.component';
import { EstablishmentFacade } from '@features/facade/establishment.facade';
import { BankStatementFacade } from '@features/facade/bank-statement.facade';
import { BankingDomicileFacade } from '@features/facade/banking-domicile.facade';
import { StatusEnum, statusEnumLabel, statusEnumSeverity } from '@models/enums/status.enum';
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

interface CsvStatementRow {
  key: string;
  releaseDate: Date;
  description: string;
  releaseValue: number;
  submitStatus: 'pending' | 'submitting' | 'success' | 'error' | 'duplicate';
  errorMessage: string | null;
  acquirerName: string | null;
  flagName: string | null;
  modalityPaymentBank: ModalityPaymentBankEnum | null;
  establishmentPvNumber: number | null;
}

@Component({
  standalone: true,
  selector: 'cs-manual-bank-statement',
  styleUrl: './manual-bank-statement.component.scss',
  templateUrl: './manual-bank-statement.component.html',
  imports: [
    FormsModule,
    Card,
    Select,
    Button,
    Divider,
    Tooltip,
    FloatLabel,
    CsTagComponent,
    CsDocumentPipe,
    InputTextModule,
    TranslateModule,
    DatePickerModule,
    InputNumberModule,
    ErrorMsgComponent,
    ReactiveFormsModule,
    ConfirmDialogModule,
  ],
})
export class ManualBankStatementComponent implements OnInit {
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(MessageService);
  private readonly translateSvc = inject(TranslateService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly flagFacade = inject(FlagFacade);
  readonly companyFacade = inject(CompanyFacade);
  readonly acquirerFacade = inject(AcquirerFacade);
  readonly establishmentFacade = inject(EstablishmentFacade);
  readonly bankingDomicileFacade = inject(BankingDomicileFacade);
  private readonly bankStatementFacade = inject(BankStatementFacade);

  readonly saving = signal(false);
  protected readonly importMode = signal<'csv' | 'manual'>('csv');

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

  // ── Importação de extrato (texto/CSV) ──────────────────────────────────────
  /** Empresa/domicílio bancário do arquivo inteiro — um extrato pertence a UMA conta bancária. */
  protected readonly csvCompanyId = signal<string | null>(null);
  protected readonly csvBankingDomicileId = signal<string | null>(null);

  protected readonly csvParsing = signal(false);
  protected readonly csvSubmitting = signal(false);
  protected readonly csvRows = signal<CsvStatementRow[]>([]);
  protected readonly csvFileCount = signal(0);

  protected readonly csvFilteredDomiciles = computed(() => {
    const cId = this.csvCompanyId();
    return this.bankingDomicileFacade.options().filter((d) => !cId || d.company?.id === cId);
  });

  protected readonly csvBankingDomicileOptions = computed(() =>
    this.csvFilteredDomiciles().map((d) => ({
      id: d.id,
      label: `${d.bank?.name ?? '—'} · Ag. ${d.agency} / CC. ${d.currentAccount}`,
      bankName: d.bank?.name ?? '—',
      agencyAccount: `Ag. ${d.agency} / CC. ${d.currentAccount}`,
      status: d.status,
    })),
  );

  protected readonly csvPendingCount = computed(
    () => this.csvRows().filter((r) => r.submitStatus === 'pending').length,
  );
  protected readonly csvHasErrors = computed(() =>
    this.csvRows().some((r) => r.submitStatus === 'error'),
  );

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
      bankName: d.bank?.name ?? '—',
      agencyAccount: `Ag. ${d.agency} / CC. ${d.currentAccount}`,
      status: d.status,
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

  statusEnumLabel(value: StatusEnum | null | undefined): string {
    return statusEnumLabel(value ?? null, this.i18n);
  }

  statusEnumSeverity(value: StatusEnum | null | undefined): CsTagTone {
    return statusEnumSeverity(value ?? null);
  }

  protected modalityPaymentBankLabel(value: ModalityPaymentBankEnum | null | undefined): string {
    return modalityPaymentBankLabel(value ?? null, this.i18n);
  }

  ngOnInit(): void {
    this.flagFacade.loadFlagOptionsFilter();
    this.companyFacade.loadCompanyOptionsFilter();
    this.acquirerFacade.loadAcquirerOptionsFilter();
    this.establishmentFacade.loadEstablishmentOptionsFilter();
    this.bankingDomicileFacade.loadBankingDomicileOptionsFilter();
  }

  protected setImportMode(mode: 'csv' | 'manual'): void {
    this.importMode.set(mode);
  }

  protected onCsvCompanyIdChange(value: string | null): void {
    this.csvCompanyId.set(value);
    this.csvBankingDomicileId.set(null);
  }

  protected async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;

    const mismatch = this.findBankMismatch(files);
    if (mismatch) {
      this.confirmationService.confirm({
        header: this.i18n.tUi('conciliation.manualBankStatement.csv.bankMismatchTitle'),
        message: this.translateSvc.instant(
          'conciliation.manualBankStatement.csv.bankMismatchMessage',
          mismatch,
        ),
        icon: 'pi pi-exclamation-triangle',
        acceptButtonStyleClass: 'p-button-warn',
        acceptLabel: this.i18n.tUi('conciliation.manualBankStatement.csv.bankMismatchConfirm'),
        rejectLabel: this.i18n.tUi('conciliation.manualBankStatement.csv.bankMismatchCancel'),
        accept: () => this.processFiles(files, input),
        reject: () => {
          input.value = '';
        },
      });
      return;
    }

    await this.processFiles(files, input);
  }

  /**
   * O extrato em texto livre não identifica o próprio banco por linha (só adquirente/bandeira),
   * então não há como validar "arquivo do banco certo" a partir do conteúdo. Como sinal de
   * segurança best-effort, extratos gerados pelo internet banking costumam levar a agência no
   * próprio nome do arquivo (ex.: "Extrato_8639_245151_02-08-2026.txt" — 8639 é a agência). Só
   * um aviso pra confirmar, nunca um bloqueio: nomes que não seguem essa convenção não devem
   * impedir a importação.
   */
  private findBankMismatch(
    files: File[],
  ): { fileName: string; fileAgency: string; selectedAgency: string; selectedBank: string } | null {
    const domicile = this.csvFilteredDomiciles().find((d) => d.id === this.csvBankingDomicileId());
    if (!domicile) return null;

    const selectedAgency = String(domicile.agency ?? '').trim();
    if (!selectedAgency) return null;

    for (const file of files) {
      const fileAgency = this.extractLeadingNumber(file.name);
      if (fileAgency && fileAgency !== selectedAgency) {
        return {
          fileName: file.name,
          fileAgency,
          selectedAgency,
          selectedBank: domicile.bank?.name ?? '-',
        };
      }
    }

    return null;
  }

  private extractLeadingNumber(fileName: string): string | null {
    const match = fileName.match(/\d{2,}/);
    return match ? match[0] : null;
  }

  private async processFiles(files: File[], input: HTMLInputElement): Promise<void> {
    this.csvParsing.set(true);
    this.csvRows.set([]);
    this.csvFileCount.set(0);

    const rows: CsvStatementRow[] = [];
    let parsedCount = 0;

    for (const file of files) {
      try {
        const text = await this.readFileAsText(file);
        rows.push(...this.parseTextIntoRows(text));
        parsedCount++;
      } catch {
        this.toast.add({
          severity: 'warn',
          summary: this.i18n.tUi('conciliation.manualBankStatement.csv.fileErrorTitle'),
          detail: this.i18n.tUi('conciliation.manualBankStatement.csv.fileErrorDetail', {
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

  /**
   * Extrato Itaú (.txt): "data;histórico;valor;", sem cabeçalho. Pré-filtra por um sinal bruto
   * de adquirente (Rede/Cielo/Stone/GetNet/...) e valor positivo só para não poluir a prévia com
   * PIX/boleto/outras linhas que não são recebimento de cartão — a classificação real (e a
   * decisão final de aceitar ou rejeitar) é sempre do backend (ver
   * ManualBankStatementTextImportService), nunca deste filtro.
   */
  private parseTextIntoRows(text: string): CsvStatementRow[] {
    const acquirerHint = /REDE|CIELO|STONE|GETNET|BANESC|VISANET|PAGAR\s*ME/i;
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const rows: CsvStatementRow[] = [];
    lines.forEach((line, index) => {
      const cols = line.split(';');
      if (cols.length < 3) return;

      const releaseDate = this.parseBrDate((cols[0] ?? '').trim());
      const description = (cols[1] ?? '').trim();
      const releaseValue = this.parseBrDecimal((cols[2] ?? '').trim());

      if (!releaseDate || !description || releaseValue <= 0) return;
      if (!acquirerHint.test(description)) return;

      rows.push({
        key: `${index}_${cols[0]}_${cols[2]}`,
        releaseDate,
        description,
        releaseValue,
        submitStatus: 'pending',
        errorMessage: null,
        acquirerName: null,
        flagName: null,
        modalityPaymentBank: null,
        establishmentPvNumber: null,
      });
    });

    return rows;
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

  protected formatDisplayDate(date: Date): string {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${d}/${m}/${date.getFullYear()}`;
  }

  protected formatCurrency(v: number): string {
    return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private formatIsoDate(date: Date): string {
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${date.getFullYear()}-${m}-${d}`;
  }

  protected submitCsv(): void {
    const companyId = this.csvCompanyId();
    const bankingDomicileId = this.csvBankingDomicileId();
    if (!companyId || !bankingDomicileId) return;

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
            detail: this.i18n.tUi('conciliation.manualBankStatement.csv.importSuccess'),
          });
        }
        return;
      }

      const row = pending[index];
      this.csvRows.update((rs) =>
        rs.map((r) => (r.key === row.key ? { ...r, submitStatus: 'submitting' } : r)),
      );

      this.bankStatementFacade
        .importText({
          companyId,
          bankingDomicileId,
          releaseDate: this.formatIsoDate(row.releaseDate),
          description: row.description,
          releaseValue: row.releaseValue,
        })
        .subscribe({
          next: (result) => {
            this.csvRows.update((rs) =>
              rs.map((r) =>
                r.key === row.key
                  ? {
                      ...r,
                      submitStatus: 'success',
                      errorMessage: null,
                      acquirerName: result.acquirerName,
                      flagName: result.flagName,
                      modalityPaymentBank: result.modalityPaymentBank,
                      establishmentPvNumber: result.establishmentPvNumber,
                    }
                  : r,
              ),
            );
            submitNext(index + 1);
          },
          error: (err) => {
            const isDuplicate = err?.error?.code === 'RELEASE_BANK_ALREADY_EXISTS';
            this.csvRows.update((rs) =>
              rs.map((r) =>
                r.key === row.key
                  ? {
                      ...r,
                      submitStatus: isDuplicate ? 'duplicate' : 'error',
                      errorMessage: err?.error?.technicalMessage ?? null,
                    }
                  : r,
              ),
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

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving()) return;

    const releaseDate = this.releaseDateCtrl.value!;
    this.saving.set(true);
    this.bankStatementFacade
      .createManual({
        companyId: this.companyIdCtrl.value!,
        bankingDomicileId: this.bankingDomicileIdCtrl.value!,
        releaseDate: this.formatIsoDate(releaseDate),
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
