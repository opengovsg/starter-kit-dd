import { type inferRouterOutputs } from '@trpc/server'
import { type meRouter } from './me.router'

export type MeUser = inferRouterOutputs<typeof meRouter>['get']
