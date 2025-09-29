
export interface IRepository <T> {
    findAll():Promise<T[]>;
    create(data:Omit<T,"id">):Promise<T>;
}