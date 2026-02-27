"use server";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An error occurred";
}

export const contact = async (
  _name: string,
  _email: string,
  _message: string
): Promise<{ error?: string }> => {
  try {
    return { error: "Contact form is not configured. Add Resend and configure RESEND_FROM / RESEND_TOKEN to enable." };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
};
