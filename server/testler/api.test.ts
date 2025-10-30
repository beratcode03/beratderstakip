import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest'
import request from 'supertest'
import express, { type Express } from 'express'
import { registerRoutes } from '../rotalar'
import type { IStorage } from '../depolama'

// Mock storage
const mockStorage: IStorage = {
  // Task methods
  getTasks: vi.fn().mockResolvedValue([]),
  createTask: vi.fn().mockImplementation((data) => Promise.resolve({ id: '1', ...data })),
  updateTask: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
  toggleTaskComplete: vi.fn().mockResolvedValue({ id: '1', completed: true }),
  archiveTask: vi.fn().mockResolvedValue({ id: '1', archived: true }),
  deleteTask: vi.fn().mockResolvedValue({ id: '1', deleted: true }),
  
  // Exam result methods
  getExamResults: vi.fn().mockResolvedValue([]),
  createExamResult: vi.fn().mockImplementation((data) => Promise.resolve({ id: '1', ...data })),
  updateExamResult: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
  deleteExamResult: vi.fn().mockResolvedValue({ id: '1', deleted: true }),
  archiveExamResult: vi.fn().mockResolvedValue({ id: '1', archived: true }),
  
  // Question log methods
  getQuestionLogs: vi.fn().mockResolvedValue([]),
  createQuestionLog: vi.fn().mockImplementation((data) => Promise.resolve({ id: '1', ...data })),
  updateQuestionLog: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
  deleteQuestionLog: vi.fn().mockResolvedValue({ id: '1', deleted: true }),
  archiveQuestionLog: vi.fn().mockResolvedValue({ id: '1', archived: true }),
  
  // Other methods
  getMoods: vi.fn().mockResolvedValue([]),
  createMood: vi.fn().mockImplementation((data) => Promise.resolve({ id: '1', ...data })),
  deleteMood: vi.fn().mockResolvedValue({ id: '1' }),
  
  getGoals: vi.fn().mockResolvedValue([]),
  createGoal: vi.fn().mockImplementation((data) => Promise.resolve({ id: '1', ...data })),
  updateGoal: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
  deleteGoal: vi.fn().mockResolvedValue({ id: '1' }),
  
  getStudyHours: vi.fn().mockResolvedValue([]),
  createStudyHour: vi.fn().mockImplementation((data) => Promise.resolve({ id: '1', ...data })),
  deleteStudyHour: vi.fn().mockResolvedValue({ id: '1' }),
  
  getExamSubjectNets: vi.fn().mockResolvedValue([]),
  createExamSubjectNet: vi.fn().mockImplementation((data) => Promise.resolve({ id: '1', ...data })),
  deleteExamSubjectNets: vi.fn().mockResolvedValue(undefined),
  
  getSetupStatus: vi.fn().mockResolvedValue({ isSetupComplete: false }),
  updateSetupStatus: vi.fn().mockResolvedValue({ isSetupComplete: true })
}

// Mock the storage module
vi.mock('../depolama', () => ({
  storage: mockStorage
}))

