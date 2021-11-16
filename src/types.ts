import { IncomingMessage } from 'http'
import { Redirect, GetServerSidePropsContext, GetServerSideProps } from 'next'
import { NextApiRequestCookies } from 'next/dist/server/api-utils'

/***********************************************/
/******************** CASE *********************/
/***********************************************/

export type SsrRequest = IncomingMessage & {
  cookies: NextApiRequestCookies
}

export type SsrCasePropsResult = {
  props: Record<string, unknown>
}

export type SsrCaseRedirectResult = {
  redirect: Redirect
}

export type SsrCaseNotFoundResult = {
  notFound: true
}

export type SsrCaseAmbiguousResult = {
  props?: Record<string, unknown>
  redirect?: Redirect
  notFound?: true
}

export type SsrCaseResult =
  | SsrCasePropsResult
  | SsrCaseRedirectResult
  | SsrCaseNotFoundResult

export type SsrCaseHandler<ContextType> = (
  nextContext: GetServerSidePropsContext,
  appContext: ContextType
) => SsrCaseResult

export type WrappedSsrCaseHandler = (
  nextContext: GetServerSidePropsContext
) => Promise<SsrCaseAmbiguousResult>

export type SsrContextGenerator<ContextType> = (
  nextContext: GetServerSidePropsContext
) => Promise<ContextType>

export type SsrErrorPageUrlGetter<ContextType> = (
  err: unknown,
  nextContext: GetServerSidePropsContext,
  appContext?: ContextType
) => string

export type SsrErrorHandler<ContextType> = (
  err: unknown,
  nextContext: GetServerSidePropsContext,
  appContext?: ContextType
) => Promise<void>

export type SsrCaseHandlerWrapper = <ContextType>(
  caseHandler: SsrCaseHandler<ContextType>,
  nextContext: ContextType,
  getErrorPageUrl: SsrErrorPageUrlGetter<ContextType>,
  onCaseHandlingError?: SsrErrorHandler<ContextType>
) => WrappedSsrCaseHandler

/***********************************************/
/****************** CASE LIST ******************/
/***********************************************/

export type WrappedSsrCaseListHandler = (
  nextContext: GetServerSidePropsContext,
  wrappedCaseHandlers: Array<WrappedSsrCaseHandler>,
  previousResult?: SsrCasePropsResult
) => Promise<SsrCaseResult>

/***********************************************/
/******************** SSR **********************/
/***********************************************/

export type SsrHandlerConfig<ContextType> = {
  contextGenerator: SsrContextGenerator<ContextType>
  globalCaseHandlers: Array<SsrCaseHandler<ContextType>>
  getErrorPageUrl: SsrErrorPageUrlGetter<ContextType>
  onContextGenerationError?: any
  onCaseHandlingError?: any
}

export type SsrHandler<ContextType> = (
  pageCaseHandlers: Array<SsrCaseHandler<ContextType>>
) => GetServerSideProps

export type SrrHandlerGenerator = <ContextType>(
  config: SsrHandlerConfig<ContextType>
) => SsrHandler<ContextType>
