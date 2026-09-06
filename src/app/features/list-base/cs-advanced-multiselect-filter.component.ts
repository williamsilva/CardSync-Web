import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  Input,
  Output,
  Component,
  OnChanges,
  ContentChild,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';

import { FloatLabel } from 'primeng/floatlabel';
import { MultiSelectModule } from 'primeng/multiselect';

import { CsAdvancedFilterItemTemplateDirective } from './cs-advanced-filter-item-template.directive';

@Component({
  standalone: true,
  selector: 'app-advanced-multiselect-filter',
  imports: [CommonModule, FormsModule, FloatLabel, MultiSelectModule],
  host: {
    class: 'block',
  },
  template: `
    <p-floatLabel variant="on" class="w-full">
      <p-multiSelect
        size="small"
        class="w-full"
        appendTo="body"
        [filter]="filter"
        [ngModel]="value"
        [options]="options"
        [inputId]="inputId"
        [disabled]="disabled"
        [showClear]="showClear"
        [optionLabel]="optionLabel"
        [optionValue]="optionValue"
        [showToggleAll]="showToggleAll"
        (ngModelChange)="onValueChange($event)"
        >
        <ng-template pTemplate="item" let-option>
          @if (itemTemplate) {
            <ng-container
              [ngTemplateOutlet]="itemTemplate.templateRef"
              [ngTemplateOutletContext]="{ $implicit: option, option: option }"
            ></ng-container>
          } @else {
            {{ getOptionLabel(option) }}
          }
    
        </ng-template>
      </p-multiSelect>
    
      <label [for]="inputId">{{ label }}</label>
    </p-floatLabel>
    `,
})
// options/value ficam any de propósito: este filtro genérico é usado por ~20 telas com listas de
// opções de shapes concretos diferentes (AcquirerMinimalModel, SelectOption<string>, etc.) e
// value é o array de valores selecionados (normalmente string[], mas o componente não assume
// isso) - tipar como Record<string, unknown>[]/unknown[] quebra a atribuição em todos os
// consumidores, já que interfaces concretas sem index signature não satisfazem Record.
export class CsAdvancedMultiselectFilterComponent implements OnChanges {
  @Input() label = '';
  @Input() inputId = '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() options: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() value: any[] | null = null;

  @Input() optionLabel = 'label';
  @Input() optionValue = 'value';

  @Input() filter = true;
  @Input() disabled = false;
  @Input() showClear = true;
  @Input() showToggleAll = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Output() valueChange = new EventEmitter<any[] | null>();

  @ContentChild(CsAdvancedFilterItemTemplateDirective)
  itemTemplate?: CsAdvancedFilterItemTemplateDirective;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['options'] &&
      this.options?.length === 1 &&
      (!this.value || this.value.length === 0)
    ) {
      const raw = this.options[0];
      const val = this.optionValue ? raw[this.optionValue] : raw;
      this.value = [val];
      this.valueChange.emit([val]);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onValueChange(value: any[] | null | undefined): void {
    this.valueChange.emit(value?.length ? value : null);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getOptionLabel(option: any): string {
    if (!option) {
      return '';
    }

    return this.optionLabel ? String(option?.[this.optionLabel] ?? '') : String(option);
  }
}
