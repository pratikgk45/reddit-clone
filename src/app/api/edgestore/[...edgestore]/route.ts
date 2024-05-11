import { initEdgeStore } from '@edgestore/server';
import { createEdgeStoreNextHandler } from '@edgestore/server/adapters/next/app';

const es = initEdgeStore.create();

const SUPPORTED_FILES = ['image/jpeg', 'image/png'];
const MAX_SIZE_IN_MB = 10;

const edgeStoreRouter = es.router({
  publicFiles: es.imageBucket({
    maxSize: 1024 * 1024 * MAX_SIZE_IN_MB, // 10MB
    accept: SUPPORTED_FILES
  }),
});

const handler = createEdgeStoreNextHandler({
  router: edgeStoreRouter,
});

export { handler as GET, handler as POST };

export type EdgeStoreRouter = typeof edgeStoreRouter;