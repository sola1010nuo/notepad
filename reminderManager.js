const { Notification } = require("electron");

class ReminderManager {
  constructor() {
    this.timers = new Map();      // noteId -> timeout
    this.notifiedIds = new Set(); // 已提醒過的 note
    this.notes = [];
    this.advanceMinutes = 30;
  }

  updateAll(notes, advanceMinutes) {
    this.notes = Array.isArray(notes) ? notes : [];
    this.advanceMinutes =
      typeof advanceMinutes === "number" ? advanceMinutes : 30;

    console.log("[Reminder] updateAll called", {
      count: this.notes.length,
      advanceMinutes: this.advanceMinutes,
      notes: this.notes.map((n) => ({
        id: n.id,
        title: n.title,
        startAt: n.startAt,
        endAt: n.endAt,
      })),
    });

    this.rescheduleAll();
  }

  clearAllTimers() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }

  rescheduleAll() {
    this.clearAllTimers();

    const now = Date.now();

    for (const note of this.notes) {
      if (!note?.id) continue;

      // 改成用 endAt 當提醒基準
      if (!note?.endAt) continue;

      if (this.notifiedIds.has(note.id)) continue;

      console.log("[Reminder] scheduling note =", {
        id: note.id,
        title: note.title,
        startAt: note.startAt,
        endAt: note.endAt,
        advanceMinutes: this.advanceMinutes,
      });

      const endMs = new Date(note.endAt).getTime();
      if (Number.isNaN(endMs)) {
        console.log("[Reminder] invalid endAt, skipped =", {
          id: note.id,
          title: note.title,
          endAt: note.endAt,
        });
        continue;
      }

      const remindMs = endMs - this.advanceMinutes * 60 * 1000;
      const delay = remindMs - now;

      console.log("[Reminder] parsed times =", {
        id: note.id,
        title: note.title,
        endAtRaw: note.endAt,
        endLocal: new Date(endMs).toLocaleString(),
        remindLocal: new Date(remindMs).toLocaleString(),
      });

      if (delay <= 0) {
        console.log("[Reminder] skipped because remind time already passed =", {
          id: note.id,
          title: note.title,
          endAt: note.endAt,
        });
        continue;
      }

      const timer = setTimeout(() => {
        this.showNotification(note);
        this.timers.delete(note.id);
      }, delay);

      this.timers.set(note.id, timer);

      console.log(
        `[Reminder] scheduled: ${note.title} (${note.id}) at ${new Date(remindMs).toLocaleString()}`
      );
    }
  }

  showNotification(note) {
    if (this.notifiedIds.has(note.id)) return;
    this.notifiedIds.add(note.id);

    const notification = new Notification({
      title: note.title || "筆記提醒",
      body: this.buildBody(note),
      silent: false,
      timeoutType: "never",
    });

    notification.on("show", () => {
      console.log(`[Reminder] shown: ${note.id}`);
    });

    notification.on("click", () => {
      console.log(`[Reminder] clicked: ${note.id}`);
    });

    notification.on("close", () => {
      console.log(`[Reminder] closed: ${note.id}`);
    });

    notification.show();
  }

  buildBody(note) {
    const lines = [];

    if (note.endAt) {
      const d = new Date(note.endAt);
      if (!Number.isNaN(d.getTime())) {
        lines.push(`結束時間：${d.toLocaleString()}`);
      }
    }

    if (note.content) {
      lines.push(note.content.slice(0, 50));
    }

    return lines.join("\n");
  }

  resetNotified(noteId) {
    this.notifiedIds.delete(noteId);
    this.rescheduleAll();
  }

  removeNote(noteId) {
    const timer = this.timers.get(noteId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(noteId);
    }

    this.notifiedIds.delete(noteId);
    this.notes = this.notes.filter((n) => n.id !== noteId);
  }
}

module.exports = new ReminderManager();