// Firebase Auth errors come back as raw codes like "auth/email-already-in-use"
// or messages like "Firebase: Error (auth/weak-password)." -- neither is
// something a non-technical user should ever see. This maps the common
// ones to plain language; anything unrecognized falls back to a generic,
// still-friendly message rather than showing the raw Firebase text.
const MESSAGES = {
  'auth/email-already-in-use': 'An account with this email already exists. Try logging in instead.',
  'auth/invalid-email': 'That email address doesn\u2019t look right. Double-check it and try again.',
  'auth/weak-password': 'That password is too short. Use at least 6 characters.',
  'auth/user-not-found': 'We couldn\u2019t find an account with that email.',
  'auth/wrong-password': 'That password doesn\u2019t match this account.',
  'auth/invalid-credential': 'That email or password doesn\u2019t match an account. Check both and try again.',
  'auth/too-many-requests': 'Too many attempts. Wait a minute and try again.',
  'auth/network-request-failed': 'Couldn\u2019t reach the server. Check your connection and try again.',
  'auth/user-disabled': 'This account has been disabled. Contact your community lead.',
}

export function friendlyAuthError(err) {
  const code = err?.code || ''
  return MESSAGES[code] || 'Something went wrong. Please try again.'
}