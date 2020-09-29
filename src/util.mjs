/*
const tz = {
  CEST: 2 * 60 * 60 * 1000
};
*/

export function decodeDate(line) {
  const m = line.match(
    /\w+\s+(?<year>\d\d\d\d)-(?<month>\d\d)-(?<day>\d\d)\s(?<hour>\d\d):(?<minute>\d\d):(?<second>\d\d)\s(?<tz>\w+)/
  );
  if (m) {
    return new Date(
      new Date(
        parseInt(m.groups.year),
        parseInt(m.groups.month) - 1,
        parseInt(m.groups.day),
        parseInt(m.groups.hour),
        parseInt(m.groups.minute),
        parseInt(m.groups.second),
        0
      ).getTime() -
        0 * 60 * 60 * 1000
    );
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
      break;
  }
  return memory;
}
