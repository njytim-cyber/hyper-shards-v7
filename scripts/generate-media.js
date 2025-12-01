// Scripts: Rich Media Generator (Images, Video, Audio)
// Usage: node scripts/generate-media.js [asset_id]
import fs from 'fs';
import path from 'path';
import { GoogleAuth } from 'google-auth-library';

const MANIFEST_PATH = 'assets/asset-manifest.json';
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const auth = new GoogleAuth({ scopes: '[https://www.googleapis.com/auth/cloud-platform](https://www.googleapis.com/auth/cloud-platform)' });

async function generate() {
    const assetId = process.argv[2];
    const asset = manifest.assets.find(a => a.id === assetId);
    if (!asset) throw new Error(`Asset ${assetId} not found.`);

    console.log(`🚀 Starting generation for: ${asset.id} (${asset.type})...`);
    const client = await auth.getClient();
    const token = (await client.getAccessToken()).token;

    if (asset.type === 'image') await generateImage(asset, token);
    else if (asset.type === 'video') await generateVideoLRO(asset, token);
    else if (asset.type === 'audio') await generateAudio(asset, token);
}

// Handler: Nano Banana / Imagen 4
async function generateImage(asset, token) {
    const url = `https://${manifest.defaults.location}-aiplatform.googleapis.com/v1/projects/${manifest.defaults.project_id}/locations/${manifest.defaults.location}/publishers/google/models/${asset.model}:predict`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            instances: [{ prompt: asset.prompt }],
            parameters: { sampleCount: 1, aspectRatio: "16:9" }
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(JSON.stringify(data.error));

    const buffer = Buffer.from(data.predictions[0].bytesBase64Encoded, 'base64');
    saveFile(asset.output, buffer);
}

// Handler: Veo / Lyria (Long Running)
async function generateVideoLRO(asset, token) {
    const url = `https://${manifest.defaults.location}-aiplatform.googleapis.com/v1/projects/${manifest.defaults.project_id}/locations/${manifest.defaults.location}/publishers/google/models/${asset.model}:predictLongRunning`;

    console.log("⏳ Submitting Job (this takes ~60s)...");
    const initResp = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            instances: [{ prompt: asset.prompt }],
            parameters: {
                sampleCount: 1,
                video_duration_seconds: asset.parameters.duration_seconds || 6
            }
        })
    });

    const initData = await initResp.json();
    if (initData.error) throw new Error(JSON.stringify(initData.error));

    let operationName = initData.name;
    console.log(`   Job ID: ${operationName}`);

    while (true) {
        await new Promise(r => setTimeout(r, 5000));
        const pollResp = await fetch(`https://${manifest.defaults.location}-aiplatform.googleapis.com/v1/${operationName}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const pollData = await pollResp.json();

        if (pollData.done) {
            if (pollData.error) throw new Error(JSON.stringify(pollData.error));
            console.log("✅ Complete. Check your GCS bucket or response.");
            break;
        }
        process.stdout.write(".");
    }
}

async function generateAudio(asset, token) {
    // Similar to Video LRO or Image Sync depending on Lyria version
    await generateVideoLRO(asset, token);
}

function saveFile(filePath, buffer) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, buffer);
    console.log(`💾 Saved to ${filePath}`);
}

generate().catch(console.error);
