import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany
} from 'typeorm';
import { Post } from '../../posts/entities/post.entity';

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    name: string;

    @Column({ unique: true, length: 100 })
    email: string;

    @Column()
    password: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => Post, post => post.user, { cascade: true })
    posts: Post[];

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role: UserRole;
}