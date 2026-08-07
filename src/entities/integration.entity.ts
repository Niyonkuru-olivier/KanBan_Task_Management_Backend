import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('integrations')
export class Integration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  provider: string;

  @Column({ type: 'jsonb', nullable: true })
  config: any;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
