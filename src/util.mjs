export function decodeDateSpanUntil(line) {
    const m = line.match(
      /\w+\s+(?<year>\d\d\d\d)-(?<month>\d\d)-(?<day>\d\d)\s(?<hour>\d\d):(?<minute>\d\d):(?<second>\d\d)\s(?<tz>\w+)/
    );
    if (m) {
      return new Date(
        parseInt(m.groups.year),
        parseInt(m.groups.month) -1,
        parseInt(m.groups.day),
        parseInt(m.groups.hour),
        parseInt(m.groups.minute),
        parseInt(m.groups.second),
        0
      );
    }
  }
  
