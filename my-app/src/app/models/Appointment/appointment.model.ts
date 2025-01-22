export interface Appointment {
  appointmentId?: number;
  clientId: number; // ID du client
  client?: Client; // Relation vers le client (optionnelle)
  serviceId: number;
  service?: Service; // Relation vers le service
  appointmentDate: Date;
  time: string;
  note?: string;
  status: string;
}

export interface Client {
  clientId: number;
  firstName: string;
  lastName: string;
}


export interface Service {
  id: number;
  name: string;
  description?: string;
}

export enum AppointmentStatus {
  Pending = 'en attente',
  Confirmed = 'confirmé',
  Canceled = 'annulé',
}
