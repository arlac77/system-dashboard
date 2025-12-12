const tz = {
  UTC: "+00:00",
  CET: "+01:00",
  CEST: "+02:00"
};

export function decodeDate(line) {
  const m = line.match(
    /\w+\s+(?<year>\d\d\d\d)-(?<month>\d\d)-(?<day>\d\d)\s(?<hour>\d\d):(?<minute>\d\d):(?<second>\d\d)\s(?<tz>\w+)/
  );
  if (m) {
    let offset;

    const tm = m.groups.tz.match(/GMT+(\d\d)(\d\d)/);
    if (tm) {
      offset = "+${tm[1]}:${tm[2]}";
    } else {
      offset = tz[m.groups.tz] || "Z";
    }

    const d = `${m.groups.year}-${m.groups.month}-${m.groups.day}T${m.groups.hour}:${m.groups.minute}:${m.groups.second}${offset}`;

    return new Date(d);
  }
}

export function hex2char(str) {
  return str.replace(/\\x(\w\w)/g, (m, n) =>
    String.fromCharCode(parseInt(n, 16))
  );
}

export function parseBoolean(value) {
  return value === "yes";
}

export function parseBytes(value) {
  const m = value.match(/([\d\.]+)(\w+)/);
  const memory = parseFloat(m[1]);
  switch (m[2]) {
    case "K":
      return memory * 1024;
    case "M":
      return memory * 1024 * 1024;
    case "G":
      return memory * 1024 * 1024 * 1024;
  }
  return memory;
}
