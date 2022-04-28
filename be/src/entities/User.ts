import { Field, ID, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType() //Trả về data
@Entity()
export class User extends BaseEntity {
  // tự động thêm cột
  @Field((_type) => ID) // field nào cần trả về thì phải trả về thì phải thêm Field() ID là type của graphql
  @PrimaryGeneratedColumn()
  id!: number; // ! không được phép null

  @Field() // nó tự trả về string rồi nên mình không cần phải return type
  @Column({ unique: true }) // unique: true -->  chuyển ngôn ngữ từ ts --> postresql
  username!: string;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
