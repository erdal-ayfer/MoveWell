// Run through Playwright CLI in a dedicated test session; see README.
// This resets only MoveWell test-origin data in that browser session.
async (page) => {
  await page.evaluate(() => sessionStorage.removeItem('movewell-qa-reset'))
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('movewell-qa-reset')) {
      localStorage.removeItem('movewell:v1')
      sessionStorage.setItem('movewell-qa-reset', 'done')
    }
    window.__movewellNotifications = []
    window.Notification = class {
      static permission = 'granted'
      constructor(title, options) {
        window.__movewellNotifications.push({ title, options })
      }
      close() {}
    }
  })
  await page.clock.install({ time: new Date(2026, 9, 13, 9) })
  await page.reload()
  const read = () => page.evaluate(() => JSON.parse(localStorage.getItem('movewell:v1')))
  const assert = (condition, message) => {
    if (!condition) throw new Error(message)
  }
  await page.getByRole('button', { name: 'Başlayalım', exact: true }).click()
  await page.getByRole('button', { name: 'İş gününü başlat', exact: true }).click()
  await page.clock.fastForward(3601000)
  await page.getByRole('button', { name: '10 dk ertele', exact: true }).click()
  let state = await read()
  const reminderId = state.session.reminderId
  assert(state.session.status === 'snoozed' && !state.history.length, 'Snooze changed history')
  await page.clock.fastForward(600001)
  await page.getByRole('dialog').waitFor()
  assert((await read()).session.reminderId === reminderId, 'Reminder identity changed')
  assert((await page.getByRole('dialog').count()) === 1, 'Duplicate reminder')
  await page.getByRole('button', { name: 'Molaya başla · 3 dk' }).click()
  await page.clock.runFor(11000)
  await page.getByRole('button', { name: 'Molayı bitir', exact: true }).click()
  state = await read()
  assert(state.history[0].outcome === 'partial', 'Early finish counted as complete')
  const actual = state.history[0].steps.reduce((sum, step) => sum + step.elapsedMs, 0)
  assert(actual >= 9000 && actual <= 13000, 'Wrong actual exercise time')
  const due = state.session.nextDueAt
  await page.reload()
  await page.getByRole('button', { name: 'Şimdi mola ver', exact: true }).waitFor()
  assert((await read()).session.nextDueAt === due, 'Reload lost schedule')
  await page.getByRole('button', { name: 'Şimdi mola ver', exact: true }).click()
  await page.clock.runFor(181000)
  state = await read()
  assert(state.history[1].outcome === 'completed', 'Full break not completed')
  assert(
    state.history[1].steps.reduce((sum, step) => sum + step.elapsedMs, 0) === 180000,
    'Full duration incorrect',
  )
  assert(
    state.session.nextDueAt === state.history[1].endedAt + 3600000,
    'Next interval does not use completion time',
  )
  await page.getByRole('button', { name: 'Günü bitir', exact: true }).click()
  await page.getByRole('button', { name: 'Hareketler', exact: true }).click()
  const labels = await page
    .locator('.demo-preview')
    .evaluateAll((elements) => elements.map((e) => e.getAttribute('aria-label')))
  assert(labels.length === 24, 'Missing exercise demos')
  await page.getByRole('button', { name: 'Oturarak', exact: true }).click()
  assert(await page.locator('.demo-preview').count() === 4, 'Seated category is incomplete')
  await page.getByRole('button', { name: 'Tümü', exact: true }).click()
  for (const label of labels) {
    await page.getByRole('button', { name: label, exact: true }).click()
    const dialog = page.getByRole('dialog')
    if (await dialog.locator('.frames').count()) {
      await page.waitForFunction(() =>
        [...document.querySelectorAll('dialog img')].every(
          (img) => img.complete && img.naturalWidth > 0,
        ),
      )
      const first = await dialog.locator('.frame.visible').getAttribute('src')
      await page.clock.runFor(5500)
      assert(
        (await dialog.locator('.frame.visible').getAttribute('src')) !== first,
        'Static source frames: ' + label,
      )
    } else {
      const animated = await dialog.locator('svg.motion-drawing').evaluate((svg) => {
        const animations = svg
          .getAnimations({ subtree: true })
          .filter((a) => a.playState === 'running')
        const sample = () =>
          animations
            .map((a) => {
              const s = getComputedStyle(a.effect.target)
              return s.transform + s.d
            })
            .join('|')
        animations.forEach((a) => {
          a.pause()
          a.currentTime = 100
        })
        const first = sample()
        animations.forEach((a) => {
          a.currentTime = 1700
        })
        return animations.length > 0 && sample() !== first
      })
      assert(animated, 'Static SVG: ' + label)
    }
    await dialog.getByRole('button', { name: 'Kapat', exact: true }).click()
  }
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.getByRole('button', { name: labels[0], exact: true }).click()
  await page.getByText('Sabit gösterim · azaltılmış hareket', { exact: true }).waitFor()
  assert(
    await page
      .getByRole('dialog')
      .locator('svg.motion-drawing')
      .evaluate((svg) =>
        svg.getAnimations({ subtree: true }).every((a) => a.playState !== 'running'),
      ),
    'Reduced motion failed',
  )
  await page.keyboard.press('Escape')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  const choices = page.locator('.library-grid input[type="checkbox"]')
  for (let i = 1; i < labels.length; i++) await choices.nth(i).uncheck()
  assert(await choices.nth(0).isDisabled(), 'Last exercise can be excluded')
  assert((await read()).settings.excluded.length === 23, 'Expanded exclusions not saved')
  await page.reload()
  await page.getByRole('button', { name: 'Hareketler', exact: true }).click()
  assert((await read()).settings.excluded.length === 23, 'Reload lost expanded exclusions')
  assert(await choices.nth(0).isDisabled(), 'Last-exercise guard lost after reload')
  for (let i = 1; i < labels.length; i++) await choices.nth(i).check()
  await page.setViewportSize({ width: 390, height: 844 })
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    'Mobile overflow',
  )
  return {
    reminder: 'passed',
    snooze: 'passed',
    partialAndComplete: 'passed',
    reload: 'passed',
    animatedDemos: labels.length,
    categoriesAndExclusions: 'passed',
    reducedMotion: 'passed',
    mobile: 'passed',
  }
}
