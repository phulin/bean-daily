import os

all_lines = []

for entry in sorted(os.scandir("/Users/phulin/Library/Application Support/KoLmafia/data/stash_log"), key=lambda entry: entry.path):
  if not entry.path.endswith(".txt"): continue
  with open(entry.path) as f:
    lines = [l.strip() for l in f.readlines() if len(l.strip()) > 0]
    if len(all_lines) == 0:
      all_lines.extend(lines)
      for line in lines: print(line)
      continue

    # Walk backward trying to find a match
    for i in range(min(len(lines), len(all_lines)), -1, -1):
      # print("comparing:")
      # print("== " + all_lines[-i])
      # print("   " + all_lines[-i + 1])
      # print("   " + all_lines[-1])

      # print("== " + lines[0])
      # print("   " + lines[1])
      # print("   " + lines[i - 1])
      # if (i < len(lines)): print("=> " + lines[i])

      all_lines_set = set(x.lower() for x in all_lines[-i:])
      lines_set = set(x.lower() for x in lines[:i])
      if lines_set == all_lines_set:
        # print("=== MATCH of {} => {} new lines ===".format(i, len(lines) - i))
        break
      # else:
      #   print("set match: " + str(all_lines_set == lines_set))
      #   if all(matches[:10]):
      #     print("ALL LINES - LINES:")
      #     for line in all_lines_set - lines_set: print(line)
      #     print("LINES - ALL LINES:")
      #     for line in lines_set - all_lines_set: print(lines)
      #   idx = matches.index(False)
      #   print("XX " + all_lines[-i + idx])
      #   print("XX " + lines[idx])
    
    all_lines.extend(lines[i:])
    for line in lines[i:]: print(line)

# for line in all_lines: print(line.strip())