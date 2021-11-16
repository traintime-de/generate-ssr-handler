import {
  SsrCaseErrorHandler,
  SsrCaseErrorHandlerGetter,
  SsrCaseHandler,
  SsrCaseHandlerWrapper,
  SsrErrorPageUrlGetter,
  WrappedSsrCaseHandler,
} from '../types'

const getDefaultCaseErrorHandler: SsrCaseErrorHandlerGetter = <
  ContextType
>() => {
  const defaultCaseHandlingErrorHandler: SsrCaseErrorHandler<ContextType> = (
    err
  ) => {
    const error = err as Error
    if (error.message) console.error(error.message)
    throw new Error(`Failed to handle SSR case.`)
  }
  return defaultCaseHandlingErrorHandler
}

const wrapCaseHandler: SsrCaseHandlerWrapper = <ContextType>(
  caseHandler: SsrCaseHandler<ContextType>,
  appContext: ContextType,
  getErrorPageUrl: SsrErrorPageUrlGetter<ContextType>,
  onCaseHandlingError?: SsrCaseErrorHandler<ContextType>
) => {
  const wrappedCaseHandler: WrappedSsrCaseHandler = async (nextContext) => {
    // Handle SSR case
    const handleCase = caseHandler
    try {
      return handleCase(nextContext, appContext)
    } catch (err) {
      const handleError =
        onCaseHandlingError ?? getDefaultCaseErrorHandler<ContextType>()
      handleError(err, nextContext, appContext)
      const errorPageUrl = getErrorPageUrl(err, nextContext, appContext)
      return {
        redirect: {
          permanent: false,
          destination: errorPageUrl,
        },
      }
    }
  }

  return wrappedCaseHandler
}
export default wrapCaseHandler
