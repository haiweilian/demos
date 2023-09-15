import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'fruits',
})
export class FruitsEntity {
  @PrimaryGeneratedColumn({
    name: 'id',
  })
  id: number;

  @Column({
    name: 'name',
  })
  name: string;

  @Column({
    name: 'category',
  })
  category: string;

  @Column({
    name: 'count',
  })
  count: number;

  @Column({
    name: 'price',
    type: 'decimal',
    scale: 2,
    precision: 10,
  })
  price: number;

  @Column({
    name: 'is_del',
  })
  isDel: string;
}
