import { FormsModule } from '@angular/forms';
import {
  Input,
  Output,
  Component,
  OnChanges,
  EventEmitter,
  SimpleChanges,
  computed,
  inject,
  signal,
} from '@angular/core';

import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { I18nService } from '@core/i18n/i18n.service';

@Component({
  standalone: true,
  selector: 'cs-divergence-dialog',
  templateUrl: './divergence-dialog.component.html',
  imports: [
    FormsModule,
    SelectModule,
    ButtonModule,
    DialogModule,
    TextareaModule,
    TranslateModule,
  ],
})
export class DivergenceDialogComponent implements OnChanges {
  private readonly i18n = inject(I18nService);
  private readonly translateSvc = inject(TranslateService);

  @Input() visible = false;
  @Input() message = '';
  @Input() reconciling = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirm = new EventEmitter<string>();

  /** Sentinela: quando selecionado, revela o textarea pra digitar um motivo livre. */
  protected readonly OTHER_DIVERGENCE_REASON = 'other';
  protected readonly divergenceReason = signal('');
  protected readonly selectedDivergenceReasonPreset = signal<string | null>(null);

  /** Motivos pré-cadastrados (só front-end, sem configuração de backend) — o texto do motivo
   * enviado/gravado é o label já traduzido, não a chave. "Outro" revela o textarea abaixo. */
  private readonly divergenceReasonPresetKeys = ['preImplantation', 'rounding', 'bankFee'] as const;

  protected readonly divergenceReasonPresetOptions = computed(() => {
    this.i18n.getAppliedLang();
    return [
      ...this.divergenceReasonPresetKeys.map((key) => ({
        value: key,
        label: this.translateSvc.instant(
          `conciliation.manualBankReconciliation.divergenceReasonPreset.${key}`,
        ),
      })),
      {
        value: this.OTHER_DIVERGENCE_REASON,
        label: this.translateSvc.instant(
          'conciliation.manualBankReconciliation.divergenceReasonPreset.other',
        ),
      },
    ];
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.divergenceReason.set('');
      this.selectedDivergenceReasonPreset.set(null);
    }
  }

  protected onVisibleChange(value: boolean): void {
    this.visibleChange.emit(value);
  }

  /** Motivo pré-cadastrado selecionado: usa o texto já traduzido direto. "Outro" só limpa o
   * texto e deixa o textarea livre para o usuário digitar. */
  protected onPresetChange(value: string): void {
    this.selectedDivergenceReasonPreset.set(value);
    if (value === this.OTHER_DIVERGENCE_REASON) {
      this.divergenceReason.set('');
      return;
    }
    const preset = this.divergenceReasonPresetOptions().find((option) => option.value === value);
    this.divergenceReason.set(preset?.label ?? '');
  }

  protected onCancel(): void {
    this.visibleChange.emit(false);
  }

  protected onConfirm(): void {
    const reason = this.divergenceReason().trim();
    if (!reason) return;
    this.confirm.emit(reason);
  }
}
