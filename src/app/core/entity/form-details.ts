export interface FormDetails {
  id: string;
  name: string;
  userId: string;
  formId: string;
  link: string;
  previewImg: string;
  totalResponses: number;
  acceptResponses: boolean;
  formClosedMessage?: string;
  inTrash?: boolean;
  deleted?: Date;
  lastUpdate: Date;
}
