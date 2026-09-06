import { Directive, TemplateRef, inject } from '@angular/core';

// T default fica any de propósito: o directive não tem nenhum @Input pra Angular inferir o tipo
// real de cada uso (cada tela usa com um shape de option diferente), então unknown quebra o
// acesso a propriedade em todos os ~20 consumidores - any é a única forma de manter a API atual
// sem redesenhar o binding de tipo em cada lista.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface CsAdvancedFilterItemTemplateContext<T = any> {
  $implicit: T;
  option: T;
}

@Directive({
  standalone: true,
  selector: 'ng-template[appAdvancedFilterItem]',
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ver comentário acima.
export class CsAdvancedFilterItemTemplateDirective<T = any> {
  readonly templateRef = inject<TemplateRef<CsAdvancedFilterItemTemplateContext<T>>>(TemplateRef);


  static ngTemplateContextGuard<T>(
    _directive: CsAdvancedFilterItemTemplateDirective<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: unknown,
  ): context is CsAdvancedFilterItemTemplateContext<T> {
    return true;
  }
}
