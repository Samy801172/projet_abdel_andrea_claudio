
export class CreateForumDto {

  name: string;
  description: string;
  date_message: Date;
  hour_message: Date;

  constructor(name: string, description: string, date_message: Date, hour_message: Date) {
    this.name = name;
    this.description = description;
    this.date_message = date_message;
    this.hour_message = hour_message;
  }
}
