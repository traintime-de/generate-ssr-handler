import { GetServerSideProps } from 'next'
import handleWrappedCases from './handleWrappedCases'
import {
  SrrHandlerGenerator,
  SsrCaseHandler,
  SsrHandler,
  SsrHandlerConfig,
} from './types'
import wrapCaseHandler from './wrapCaseHandler'

const defaultContextGenerationErrorHandler = () => {
  throw new Error(`Failed to generate SSR context.`)
}

const generateSsrHandler: SrrHandlerGenerator = <ContextType>(
  config: SsrHandlerConfig<ContextType>
) => {
  // Deconstruct config
  const {
    contextGenerator,
    globalCaseHandlers,
    onContextGenerationError,
    onCaseHandlingError,
    getErrorPageUrl,
  } = config

  // Generate SSR handler
  const ssrHandler: SsrHandler<ContextType> = (
    pageCaseHandlers: Array<SsrCaseHandler<ContextType>>
  ) => {
    // Concatenate global case handlers and page-specific case handlers
    const allCaseHandlers = [...globalCaseHandlers, ...pageCaseHandlers]

    // Generate getServerSideProps function
    const getServerSideProps: GetServerSideProps = async (nextContext) => {
      const { req } = nextContext

      // Generate context
      const generateContext: () => Promise<{
        success: boolean
        context: ContextType | null
        err?: unknown
      }> = async () => {
        try {
          const context = await contextGenerator(nextContext)
          return {
            success: true,
            context,
          }
        } catch (err) {
          const handleError =
            onContextGenerationError ?? defaultContextGenerationErrorHandler
          handleError(req, err)
          return {
            success: false,
            context: null,
            err,
          }
        }
      }
      const {
        success: wasContextGenerated,
        context: ambiguousContext,
        err: contextGenerationError,
      } = await generateContext()
      if (!wasContextGenerated) {
        const errorPageUrl = getErrorPageUrl(
          contextGenerationError,
          nextContext
        )
        return {
          redirect: {
            permanent: false,
            destination: errorPageUrl,
          },
        }
      }
      const context = ambiguousContext as ContextType

      // Wrap case handlers
      const wrappedCaseHandlers = allCaseHandlers.map((caseHandler) =>
        wrapCaseHandler(
          caseHandler,
          context,
          getErrorPageUrl,
          onCaseHandlingError
        )
      )

      // Handle cases
      const ssrResult = handleWrappedCases(nextContext, wrappedCaseHandlers)
      return ssrResult
    }

    return getServerSideProps
  }

  return ssrHandler
}

export default generateSsrHandler
