import { Settings } from "../Settings/Settings";

const API = "https://discord.com/api/v9";

export interface ClientResponse {
  ok: boolean;
  status: number;
  data: any;
}

export class Client {
  private token: string;

  constructor() {
    this.token = Settings.Token;
  }

  private esi13Log(message: string): void {
    console.log(`[Client] ${message}`);
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async request(method: string, path: string, body?: any, attempt: number = 0): Promise<ClientResponse> {
    const response = await fetch(`${API}${path}`, {
      method,
      headers: {
        Authorization: this.token,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36"
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (response.status === 429) {
      const data = await response.json().catch(() => ({}));
      const delay = Math.ceil((data.retry_after ?? 1) * 1000) + 250;
      this.esi13Log(`Rate limit — ${delay}ms bekleniyor`);
      await this.wait(delay);
      if (attempt < 5) return this.request(method, path, body, attempt + 1);
      return { ok: false, status: 429, data };
    }

    if (response.status >= 500 && attempt < 3) {
      await this.wait(1000 * (attempt + 1));
      return this.request(method, path, body, attempt + 1);
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    const ok = response.status >= 200 && response.status < 300;

    if (!ok) this.esi13Log(`${method} ${path} → ${response.status}`);

    return { ok, status: response.status, data };
  }

  get(path: string): Promise<ClientResponse> {
    return this.request("GET", path);
  }

  delete(path: string): Promise<ClientResponse> {
    return this.request("DELETE", path);
  }
}
