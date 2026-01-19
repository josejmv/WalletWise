import type {
  Job,
  Currency,
  Account,
  JobType,
  JobPeriodicity,
  JobStatus,
} from "@prisma/client";

export type { Job, JobType, JobPeriodicity, JobStatus };

export interface JobWithRelations extends Job {
  currency: Currency;
  account: Account;
}

export interface CreateJobInput {
  userId?: string | null; // Multi-user support
  name: string;
  type: JobType;
  salary: number;
  currencyId: string;
  accountId: string;
  periodicity: JobPeriodicity;
  payDay?: number;
  status?: JobStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateJobInput {
  name?: string;
  type?: JobType;
  salary?: number;
  currencyId?: string;
  accountId?: string;
  periodicity?: JobPeriodicity;
  payDay?: number | null;
  status?: JobStatus;
  startDate?: Date;
  endDate?: Date | null;
}

export interface JobFilters {
  userId?: string | null; // Multi-user support
  type?: JobType;
  status?: JobStatus;
  currencyId?: string;
  accountId?: string;
}
