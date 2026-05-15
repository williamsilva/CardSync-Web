import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, Input, Output, signal } from '@angular/core';

import { FloatLabel } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';

import { I18nService } from '@core/i18n/i18n.service';

export interface CsCurrencyRangeValue {
  start: number | null;
  end: number | null;
}

@Component({
  selector: 'cs-currency-range-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, InputNumberModule, FloatLabel],
  host: {
    class: 'block',
  },
  template: `
    <div class="flex flex-column w-full gap-2">
      <div class="w-full text-center text-sm font-semibold text-color-secondary line-height-2">
        {{ label }}
      </div>

      <div class="grid formgrid align-items-end">
        <div class="col-12 sm:col-6 p-1">
          <p-floatlabel variant="on" class="w-full">
            <p-inputNumber
              size="small"
              class="w-full"
              mode="currency"
              [locale]="locale()"
              [currency]="currency()"
              [ngModel]="startValue()"
              inputStyleClass="w-full"
              [inputId]="inputId + '-start'"
              [minFractionDigits]="minFractionDigits"
              [maxFractionDigits]="maxFractionDigits"
              (ngModelChange)="onStartChange($event)"
            ></p-inputNumber>

            <label [for]="inputId + '-start'">
              {{ startLabel }}
            </label>
          </p-floatlabel>
        </div>

        <div class="col-12 sm:col-6 p-1">
          <p-floatlabel variant="on" class="w-full">
            <p-inputNumber
              size="small"
              class="w-full"
              mode="currency"
              [locale]="locale()"
              [ngModel]="endValue()"
              [currency]="currency()"
              inputStyleClass="w-full"
              [inputId]="inputId + '-end'"
              (ngModelChange)="onEndChange($event)"
              [minFractionDigits]="minFractionDigits"
              [maxFractionDigits]="maxFractionDigits"
            ></p-inputNumber>

            <label [for]="inputId + '-end'">
              {{ endLabel }}
            </label>
          </p-floatlabel>
        </div>
      </div>
    </div>
  `,
})
export class CsCurrencyRangeFilterComponent {
  private readonly i18n = inject(I18nService);

  @Input() inputId = 'currencyRange';
  @Input() label = 'Valor';

  @Input() startLabel = 'Inicial';
  @Input() endLabel = 'Final';

  @Input() minFractionDigits = 2;
  @Input() maxFractionDigits = 2;

  @Input() set value(value: CsCurrencyRangeValue | null | undefined) {
    this.startValue.set(value?.start ?? null);
    this.endValue.set(value?.end ?? null);
  }

  @Output() valueChange = new EventEmitter<CsCurrencyRangeValue>();

  protected readonly startValue = signal<number | null>(null);
  protected readonly endValue = signal<number | null>(null);

  protected readonly locale = computed(() => {
    this.i18n.appliedLang();
    return this.i18n.getLocale();
  });

  protected readonly currency = computed(() => {
    this.i18n.appliedLang();
    return this.i18n.getCurrency();
  });

  protected readonly hasValue = computed(
    () => this.startValue() !== null || this.endValue() !== null,
  );

  protected onStartChange(value: number | null): void {
    this.startValue.set(value ?? null);
    this.emitChange();
  }

  protected onEndChange(value: number | null): void {
    this.endValue.set(value ?? null);
    this.emitChange();
  }

  protected emitChange(): void {
    this.valueChange.emit({
      start: this.startValue(),
      end: this.endValue(),
    });
  }
}

export function currencyRangeLabel(
  i18n: I18nService,
  start: number | null | undefined,
  end: number | null | undefined,
): string | null {
  const hasStart = start !== null && start !== undefined;
  const hasEnd = end !== null && end !== undefined;

  if (!hasStart && !hasEnd) {
    return null;
  }

  if (hasStart && hasEnd) {
    return `${i18n.formatBrlCurrency(start)} ${i18n.tUi('common.to')} ${i18n.formatBrlCurrency(end)}`;
  }

  if (hasStart) {
    return `${i18n.tUi('common.from')} ${i18n.formatBrlCurrency(start)}`;
  }

  return `${i18n.tUi('common.until')} ${i18n.formatBrlCurrency(end)}`;
}