describe('Backend API Tests', () => {
  let app: Express

  beforeAll(async () => {
    app = express()
    app.use(express.json())
    await registerRoutes(app)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Exam Results API', () => {
    describe('GET /api/exam-results', () => {
      it('tüm deneme sonuçlarını getirmeli', async () => {
        const mockExams = [
          { id: '1', exam_name: 'TYT Deneme 1', tyt_net: '85', ayt_net: '0' }
        ]
        mockStorage.getExamResults = vi.fn().mockResolvedValue(mockExams)

        const response = await request(app).get('/api/exam-results')
        
        expect(response.status).toBe(200)
        expect(response.body).toEqual(mockExams)
        expect(mockStorage.getExamResults).toHaveBeenCalled()
      })

      it('hata durumunda 500 dönmeli', async () => {
        mockStorage.getExamResults = vi.fn().mockRejectedValue(new Error('DB Error'))

        const response = await request(app).get('/api/exam-results')
        
        expect(response.status).toBe(500)
      })
    })

    describe('POST /api/exam-results', () => {
      it('geçerli TYT denemesi oluşturmalı', async () => {
        const newExam = {
          exam_name: 'TYT Deneme 1',
          exam_date: '2025-10-30',
          exam_type: 'TYT',
          exam_scope: 'full',
          tyt_net: '85.5',
          ayt_net: '0'
        }

        const response = await request(app)
          .post('/api/exam-results')
          .send(newExam)
        
        expect(response.status).toBe(201)
        expect(mockStorage.createExamResult).toHaveBeenCalled()
      })

      it('geçersiz veri için 400 dönmeli', async () => {
        const invalidExam = {
          tyt_net: '85'
        }

        const response = await request(app)
          .post('/api/exam-results')
          .send(invalidExam)
        
        expect(response.status).toBe(400)
      })
    })

    describe('PUT /api/exam-results/:id', () => {
      it('mevcut denemeyi güncellemeli', async () => {
        const updateData = {
          exam_name: 'TYT Deneme 1 Updated',
          tyt_net: '90'
        }

        mockStorage.updateExamResult = vi.fn().mockResolvedValue({ id: '1', ...updateData })

        const response = await request(app)
          .put('/api/exam-results/1')
          .send(updateData)
        
        expect(response.status).toBe(200)
        expect(mockStorage.updateExamResult).toHaveBeenCalledWith('1', expect.any(Object))
      })

      it('bulunamayan deneme için 404 dönmeli', async () => {
        mockStorage.updateExamResult = vi.fn().mockResolvedValue(null)

        const response = await request(app)
          .put('/api/exam-results/999')
          .send({ exam_name: 'Test' })
        
        expect(response.status).toBe(404)
      })
    })

    describe('DELETE /api/exam-results/:id', () => {
      it('denemeyi silmeli', async () => {
        const response = await request(app).delete('/api/exam-results/1')
        
        expect(response.status).toBe(200)
        expect(mockStorage.deleteExamResult).toHaveBeenCalledWith('1')
      })
    })
  })

  describe('Question Logs API', () => {
    describe('GET /api/question-logs', () => {
      it('tüm soru loglarını getirmeli', async () => {
        const mockLogs = [
          { 
            id: '1', 
            exam_type: 'TYT', 
            subject: 'Matematik',
            correct_count: '15',
            wrong_count: '3',
            blank_count: '2',
            study_date: '2025-10-30'
          }
        ]
        mockStorage.getQuestionLogs = vi.fn().mockResolvedValue(mockLogs)

        const response = await request(app).get('/api/question-logs')
        
        expect(response.status).toBe(200)
        expect(response.body).toEqual(mockLogs)
      })
    })

    describe('POST /api/question-logs', () => {
      it('geçerli soru logu oluşturmalı', async () => {
        const newLog = {
          exam_type: 'TYT',
          subject: 'Matematik',
          topic: 'Fonksiyonlar',
          correct_count: '15',
          wrong_count: '3',
          blank_count: '2',
          study_date: '2025-10-30'
        }

        const response = await request(app)
          .post('/api/question-logs')
          .send(newLog)
        
        expect(response.status).toBe(201)
        expect(mockStorage.createQuestionLog).toHaveBeenCalled()
      })

      it('geçersiz exam_type için 400 dönmeli', async () => {
        const invalidLog = {
          exam_type: 'INVALID',
          subject: 'Matematik',
          correct_count: '15',
          wrong_count: '3',
          blank_count: '2',
          study_date: '2025-10-30'
        }

        const response = await request(app)
          .post('/api/question-logs')
          .send(invalidLog)
        
        expect(response.status).toBe(400)
      })
    })
  })

  describe('Tasks API', () => {
    describe('GET /api/tasks', () => {
      it('tüm görevleri getirmeli', async () => {
        const mockTasks = [
          { id: '1', title: 'Matematik Çalış', completed: false }
        ]
        mockStorage.getTasks = vi.fn().mockResolvedValue(mockTasks)

        const response = await request(app).get('/api/tasks')
        
        expect(response.status).toBe(200)
        expect(response.body).toEqual(mockTasks)
      })
    })

    describe('POST /api/tasks', () => {
      it('yeni görev oluşturmalı', async () => {
        const newTask = {
          title: 'Matematik Çalış',
          priority: 'high',
          category: 'matematik'
        }

        const response = await request(app)
          .post('/api/tasks')
          .send(newTask)
        
        expect(response.status).toBe(201)
        expect(mockStorage.createTask).toHaveBeenCalled()
      })
    })

    describe('PATCH /api/tasks/:id/toggle', () => {
      it('görev durumunu değiştirmeli', async () => {
        const response = await request(app).patch('/api/tasks/1/toggle')
        
        expect(response.status).toBe(200)
        expect(mockStorage.toggleTaskComplete).toHaveBeenCalledWith('1')
      })
    })
  })

  describe('Goals API', () => {
    describe('GET /api/goals', () => {
      it('tüm hedefleri getirmeli', async () => {
        const mockGoals = [
          { id: '1', title: 'TYT Net 100', targetValue: '100' }
        ]
        mockStorage.getGoals = vi.fn().mockResolvedValue(mockGoals)

        const response = await request(app).get('/api/goals')
        
        expect(response.status).toBe(200)
        expect(response.body).toEqual(mockGoals)
      })
    })

    describe('POST /api/goals', () => {
      it('yeni hedef oluşturmalı', async () => {
        const newGoal = {
          title: 'TYT Net 100',
          targetValue: '100',
          currentValue: '85',
          unit: 'net',
          category: 'tyt',
          timeframe: 'aylık'
        }

        const response = await request(app)
          .post('/api/goals')
          .send(newGoal)
        
        expect(response.status).toBe(201)
        expect(mockStorage.createGoal).toHaveBeenCalled()
      })
    })
  })
})
