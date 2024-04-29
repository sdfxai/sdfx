export const formatPromptError = (error: any) => {
  if (error === null) {
    return '(unknown error)'
  } else if (typeof error === 'string') {
    return error
  } else if (error.stack && error.message) {
    return error.toString()
  } else if (error.response) {
    let message = error.response?.error?.message
    if (error.response?.error?.details) message += ': ' + error.response.error.details

    if (error.response?.node_errors) {
      for (const [nodeID, nodeError] of Object.entries(error.response.node_errors)) {
        const nodeErrorTyped: any = nodeError
        message += '\n' + nodeErrorTyped.class_type + ':'
        for (const errorReason of nodeErrorTyped.errors) {
          message += '\n    - ' + errorReason.message + ': ' + errorReason.details
        }
      }
    }

    return message
  }
  return '(unknown error)'
}

export const formatExecutionError = (error: any) => {
  if (error === null) {
    return '(unknown error)'
  }

  const traceback = error.traceback.join('')
  const nodeId = error.node_id
  const nodeType = error.node_type

  return `Error occurred when executing ${nodeType}:\n\n${error.exception_message}\n\n${traceback}`
}

