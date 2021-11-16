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
  context: ContextType,
  getErrorPageUrl: SsrErrorPageUrlGetter<ContextType>,
  onCaseHandlingError?: SsrErrorHandler
) => {
  const wrappedCaseHandler: WrappedSsrCaseHandler = async (req) => {
    // Handle SSR case
    const handleCase = caseHandler
    try {
      return handleCase(req, context as ContextType)
    } catch (err) {
      const handleError = onCaseHandlingError ?? defaultCaseHandlingErrorHandler
      handleError(req, err)
      const errorPageUrl = getErrorPageUrl(req, context)
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
