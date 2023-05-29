import {
  bufferToFile,
  fileToBuffer,
  getAllProperties,
  getClanName,
  getProperty,
  myName,
  print,
  todayToString,
  visitUrl,
  xpath,
} from "kolmafia";
import { Clan, get, set } from "libram";

function setsEqual(a: Set<string>, b: Set<string>) {
  return a.size === b.size && [...a].every((x) => b.has(x));
}

export function main(): void {
  if (myName().toLowerCase() !== "worthawholebean") return;
  prefBackup();
  stashLog();
}

function prefBackup() {
  if (get("_prefsBackedUp", false)) return;

  print("Backing up prefs...", "blue");

  bufferToFile(
    Object.entries(getAllProperties("", false))
      .map(([name]) => {
        const rawValue = getProperty(name);
        const value = rawValue
          .replace(/[\\=:#!]/g, (match) => `\\${match}`)
          .replace(/\t/g, "\\t")
          .replace(/\n/g, "\\n")
          .replace(/\f/g, "\\f")
          .replace(/\r/g, "\\r");
        return rawValue === "" ? `${name}\n` : `${name}=${value}\n`;
      })
      .join(""),
    `data/${myName}_prefs_backup.txt`
  );

  set("_prefsBackedUp", true);
}

function stashLog() {
  const originalClan = getClanName();
  try {
    Clan.join("The 100% of Scientific FACT Club");
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

    let i;
    for (i = Math.min(savedLines.length, newLines.length); i >= 0; i--) {
      const savedLinesSet = new Set(
        savedLines.slice(savedLines.length - i).map((l) => l.toLowerCase())
      );
      const newLinesSet = new Set(newLines.slice(0, i).map((l) => l.toLowerCase()));
      if (setsEqual(savedLinesSet, newLinesSet)) break;
    }

    print(`${i} lines overlap with saved => ${newLines.length - i} new lines.`);
    print("First 5 new lines:", "blue");
    for (const line of newLines.slice(i, i + 5)) print(line);
    const allLines = [...savedLines, ...newLines.slice(i)];

    print(`Saving updated log with ${allLines.length} lines.`);
    bufferToFile(allLines.join("\n"), "data/stash_log.txt");
  } finally {
    Clan.join(originalClan);
  }
}
