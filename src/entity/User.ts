import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, BeforeInsert } from 'typeorm';
import { hash } from 'bcryptjs';

@Entity('users')
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid') id: string;

    @Column('varchar', { length: 255 })
    email: string;

    @Column('text') password: string;

    @Column('bool', { default: false })
    isConfirmed: boolean;

    @BeforeInsert()
    async hashPassword() {
        this.password = await hash(this.password, 10);
    }
}
