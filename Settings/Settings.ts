export interface AppSettings {
  Token: string;
  Id: string;
  Backup: boolean;
}

export const Settings: AppSettings = {
  Token: process.env.TOKEN ?? "",
  Id: process.env.ID ?? "",
  Backup: process.env.BACKUP !== "false"
};
