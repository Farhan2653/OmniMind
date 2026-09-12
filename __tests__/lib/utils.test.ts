import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('utils - cn function', () => {
  it('merges standard classes correctly', () => {
    const result = cn('bg-red-500', 'text-white')
    expect(result).toBe('bg-red-500 text-white')
  })

  it('handles conditional classes properly', () => {
    const isTrue = true
    const isFalse = false
    const result = cn('base-class', isTrue && 'true-class', isFalse && 'false-class')
    expect(result).toBe('base-class true-class')
  })

  it('resolves tailwind class conflicts correctly', () => {
    // tailwind-merge should resolve conflicting classes, keeping the latter one
    const result = cn('px-2 p-4', 'p-8') // p-8 overrides everything
    expect(result).toBe('p-8')
  })

  it('handles arrays and objects correctly via clsx', () => {
    const result = cn('base', ['arr1', 'arr2'], { obj1: true, obj2: false })
    expect(result).toBe('base arr1 arr2 obj1')
  })
})
