import { Client } from "./Client";

export type TargetKind = "dm" | "guild" | "text" | "voice";

export interface Target {
  kind: TargetKind;
  id: string;
  channelIds: string[];
}

interface RawChannel {
  id: string;
  type: number;
}

export class Resolver {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async resolve(id: string): Promise<Target> {
    const channel = await this.client.get(`/channels/${id}`);

    if (channel.ok) {
      const kind = this.kindOf(channel.data.type);
      return { kind, id, channelIds: [id] };
    }

    const guild = await this.client.get(`/guilds/${id}`);

    if (guild.ok) {
      const list = await this.client.get(`/guilds/${id}/channels`);
      if (!list.ok) throw new Error(`Kanallar alınamadı: ${list.status}`);

      const channels = (list.data as RawChannel[]).filter(c => c.type === 0 || c.type === 2);
      if (channels.length === 0) throw new Error("SILINECEK kanal bulunamadı");

      return { kind: "guild", id, channelIds: channels.map(c => c.id) };
    }

    throw new Error(`Geçersiz ID: ${id}`);
  }

  private kindOf(type: number): TargetKind {
    if (type === 0) return "text";
    if (type === 2) return "voice";
    if (type === 1 || type === 3) return "dm";
    throw new Error(`Desteklenmeyen kanal tipi: ${type}`);
  }
}
