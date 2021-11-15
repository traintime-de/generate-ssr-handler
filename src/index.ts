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
      }> = async () => {
        try {
          const context = await contextGenerator(req)
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
          }
        }
      }
      const { success: wasContextGenerated, context: ambiguousContext } =
        await generateContext()
      if (!wasContextGenerated) {
        const errorPageUrl = getErrorPageUrl(req, ambiguousContext)
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
          onCaseHandlingError,
          getErrorPageUrl
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
