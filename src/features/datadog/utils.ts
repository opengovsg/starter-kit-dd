import { datadogRum } from '@datadog/browser-rum'
import { type MeUser } from '~/server/modules/me'

export const datadogUsedForMonitoring = (): boolean => {
  return (
    process.env.NEXT_PUBLIC_DD_ENV === 'development' ||
    process.env.NEXT_PUBLIC_DD_ENV === 'production' ||
    process.env.NEXT_PUBLIC_DD_ENV == 'staging'
  )
}

export const isDatadogInitialized = (): boolean => {
  return datadogRum.getInitConfiguration() !== undefined
}

export const setDatadogUser = (user: MeUser) => {
  if (datadogUsedForMonitoring() && !Object.keys(datadogRum.getUser()).length)
    datadogRum.setUser({
      ...user,
      email: user.email || undefined,
      name: user.name || undefined,
    })
}
