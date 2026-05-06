import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SelectModule } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  standalone: true,
  selector: 'cs-advanced-period-date-filter',
  imports: [CommonModule, FormsModule, SelectModule, FloatLabel, DatePickerModule],
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
  template: `
    <div [class]="periodColClass">
      <p-floatLabel variant="on" class="w-full">
        <p-select
          size="small"
          class="w-full"
          appendTo="body"
          [showClear]="true"
          [ngModel]="period"
          optionValue="value"
          optionLabel="label"
          [inputId]="periodInputId"
          [options]="periodOptions"
          [disabled]="disabledPeriod"
          (ngModelChange)="periodChange.emit($event ?? null)"
        ></p-select>

        <label [for]="periodInputId">{{ periodLabel }}</label>
      </p-floatLabel>
    </div>

    <div [class]="dateColClass">
      <p-floatLabel variant="on" class="w-full">
        <p-datepicker
          size="small"
          [view]="view"
          class="w-full"
          appendTo="body"
          dataType="string"
          [showIcon]="true"
          [ngModel]="value"
          [disabled]="disabled"
          [readonlyInput]="true"
          [inputId]="dateInputId"
          [dateFormat]="dateFormat"
          [selectionMode]="selectionMode"
          (ngModelChange)="valueChange.emit($event ?? null)"
        ></p-datepicker>

        <label [for]="dateInputId">{{ dateLabel }}</label>
      </p-floatLabel>
    </div>
  `,
})
export class CsAdvancedPeriodDateFilterComponent {
  @Input() periodInputId = '';
  @Input() dateInputId = '';

  @Input() periodLabel = '';
  @Input() dateLabel = '';

  @Input() period: any | null = null;
  @Input() value: string | string[] | null = null;

  @Input() periodOptions: any[] = [];

  @Input() disabled = false;
  @Input() disabledPeriod = false;
  @Input() view: any = 'date';
  @Input() dateFormat = 'dd/mm/yy';
  @Input() selectionMode: any = 'single';

  @Input() periodColClass = 'col-12 md:col-2 p-1';
  @Input() dateColClass = 'col-12 md:col-2 p-1';

  @Output() periodChange = new EventEmitter<any | null>();
  @Output() valueChange = new EventEmitter<string | string[] | null>();
}
