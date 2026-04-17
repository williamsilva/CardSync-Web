import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, EventEmitter, Output, computed, inject, input, signal } from '@angular/core';

import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { I18nService } from '@core/i18n/i18n.service';
import { AcquirerModel } from '@models/acquirer.models';
import { CsDocumentPipe } from '@shared/pipes/cs-document.pipe';
import { EstablishmentFacade } from '@features/facade/establishment.facade';
import { EstablishmentMinimalModel } from '@models/establishment-minimal.models';
import { AcquirerRelationsFacade } from '@features/facade/acquirer-relations.facade';
import { StatusEnum, statusEnumLabel, statusEnumSeverity } from '@models/enums/status.enum';
import { AcquirerPermissionPolicy } from '@features/security/policy/acquirer-permission.policy';
import {
  TypeEstablishmentEnum,
  typeEstablishmentEnumLabel,
  typeEstablishmentEnumSeverity,
} from '@models/enums/type-establishment.enum';

@Component({
  standalone: true,
  selector: 'app-acquirer-establishment-relations',
  templateUrl: './acquirer-establishment-relations.component.html',
  imports: [
    CommonModule,
    TagModule,
    TableModule,
    ButtonModule,
    DialogModule,
    SelectModule,
    CsDocumentPipe,
    TranslateModule,
    InputTextModule,
    FloatLabelModule,
    ReactiveFormsModule,
    ConfirmDialogModule,
  ],
})
export class AcquirerEstablishmentRelationsComponent {
  acquirer = input.required<AcquirerModel>();
  @Output() changed = new EventEmitter<void>();

  protected readonly fb = inject(FormBuilder);
  protected readonly confirm = inject(ConfirmationService);
  protected readonly messageService = inject(MessageService);
  protected readonly secPolicy = inject(AcquirerPermissionPolicy);

  readonly i18n = inject(I18nService);
  readonly establishmentFacade = inject(EstablishmentFacade);
  readonly acquirerRelationsFacade = inject(AcquirerRelationsFacade);
  readonly pendingRelations = signal<EstablishmentMinimalModel[]>([]);

  readonly addVisible = signal(false);
  readonly options = this.establishmentFacade.options;
  readonly saving = this.acquirerRelationsFacade.loading;

  readonly form = this.fb.nonNullable.group({
    establishmentId: ['', Validators.required],
  });

  readonly availableOptions = computed(() => {
    const linkedIds = new Set(
      (this.acquirer().establishments ?? [])
        .map((item) => item.establishmentId)
        .filter((id): id is string => !!id),
    );

    const pendingIds = new Set(
      this.pendingRelations()
        .map((item) => item.id)
        .filter((id): id is string => !!id),
    );

    return this.options().filter((item) => !linkedIds.has(item.id) && !pendingIds.has(item.id));
  });

  readonly canRemoveRelations = computed(() => {
    return this.secPolicy.canRemoveRelations();
  });

  constructor() {
    this.establishmentFacade.loadEstablishmentOptionsFilter();
  }

  get establishmentIdCtrl() {
    return this.form.controls.establishmentId;
  }

  statusLabel(status: StatusEnum | null) {
    return statusEnumLabel(status, this.i18n);
  }

  statusSeverity(status: StatusEnum | null) {
    return statusEnumSeverity(status);
  }

  typeEstablishmentEnumLabel(status: TypeEstablishmentEnum | null) {
    return typeEstablishmentEnumLabel(status, this.i18n);
  }

  severityTypeEstablishmentEnum(status: TypeEstablishmentEnum | null) {
    return typeEstablishmentEnumSeverity(status);
  }

  openAddDialog() {
    if (!this.secPolicy.canManageRelations()) return;
    this.pendingRelations.set([]);
    this.form.reset({ establishmentId: '' });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.addVisible.set(true);
  }

  closeAddDialog() {
    this.pendingRelations.set([]);
    this.form.reset({ establishmentId: '' });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.addVisible.set(false);
  }

  addRelationToList() {
    if (!this.secPolicy.canManageRelations()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const establishmentId = this.establishmentIdCtrl.value;
    const establishment = this.availableOptions().find((item) => item.id === establishmentId);
    if (!establishment) return;

    this.pendingRelations.update((items) => [...items, establishment]);

    this.form.reset({ establishmentId: '' });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  removePendingRelation(establishmentId: string) {
    this.pendingRelations.update((items) => items.filter((item) => item.id !== establishmentId));
  }

  saveRelations() {
    if (!this.secPolicy.canManageRelations()) return;
    const ids = this.pendingRelations().map((item) => item.id);

    if (!ids.length) return;

    this.acquirerRelationsFacade.addEstablishmentRelations(this.acquirer().id, ids, () => {
      this.closeAddDialog();
      this.changed.emit();
    });
  }

  confirmRemoveEstablishment(establishmentId: string, establishmentPvNumber: string) {
    if (!this.secPolicy.canRemoveRelations()) return;
    this.confirm.confirm({
      header: this.i18n.tUi('acquirer.relationships.removeEstablishment.header'),
      message: this.i18n.tUi('acquirer.relationships.removeEstablishment.message', {
        establishment: establishmentPvNumber,
        acquirer: this.acquirer().fantasyName,
      }),
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: this.i18n.tUi('common.yes'),
      rejectLabel: this.i18n.tUi('common.no'),
      accept: () => {
        this.acquirerRelationsFacade.removeEstablishment(
          this.acquirer().id,
          establishmentId,
          () => {
            this.messageService.add({
              severity: 'success',
              summary: this.i18n.tUi('common.success'),
              detail: this.i18n.tUi('acquirer.relationships.removeEstablishment.success', {
                establishment: establishmentPvNumber,
                acquirer: this.acquirer().fantasyName,
              }),
            });
            this.changed.emit();
          },
        );
      },
    });
  }
}
