import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  Input,
  Output,
  Component,
  OnChanges,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TranslateModule } from '@ngx-translate/core';

export interface ErpEditIdentityPayload {
  nsu: number | null;
  authorization: string | null;
}

@Component({
  standalone: true,
  selector: 'cs-erp-edit-identity-dialog',
  templateUrl: './erp-edit-identity-dialog.component.html',
  styleUrl: './erp-edit-identity-dialog.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    FloatLabelModule,
    InputTextModule,
    InputNumberModule,
    TranslateModule,
  ],
})
export class ErpEditIdentityDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input() resolving = false;
  @Input() initialNsu: number | null = null;
  @Input() initialAuthorization: string | null = null;

  @Output() closeDialog = new EventEmitter<void>();
  @Output() confirmEdit = new EventEmitter<ErpEditIdentityPayload>();
  @Output() visibleChange = new EventEmitter<boolean>();

  protected nsu: number | null = null;
  protected authorization: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.nsu = this.initialNsu;
      this.authorization = this.initialAuthorization ?? null;
    }
  }

  protected onConfirmClick(): void {
    this.confirmEdit.emit({ nsu: this.nsu, authorization: this.authorization ?? null });
  }

  protected onVisibleChange(value: boolean): void {
    this.visibleChange.emit(value);
  }
}
