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
  req: SsrRequest,
  ctx: ContextType
) => SsrCaseResult

export type WrappedSsrCaseHandler = (
  req: SsrRequest
) => Promise<SsrCaseAmbiguousResult>

export type SsrContextGenerator<ContextType> = (
  req: SsrRequest
) => Promise<ContextType>

export type SsrErrorHandler = (req: SsrRequest, err: unknown) => Promise<void>

export type SsrErrorPageUrlGetter<ContextType> = (
  req: SsrRequest,
  context: ContextType | null
) => string

export type SsrCaseHandlerWrapper = <ContextType>(
  caseHandler: SsrCaseHandler<ContextType>,
  context: ContextType,
  getErrorPageUrl: SsrErrorPageUrlGetter<ContextType>,
  onCaseHandlingError?: SsrErrorHandler
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
