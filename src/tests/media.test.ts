import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { exercises } from '../data/exercises'

describe('Bundled instructional media', () => {
  it('has a deliberate moving demo for every catalog exercise', () => {
    const css = readFileSync(resolve('src/styles.css'), 'utf8')
    for (const exercise of exercises) {
      if (exercise.media.type === 'frames') {
        expect(existsSync(resolve('public', exercise.media.src.slice(1)))).toBe(true)
        expect(exercise.media.license).toBe('GPL-3.0')
      } else {
        expect(css).toContain(`.movement-${exercise.id}`)
        expect(exercise.instructionsTr.length).toBeGreaterThanOrEqual(2)
      }
    }
  })
  it('includes genuinely different source frames and the original license', () => {
    for (const prefix of ['finger-stretch', 'depth-focus']) {
      const first = readFileSync(resolve(`public/exercises/workrave/${prefix}-1.png`))
      const second = readFileSync(resolve(`public/exercises/workrave/${prefix}-2.png`))
      expect(first.equals(second)).toBe(false)
      expect(first.subarray(1, 4).toString()).toBe('PNG')
    }
    expect(readFileSync(resolve('public/exercises/workrave/COPYING'), 'utf8')).toContain(
      'GNU GENERAL PUBLIC LICENSE',
    )
  })
})
