export interface FormDetails {
  id: string;
  uid?: string;
  name: string;
  userId: string;
  formId: string;
  link: string;
  totalResponses: number;
  acceptResponses: boolean;
  formClosedMessage?: string;
  inTrash?: boolean;
  deleted?: Date;
  lastUpdate: Date;
}
