import 'pino-datadog-transport'
import 'pino-pretty'
import { pino, type TransportSingleOptions } from 'pino'
import { env } from '~/env.mjs'
import { type NextApiRequest } from 'next'

// use syslog protocol levels as per https://datatracker.ietf.org/doc/html/rfc5424#page-10
const levels: { [level: string]: number } = {
  emerg: 80,
  alert: 70,
  crit: 60,
  error: 50,
  warn: 40,
  notice: 30,
  info: 20,
  debug: 10,
}

type LoggerOptions = {
  path: string
  req?: NextApiRequest
}

export class PinoLogger {
  private static instance: pino.Logger
  private static getInstance() {
    if (!PinoLogger.instance)
      PinoLogger.instance = PinoLogger.createBaseLogger()
    return PinoLogger.instance
  }

  private static createBaseLogger = (): pino.Logger => {
    const service = `${env.NEXT_PUBLIC_APP_NAME}`
      .replaceAll(/\s/g, '-')
      .toLowerCase()
    const datadogOptions = {
      target: 'pino-datadog-transport',
      options: {
        ddClientConf: {
          authMethods: {
            apiKeyAuth: env.DATADOG_API_KEY,
          },
        },
        ddsource: 'nodejs',
        service: service,
        ddtags: `env:${env.NEXT_PUBLIC_DD_ENV},service:${service}`,
        sendImmediate: true,
      },
    }

    let transport
    if (
      !env.DATADOG_API_KEY ||
      env.NEXT_PUBLIC_DD_ENV === 'development' ||
      env.NEXT_PUBLIC_DD_ENV === 'test'
    ) {
      const pipeline = [
        {
          target: 'pino-pretty',
          options: {
            colorize: true,
            hideObject: true,
          },
        },
      ] as TransportSingleOptions[]
      if (env.DATADOG_API_KEY) {
        pipeline.push(datadogOptions)
      }
      transport = pino.transport({
        pipeline,
      })
    } else {
      transport = pino.transport(datadogOptions)
    }
    return pino(
      {
        level: process.env.PINO_LOG_LEVEL || 'info',
        customLevels: levels,
        useOnlyCustomLevels: true,
        timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
        formatters: {
          bindings: () => {
            return {
              env: env.NEXT_PUBLIC_DD_ENV,
            }
          },
          level: (label) => {
            return { level: label.toUpperCase() }
          },
        },
      },
      transport
    )
  }
  /*
  The logger we use inherits the bindings and transport from the parent singleton instance
  Use child loggers to avoid creating a new instance for every trpc call
  */
  public static logger = ({ path, req }: LoggerOptions) => {
    return PinoLogger.getInstance().child({
      path: path,
      requestHeaders: req?.headers,
      trace_id: (req?.headers || {})['x-datadog-trace-id'],
    })
  }
}
