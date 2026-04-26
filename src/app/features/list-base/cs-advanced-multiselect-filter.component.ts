import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, ContentChild, EventEmitter, Input, Output } from '@angular/core';

import { FloatLabel } from 'primeng/floatlabel';
import { MultiSelectModule } from 'primeng/multiselect';

import { CsAdvancedFilterItemTemplateDirective } from './cs-advanced-filter-item-template.directive';

@Component({
  standalone: true,
  selector: 'cs-advanced-multiselect-filter',
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
          <ng-container
            *ngIf="itemTemplate; else defaultItemTemplate"
            [ngTemplateOutlet]="itemTemplate.templateRef"
            [ngTemplateOutletContext]="{ $implicit: option, option: option }"
          ></ng-container>

          <ng-template #defaultItemTemplate>
            {{ getOptionLabel(option) }}
          </ng-template>
        </ng-template>
      </p-multiSelect>

      <label [for]="inputId">{{ label }}</label>
    </p-floatLabel>
  `,
})
export class CsAdvancedMultiselectFilterComponent {
  @Input() inputId = '';
  @Input() label = '';
  @Input() value: any[] | null = null;
  @Input() options: any[] = [];

  @Input() optionLabel = 'label';
  @Input() optionValue = 'value';

  @Input() filter = true;
  @Input() disabled = false;
  @Input() showClear = true;
  @Input() showToggleAll = false;

  @Output() valueChange = new EventEmitter<any[] | null>();

  @ContentChild(CsAdvancedFilterItemTemplateDirective)
  itemTemplate?: CsAdvancedFilterItemTemplateDirective;

  onValueChange(value: any[] | null | undefined): void {
    this.valueChange.emit(value?.length ? value : null);
  }

  getOptionLabel(option: any): string {
    if (!option) {
      return '';
    }

    return this.optionLabel ? String(option?.[this.optionLabel] ?? '') : String(option);
  }
}
