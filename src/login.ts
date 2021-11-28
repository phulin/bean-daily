import {
  bufferToFile,
  fileToBuffer,
  getClanName,
  print,
  todayToString,
  visitUrl,
  xpath,
} from "kolmafia";
import { Clan } from "libram";

export function main(): void {
  const originalClan = getClanName();
  try {
    const table = xpath(
      visitUrl("clan_log.php"),
      '//center[.="Stash Activity:"]/../../table//td/font/.'
    );
    const newLinesReversed = table[0]
      .replace(/<font.*?>/, "")
      .replace(/<\/font>/, "")
      .split("<br />")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    const newLines = [...newLinesReversed].reverse();
    print(`Found ${newLines.length} lines in FACT Club activity log.`);
    bufferToFile(newLines.join("\n"), `data/stash_log/${todayToString()}.txt`);
    const savedLog = fileToBuffer("data/stash_log.txt");
    const savedLines = savedLog.split(/[\r\n]+/g).filter((line) => line.length > 0);
    print("Last 5 saved lines:", "blue");
    for (const line of savedLines.slice(-5)) print(line);
    const lastSavedLine = savedLines.length > 0 ? savedLines[savedLines.length - 1] : null;
    const lastOverlapIndexReversed = newLinesReversed.findIndex(
      (newLine) => newLine === lastSavedLine
    );
    let allLines: string[];
    if (lastOverlapIndexReversed === -1) {
      allLines = [...savedLines, ...newLines];
    } else {
      const firstFreshIndex = newLinesReversed.length - lastOverlapIndexReversed;
      print(`${firstFreshIndex} lines overlap with saved.`);
      print("First 5 new lines:", "blue");
      for (const line of newLines.slice(firstFreshIndex)) print(line);
      allLines = [...savedLines, ...newLines.slice(firstFreshIndex)];
    }
    print(`Saving updated log with ${allLines.length} lines.`);
    bufferToFile(allLines.join("\n"), "data/stash_log.txt");
  } finally {
    Clan.join(originalClan);
  }
}
