import { Entity, Column, BaseEntity, ObjectID, ObjectIdColumn } from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
    @ObjectIdColumn() id: ObjectID;

    @Column('varchar', { length: 255 })
    email: string;

    @Column('text') password: string;

    @Column('boolean', { default: false })
    isConfirmed: boolean;
}
