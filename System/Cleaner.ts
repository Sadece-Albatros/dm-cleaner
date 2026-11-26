import * as fs from "fs";
import * as path from "path";
import { Client } from "./Client";
import { Target } from "./Resolver";
import { Settings } from "../Settings/Settings";

interface Message {
  id: string;
  content: string;
  author: { id: string };
  timestamp: string;
}

interface Esigayon13BackupEntry {
  channelId: string;
  messageId: string;
  content: string;
  timestamp: string;
}

export class Cleaner {
  private client: Client;
  private me: string;
  private backupRoot: string;

  constructor(client: Client, me: string) {
    this.client = client;
    this.me = me;
    this.backupRoot = path.join(process.cwd(), "Backup");
  }

  async clean(target: Target): Promise<void> {
    console.log(`[Cleaner] Hedef: ${target.kind} (${target.channelIds.length} kanal)`);

    let totalSeen = 0;
    let totalDeleted = 0;

    for (const channelId of target.channelIds) {
      let before: string | undefined;
      let channelSeen = 0;
      let channelDeleted = 0;
      const entries: Esigayon13BackupEntry[] = [];

      while (true) {
        const query = `?limit=100${before ? `&before=${before}` : ""}`;
        const result = await this.client.get(`/channels/${channelId}/messages${query}`);

        if (!result.ok) {
          console.log(`[Cleaner] ${channelId} mesajlar alınamadı (${result.status})`);
          break;
        }

        const messages = result.data as Message[];
        if (!Array.isArray(messages) || messages.length === 0) break;

        for (const message of messages) {
          channelSeen++;
          if (message.author.id !== this.me) continue;

          if (Settings.Backup) {
            entries.push({
              channelId,
              messageId: message.id,
              content: message.content,
              timestamp: this.toIstanbul(message.timestamp)
            });
          }

          const removed = await this.client.delete(`/channels/${channelId}/messages/${message.id}`);
          if (removed.ok) channelDeleted++;
        }

        before = messages[messages.length - 1].id;
        if (messages.length < 100) break;
      }

      if (Settings.Backup && entries.length > 0) this.writeBackup(target.id, channelId, entries);

      totalSeen += channelSeen;
      totalDeleted += channelDeleted;
      console.log(`[Cleaner] ${channelId}: ${channelSeen} tarandı, ${channelDeleted} silindi`);
    }

    console.log(`[Cleaner] Toplam: ${totalSeen} tarandı, ${totalDeleted} silindi`);
  }

  private toIstanbul(value: string): string {
    return new Date(value).toLocaleString("tr-TR", {
      timeZone: "Europe/Istanbul",
      dateStyle: "medium",
      timeStyle: "medium"
    });
  }

  private writeBackup(targetId: string, channelId: string, entries: Esigayon13BackupEntry[]): void {
    const folder = path.join(this.backupRoot, targetId);
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

    const file = path.join(folder, `${channelId}.json`);
    const existing: Esigayon13BackupEntry[] = fs.existsSync(file)
      ? JSON.parse(fs.readFileSync(file, "utf8"))
      : [];

    fs.writeFileSync(file, JSON.stringify(existing.concat(entries), null, 2), "utf8");
  }
}
