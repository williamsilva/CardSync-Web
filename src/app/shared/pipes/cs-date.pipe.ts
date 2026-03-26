import { Pipe, PipeTransform, inject, signal } from '@angular/core';
import { formatDate } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { Lang } from '../../core/i18n/i18n.types';

type CsDatePreset = 'short' | 'medium' | 'date' | 'datetime' | 'time';

@Pipe({
  name: 'csDate',
  standalone: true,
  pure: false,
})
export class CsDatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);
  private readonly translate = inject(TranslateService);
  private readonly tick = signal(0);

  constructor() {
    this.translate.onLangChange.subscribe(() => {
      this.tick.update((v) => v + 1);
    });
  }

  transform(
    value: string | Date | number | null | undefined,
    preset: CsDatePreset | string = 'short',
    timezone?: string,
    locale?: string,
  ): string {
    this.tick();

    if (value == null || value === '') {
      return '-';
    }

    const parsed = this.normalizeDate(value);
    if (!parsed) {
      return '-';
    }

    const lang = this.i18n.getAppliedLang();
    const resolvedLocale = locale ?? this.i18n.getDateLocale();
    const resolvedTimezone = timezone ?? this.i18n.getDateTimeZone();
    const format = this.resolveFormat(preset, lang);

    try {
      return formatDate(parsed, format, resolvedLocale, resolvedTimezone);
    } catch {
      return '-';
    }
  }

  private normalizeDate(value: string | Date | number): Date | null {
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === 'number') {
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
    }

    if (typeof value === 'string') {
      const raw = value.trim();
      if (!raw) {
        return null;
      }

      const d = new Date(raw);
      return Number.isNaN(d.getTime()) ? null : d;
    }

    return null;
  }

  private resolveFormat(preset: CsDatePreset | string, lang: Lang): string {
    switch (preset) {
      case 'date':
        return lang === 'en' ? 'MM/dd/yyyy' : 'dd/MM/yyyy';
      case 'time':
        return 'HH:mm:ss';
      case 'datetime':
        return lang === 'en' ? 'MM/dd/yyyy HH:mm:ss' : 'dd/MM/yyyy HH:mm:ss';
      case 'medium':
      case 'short':
        return lang === 'en' ? 'MM/dd/yyyy HH:mm' : 'dd/MM/yyyy HH:mm';
      default:
        return preset;
    }
  }
}
