import { Email } from "@convex-dev/auth/providers/Email";
import axios from "axios";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

/**
 * Phone OTP provider — sends OTP via SMS using Freebuff's auth service.
 * Uses the same Email provider under the hood but targets phone numbers.
 */
export const phoneOtp = Email({
  id: "phone-otp",
  maxAge: 60 * 10, // 10 minutes

  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes: Uint8Array) {
        crypto.getRandomValues(bytes);
      },
    };
    const alphabet = "0123456789";
    return generateRandomString(random, alphabet, 6);
  },

  async sendVerificationRequest({ identifier: phone, token }) {
    try {
      // Use Freebuff's auth service to send SMS OTP
      // The phone number is passed as the identifier
      await axios.post(
        "https://auth.freebuff.app/send_otp",
        {
          to: phone,
          otp: token,
          appName: process.env.VLY_APP_NAME || "a freebuff.com application",
          channel: "sms", // Specify SMS channel for phone OTP
        },
        {
          headers: {
            "x-api-key": "fb_email_2crN1hqIArZP2bEfvjp5Qik4",
          },
        },
      );
    } catch (error) {
      // If the SMS service isn't available, log for debugging
      // In production, this should throw to prevent silent failures
      console.error("[PhoneOTP] Failed to send SMS:", error);
      throw new Error("Failed to send OTP via SMS. Please try email instead.");
    }
  },
});
