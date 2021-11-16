import {
  SsrCaseNotFoundResult,
  SsrCaseRedirectResult,
  WrappedSsrCaseListHandler,
} from '../types'

const handleWrappedCases: WrappedSsrCaseListHandler = async (
  nextContext,
  wrappedCaseHandlers,
  previousResult = { props: {} }
) => {
  if (wrappedCaseHandlers.length === 0) return previousResult

  const [handleCurrentCase] = wrappedCaseHandlers
  const { props: prevProps } = previousResult

  // Handle current case
  const currentResult = await handleCurrentCase(nextContext)

  // Return if 'redirect' or 'not found' scenario
  if (currentResult.redirect) return currentResult as SsrCaseRedirectResult
  if (currentResult.notFound) return currentResult as SsrCaseNotFoundResult
  if (!currentResult.props) {
    throw new Error(
      `Expected SSR case handler to return either props, redirect or notFound.`
    )
  }

  // Combine props
  const { props: currentProps } = currentResult
  const combinedProps = { ...prevProps, ...currentProps }

  // Continue handling cases and combine results
  const remainingHandlers = wrappedCaseHandlers.slice(1)
  const combinedResult = { props: combinedProps }
  return await handleWrappedCases(
    nextContext,
    remainingHandlers,
    combinedResult
  )
}

export default handleWrappedCases
