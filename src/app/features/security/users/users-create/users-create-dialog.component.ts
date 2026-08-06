
import { computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { input, effect, signal, Output, inject, Component, EventEmitter } from '@angular/core';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectModule } from 'primeng/multiselect';

import { APP_KEY } from '@core/api/api.config';
import { I18nService } from '@core/i18n/i18n.service';
import { UsersFacade } from '@features/facade/users.facade';
import { GroupsFacade } from '@features/facade/groups.facade';
import { UserCreateInput, UserModel } from '@models/users.models';
import { isPendingPassword } from '@models/enums/user-status.enum';
import { cpfCnpjValidator } from '@shared/validators/cpf-cnpj.validator';
import { ErrorMsgComponent } from '@shared/error-msg/error-msg.component';
import { CpfCnpjMaskDirective } from '@shared/directives/cpf-cnpj-mask.directive';

@Component({
  standalone: true,
  selector: 'app-users-create-dialog',
  templateUrl: './users-create-dialog.component.html',
  imports: [
    ToastModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    TranslateModule,
    FloatLabelModule,
    ErrorMsgComponent,
    MultiSelectModule,
    ReactiveFormsModule,
    CpfCnpjMaskDirective
],
})
export class UsersCreateDialogComponent {
  visible = input.required<boolean>();
  user = input<UserModel | null>(null);

  @Output() saved = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();
  @Output() visibleChange = new EventEmitter<boolean>();

  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly i18n = inject(I18nService);
  readonly groups = inject(GroupsFacade);
  readonly sendingInvite = signal(false);
  readonly usersFacade = inject(UsersFacade);
  readonly loadedUser = signal<UserModel | null>(null);

  readonly isEditMode = computed(() => !!this.user());

  readonly saving = signal(false);
  readonly submitted = signal(false);

  readonly loadingUser = signal(false);
  private lastLoadedId: string | null = null;
  readonly groupOptions = this.groups.options;

  /** Grupos do usuário que pertencem a outro app (ex.: nimbusflow) — não editáveis aqui, mas
   * preservados no save. Ver comentário no effect abaixo. */
  private readonly otherAppGroupIds = signal<string[]>([]);

  readonly form = this.fb.nonNullable.group({
    document: ['', [Validators.required, cpfCnpjValidator()]],
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    userName: [
      '',
      [Validators.required, Validators.email, Validators.minLength(3), Validators.maxLength(255)],
    ],
    groupIds: this.fb.nonNullable.control<string[]>(
      [],
      [Validators.required, Validators.minLength(1)],
    ),
  });

  readonly canResendInvite = computed(() => {
    if (!this.isEditMode()) return false;
    const u = this.loadedUser();
    if (!u) return false;
    return isPendingPassword(u.status);
  });

  constructor() {
    this.groups.loadGroupOptions();

    effect(() => {
      if (!this.visible()) return;

      const user = this.user();
      if (!user) {
        this.lastLoadedId = null;
        this.resetFormForCreate();
        return;
      }

      if (this.lastLoadedId === user.id) return;
      this.lastLoadedId = user.id;

      this.loadedUser.set(user);
      this.loadingUser.set(true);

      const digitsDoc = String(user?.document ?? '').replace(/\D+/g, '');
      const groupsRaw = Array.isArray(user?.groups) ? (user.groups as any[]) : [];

      // O catálogo de grupos do NimbusAuth é compartilhado entre apps (cardsync, nimbusflow,
      // ...) — um usuário pode pertencer a grupos de outros apps que este seletor (escopado a
      // appKey=cardsync, ver GroupsFacade/groupOptions) nem lista. Sem separar os dois, o
      // multiselect contava TODOS os grupos do usuário como "selecionados" (badge inflado,
      // ex.: "6 itens" quando só 1 era do cardsync) e, pior, salvar sem tocar em "Grupos"
      // arriscava apagar a associação do usuário a grupos de outros apps (UserService#update
      // no NimbusAuth substitui o Set de grupos inteiro, não faz merge). Os de outros apps
      // ficam guardados à parte e são recolocados no payload no save.
      const cardsyncGroupIds = groupsRaw
        .filter((g) => typeof g === 'string' || g?.appKey === APP_KEY)
        .map((g) => (typeof g === 'string' ? g : g?.id))
        .filter(Boolean);

      const otherAppGroupIds = groupsRaw
        .filter((g) => typeof g !== 'string' && g?.appKey && g.appKey !== APP_KEY)
        .map((g) => g?.id)
        .filter(Boolean);

      this.otherAppGroupIds.set(otherAppGroupIds);

      this.form.reset({
        name: user?.name ?? '',
        userName: user?.userName ?? '',
        document: digitsDoc,
        groupIds: cardsyncGroupIds,
      });

      this.submitted.set(false);
      this.loadingUser.set(false);
    });
  }

