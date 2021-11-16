import {
  SsrCaseHandler,
  SsrCaseHandlerWrapper,
  SsrErrorHandler,
  SsrErrorPageUrlGetter,
  WrappedSsrCaseHandler,
} from '../types'

const defaultCaseHandlingErrorHandler = () => {
  throw new Error(`Failed to handle SSR case.`)
}

const wrapCaseHandler: SsrCaseHandlerWrapper = <ContextType>(
  caseHandler: SsrCaseHandler<ContextType>,
  appContext: ContextType,
  getErrorPageUrl: SsrErrorPageUrlGetter<ContextType>,
  onCaseHandlingError?: SsrErrorHandler<ContextType>
) => {
  const wrappedCaseHandler: WrappedSsrCaseHandler = async (nextContext) => {
    // Handle SSR case
    const handleCase = caseHandler
    try {
      return handleCase(nextContext, appContext)
    } catch (err) {
      const handleError = onCaseHandlingError ?? defaultCaseHandlingErrorHandler
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
