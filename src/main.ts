import * as child from "node:child_process";
import * as util from "node:util";
import * as path from "node:path";
import OS from "opensubtitles-api";
import countries from "i18n-iso-countries";

const exec = util.promisify(child.exec);

interface Track {
  codec: string;
  id: number;
  type: string;
  properties: TrackProperties;
}

interface TrackProperties {
  codec_id: string;
  codec_private_length: number;
  default_track: boolean;
  enabled_track: boolean;
  forced_track: boolean;
  language: string;
  language_ietf?: string;
  number: number;
  track_name: string;
  uid: number;
}

interface MkvMergeOutput {
  file_name: string;
  tracks: Track[];
}

interface SubtitledVideoTrack {
  filePath: string;
  track: Track;
}

async function parseVideoFile(path: string): Promise<MkvMergeOutput> {
  const out = await exec(["mkvmerge", "-J", path].join(" "));
  const js = JSON.parse(out.stdout);
  return js;
}

async function extractSubtitles(
  video: SubtitledVideoTrack,
  outputFolder: string
) {
  const bareFileName = path.basename(video.filePath, "mkv");
  const { properties } = video.track;
  const variable =
    properties.language + (properties.forced_track ? "-forced" : "");
  console.log(properties.language);
  const identifier = `${video.track.id}:${bareFileName}${variable}`;
  switch (video.track.codec) {
    case "SubRip/SRT": {
      return await exec(
        ["mkvextract", "tracks", video.filePath, `${identifier}.srt`].join(" ")
      );
    }
    // case "VobSub": {
    //   return await exec(
    //     [
    //       "mkvextract",
    //       "tracks",
    //       bareFileName,
    //       `${track.id}:${track.properties.track}.idx`,
    //     ].join(" ")
    //   );
    // }
  }
}

async function main() {
  const os = new OS({
    username: "",
    password: "",
    ssl: true,
  });

  const res = await os.login();
  console.log(res);

  // const path = "/Users/xetera/Downloads/lights.mkv";
  // const video = await parseVideoFile(path);
  // const subs = video.tracks.filter((track) => track.type === "subtitles");
  // for (const sub of subs) {
  //   const file: SubtitledVideoTrack = {
  //     filePath: path,
  //     track: sub,
  //   };
  //   extractSubtitles(file, "/Users/xetera/Downloads");
  // }
}

main();
