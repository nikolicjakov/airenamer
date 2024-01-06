import { Base64 } from "https://deno.land/x/bb64@1.1.0/mod.ts";

export async function getkeywords(image: string): Promise<string[]> {
  const body = {
    "model": "llava:13b-v1.5-q5_K_M",
    "format": "json",
    "prompt": `Describe the image as a collection of keywords. Output in JSON format. Use the following schema: { filename: string, keywords: string[] }`,
    "images": [image],
    "stream": false
  };

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await response.json();
  const keywords = JSON.parse(json.response);

  return keywords?.keywords || [];
}

function createFileName(keywords: string[], fileext: string): string {
  const fileparts = keywords.map(k => k.replace(/ /g, "_"));
  const newfilename = fileparts.join("-") + "." + fileext;
  return newfilename;
}

if (import.meta.main) {
  const currentpath = Deno.cwd();
  for (const file of Deno.readDirSync(".")) {
    if (file.name.endsWith(".jpg") || file.name.endsWith(".png")) {
      const b64 = Base64.fromFile(`${currentpath}/${file.name}`).toString();
      const keywords = await getkeywords(b64);
      const newfilename = createFileName(keywords, file.name.split(".").pop()!);
      Deno.copyFileSync(`${currentpath}/${file.name}`, `${currentpath}/${newfilename}`);

      console.log(`Copied ${file.name} to ${newfilename}`);
    }
  }
}