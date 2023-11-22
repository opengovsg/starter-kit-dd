// eslint-disable-next-line @typescript-eslint/no-var-requires
const { tracer } = require('dd-trace')

function setUpDatadogTracing() {
  tracer.init({
    runtimeMetrics: true,
    logInjection: true,
    env: process.env.NEXT_PUBLIC_DD_ENV,
  })
}

setUpDatadogTracing()