  onResendInvite() {
    const id = this.user()?.id;
    if (!id) return;
    if (!this.canResendInvite()) return;

    this.sendingInvite.set(true);

    this.usersFacade
      .resendInvite(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.add({
            severity: 'success',
            summary: this.i18n.tUi('common.success'),
            detail: this.i18n.tUi('users.invite.resent'),
          });
        },
        error: () => {
          this.toast.add({
            severity: 'error',
            summary: this.i18n.tUi('common.error'),
            detail: this.i18n.tUi('users.invite.resendError'),
          });
        },
        complete: () => this.sendingInvite.set(false),
      });
  }

  onHide() {
    this.close();
  }

  close() {
    this.loadedUser.set(null);
    this.submitted.set(false);
    this.saving.set(false);
    this.loadingUser.set(false);
    this.lastLoadedId = null;
    this.resetFormForCreate();
    this.visibleChange.emit(false);
  }

  save() {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();

    if (this.form.invalid) {
      this.focusFirstInvalid();
      return;
    }

    const v = this.form.getRawValue();
    // Recoloca os grupos de outros apps (não editáveis neste seletor) junto com os do cardsync
    // selecionados no form — ver comentário no effect do construtor. Sem isso, salvar o usuário
    // apagaria a associação dele a grupos de outros apps Nimbus.
    const groupIds = Array.from(new Set([...(v.groupIds ?? []), ...this.otherAppGroupIds()]));
    const payload: UserCreateInput = {
      name: v.name.trim(),
      userName: (v.userName ?? '').trim().toLowerCase(),
      document: String(v.document ?? '').replace(/\D+/g, ''),
      groupIds: groupIds.length ? groupIds : undefined,
    };

    this.saving.set(true);

    const id = this.user()?.id;
    const req$ = id ? this.usersFacade.update(id, payload) : this.usersFacade.create(payload);

    req$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);

        const isEdit = !!id;
        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: isEdit
            ? this.i18n.tUi('users.form.updated')
            : this.i18n.tUi('users.form.created'),
        });

        if (isEdit) this.updated.emit();
        else this.created.emit();

        this.saved.emit();
        this.close();
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }

  private focusFirstInvalid() {
    const firstInvalidName = Object.keys(this.form.controls).find(
      (key) => this.form.controls[key as keyof typeof this.form.controls].invalid,
    );
    if (!firstInvalidName) return;

    const el =
      document.getElementById(firstInvalidName) ||
      document.querySelector<HTMLElement>(`[inputId="${firstInvalidName}"]`) ||
      document.querySelector<HTMLElement>(`[formcontrolname="${firstInvalidName}"]`);

    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const focusTarget =
      el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
        ? el
        : ((el.querySelector('input,textarea,[tabindex],button') as HTMLElement | null) ?? el);

    setTimeout(() => focusTarget.focus(), 80);
  }

  private resetFormForCreate() {
    this.loadedUser.set(null);
    this.otherAppGroupIds.set([]);
    this.form.reset({
      name: '',
      userName: '',
      document: '',
      groupIds: [],
    });
  }
}
