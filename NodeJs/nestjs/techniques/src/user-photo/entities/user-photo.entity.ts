import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserPhoto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user: number;

  @Column()
  url: string;
}
