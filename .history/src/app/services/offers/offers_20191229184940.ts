export interface Service {
  type: string;
  duration: string;
  cost: number;
}
export class Offers {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public imageUrl: string,
    public isActive: boolean,
    public availability: string,
    public category: string,
    public services: Service,
    public userId: string
  ) {}
}