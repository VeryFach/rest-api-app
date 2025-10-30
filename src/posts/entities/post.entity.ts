import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('posts')
export class Post {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 200 })
    title: string;

    @Column('text')
    content: string;

    @Column({ name: 'user_id' })
    userId: number;

    @Column({ default: false })
    published: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => User, user => user.posts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}