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

import { FlagModel } from '@models/flag.models';
import { I18nService } from '@core/i18n/i18n.service';
import { CompanyFacade } from '@features/facade/company.facade';
import { CsDocumentPipe } from '@shared/pipes/cs-document.pipe';
import { CompanyMinimalModel } from '@models/company-minimal.models';
import { ErrorMsgComponent } from '@shared/error-msg/error-msg.component';
import { FlagRelationsFacade } from '@features/facade/flag-relations.facade';
import { FlagPermissionPolicy } from '@features/security/policy/flag-permission.policy';
import { StatusEnum, statusEnumLabel, statusEnumSeverity } from '@models/enums/status.enum';

@Component({
  standalone: true,
  selector: 'app-flag-company-relations',
  templateUrl: './flag-company-relations.component.html',
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
    ErrorMsgComponent,
    ReactiveFormsModule,
    ConfirmDialogModule,
  ],
})
export class FlagCompanyRelationsComponent {
  flag = input.required<FlagModel>();
  @Output() changed = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly confirm = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  protected readonly secPolicy = inject(FlagPermissionPolicy);

  readonly i18n = inject(I18nService);
  readonly companyFacade = inject(CompanyFacade);
  readonly flagRelationsFacade = inject(FlagRelationsFacade);

  readonly addVisible = signal(false);
  readonly pendingCompanies = signal<CompanyMinimalModel[]>([]);

  readonly options = this.companyFacade.options;
  readonly saving = this.flagRelationsFacade.loading;

  readonly form = this.fb.nonNullable.group({
    companyId: ['', Validators.required],
  });

  readonly availableOptions = computed(() => {
    const linkedIds = new Set(
      (this.flag().companies ?? [])
        .map((item) => item.companyId)
        .filter((id): id is string => !!id),
    );

    const pendingIds = new Set(
      this.pendingCompanies()
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
    this.pendingCompanies.set([]);
    this.form.reset({ companyId: '' });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.addVisible.set(true);
  }

  closeAddDialog() {
    this.pendingCompanies.set([]);
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

    this.pendingCompanies.update((items) => [...items, company]);

    this.form.reset({ companyId: '' });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  removePendingCompany(companyId: string) {
    this.pendingCompanies.update((items) => items.filter((item) => item.id !== companyId));
  }

  saveRelations() {
    if (!this.secPolicy.canManageRelations()) return;
    const ids = this.pendingCompanies().map((item) => item.id);
    if (!ids.length) return;

    this.flagRelationsFacade.addCompanies(this.flag().id, ids, () => {
      this.closeAddDialog();
      this.changed.emit();
    });
  }

  confirmRemoveCompany(companyId: string, companyName: string) {
    if (!this.secPolicy.canRemoveRelations()) return;
    this.confirm.confirm({
      header: this.i18n.tUi('flag.relationships.removeCompany.header'),
      message: this.i18n.tUi('flag.relationships.removeCompany.message', {
        company: companyName,
        flag: this.flag().name,
      }),
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: this.i18n.tUi('common.yes'),
      rejectLabel: this.i18n.tUi('common.no'),
      accept: () => {
        this.flagRelationsFacade.removeCompany(this.flag().id, companyId, () => {
          this.messageService.add({
            severity: 'success',
            summary: this.i18n.tUi('common.success'),
            detail: this.i18n.tUi('flag.relationships.removeCompany.success', {
              company: companyName,
              flag: this.flag().name,
            }),
          });
          this.changed.emit();
        });
      },
    });
  }
}
