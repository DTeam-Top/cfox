/* eslint-disable node/no-unpublished-import */
import {filesFromPath} from 'files-from-path';
import fs from 'fs';
import {injectable} from 'inversify';
import mime from 'mime';
import {Blob, File, NFTStorage} from 'nft.storage';
import path from 'path';
import {should, toHttpUrl} from '../commons';
import {dbService} from '../types/container';
import {IpfsInterface} from '../types/types';

@injectable()
export class IpfsService implements IpfsInterface {
  private storage?: NFTStorage;

  constructor() {}

  async uploadSingleFile(fileName: string): Promise<any> {
    const data = fs.readFileSync(fileName);
    const result = await this.getStorage().storeBlob(new Blob([data]));

    return {
      cid: result,
      httpUrl: `https://ipfs.io/ipfs/${result}`,
    };
  }

  async uploadDirectory(pathName: string): Promise<any> {
    const files = filesFromPath(pathName, {
      pathPrefix: path.resolve(pathName),
      hidden: true,
    });
    const result = await this.getStorage().storeDirectory(files);

    return {
      cid: result,
      httpUrl: `https://ipfs.io/ipfs/${result}/`,
    };
  }

  async uploadMetadata(metadataFileName: string): Promise<any> {
    const content = fs.readFileSync(metadataFileName);
    const metadata = JSON.parse(content.toString());

    should(
      metadata.name && metadata.description && metadata.image,
      `${metadataFileName} not includes "name", "description", "image".`
    );

    const imageContent = fs.readFileSync(metadata.image);
    const type = mime.getType(metadata.image);
    metadata.image = new File([imageContent], path.basename(metadata.image), {
      type,
    });

    const result = await this.getStorage().store(metadata);
    return {
      cid: result.ipnft,
      httpUrl: toHttpUrl(result.url),
    };
  }

  private getStorage() {
    if (this.storage) {
      return this.storage;
    }

    const nftStorageKey = dbService().getKey('nft.storage');
    should(!!nftStorageKey, 'nft.storage key is missing, please set one.');
    this.storage = new NFTStorage({token: nftStorageKey!});
    return this.storage;
  }
}
