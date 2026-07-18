import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DividerModule } from 'primeng/divider';
import { FloatLabel } from 'primeng/floatlabel';
import { TranslateModule } from '@ngx-translate/core';

import { CsTagComponent, CsTagTone } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';
import { PERMISSIONS } from '@core/auth/permissions.constants';
import { PermissionService } from '@core/auth/permission.service';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { FileProcessingService } from '@features/service/file-processing.service';
import { FileUploadSystem, FileUploadItemResultModel } from '@models/file-processing.models';

interface SystemOption {
  value: FileUploadSystem;
  label: string;
}

@Component({
  standalone: true,
  selector: 'cs-file-upload',
  styleUrl: './file-upload.component.scss',
  templateUrl: './file-upload.component.html',
  imports: [
    FormsModule,
    CardModule,
    ButtonModule,
    SelectModule,
    DividerModule,
    FloatLabel,
    CsTagComponent,
    TranslateModule,
    PageHeaderComponent,
  ],
})
export class FileUploadComponent {
  private readonly i18n = inject(I18nService);
  private readonly perms = inject(PermissionService);
  private readonly service = inject(FileProcessingService);

  protected readonly uploading = signal(false);
  protected readonly processing = signal(false);
  protected readonly system = signal<FileUploadSystem | null>(null);
  protected readonly selectedFiles = signal<File[]>([]);
  protected readonly results = signal<FileUploadItemResultModel[] | null>(null);

  protected readonly canProcess = computed(() =>
    this.perms.hasSupportOr(PERMISSIONS.FILE_PROCESSING.PROCESS),
  );

  protected readonly systemOptions = computed<SystemOption[]>(() => {
    this.i18n.getAppliedLang();
    return [
      { value: 'erp', label: this.i18n.tUi('fileProcessing.upload.systems.erp') },
      { value: 'rede', label: this.i18n.tUi('fileProcessing.upload.systems.rede') },
      { value: 'itau', label: this.i18n.tUi('fileProcessing.upload.systems.itau') },
      { value: 'santander', label: this.i18n.tUi('fileProcessing.upload.systems.santander') },
      { value: 'bradesco', label: this.i18n.tUi('fileProcessing.upload.systems.bradesco') },
    ];
  });

  protected readonly canUpload = computed(
    () =>
      !!this.system() && this.selectedFiles().length > 0 && !this.uploading() && this.canProcess(),
  );

  protected readonly successCount = computed(
    () => this.results()?.filter((r) => r.success).length ?? 0,
  );
  protected readonly errorCount = computed(
    () => this.results()?.filter((r) => !r.success).length ?? 0,
  );

  protected onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    if (files.length) {
      this.selectedFiles.update((current) => [...current, ...files]);
      this.results.set(null);
    }
    input.value = '';
  }

  protected removeFile(index: number): void {
    this.selectedFiles.update((files) => files.filter((_, i) => i !== index));
  }

  protected clearFiles(): void {
    this.selectedFiles.set([]);
    this.results.set(null);
  }

  protected upload(): void {
    const system = this.system();
    const files = this.selectedFiles();
    if (!system || files.length === 0 || this.uploading()) return;

    this.uploading.set(true);
    this.service.uploadFiles(system, files).subscribe({
      next: (results) => {
        this.results.set(results);
        this.selectedFiles.set([]);
      },
      error: () => this.uploading.set(false),
      complete: () => this.uploading.set(false),
    });
  }

  protected processNow(): void {
    const system = this.system();
    if (!system || this.processing()) return;

    this.processing.set(true);
    const request$ =
      system === 'erp'
        ? this.service.processErp()
        : system === 'rede'
          ? this.service.processRede()
          : this.service.processBank();

    request$.subscribe({
      complete: () => this.processing.set(false),
      error: () => this.processing.set(false),
    });
  }

  protected resultTone(success: boolean): CsTagTone {
    return success ? 'success' : 'danger';
  }

  protected formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
