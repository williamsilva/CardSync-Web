
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
import { I18nService } from '@core/i18n/i18n.service';
import { AcquirerModel } from '@models/acquirer.models';
import { CsDocumentPipe } from '@shared/pipes/cs-document.pipe';
import { CompanyFacade } from '@features/facade/company.facade';
import { CompanyMinimalModel } from '@models/company-minimal.models';
import { AcquirerMinimalModel } from '@models/acquirer-minimal.models';
import { ErrorMsgComponent } from '@shared/error-msg/error-msg.component';
import { EstablishmentFacade } from '@features/facade/establishment.facade';
import { AcquirerRelationsFacade } from '@features/facade/acquirer-relations.facade';
import { AcquirerPermissionPolicy } from '@features/security/policy/acquirer-permission.policy';
import {
  StatusEnum,
  allStatusEnum,
  statusEnumLabel,
  statusEnumSeverity,
} from '@models/enums/status.enum';
import {
  TypeEstablishmentEnum,
  allTypeEstablishmentEnum,
  typeEstablishmentEnumLabel,
  typeEstablishmentEnumSeverity,
} from '@models/enums/type-establishment.enum';

type PendingEstablishmentRelation = {
  pvNumber: number;
  status: StatusEnum | null;
  type: TypeEstablishmentEnum | null;
  company: CompanyMinimalModel;
  acquirer: AcquirerMinimalModel;
};

@Component({
  standalone: true,
  selector: 'app-acquirer-establishment-relations',
  templateUrl: './acquirer-establishment-relations.component.html',
  imports: [
    TableModule,
    ButtonModule,
    DialogModule,
    SelectModule,
    CsTagComponent,
    CsDocumentPipe,
    TranslateModule,
    InputTextModule,
    FloatLabelModule,
    ErrorMsgComponent,
    ReactiveFormsModule,
    ConfirmDialogModule
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
  readonly companyFacade = inject(CompanyFacade);
  readonly establishmentFacade = inject(EstablishmentFacade);
  readonly acquirerRelationsFacade = inject(AcquirerRelationsFacade);
  readonly pendingRelations = signal<PendingEstablishmentRelation[]>([]);

  readonly addVisible = signal(false);
  readonly options = this.establishmentFacade.options;
  readonly companyOptions = this.companyFacade.options;
  readonly saving = this.acquirerRelationsFacade.loading;

  readonly typeEstablishmentOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allTypeEstablishmentEnum().map((value) => ({
      label: typeEstablishmentEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly statusOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allStatusEnum().map((value) => ({
      label: statusEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly form = this.fb.group({
    acquirer: this.fb.control<AcquirerMinimalModel | null>(null),
    companyId: this.fb.control<string | null>(null, [Validators.required]),
    status: this.fb.control<StatusEnum | null>(null, [Validators.required]),
    type: this.fb.control<TypeEstablishmentEnum | null>(null, [Validators.required]),

    pvNumber: this.fb.nonNullable.control<number | null>(null, [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(20),
    ]),
  });

  readonly canRemoveRelations = computed(() => {
    return this.secPolicy.canRemoveRelations();
  });

  constructor() {
    this.companyFacade.loadCompanyOptionsFilter();
    this.establishmentFacade.loadEstablishmentOptionsFilter();
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
    this.form.reset({
      type: null,
      status: null,
      pvNumber: null,
      acquirer: null,
      companyId: null,
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.addVisible.set(true);
  }

  closeAddDialog() {
    this.pendingRelations.set([]);
    this.form.reset({
      type: null,
      status: null,
      pvNumber: null,
      acquirer: null,
      companyId: null,
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.addVisible.set(false);
  }

  addRelationToList() {
    if (!this.secPolicy.canManageRelations()) return;

    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const type = this.typeCtrl.value;
    const status = this.statusCtrl.value;
    const pvNumber = this.pvNumberCtrl.value;
    const companyId = this.companyIdCtrl.value;

    const company = this.companyOptions().find((item) => item.id === companyId) ?? null;
    if (!company || !pvNumber) return;

    this.pendingRelations.update((items) => [
      ...items,
      {
        type,
        status,
        company,
        acquirer: {
          cnpj: '',
          status: null,
          socialReason: '',
          id: this.acquirer().id,
          fantasyName: this.acquirer().fantasyName,
        },
        pvNumber,
      },
    ]);

    this.form.reset({
      type: null,
      status: null,
      acquirer: null,
      pvNumber: null,
      companyId: null,
    });

    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  removePendingRelation(pvNumber: number) {
    this.pendingRelations.update((items) => items.filter((item) => item.pvNumber !== pvNumber));
  }

  saveRelations() {
    if (!this.secPolicy.canManageRelations()) return;
    const items = this.pendingRelations().map((item) => ({
      type: item.type,
      status: item.status,
      pvNumber: item.pvNumber,
      companyId: item.company?.id,
    }));

    if (!items.length) return;

    this.acquirerRelationsFacade.addEstablishmentRelations(this.acquirer().id, { items }, () => {
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

  get typeCtrl() {
    return this.form.controls.type;
  }

  get statusCtrl() {
    return this.form.controls.status;
  }

  get pvNumberCtrl() {
    return this.form.controls.pvNumber;
  }

  get acquirerCtrl() {
    return this.form.controls.acquirer;
  }

  get companyIdCtrl() {
    return this.form.controls.companyId;
  }
}
