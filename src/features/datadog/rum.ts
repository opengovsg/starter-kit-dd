import { datadogRum } from '@datadog/browser-rum'
import getConfig from 'next/config'
import { datadogUsedForMonitoring, isDatadogInitialized } from './utils'

export const realUserMonitoring = () => {
  const { VERSION } = getConfig().publicRuntimeConfig
  if (
    !process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID ||
    !process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN
  ) {
    console.warn(
      'Datadog RUM is disabled. Provide an applicationId and clientId.'
    )
    return
  }
  if (!isDatadogInitialized() && datadogUsedForMonitoring()) {
    datadogRum.init({
      applicationId: process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID,
      clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
      site: 'datadoghq.com',
      service: process.env.NEXT_PUBLIC_APP_NAME,
      env: process.env.NEXT_PUBLIC_DD_ENV,
      version: VERSION,
      sessionSampleRate: 100,
      sessionReplaySampleRate: 100,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: 'mask-user-input',
      trackViewsManually: false,
      traceSampleRate: 100,
      allowedTracingUrls: [() => true],
    })
    datadogRum.startSessionReplayRecording()
  }
}
