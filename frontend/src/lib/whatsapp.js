// Builds a working wa.me deep link from a phone number, optionally with a
// pre-filled message the person can send as-is or edit before sending.
// wa.me requires the FULL international format with no leading zero
// (e.g. 2348012345678) -- but Nigerian users naturally type the local
// format with a leading 0 (e.g. 08012345678). Without normalizing this,
// the link points at an invalid number and WhatsApp opens generically
// instead of landing on the specific contact.
export function whatsappLink(phone, message) {
  let digits = (phone || '').replace(/\D/g, '')

  if (digits.startsWith('0')) {
    // Local format (leading 0) -- swap it for Nigeria's country code.
    digits = '234' + digits.slice(1)
  }

  const base = `https://wa.me/${digits}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}