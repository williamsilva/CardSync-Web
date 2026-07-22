
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
import { ErrorMsgComponent } from '@shared/error-msg/error-msg.component';
import { AcquirerRelationsFacade } from '@features/facade/acquirer-relations.facade';
import { StatusEnum, statusEnumLabel, statusEnumSeverity } from '@models/enums/status.enum';
import { AcquirerPermissionPolicy } from '@features/security/policy/acquirer-permission.policy';

@Component({
  standalone: true,
  selector: 'app-acquirer-company-relations',
  templateUrl: './acquirer-company-relations.component.html',
  imports: [
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
    ConfirmDialogModule
],
})
export class AcquirerCompanyRelationsComponent {
  acquirer = input.required<AcquirerModel>();
  @Output() changed = new EventEmitter<void>();

  protected readonly fb = inject(FormBuilder);
  protected readonly confirm = inject(ConfirmationService);
  protected readonly messageService = inject(MessageService);
  protected readonly secPolicy = inject(AcquirerPermissionPolicy);

  readonly i18n = inject(I18nService);
  readonly companyFacade = inject(CompanyFacade);
  readonly pendingRelations = signal<CompanyMinimalModel[]>([]);
  readonly acquirerRelationsFacade = inject(AcquirerRelationsFacade);

  readonly addVisible = signal(false);
  readonly options = this.companyFacade.options;
  readonly saving = this.acquirerRelationsFacade.loading;

  readonly form = this.fb.nonNullable.group({
    companyId: ['', Validators.required],
  });

  readonly availableOptions = computed(() => {
    const linkedIds = new Set(
      (this.acquirer().companies ?? [])
        .map((item) => item.companyId)
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
    this.companyFacade.loadCompanyOptionsFilter();
  }

  get companyIdCtrl() {
    return this.form.controls.companyId;
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
    this.form.reset({ companyId: '' });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.addVisible.set(true);
  }

  closeAddDialog() {
    this.pendingRelations.set([]);
    this.form.reset({ companyId: '' });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.addVisible.set(false);
  }

  addRelationToList() {
    if (!this.secPolicy.canManageRelations()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const companyId = this.companyIdCtrl.value;
    const company = this.availableOptions().find((item) => item.id === companyId);
    if (!company) return;

    this.pendingRelations.update((items) => [...items, company]);

    this.form.reset({ companyId: '' });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  removePendingCompany(companyId: string) {
    this.pendingRelations.update((items) => items.filter((item) => item.id !== companyId));
  }

  saveRelations() {
    if (!this.secPolicy.canManageRelations()) return;
    const ids = this.pendingRelations().map((item) => item.id);
    if (!ids.length) return;

    this.acquirerRelationsFacade.addCompanies(this.acquirer().id, ids, () => {
      this.closeAddDialog();
      this.changed.emit();
    });
  }

  confirmRemoveCompany(companyId: string, companyName: string) {
    if (!this.secPolicy.canRemoveRelations()) return;
    this.confirm.confirm({
      header: this.i18n.tUi('acquirer.relationships.removeCompany.header'),
      message: this.i18n.tUi('acquirer.relationships.removeCompany.message', {
        company: companyName,
        acquirer: this.acquirer().fantasyName,
      }),
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: this.i18n.tUi('common.yes'),
      rejectLabel: this.i18n.tUi('common.no'),
      accept: () => {
        this.acquirerRelationsFacade.removeCompany(this.acquirer().id, companyId, () => {
          this.messageService.add({
            severity: 'success',
            summary: this.i18n.tUi('common.success'),
            detail: this.i18n.tUi('acquirer.relationships.removeCompany.success', {
              company: companyName,
              acquirer: this.acquirer().fantasyName,
            }),
          });
          this.changed.emit();
        });
      },
    });
  }
}
