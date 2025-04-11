import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Tailwind,
} from "@react-email/components";

interface FeedbackEmailProps {
  name: string;
  email: string;
  feedbackType: string;
  rating: string;
  comments: string;
}

export function FeedbackEmail({
  name,
  email,
  feedbackType,
  rating,
  comments,
}: FeedbackEmailProps) {
  const feedbackTypeLabel =
    {
      general: "General Feedback",
      bug: "Bug Report",
      feature: "Feature Request",
      support: "Support Issue",
      other: "Other",
    }[feedbackType] || feedbackType;

  const ratingLabel =
    {
      "1": "Poor",
      "2": "Fair",
      "3": "Good",
      "4": "Very Good",
      "5": "Excellent",
    }[rating] || rating;

  return (
    <Html>
      <Head />
      <Preview>New Feedback Submission from {name}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white p-8 rounded-lg shadow-lg my-8 mx-auto max-w-xl">
            <Heading className="text-xl font-bold text-gray-800 mb-2">
              New Feedback Submission
            </Heading>
            <Text className="text-gray-600 mb-4">
              You have received a new feedback submission from your website.
            </Text>

            <Hr className="border-gray-200 my-4" />

            <Section>
              <Text className="text-gray-800 font-medium">Name:</Text>
              <Text className="text-gray-700 mb-4">{name}</Text>

              <Text className="text-gray-800 font-medium">Email:</Text>
              <Text className="text-gray-700 mb-4">{email}</Text>

              <Text className="text-gray-800 font-medium">Feedback Type:</Text>
              <Text className="text-gray-700 mb-4">{feedbackTypeLabel}</Text>

              <Text className="text-gray-800 font-medium">Rating:</Text>
              <Text className="text-gray-700 mb-4">
                {ratingLabel} ({rating}/5)
              </Text>

              <Text className="text-gray-800 font-medium">Comments:</Text>
              <Text className="text-gray-700 mb-4 whitespace-pre-wrap">
                {comments}
              </Text>
            </Section>

            <Hr className="border-gray-200 my-4" />

            <Text className="text-sm text-gray-500 text-center">
              This is an automated email sent from your feedback form.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default FeedbackEmail;
