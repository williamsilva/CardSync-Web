import { FormsModule } from '@angular/forms';
import {
  Input,
  Output,
  Component,
  OnChanges,
  EventEmitter,
  SimpleChanges,
  computed,
  signal,
} from '@angular/core';

import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';

import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { CsCurrencyPipe } from '@shared/pipes/cs-currency.pipe';
import {
  PreImplantationDivergenceCandidate,
  PreImplantationDivergencePreviewResult,
} from '@features/service/manual-bank-reconciliation.api.service';

@Component({
  standalone: true,
  selector: 'cs-pre-implantation-divergence-dialog',
  templateUrl: './pre-implantation-divergence-dialog.component.html',
  imports: [
    FormsModule,
    CsDatePipe,
    TableModule,
    SelectModule,
    ButtonModule,
    DialogModule,
    TooltipModule,
    CsCurrencyPipe,
    TranslateModule,
  ],
})
export class PreImplantationDivergenceDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input() applying = false;
  @Input() preview: PreImplantationDivergencePreviewResult | null = null;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() applyClick = new EventEmitter<string[]>();

  /** Seleção da tabela de prévia — começa com todos os elegíveis marcados; o usuário desmarca o que não quer vincular. */
  protected readonly selectedCandidates = signal<PreImplantationDivergenceCandidate[]>([]);

  /** Filtros locais da tabela de prévia — a lista inteira já veio numa única chamada, então filtra em memória, sem nova requisição. */
  protected readonly companyFilter = signal<string | null>(null);
  protected readonly acquirerFilter = signal<string | null>(null);
  protected readonly bankFilter = signal<string | null>(null);

  protected readonly companyOptions = computed(() => this.uniqueOptions((c) => c.companyName));
  protected readonly acquirerOptions = computed(() => this.uniqueOptions((c) => c.acquirerName));
  protected readonly bankOptions = computed(() => this.uniqueOptions((c) => c.bankName));

  protected readonly filteredCandidates = computed(() => {
    const candidates = this.preview?.candidates ?? [];
    const company = this.companyFilter();
    const acquirer = this.acquirerFilter();
    const bank = this.bankFilter();
    return candidates.filter(
      (c) =>
        (!company || c.companyName === company) &&
        (!acquirer || c.acquirerName === acquirer) &&
        (!bank || c.bankName === bank),
    );
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['preview']) {
      // Começa com todos os elegíveis marcados — o usuário desmarca o que não quer vincular.
      this.selectedCandidates.set(this.preview?.candidates ?? []);
      this.companyFilter.set(null);
      this.acquirerFilter.set(null);
      this.bankFilter.set(null);
    }
  }

  private uniqueOptions(
    pick: (c: PreImplantationDivergenceCandidate) => string | null,
  ): { label: string; value: string }[] {
    const candidates = this.preview?.candidates ?? [];
    const names = new Set(candidates.map(pick).filter((n): n is string => !!n));
    return Array.from(names)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({ label: name, value: name }));
  }

  protected onVisibleChange(value: boolean): void {
    this.visibleChange.emit(value);
  }

  protected onCancel(): void {
    this.visibleChange.emit(false);
  }

  /** Ao trocar o filtro, a seleção passa a ser só o que ficou visível — evita "selecionados"
   * escondidos fora do filtro atual. */
  protected onCompanyFilterChange(value: string | null): void {
    this.companyFilter.set(value);
    this.selectedCandidates.set(this.filteredCandidates());
  }

  protected onAcquirerFilterChange(value: string | null): void {
    this.acquirerFilter.set(value);
    this.selectedCandidates.set(this.filteredCandidates());
  }

  protected onBankFilterChange(value: string | null): void {
    this.bankFilter.set(value);
    this.selectedCandidates.set(this.filteredCandidates());
  }

  protected onApply(): void {
    this.applyClick.emit(this.selectedCandidates().map((c) => c.releaseBankId));
  }
}
