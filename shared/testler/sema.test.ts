import { describe, it, expect } from 'vitest'
import { 
  insertExamResultSchema, 
  insertQuestionLogSchema, 
  insertTaskSchema,
  insertGoalSchema,
  SUBJECT_LIMITS 
} from '../sema'

describe('Schema Validation Tests', () => {
  describe('SUBJECT_LIMITS', () => {
    it('TYT için doğru ders limitleri tanımlı olmalı', () => {
      expect(SUBJECT_LIMITS.TYT).toBeDefined()
      expect(SUBJECT_LIMITS.TYT['Türkçe']).toBe(40)
      expect(SUBJECT_LIMITS.TYT['Sosyal Bilimler']).toBe(20)
      expect(SUBJECT_LIMITS.TYT['Matematik']).toBe(30)
      expect(SUBJECT_LIMITS.TYT['Geometri']).toBe(10)
      expect(SUBJECT_LIMITS.TYT['Fen Bilimleri']).toBe(20)
    })

    it('AYT için doğru ders limitleri tanımlı olmalı', () => {
      expect(SUBJECT_LIMITS.AYT).toBeDefined()
      expect(SUBJECT_LIMITS.AYT['Matematik']).toBe(30)
      expect(SUBJECT_LIMITS.AYT['Geometri']).toBe(10)
      expect(SUBJECT_LIMITS.AYT['Fizik']).toBe(14)
      expect(SUBJECT_LIMITS.AYT['Kimya']).toBe(13)
      expect(SUBJECT_LIMITS.AYT['Biyoloji']).toBe(13)
    })

    it('AYT\'de TYT derslerinin olmaması gerekir', () => {
      expect(SUBJECT_LIMITS.AYT['Türkçe']).toBeUndefined()
      expect(SUBJECT_LIMITS.AYT['Sosyal Bilimler']).toBeUndefined()
      expect(SUBJECT_LIMITS.AYT['Fen Bilimleri']).toBeUndefined()
    })
  })

  describe('ExamResult Schema Validation', () => {
    it('geçerli TYT denemesi oluşturulabilmeli', () => {
      const validExam = {
        exam_name: 'TYT Genel Deneme 1',
        exam_date: '2025-10-30',
        exam_type: 'TYT' as const,
        exam_scope: 'full' as const,
        tyt_net: '85.5',
        ayt_net: '0'
      }
      
      const result = insertExamResultSchema.safeParse(validExam)
      expect(result.success).toBe(true)
    })

    it('geçerli AYT denemesi oluşturulabilmeli', () => {
      const validExam = {
        exam_name: 'AYT Genel Deneme 1',
        exam_date: '2025-10-30',
        exam_type: 'AYT' as const,
        exam_scope: 'full' as const,
        tyt_net: '0',
        ayt_net: '45.25'
      }
      
      const result = insertExamResultSchema.safeParse(validExam)
      expect(result.success).toBe(true)
    })

    it('branş denemesi selected_subject gerektirir', () => {
      const branchExam = {
        exam_name: 'Matematik Branş',
        exam_date: '2025-10-30',
        exam_type: 'TYT' as const,
        exam_scope: 'branch' as const,
        selected_subject: 'matematik',
        tyt_net: '25',
        ayt_net: '0'
      }
      
      const result = insertExamResultSchema.safeParse(branchExam)
      expect(result.success).toBe(true)
    })

    it('exam_name zorunlu alan olmalı', () => {
      const invalidExam = {
        exam_date: '2025-10-30',
        tyt_net: '85',
        ayt_net: '0'
      }
      
      const result = insertExamResultSchema.safeParse(invalidExam)
      expect(result.success).toBe(false)
    })

    it('exam_date zorunlu alan olmalı', () => {
      const invalidExam = {
        exam_name: 'Test Deneme',
        tyt_net: '85',
        ayt_net: '0'
      }
      
      const result = insertExamResultSchema.safeParse(invalidExam)
      expect(result.success).toBe(false)
    })
  })

  describe('QuestionLog Schema Validation', () => {
    it('geçerli soru logu oluşturulabilmeli', () => {
      const validLog = {
        exam_type: 'TYT' as const,
        subject: 'Matematik',
        topic: 'Fonksiyonlar',
        correct_count: '15',
        wrong_count: '3',
        blank_count: '2',
        study_date: '2025-10-30'
      }
      
      const result = insertQuestionLogSchema.safeParse(validLog)
      expect(result.success).toBe(true)
    })

    it('exam_type TYT veya AYT olmalı', () => {
      const invalidLog = {
        exam_type: 'INVALID',
        subject: 'Matematik',
        correct_count: '15',
        wrong_count: '3',
        blank_count: '2',
        study_date: '2025-10-30'
      }
      
      const result = insertQuestionLogSchema.safeParse(invalidLog)
      expect(result.success).toBe(false)
    })

    it('zorunlu alanlar kontrol edilmeli', () => {
      const invalidLog = {
        exam_type: 'TYT' as const,
        subject: 'Matematik'
      }
      
      const result = insertQuestionLogSchema.safeParse(invalidLog)
      expect(result.success).toBe(false)
    })
  })

  describe('Task Schema Validation', () => {
    it('geçerli task oluşturulabilmeli', () => {
      const validTask = {
        title: 'Matematik Çalış',
        priority: 'high' as const,
        category: 'matematik' as const
      }
      
      const result = insertTaskSchema.safeParse(validTask)
      expect(result.success).toBe(true)
    })

    it('priority değerleri kontrol edilmeli', () => {
      const invalidTask = {
        title: 'Test Task',
        priority: 'invalid'
      }
      
      const result = insertTaskSchema.safeParse(invalidTask)
      expect(result.success).toBe(false)
    })
  })

  describe('Goal Schema Validation', () => {
    it('geçerli hedef oluşturulabilmeli', () => {
      const validGoal = {
        title: 'TYT Net Hedefi',
        targetValue: '100',
        currentValue: '85',
        unit: 'net',
        category: 'tyt' as const,
        timeframe: 'aylık' as const
      }
      
      const result = insertGoalSchema.safeParse(validGoal)
      expect(result.success).toBe(true)
    })

    it('zorunlu alanlar kontrol edilmeli', () => {
      const invalidGoal = {
        title: 'Hedef'
      }
      
      const result = insertGoalSchema.safeParse(invalidGoal)
      expect(result.success).toBe(false)
    })
  })
})
