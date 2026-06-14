import { logger } from '@utils';
import Ajv, { type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import fs from 'fs/promises';
import path from 'path';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const schemaCache = new Map<string, object>();
const validatorCache = new Map<string, ValidateFunction>();

export async function loadApiSchema(schemaPath: string): Promise<object> {
  const abs = path.isAbsolute(schemaPath) ? schemaPath : path.resolve(process.cwd(), schemaPath);
  logger.info(`Loading API schema from ${abs}`);
  if (schemaCache.has(abs)) return schemaCache.get(abs) as object;
  try {
    const raw = await fs.readFile(abs, 'utf-8');
    const parsed = JSON.parse(raw);
    schemaCache.set(abs, parsed);
    return parsed;
  } catch (err) {
    logger.error(`Failed to load schema at ${abs}`, err);
    throw err;
  }
}

export async function getApiSchemaValidator(
  schemaOrPath: string | object,
): Promise<ValidateFunction> {
  logger.info(
    `Getting API schema validator for ${typeof schemaOrPath === 'string' ? schemaOrPath : 'inline schema'}`,
  );
  if (typeof schemaOrPath === 'string') {
    const abs = path.isAbsolute(schemaOrPath)
      ? schemaOrPath
      : path.resolve(process.cwd(), schemaOrPath);
    if (validatorCache.has(abs)) return validatorCache.get(abs) as ValidateFunction;
    logger.info(`Loading and compiling schema from ${abs}`);
    const schema = await loadApiSchema(abs);
    const validate = ajv.compile(schema as object);
    validatorCache.set(abs, validate);
    return validate;
  }
  return ajv.compile(schemaOrPath as object);
}
