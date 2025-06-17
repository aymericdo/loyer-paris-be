export class Vega {
  static commonOpt() {
    return {
      $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
      width: 700,
      height: 500,
      autosize: { type: 'fit', contains: 'padding' },
      background: 'transparent',
      title: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        baseline: 'middle',
      },
      padding: {
        top: 12,
        left: 24,
        right: 24,
        bottom: 12,
      },
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
          gridOpacity: 0.2,
          zindex: 0,
        },
      },
    }
  }
}
