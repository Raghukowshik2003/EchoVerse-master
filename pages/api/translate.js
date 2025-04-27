import { TranslationServiceClient } from '@google-cloud/translate';

//this function will be used to parse the json string correctly.
function parseJSON(jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return {};
    }
  }

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { text, targetLang } = req.body;
      const projectId = process.env.GOOGLE_CLOUD_PROJECT;
      const key = parseJSON(process.env.GOOGLE_CLOUD_KEY); // Parse the JSON string

      const translationClient = new TranslationServiceClient({
        credentials: key,
        projectId: projectId,
      });

      const location = 'global';
      const [response] = await translationClient.translateText({
        parent: `projects/${projectId}/locations/${location}`,
        contents: [text],
        mimeType: 'text/plain',
        targetLanguageCode: targetLang,
      });
      res.status(200).json({ translatedText: response.translations[0].translatedText });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: 'Translation failed: ' + error.message });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
