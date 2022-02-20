import jsdom from 'jsdom';

export const virtualConsole = () => {
  const virtualConsole = new jsdom.VirtualConsole()
  virtualConsole.sendTo(console, { omitJSDOMErrors: true })
  virtualConsole.on('jsdomError', (err) => {
    if (err.message !== 'Could not parse CSS stylesheet') {
      console.error(err)
    }
  })

  return virtualConsole
};
