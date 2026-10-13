import { expect, test } from 'claude-code/testing'

import { DANCER_COLUMNS } from './register'

const band = (isWorking: boolean) => ({
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isWorking,
    maxRows: 20,
    bodyColumns: 80,
    scroll: { offset: 0, bodyRows: 19 },
    view: {},
  },
}) as const

test('the dancer moves while Claude works and stands still otherwise', async ($, on) => {
  on('ui.render', ($, e) => {
    const { Box } = $.ui.resolve(e)
    return <Box />
  })
  const working = await $.ui.mount({ plugin: 'jeanCLAUDE', surface: 'desktop', ...band(true) })
  const moving = await working.find({ type: 'Svg' })
  expect(moving?.props.alt).toBe('Dancing while Claude works')
  expect(String(moving?.props.source)).toContain('data:image/gif;base64,')
  await working.unmount()

  const idle = await $.ui.mount({ plugin: 'jeanCLAUDE', surface: 'desktop', ...band(false) })
  const still = await idle.find({ type: 'Svg' })
  expect(still?.props.alt).toBe('Waiting')
  expect(String(still?.props.source)).toContain('data:image/png;base64,')
  await idle.unmount()
})

test('the terminal keeps its own band', async ($, on) => {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine</Text>
  })
  const ui = await $.ui.mount({ plugin: 'jeanCLAUDE', surface: 'terminal', ...band(true) })
  expect(await ui.find({ type: 'Svg' })).toBeUndefined()
  await ui.unmount()
})

test('another mod in the band still shows beside the dancer', async ($, on) => {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text key="other">progress bar</Text>
  })
  const ui = await $.ui.mount({ plugin: 'jeanCLAUDE', surface: 'desktop', ...band(true) })
  expect(await ui.find({ type: 'Svg' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'progress bar' })).toBeDefined()
  await ui.unmount()
})

test('whatever draws beside the dancer is told the band is narrower', async ($, on) => {
  let columns = -1
  on('ui.render', ($, e) => {
    if (e.component === 'AbovePrompt') columns = e.props.bodyColumns
    const { Box } = $.ui.resolve(e)
    return <Box />
  })
  const ui = await $.ui.mount({ plugin: 'jeanCLAUDE', surface: 'desktop', ...band(true) })
  expect(columns).toBe(80 - DANCER_COLUMNS)
  await ui.unmount()
})

test('the dancer sits at the right end of the band', async ($, on) => {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>progress bar</Text>
  })
  const ui = await $.ui.mount({ plugin: 'jeanCLAUDE', surface: 'desktop', ...band(true) })
  const row = (await ui.drawn()) as { children: Array<{ type: string; props?: Record<string, unknown> }> }
  expect(row.children.at(-1)?.type).toBe('Svg')
  expect(row.children[0]?.props?.flexGrow).toBe(1)
  await ui.unmount()
})
