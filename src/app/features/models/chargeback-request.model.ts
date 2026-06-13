import { FlagMinimalModel } from './flag-minimal.models';
import { CompanyMinimalModel } from './company-minimal.models';
import { AcquirerMinimalModel } from './acquirer-minimal.models';
import { EstablishmentMinimalModel } from './establishment-minimal.models';
import { ModalityEnum } from '@models/enums/modality.enum';
import { ChargebackRequestReasonEnum } from '@models/enums/chargeback-request-reason.enum';
import { ChargebackRequestStatusEnum } from '@models/enums/chargeback-request-status.enum';

/**
 * Representa um request de chargeback enviado pela adquirente,
 * solicitando documentacao ou contestando uma venda.
 */
export interface ChargebackRequestModel {
  id: string;
  saleDate: string | null;
  limitDate: string | null;        // Data limite para envio de documentacao
  cvNsu: string | null;
  authorization: string | null;
  rvNumber: string | null;         // Resumo de vendas
  cardNumber: string | null;
  grossValue: number | null;       // Valor bruto da venda contestada
  requestReason: ChargebackRequestReasonEnum | null;  // Motivo do request (CODIGO)
  requestReasonDescription: string | null;            // Descricao livre do codigo
  requestStatus: ChargebackRequestStatusEnum | null;
  modality: ModalityEnum | null;

  flag: FlagMinimalModel | null;
  company: CompanyMinimalModel | null;
  acquirer: AcquirerMinimalModel | null;
  establishment: EstablishmentMinimalModel | null;
}

export interface ChargebackRequestApiModel {
  id: string;
  saleDate: string | null;
  limitDate: string | null;
  cvNsu: string | null;
  authorization: string | null;
  rvNumber: string | null;
  cardNumber: string | null;
  grossValue: number | null;
  requestReason: string | null;
  requestReasonDescription: string | null;
  requestStatus: string | null;
  modality: string | null;

  flag: FlagMinimalModel | null;
  company: CompanyMinimalModel | null;
  acquirer: AcquirerMinimalModel | null;
  establishment: EstablishmentMinimalModel | null;
}

export interface ChargebackRequestTotalsModel {
  quantity: number;       // Request: N
  totalGrossValue: number; // Bruto: R$ X
}

export function mapChargebackRequestApiModel(
  input: ChargebackRequestApiModel,
): ChargebackRequestModel {
  return {
    ...input,
    requestReason: (input.requestReason as ChargebackRequestReasonEnum) ?? null,
    requestStatus: (input.requestStatus as ChargebackRequestStatusEnum) ?? null,
    modality: (input.modality as ModalityEnum) ?? null,
  };
}

export function mapChargebackRequestApiModels(
  items: ChargebackRequestApiModel[] | null | undefined,
): ChargebackRequestModel[] {
  return (items ?? []).map(mapChargebackRequestApiModel);
}
