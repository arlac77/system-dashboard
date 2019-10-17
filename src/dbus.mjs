import dbus from "dbus-next";

export const defaultDbusConfig = {
    dbus : {
        systemd: {
            address : 'org.freedesktop.systemd1'
        }
    }
};

/*
org.freedesktop.systemd1
*/

export async function list() {
  let bus = dbus.sessionBus();
  let obj = await bus.getProxyObject(
    "org.freedesktop.DBus",
    "/org/freedesktop/DBus"
  );
  let iface = obj.getInterface("org.freedesktop.DBus");
  const names = await iface.ListNames();

  return names;
}
