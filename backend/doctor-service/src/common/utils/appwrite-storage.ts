import { Client, ID, Storage, Tokens } from 'node-appwrite';
import { InputFile } from 'node-appwrite/file';
import { ConfigService } from '@nestjs/config';

export class AppwriteStorage {
  private readonly storage: Storage;
  private readonly tokens: Tokens;
  private readonly bucketId: string;
  private readonly endpoint: string;
  private readonly projectId: string;

  constructor(config: ConfigService) {
    this.endpoint = this.required(config, 'APPWRITE_ENDPOINT');
    this.projectId = this.required(config, 'APPWRITE_PROJECT_ID');
    this.bucketId = this.required(config, 'APPWRITE_BUCKET_ID');
    const client = new Client()
      .setEndpoint(this.endpoint)
      .setProject(this.projectId)
      .setKey(this.required(config, 'APPWRITE_API_KEY'));
    this.storage = new Storage(client);
    this.tokens = new Tokens(client);
  }

  async upload(path: string, filename: string): Promise<string> {
    const file = await this.storage.createFile({
      bucketId: this.bucketId,
      fileId: ID.unique(),
      file: InputFile.fromPath(path, filename),
    });
    return file.$id;
  }

  async delete(fileId: string): Promise<void> {
    await this.storage.deleteFile({ bucketId: this.bucketId, fileId });
  }

  async viewUrl(fileId: string): Promise<string> {
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const token = await this.tokens.createFileToken({
      bucketId: this.bucketId,
      fileId,
      expire: expiresAt,
    });
    return `${this.endpoint.replace(/\/$/, '')}/storage/buckets/${this.bucketId}/files/${fileId}/view?project=${this.projectId}&token=${token.secret}`;
  }

  private required(config: ConfigService, key: string): string {
    const value = config.get<string>(key);
    if (!value) throw new Error(`${key} must be configured to store files in Appwrite.`);
    return value;
  }
}
