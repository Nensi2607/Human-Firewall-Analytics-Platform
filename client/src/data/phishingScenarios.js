const phishingScenarios = [
  {
    id: "password-reset",
    sender: "account-team@secure-notice.example",
    subject: "URGENT: Password reset required today",
    message:
      "Your account will be locked unless you confirm your password immediately. Use the Verify Account button below to keep access.",
    correctAnswer: "phishing",
    indicators: [
      "The sender uses an unfamiliar support domain.",
      "Urgent language pressures you to act immediately.",
      "The message asks you to verify a password through a link.",
    ],
  },
  {
    id: "hr-document",
    sender: "hr-documents@company-files.example",
    subject: "Updated employee handbook - review required",
    message:
      "Please review the attached employee handbook before the end of the day. Enable editing and macros if prompted so the document can load correctly.",
    correctAnswer: "phishing",
    indicators: [
      "The sender is not using a verified company domain.",
      "Unexpected attachments can contain harmful content.",
      "Requests to enable macros are a common warning sign.",
    ],
  },
  {
    id: "delivery-notice",
    sender: "delivery-update@parcel-alert.example",
    subject: "Delivery attempt failed - action needed",
    message:
      "We could not deliver your package. Confirm your address and pay a small redelivery fee using the secure form within 24 hours.",
    correctAnswer: "phishing",
    indicators: [
      "The message creates urgency with a short deadline.",
      "It requests payment through an unexpected message.",
      "The sender and destination are not connected to a known order.",
    ],
  },
  {
    id: "security-training",
    sender: "security-training@learning.example",
    subject: "Scheduled security awareness session",
    message:
      "Your security awareness session is scheduled for Tuesday at 10:00 AM. Open the training portal from the usual company bookmark or contact the security team if you have questions.",
    correctAnswer: "legitimate",
    indicators: [
      "The message does not ask for a password, payment, or sensitive data.",
      "It recommends using a known bookmark instead of an unexpected link.",
      "You can verify the session through the security team.",
    ],
  },
];

export default phishingScenarios;
