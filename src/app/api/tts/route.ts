// src/app/api/tts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { protos } from '@google-cloud/text-to-speech'; // Import protos for the correct type

// Initialize the Google TTS Client
// It automatically uses GOOGLE_APPLICATION_CREDENTIALS from .env.local
// Function to initialize the client safely
function initializeTtsClient() {
  try {
    // 1. Read the key content from the environment variable set in Vercel
    const keyJsonString = process.env.GOOGLE_CLOUD_KEY;

    if (!keyJsonString) {
      throw new Error('GOOGLE_CLOUD_KEY environment variable is not set.');
    }

    // 2. Parse the JSON string into an object
    const credentials = JSON.parse(keyJsonString);

    // 3. Initialize the client explicitly with the parsed credentials
    return new TextToSpeechClient({ credentials });

  } catch (error) {
    console.error("Failed to initialize TextToSpeechClient:", error);
    // Depending on your error handling strategy, you might:
    // - Return null or undefined and handle it later
    // - Throw the error to prevent the API route from working without credentials
    // For now, let's throw to make the issue clear during deployment/runtime
    throw new Error(`Failed to initialize TTS client: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Initialize the client using the function
const ttsClient = initializeTtsClient();

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body from the frontend
    const { text, languageCode, voiceName } = await request.json();

    // Basic validation
    if (!text || !languageCode || !voiceName) {
      return NextResponse.json(
        { error: 'Missing required fields: text, languageCode, voiceName' },
        { status: 400 }
      );
    }

    console.log(`[API Route] Received TTS request: Lang=${languageCode}, Voice=${voiceName}, Text="${text.substring(0, 50)}..."`);

    // 2. Construct the Google TTS request object
    const ttsRequest = {
      input: { text: text },
      // The voice object specifies the desired voice
      voice: {
        languageCode: languageCode, // e.g., 'en-US'
        name: voiceName,           // e.g., 'en-US-Wavenet-D' (Male), 'fr-FR-Wavenet-A' (Female)
      },
      // Specify the audio format
      audioConfig: {
        audioEncoding: 'MP3' as const, // MP3 is widely supported
      },
    };

    // 3. Call the Google Cloud Text-to-Speech API
    console.log("[API Route] Sending request to Google TTS API...");
    const [response] = await ttsClient.synthesizeSpeech(ttsRequest);
    console.log("[API Route] Received response from Google TTS API.");

    // 4. Check if audio content was received and handle the type correctly
      const audioContent = response.audioContent as Uint8Array | null | undefined
    if (!audioContent) {
      console.error("[API Route] Google TTS API returned no audio content.");
      return NextResponse.json(
        { error: 'Failed to synthesize speech - no audio content received' },
        { status: 500 }
      );
    }

    // 5. Send the audio back to the frontend as a Base64 encoded string
    // The audioContent is now a Uint8Array, so we can directly use it with Buffer.from
    const audioBase64 = Buffer.from(audioContent).toString('base64');

    return NextResponse.json({ audioBase64: audioBase64 });

  } catch (error) {
    console.error('[API Route] Error processing TTS request:', error);
    let errorMessage = 'Internal Server Error during TTS synthesis';
    if (error instanceof Error) {
        // Provide slightly more context if possible, but avoid leaking sensitive details
        errorMessage = `TTS Synthesis failed: ${error.message.substring(0, 100)}`; // Limit error message length
    }

    if (error instanceof Error && error.message.startsWith('Failed to initialize TTS client')) {
      errorMessage = error.message; // Use the specific initialization error
  }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
