import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, EventEmitter, Output, computed, inject, input, signal } from '@angular/core';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { CsTagComponent } from '@shared/ui';
import { FlagModel } from '@models/flag.models';
import { I18nService } from '@core/i18n/i18n.service';
import { CsDocumentPipe } from '@shared/pipes/cs-document.pipe';
import { AcquirerFacade } from '@features/facade/acquirer.facade';
import { ErrorMsgComponent } from '@shared/error-msg/error-msg.component';
import { FlagRelationsFacade } from '@features/facade/flag-relations.facade';
import { FlagPermissionPolicy } from '@features/security/policy/flag-permission.policy';
import { StatusEnum, statusEnumLabel, statusEnumSeverity } from '@models/enums/status.enum';

type PendingAcquirerRelation = {
  acquirerId: string;
  acquirerName: string;
  acquirerCode: string;
};

@Component({
  standalone: true,
  selector: 'app-flag-acquirer-relations',
  templateUrl: './flag-acquirer-relations.component.html',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    SelectModule,
    CsDocumentPipe,
    CsTagComponent,
    TranslateModule,
    InputTextModule,
    FloatLabelModule,
    ErrorMsgComponent,
    ReactiveFormsModule,
    ConfirmDialogModule,
  ],
})
export class FlagAcquirerRelationsComponent {
  flag = input.required<FlagModel>();
  @Output() changed = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly confirm = inject(ConfirmationService);

  readonly i18n = inject(I18nService);
  readonly acquirerFacade = inject(AcquirerFacade);
  private readonly messageService = inject(MessageService);
  readonly flagRelationsFacade = inject(FlagRelationsFacade);
  protected readonly secPolicy = inject(FlagPermissionPolicy);

  readonly addVisible = signal(false);
  readonly pendingRelations = signal<PendingAcquirerRelation[]>([]);

  readonly options = this.acquirerFacade.options;
  readonly saving = this.flagRelationsFacade.loading;

  readonly form = this.fb.nonNullable.group({
    acquirerId: ['', Validators.required],
    acquirerCode: [
      '',
      [Validators.required, Validators.maxLength(2), Validators.pattern(/^[a-zA-Z0-9_-]+$/)],
    ],
  });

  readonly availableOptions = computed(() => {
    const linkedIds = new Set(
      (this.flag().acquirers ?? [])
        .map((item) => item.acquirerId)
        .filter((id): id is string => !!id),
    );

    const pendingIds = new Set(
      this.pendingRelations()
        .map((item) => item.acquirerId)
        .filter((id): id is string => !!id),
    );

    return this.options().filter((item) => !linkedIds.has(item.id) && !pendingIds.has(item.id));
  });

  readonly canRemoveRelations = computed(() => {
    return this.secPolicy.canRemoveRelations();
  });

  constructor() {
    this.acquirerFacade.loadAcquirerOptionsFilter();
  }

  statusLabel(status: StatusEnum | null) {
    return statusEnumLabel(status, this.i18n);
  }

  statusSeverity(status: StatusEnum | null) {
    return statusEnumSeverity(status);
  }

  openAddDialog() {
    if (!this.secPolicy.canManageRelations()) return;
    this.pendingRelations.set([]);
    this.form.reset({ acquirerId: '', acquirerCode: '' });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.addVisible.set(true);
  }

  closeAddDialog() {
    this.pendingRelations.set([]);
    this.form.reset({ acquirerId: '', acquirerCode: '' });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.addVisible.set(false);
  }

  addRelationToList() {
    if (!this.secPolicy.canManageRelations()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const acquirerId = this.acquirerIdCtrl.value;
    const acquirerCode = this.acquirerCodeCtrl.value.trim();

    const acquirer = this.availableOptions().find((item) => item.id === acquirerId);
    if (!acquirer) return;

    this.pendingRelations.update((items) => [
      ...items,
      {
        acquirerId: acquirer.id,
        acquirerName: acquirer.fantasyName,
        acquirerCode,
      },
    ]);

    this.form.reset({ acquirerId: '', acquirerCode: '' });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  removePendingRelation(acquirerId: string) {
    this.pendingRelations.update((items) => items.filter((item) => item.acquirerId !== acquirerId));
  }

  saveRelations() {
    if (!this.secPolicy.canManageRelations()) return;
    const items = this.pendingRelations().map((item) => ({
      acquirerId: item.acquirerId,
      acquirerCode: item.acquirerCode,
    }));

    if (!items.length) return;

    this.flagRelationsFacade.addAcquirerRelations(this.flag().id, { items }, () => {
      this.closeAddDialog();
      this.changed.emit();
    });
  }

  confirmRemoveAcquirer(acquirerId: string, acquirerName: string) {
    if (!this.secPolicy.canRemoveRelations()) return;
    this.confirm.confirm({
      header: this.i18n.tUi('flag.relationships.removeAcquirer.header'),
      message: this.i18n.tUi('flag.relationships.removeAcquirer.message', {
        acquirer: acquirerName,
        flag: this.flag().name,
      }),
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: this.i18n.tUi('common.yes'),
      rejectLabel: this.i18n.tUi('common.no'),
      accept: () => {
        this.flagRelationsFacade.removeAcquirer(this.flag().id, acquirerId, () => {
          this.messageService.add({
            severity: 'success',
            summary: this.i18n.tUi('common.success'),
            detail: this.i18n.tUi('flag.relationships.removeAcquirer.success', {
              acquirer: acquirerName,
              flag: this.flag().name,
            }),
          });
          this.changed.emit();
        });
      },
    });
  }

  get acquirerIdCtrl() {
    return this.form.controls.acquirerId;
  }

  get acquirerCodeCtrl() {
    return this.form.controls.acquirerCode;
  }
}
