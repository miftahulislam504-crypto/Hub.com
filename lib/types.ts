// lib/types.ts

export interface User {
  uid: string
  email: string
  displayName: string
  role: 'engineer' | 'admin'
  createdAt: Date
}

export interface Project {
  id: string
  projectCode: string
  projectName: string
  clientName: string
  location: string
  status: 'active' | 'on_hold' | 'completed'
  startDate: Date
  endDate?: Date
  description?: string
  createdBy: string
  createdAt: Date
  updatedAt?: Date
}

export type ProjectStatus = 'active' | 'on_hold' | 'completed'

export interface ActivityLog {
  id: string
  projectId: string
  action: string
  description: string
  userId: string
  timestamp: Date
}

export interface ServiceResult<T> {
  data?: T
  error?: string
  success: boolean
}
