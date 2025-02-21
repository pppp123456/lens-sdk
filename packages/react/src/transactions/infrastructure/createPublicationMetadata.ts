import {
  PublicationMetadata,
  PublicationMainFocus,
  PublicationMetadataDisplayTypes,
  PublicationMetadataMediaInput,
} from '@lens-protocol/api-bindings';
import {
  CollectPolicyType,
  CreateCommentRequest,
  CreatePostRequest,
  MediaObject,
  NftAttribute,
} from '@lens-protocol/domain/use-cases/publications';
import { v4 } from 'uuid';

function mapMetaAttributes(attributes: NftAttribute[]) {
  return attributes.map(({ displayType, value, ...rest }) => {
    return {
      ...rest,
      value: value.toString(),
      displayType: PublicationMetadataDisplayTypes[displayType],
    };
  });
}

function mapMedia(media: MediaObject): PublicationMetadataMediaInput {
  return {
    item: media.url,
    type: media.mimeType,
    ...(media.altTag && { altTag: media.altTag }),
    ...(media.cover && { cover: media.cover }),
  };
}

export function createPublicationMetadata(
  request: CreatePostRequest | CreateCommentRequest,
): PublicationMetadata {
  const sharedMetadata = {
    version: '2.0.0',
    metadata_id: v4(),
    ...(request.appId && { appId: request.appId }),
    content: request.content,
    media: request.media?.map(mapMedia),
    locale: request.locale,
    mainContentFocus: PublicationMainFocus[request.contentFocus],
  } as const;

  switch (request.collect.type) {
    case CollectPolicyType.CHARGE:
    case CollectPolicyType.FREE:
      return {
        ...sharedMetadata,

        attributes: mapMetaAttributes(request.collect.metadata.attributes),
        description: request.collect.metadata.description,
        name: request.collect.metadata.name,
      };

    case CollectPolicyType.NO_COLLECT:
      return {
        ...sharedMetadata,

        name: 'none', // although "name" is not needed when a publication is not collectable, Publication Metadata V2 schema requires it ¯\_(ツ)_/¯
        attributes: [],
      };
  }
}
