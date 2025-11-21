import { handleUpload, type HandleUploadBody } from "@vercel/blob/server"
import { NextResponse } from "next/server"

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      // The body contains the pathname of the file to upload.
      // The pathname is sent from the client-side upload function.
      onBeforeGenerateToken: async (pathname) => {
        // This logic here for generating a token is only for demonstration purposes.
        // In a real world application, you would have more complex logic here,
        // like checking if the user is authenticated and has permission to upload.
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "text/plain", "application/pdf"],
          token: process.env.BLOB_READ_WRITE_TOKEN,
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // You can use this callback to store the blob details in your database.
        console.log("Blob upload completed", blob, tokenPayload)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
