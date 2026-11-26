import { Client } from "./Client";
import { Resolver } from "./Resolver";
import { Cleaner } from "./Cleaner";
import { Settings } from "../Settings/Settings";

async function main(): Promise<void> {
  const client = new Client();
  const me = await client.get("/users/@me");

  if (!me.ok) {
    console.log(`[System] Token geçersiz (${me.status})`);
    return;
  }

  console.log(`[System] Bağlı hesap: ${me.data.username}`);

  try {
    const resolver = new Resolver(client);
    const target = await resolver.resolve(Settings.Id);
    const cleaner = new Cleaner(client, me.data.id);
    await cleaner.clean(target);
  } catch (error) {
    console.log(`[System] ${(error as Error).message}`);
  }
}

main();
