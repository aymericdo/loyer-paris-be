export const vegaCommonOpt = () => {
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
    width: 700,
    height: 500,
    padding: 26,
    autosize: { type: 'fit', contains: 'padding' },
    background: 'transparent',
    config: {
      view: {
        stroke: 'transparent',
      },
      legend: {
        labelColor: 'white',
        labelFontSize: 12,
        titleColor: 'white',
        titleFontSize: 16,
      },
      axis: {
        domainColor: '#fff',
        gridColor: '#fff',
        labelColor: '#fff',
        tickColor: '#fff',
        titleColor: '#fff',
      },
    },
  }
}
