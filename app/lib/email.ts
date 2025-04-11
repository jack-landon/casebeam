"use server";

import { Resend } from "resend";
import FeedbackEmail from "./emails/FeedbackEmail";

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Define the type for feedback data
type FeedbackData = {
  name: string;
  email: string;
  feedbackType: string;
  rating: string;
  comments: string;
};

export async function sendFeedbackEmail(data: FeedbackData) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY environment variable");
  }

  const { name, email, feedbackType, rating, comments } = data;

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: "Feedback <feedback@yourdomain.com>",
      to: ["admin@casebeam.com"],
      subject: `New Feedback: ${feedbackType} from ${name}`,
      react: FeedbackEmail({
        name,
        email,
        feedbackType,
        rating,
        comments,
      }),
    });

    if (error) {
      console.error("Error sending email:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { success: true, data: emailData };
  } catch (error) {
    console.error("Error in sendFeedbackEmail:", error);
    throw error;
  }
}
