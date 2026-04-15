import { NextResponse } from "next/server";

export const POST = async (request: Request): Promise<Response> => {
  void request;
  return NextResponse.json(
    {
      ok: false,
      message: "Authentication webhooks are disabled after the Auth.js migration.",
    },
    { status: 410 }
  );
};
