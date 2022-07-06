export default function formatErrorMessage(jsonError) {
  // the extra space after ":" is intentional
  const [name, message] = jsonError.split(": ")
  return `[${name}] ${message}`
}
