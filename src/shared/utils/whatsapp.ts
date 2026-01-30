/**
 * Opens WhatsApp with a pre-filled message to a specific phone number
 * @param phoneNumber - The phone number to send the message to (can include country code)
 * @param message - The message to pre-fill (optional, defaults to Arabic greeting)
 */
export function sendWhatsAppMessage(
  phoneNumber: string,
  message: string = "السلام عليكم ورحمه الله وبركاته"
): void {
  // Clean phone number - keep only digits and plus sign
  const cleanedPhone = phoneNumber.replace(/[^0-9+]/g, "");
  
  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Open WhatsApp with the pre-filled message
  window.open(
    `https://wa.me/${cleanedPhone}?text=${encodedMessage}`,
    "_blank"
  );
}
