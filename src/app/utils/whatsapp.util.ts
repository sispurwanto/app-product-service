export class WhatsAppUtil {
  /**
   * Normalizes Indonesian and international phone numbers into standard WA format (e.g., 628xxxxxxxxxx)
   */
  static normalizePhoneNumber(phone: string): string {
    if (!phone) return '';
    // Strip all non-digit characters except leading +
    let cleaned = phone.replace(/[^0-9]/g, '');

    // Convert 08xx to 628xx
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    }
    // If user typed 8xx without leading 0 or 62
    else if (cleaned.startsWith('8')) {
      cleaned = '62' + cleaned;
    }

    return cleaned;
  }

  /**
   * Validates if a phone number is a valid Indonesian mobile / WhatsApp number
   */
  static isValidIndonesianWA(phone: string): boolean {
    const normalized = this.normalizePhoneNumber(phone);
    // Indonesian mobile numbers start with 628 and are usually 10 to 14 digits total
    const waRegex = /^628[1-9][0-9]{7,11}$/;
    return waRegex.test(normalized);
  }

  /**
   * Generates a direct WhatsApp Web / App link
   */
  static generateWaLink(phoneNumber: string, message: string): string {
    const normalized = this.normalizePhoneNumber(phoneNumber);
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${normalized}?text=${encoded}`;
  }

  /**
   * Generates ticket number format: WC-YYYYMM-XXXX
   */
  static generateTicketNumber(): string {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `WC-${yearMonth}-${randomSuffix}`;
  }
}
