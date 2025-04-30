// src/infra/http/server.ts
import { fastifyCors } from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { fastify } from "fastify";
import {
  hasZodFastifySchemaValidationErrors,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler
} from "fastify-type-provider-zod";

// src/env.ts
import { z } from "zod";
var envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  DATABASE_URL: z.string().url().startsWith("postgresql://"),
  CLOUDFLARE_ACCOUNT_ID: z.string(),
  CLOUDFLARE_ACCESS_KEY_ID: z.string(),
  CLOUDFLARE_SECRET_ACCESS_KEY: z.string(),
  CLOUDFLARE_BUCKET: z.string(),
  CLOUDFLARE_PUBLIC_URL: z.string().url()
});
var env = envSchema.parse(process.env);

// src/infra/db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// src/infra/db/schemas/link.ts
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
var links = pgTable("links", {
  id: text("id").primaryKey().$defaultFn(() => uuidv7()),
  originalUrl: text("original_url").notNull(),
  shortUrl: text("short_url").notNull().unique(),
  accessCount: integer("access_count").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// src/infra/db/schemas/index.ts
var schema = {
  links
};

// src/infra/db/index.ts
var pg = postgres(env.DATABASE_URL);
var db = drizzle(pg, { schema });

// src/infra/shared/either.ts
var isLeft = (e) => {
  return e.left !== void 0;
};
var isRight = (e) => {
  return e.right !== void 0;
};
var unwrapEither = ({
  left,
  right
}) => {
  if (right !== void 0 && left !== void 0) {
    throw new Error(
      `Received both left and right values at runtime when opening an Either
Left: ${JSON.stringify(
        left
      )}
Right: ${JSON.stringify(right)}`
    );
  }
  if (left !== void 0) {
    return left;
  }
  if (right !== void 0) {
    return right;
  }
  throw new Error(
    "Received no left or right values at runtime when opening Either"
  );
};
var makeLeft = (value) => ({ left: value });
var makeRight = (value) => ({ right: value });

// src/infra/shared/schemas/create-link.schema.ts
import { z as z3 } from "zod";

// src/infra/shared/schemas/link.schema.ts
import { z as z2 } from "zod";
var linkSchema = z2.object({
  id: z2.string().uuid(),
  originalUrl: z2.string().url(),
  shortUrl: z2.string().regex(/^[a-zA-Z0-9_-]+$/),
  accessCount: z2.number(),
  createdAt: z2.date()
});

// src/infra/shared/schemas/create-link.schema.ts
var createLinkSchema = z3.object({
  originalUrl: linkSchema.shape.originalUrl,
  shortUrl: linkSchema.shape.shortUrl
});

// src/app/functions/get-link.ts
import { eq } from "drizzle-orm";
var getLinkByShortUrl = async (shortUrl) => {
  const link = await db.select().from(schema.links).where(eq(schema.links.shortUrl, shortUrl)).then((res) => res[0]);
  if (!link) {
    return makeLeft("Link n\xE3o encontrado." /* LINK_NOT_FOUND */);
  }
  const parsed = linkSchema.safeParse(link);
  if (!parsed.success) {
    return makeLeft("O link inserido \xE9 inv\xE1lido." /* INVALID_LINK_DATA */);
  }
  return makeRight(parsed.data);
};

// src/app/functions/create-link.ts
var createLink = async (originalUrl, shortUrl) => {
  const parsedInput = createLinkSchema.safeParse({ originalUrl, shortUrl });
  if (!parsedInput.success) {
    return makeLeft("Os dados de entrada s\xE3o inv\xE1lidos." /* INVALID_INPUT */);
  }
  const existingLink = await getLinkByShortUrl(shortUrl);
  if (isRight(existingLink)) {
    return makeLeft("Essa URL encurtada j\xE1 existe." /* SHORT_URL_ALREADY_EXISTS */);
  }
  const inserted = await db.insert(schema.links).values({
    originalUrl,
    shortUrl,
    accessCount: 0
  }).returning();
  const newLink = inserted[0];
  if (!newLink) {
    return makeLeft("O link inserido \xE9 inv\xE1lido." /* INVALID_LINK_DATA */);
  }
  const parsedLink = linkSchema.safeParse(newLink);
  if (!parsedLink.success) {
    return makeLeft("O link inserido \xE9 inv\xE1lido." /* INVALID_LINK_DATA */);
  }
  return makeRight(parsedLink.data);
};

// src/infra/http/routes/create-link.ts
import { z as z4 } from "zod";
var createLinkRoute = async (server2) => {
  server2.post(
    "/links",
    {
      schema: {
        summary: "Create a new link",
        body: createLinkSchema,
        response: {
          200: z4.object({ id: linkSchema.shape.id }),
          400: z4.object({
            message: z4.string()
          })
        }
      }
    },
    async (request, reply) => {
      const result = await createLink(
        request.body.originalUrl,
        request.body.shortUrl
      );
      if (isLeft(result)) {
        return reply.status(400).send({ message: result.left });
      }
      return reply.status(200).send({ id: result.right.id });
    }
  );
};

// src/app/functions/delete-link.ts
import { eq as eq2 } from "drizzle-orm";
var deleteLinkByShortUrl = async (shortUrl) => {
  const link = await db.select().from(schema.links).where(eq2(schema.links.shortUrl, shortUrl)).then((res) => res[0]);
  if (!link) {
    return makeLeft("Link n\xE3o encontrado." /* LINK_NOT_FOUND */);
  }
  await db.delete(schema.links).where(eq2(schema.links.shortUrl, shortUrl));
  return makeRight(true);
};

// src/infra/http/routes/delete-link.ts
import { z as z5 } from "zod";
var deleteLinkRoute = async (server2) => {
  server2.delete(
    "/links/:shortUrl",
    {
      schema: {
        summary: "Delete link",
        params: z5.object({
          shortUrl: linkSchema.shape.shortUrl
        }),
        response: {
          200: z5.object({ message: z5.string() }),
          404: z5.object({ message: z5.string() })
        }
      }
    },
    async (request, reply) => {
      const result = await deleteLinkByShortUrl(request.params.shortUrl);
      if (isLeft(result)) {
        return reply.status(404).send({ message: result.left });
      }
      return reply.status(200).send({
        message: "Link encurtado deletado com sucesso."
      });
    }
  );
};

// src/app/functions/export-links.ts
import { PassThrough, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

// src/infra/storage/upload-file-to-storage.ts
import { randomUUID } from "node:crypto";
import { basename, extname } from "node:path";
import { Readable } from "node:stream";
import { Upload } from "@aws-sdk/lib-storage";
import { z as z6 } from "zod";

// src/infra/storage/client.ts
import { S3Client } from "@aws-sdk/client-s3";
var r2 = new S3Client({
  region: "auto",
  endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY
  }
});

// src/infra/storage/upload-file-to-storage.ts
var uploadFileToStorageInput = z6.object({
  folder: z6.enum(["csv", "downloads"]),
  fileName: z6.string(),
  contentType: z6.string(),
  contentStream: z6.instanceof(Readable)
});
async function uploadFileToStorage(input) {
  const { folder, fileName, contentType, contentStream } = uploadFileToStorageInput.parse(input);
  const fileExtension = extname(fileName);
  const fileNameWithoutExtension = basename(fileName);
  const sanitizedFileName = fileNameWithoutExtension.replace(
    /[^a-zA-Z0-9]/g,
    ""
  );
  const sanitizedFileNameWithExtension = sanitizedFileName.concat(fileExtension);
  const uniqueFileName = `${folder}/${randomUUID()}-${sanitizedFileNameWithExtension}`;
  const upload = new Upload({
    client: r2,
    params: {
      Key: uniqueFileName,
      Bucket: env.CLOUDFLARE_BUCKET,
      Body: contentStream,
      ContentType: contentType
    }
  });
  await upload.done();
  return {
    key: uniqueFileName,
    url: new URL(uniqueFileName, env.CLOUDFLARE_PUBLIC_URL).toString()
  };
}

// src/app/functions/export-links.ts
import { stringify } from "csv-stringify";
import { ilike } from "drizzle-orm";
import { z as z7 } from "zod";
var exportLinksInput = z7.object({
  searchQuery: z7.string().optional()
});
async function exportLinks(input) {
  const { searchQuery } = exportLinksInput.parse(input);
  const { sql, params } = db.select({
    id: schema.links.id,
    originalUrl: schema.links.originalUrl,
    shortUrl: schema.links.shortUrl,
    accessCount: schema.links.accessCount,
    createdAt: schema.links.createdAt
  }).from(schema.links).where(
    searchQuery ? ilike(schema.links.shortUrl, `%${searchQuery}%`) : void 0
  ).toSQL();
  const cursor = pg.unsafe(sql, params).cursor(2);
  const csv = stringify({
    delimiter: ",",
    header: true,
    columns: [
      { key: "original_url", header: "Original URL" },
      { key: "short_url", header: "Short URL" },
      { key: "access_count", header: "Access Count" },
      { key: "created_at", header: "Created At" }
    ]
  });
  const uploadToStorageStream = new PassThrough();
  const convertToCSVPipeline = pipeline(
    cursor,
    new Transform({
      objectMode: true,
      transform(chunks, encoding, callback) {
        for (const chunk of chunks) {
          this.push(chunk);
        }
        callback();
      }
    }),
    csv,
    uploadToStorageStream
  );
  const uploadToStorage = uploadFileToStorage({
    contentType: "text/csv",
    folder: "downloads",
    fileName: `${(/* @__PURE__ */ new Date()).toISOString()}-links.csv`,
    contentStream: uploadToStorageStream
  });
  const [{ url }] = await Promise.all([uploadToStorage, convertToCSVPipeline]);
  return makeRight({ reportUrl: url });
}

// src/infra/http/routes/export-links.ts
import { z as z8 } from "zod";
var exportLinksRoute = async (server2) => {
  server2.post(
    "/links/exports",
    {
      schema: {
        summary: "Export links",
        querystring: z8.object({
          searchQuery: z8.string().optional()
        }),
        response: {
          200: z8.object({
            reportUrl: z8.string()
          })
        }
      }
    },
    async (request, reply) => {
      const { searchQuery } = request.query;
      const result = await exportLinks({
        searchQuery
      });
      const { reportUrl } = unwrapEither(result);
      return reply.status(200).send({ reportUrl });
    }
  );
};

// src/infra/http/routes/get-link.ts
import { z as z9 } from "zod";
var getLinkByShortUrlRoute = async (server2) => {
  server2.get(
    "/links/:shortUrl",
    {
      schema: {
        summary: "Get link by short URL",
        params: z9.object({
          shortUrl: linkSchema.shape.shortUrl
        }),
        response: {
          200: z9.object({
            id: linkSchema.shape.id,
            originalUrl: linkSchema.shape.originalUrl,
            shortUrl: linkSchema.shape.shortUrl,
            accessCount: linkSchema.shape.accessCount,
            createdAt: linkSchema.shape.createdAt
          }),
          404: z9.object({
            message: z9.string()
          }),
          400: z9.object({
            message: z9.string()
          })
        }
      }
    },
    async (request, reply) => {
      const { shortUrl } = request.params;
      const result = await getLinkByShortUrl(shortUrl);
      if (isLeft(result)) {
        return reply.status(400).send({ message: result.left });
      }
      return reply.status(200).send(result.right);
    }
  );
};

// src/infra/shared/schemas/get-links.schema.ts
import { z as z10 } from "zod";
var getLinksInput = z10.object({
  searchQuery: z10.string().optional(),
  sortBy: z10.enum(["createdAt", "originalUrl", "shortUrl", "accessCount"]).optional(),
  sortDirection: z10.enum(["asc", "desc"]).optional(),
  page: z10.coerce.number().optional().default(1),
  pageSize: z10.coerce.number().optional().default(20)
});

// src/app/functions/get-paged-links.ts
import { asc, count, desc, ilike as ilike2 } from "drizzle-orm";
async function getLinks(input) {
  const { page, pageSize, searchQuery, sortBy, sortDirection } = getLinksInput.parse(input);
  const [links2, totalResult] = await Promise.all([
    db.select({
      id: schema.links.id,
      originalUrl: schema.links.originalUrl,
      shortUrl: schema.links.shortUrl,
      accessCount: schema.links.accessCount,
      createdAt: schema.links.createdAt
    }).from(schema.links).where(
      searchQuery ? ilike2(schema.links.originalUrl, `%${searchQuery}%`) : void 0
    ).orderBy((fields) => {
      if (sortBy && sortDirection === "asc") {
        return asc(fields[sortBy]);
      }
      if (sortBy && sortDirection === "desc") {
        return desc(fields[sortBy]);
      }
      return desc(fields.createdAt);
    }).offset((page - 1) * pageSize).limit(pageSize),
    db.select({ total: count(schema.links.id) }).from(schema.links).where(
      searchQuery ? ilike2(schema.links.originalUrl, `%${searchQuery}%`) : void 0
    )
  ]);
  const total = totalResult[0]?.total || 0;
  const totalPages = Math.ceil(total / pageSize);
  const pagination = {
    number: page,
    size: pageSize,
    hasPrevious: page > 1,
    hasNext: page < totalPages
  };
  return makeRight({ links: links2, pagination, total });
}

// src/infra/http/routes/get-paged-links.ts
import { z as z11 } from "zod";
var getLinksRoute = async (server2) => {
  server2.get(
    "/links",
    {
      schema: {
        summary: "Get a list of links",
        querystring: getLinksInput,
        response: {
          200: z11.object({
            links: z11.array(
              z11.object({
                id: linkSchema.shape.id,
                originalUrl: linkSchema.shape.originalUrl,
                shortUrl: linkSchema.shape.shortUrl,
                accessCount: linkSchema.shape.accessCount,
                createdAt: linkSchema.shape.createdAt
              })
            ),
            pagination: z11.object({
              number: z11.number(),
              size: z11.number(),
              hasPrevious: z11.boolean(),
              hasNext: z11.boolean()
            }),
            total: z11.number()
          }),
          400: z11.object({
            message: z11.string()
          })
        }
      }
    },
    async (request, reply) => {
      const result = await getLinks(request.query);
      if (isLeft(result)) {
        return reply.status(400).send({ message: "Failed to fetch links." });
      }
      const { links: links2, pagination, total } = unwrapEither(result);
      return reply.status(200).send({
        links: links2,
        pagination,
        total
      });
    }
  );
};

// src/app/functions/increment-link-access.ts
import { eq as eq3 } from "drizzle-orm";
var incrementLinkAccess = async (shortUrl) => {
  const result = await getLinkByShortUrl(shortUrl);
  if (isLeft(result)) {
    return makeLeft("Link n\xE3o encontrado." /* LINK_NOT_FOUND */);
  }
  const link = result.right;
  const updated = await db.update(schema.links).set({
    accessCount: link.accessCount + 1
  }).where(eq3(schema.links.shortUrl, shortUrl));
  if (updated.count === 0) {
    return makeLeft("Houve um erro ao incrementar o acesso ao link." /* UPDATE_FAILED */);
  }
  return makeRight(true);
};

// src/infra/http/routes/increment-link-access.ts
import { z as z12 } from "zod";
var incrementLinkAccessRoute = async (server2) => {
  server2.put(
    "/links/increment/:shortUrl",
    {
      schema: {
        summary: "Increment the access count of a link by its short URL",
        params: z12.object({
          shortUrl: linkSchema.shape.shortUrl
        }),
        response: {
          200: z12.object({
            success: z12.boolean()
          }),
          400: z12.object({
            message: z12.string()
          }),
          404: z12.object({
            message: z12.string()
          })
        }
      }
    },
    async (request, reply) => {
      const result = await incrementLinkAccess(request.params.shortUrl);
      if (isLeft(result)) {
        if (result.left === "Link n\xE3o encontrado." /* LINK_NOT_FOUND */) {
          return reply.status(404).send({ message: "Link n\xE3o encontrado." /* LINK_NOT_FOUND */ });
        }
        return reply.status(400).send({ message: "Houve um erro ao incrementar o acesso ao link." /* UPDATE_FAILED */ });
      }
      return reply.status(200).send({ success: true });
    }
  );
};

// src/infra/http/server.ts
var server = fastify();
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);
server.setErrorHandler((error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: "Validation error",
      issues: error.validation
    });
  }
  console.error(error);
  return reply.status(500).send({ message: "Internal server error." });
});
server.register(fastifyCors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
});
server.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Brevly API",
      version: "1.0.0"
    }
  },
  transform: jsonSchemaTransform
});
server.register(fastifySwaggerUi, {
  routePrefix: "/docs"
});
server.register(createLinkRoute);
server.register(getLinksRoute);
server.register(getLinkByShortUrlRoute);
server.register(incrementLinkAccessRoute);
server.register(deleteLinkRoute);
server.register(exportLinksRoute);
server.listen({ port: 3333, host: "0.0.0.0" }).then(() => {
  console.log("HTTP server running on http://localhost:3333");
});
