
import { Component, EventEmitter, Output, input } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';

import { FlagModel } from '@models/flag.models';
import { FlagPermissionPolicy } from '@features/security/policy/flag-permission.policy';

@Component({
  standalone: true,
  selector: 'app-flag-row-actions',
  templateUrl: './flag-row-actions.component.html',
  imports: [ButtonModule, TooltipModule, TranslateModule],
})
export class FlagRowActionsComponent {
  row = input.required<FlagModel>();
  secPolicy = input.required<FlagPermissionPolicy>();

  @Output() edit = new EventEmitter<FlagModel>();
  @Output() block = new EventEmitter<FlagModel>();
  @Output() activate = new EventEmitter<FlagModel>();
  @Output() deactivate = new EventEmitter<FlagModel>();

  onEdit() {
    this.edit.emit(this.row());
  }

  onActivate() {
    this.activate.emit(this.row());
  }

  onDeactivate() {
    this.deactivate.emit(this.row());
  }

  onBlock() {
    this.block.emit(this.row());
  }
}
