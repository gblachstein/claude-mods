import type { Register } from 'claude-code'

import { GIF, HEIGHT, PNG, WIDTH } from './gif'

// The picture as an SVG: the animated GIF while a turn runs, its first frame
// (a still PNG) otherwise.
export function dancerSvg(isWorking: boolean): string {
  const href = isWorking ? `data:image/gif;base64,${GIF}` : `data:image/png;base64,${PNG}`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}"><image href="${href}" width="${WIDTH}" height="${HEIGHT}"/></svg>`
}

// Band columns the dancer and its gap take: the desktop lays out about 8 CSS
// px per reported column. Whatever draws beside him (savvy-progress sizes its
// bar to the whole band) is told the band is this much narrower, so the row
// fits on one line instead of wrapping.
export const DANCER_COLUMNS = Math.ceil((WIDTH + 16) / 8)

export const register: Register = on => {
  // Draws at the right end of the band, beside whatever else wants it (the engine's own, or another
  // mod's such as savvy-progress) rather than in place of it.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || e.surface !== 'desktop') {
      return next(e)
    }

    const rest = await next({
      ...e,
      props: { ...e.props, bodyColumns: Math.max(1, e.props.bodyColumns - DANCER_COLUMNS) },
    })
    const { Box, Svg } = $.ui.resolve(e)
    const isWorking = e.props.isWorking

    return (
      <Box flexDirection="row" flexWrap="nowrap" alignItems="flex-end" gap={1}>
        <Box key="rest" flexGrow={1}>
          {rest}
        </Box>
        <Svg
          source={dancerSvg(isWorking)}
          alt={isWorking ? 'Dancing while Claude works' : 'Waiting'}
          width={WIDTH}
          height={HEIGHT}
        />
      </Box>
    )
  })
}
