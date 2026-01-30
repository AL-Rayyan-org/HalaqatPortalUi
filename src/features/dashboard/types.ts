// Dashboard Types

// ==================== Stats Types ====================
export interface StatCardData {
  count: number;
  avgTime: string;
}

export interface DashboardStats {
  pending: StatCardData;
  feedback: StatCardData;
  payment: StatCardData;
}

// ==================== Workload Distribution Types ====================
export interface WorkloadDistributionItem {
  status: string;
  count: number;
}

export interface WorkloadDistribution {
  items: WorkloadDistributionItem[];
  total: number;
}

// ==================== Closed Orders Types ====================
export interface ClosedOrdersItem {
  status: string;
  count: number;
}

export interface ClosedOrdersDistribution {
  items: ClosedOrdersItem[];
  total: number;
}

// ==================== Completion Trend Types ====================
export interface CompletionTrendItem {
  date: string;
  completed: number;
  rejected: number;
}

// ==================== Teacher Workload Types ====================
export interface TeacherWorkloadItem {
  teacherId: string;
  name: string;
  active: number;
  review: number;
  feedBack: number;
  processing: number;
  avgTime: string;
}

// ==================== Admin Dashboard Response ====================
export interface AdminDashboardResponse {
  stats: DashboardStats;
  currentWorkload: WorkloadDistribution;
  closedOrders: ClosedOrdersDistribution;
  completionTrend: CompletionTrendItem[];
  teacherWorkload: TeacherWorkloadItem[];
}

// ==================== Teacher Dashboard Types ====================
export interface TeacherDashboardResponse {
  totalAssigend: number; // Note: API has typo in field name
  active: number;
  review: number;
  processing: number;
  feedback: number;
  waitingPayment: number;
  oldestCase: string; // ISO date string
  activeWork: ActiveWorkItem[];
}

// ==================== Active Work Types (for future use) ====================
export interface ActiveWorkItem {
  id: string;
  productCode: string;
  clientName: string;
  clientType: "B2B" | "B2C";
  organization?: string;
  service: string;
  status: string;
  timeInStatus: string;
}
