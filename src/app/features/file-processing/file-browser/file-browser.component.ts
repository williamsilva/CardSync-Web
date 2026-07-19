import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { FloatLabel } from 'primeng/floatlabel';
import { TranslateModule } from '@ngx-translate/core';

import { I18nService } from '@core/i18n/i18n.service';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { STATE_KEY } from '@features/state-key.constants';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { FileProcessingService } from '@features/service/file-processing.service';
import {
  ActiveFilterItem,
  ActiveFilterGroup,
  FiltersPanelComponent,
} from '@shared/features/filters-panel/filters-panel.component';
import {
  FileBrowserFolder,
  FileUploadSystem,
  FileBrowserItemModel,
} from '@models/file-processing.models';

interface SystemOption {
  value: FileUploadSystem;
  label: string;
}

interface FolderOption {
  value: FileBrowserFolder;
  label: string;
}

interface FileBrowserFiltersState {
  system: FileUploadSystem | null;
  folder: FileBrowserFolder;
}

@Component({
  standalone: true,
  selector: 'cs-file-browser',
  styleUrl: './file-browser.component.scss',
  templateUrl: './file-browser.component.html',
  providers: [CsDatePipe],
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    SelectModule,
    FloatLabel,
    CsDatePipe,
    TooltipModule,
    TranslateModule,
    PageHeaderComponent,
    FiltersPanelComponent,
  ],
})
export class FileBrowserComponent {
  private static readonly DEFAULT_ROWS = 20;

  private readonly i18n = inject(I18nService);
  private readonly service = inject(FileProcessingService);

  protected readonly rowsPerPageOptions = [13, 20, 30, 50, 100, 300, 500, 1000];
  protected readonly tableStateKey = STATE_KEY.CARDSYNC.PROCESSED_FILES.BROWSER.TABLE.STATE.V1;

  protected rows =
    Number(localStorage.getItem(STATE_KEY.CARDSYNC.PROCESSED_FILES.BROWSER.TABLE.ROWS.V1)) ||
    FileBrowserComponent.DEFAULT_ROWS;

  protected readonly loading = signal(false);
  protected readonly system = signal<FileUploadSystem | null>(null);
  protected readonly folder = signal<FileBrowserFolder>('input');
  protected readonly files = signal<FileBrowserItemModel[] | null>(null);
  protected readonly searchedOnce = signal(false);

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

  protected readonly folderOptions = computed<FolderOption[]>(() => {
    this.i18n.getAppliedLang();
    return [
      { value: 'input', label: this.i18n.tUi('fileProcessing.browser.folders.input') },
      { value: 'processed', label: this.i18n.tUi('fileProcessing.browser.folders.processed') },
      { value: 'error', label: this.i18n.tUi('fileProcessing.browser.folders.error') },
      { value: 'duplicate', label: this.i18n.tUi('fileProcessing.browser.folders.duplicate') },
      {
        value: 'invalid_file',
        label: this.i18n.tUi('fileProcessing.browser.folders.invalidFile'),
      },
      { value: 'log', label: this.i18n.tUi('fileProcessing.browser.folders.log') },
    ];
  });

  protected readonly activeFilterGroups = computed<ActiveFilterGroup[]>(() => {
    this.i18n.getAppliedLang();
    const system = this.system();
    if (!system) return [];

    const items: ActiveFilterItem[] = [];

    const systemLabel = this.systemOptions().find((o) => o.value === system)?.label ?? system;
    items.push({ label: this.i18n.tUi('fileProcessing.upload.system'), value: systemLabel });

    const folder = this.folder();
    const folderLabel = this.folderOptions().find((o) => o.value === folder)?.label ?? folder;
    items.push({ label: this.i18n.tUi('fileProcessing.browser.folder'), value: folderLabel });

    return [{ title: this.i18n.tUi('common.filter'), filters: items }];
  });

  protected readonly activeFiltersCount = computed(() =>
    this.activeFilterGroups().reduce((sum, group) => sum + group.filters.length, 0),
  );

  constructor() {
    this.restoreFilters();
  }

  protected search(): void {
    const system = this.system();
    if (!system || this.loading()) return;

    this.persistFilters();
    this.loading.set(true);
    this.searchedOnce.set(true);

    this.service.browseFiles(system, this.folder()).subscribe({
      next: (items) => {
        this.files.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.files.set(null);
        this.loading.set(false);
      },
    });
  }

  protected refresh(): void {
    if (this.searchedOnce()) this.search();
  }

  protected clear(): void {
    this.system.set(null);
    this.folder.set('input');
    this.files.set(null);
    this.searchedOnce.set(false);
    localStorage.removeItem(STATE_KEY.CARDSYNC.PROCESSED_FILES.BROWSER.FILTERS.V1);
  }

  protected download(item: FileBrowserItemModel): void {
    const system = this.system();
    if (!system) return;

    const url = this.service.getDownloadUrl(system, this.folder(), item.name);
    window.open(url, '_blank');
  }

  protected formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private persistFilters(): void {
    const state: FileBrowserFiltersState = { system: this.system(), folder: this.folder() };
    localStorage.setItem(
      STATE_KEY.CARDSYNC.PROCESSED_FILES.BROWSER.FILTERS.V1,
      JSON.stringify(state),
    );
  }

  private restoreFilters(): void {
    const raw = localStorage.getItem(STATE_KEY.CARDSYNC.PROCESSED_FILES.BROWSER.FILTERS.V1);
    if (!raw) return;

    try {
      const state = JSON.parse(raw) as FileBrowserFiltersState;
      this.system.set(state.system ?? null);
      this.folder.set(state.folder ?? 'input');
    } catch {
      // estado inválido — ignora e mantém os defaults
    }
  }
}
