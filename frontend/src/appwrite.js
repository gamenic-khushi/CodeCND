import { Client, Databases, Account, Storage, ID, Query } from 'appwrite';

const DB  = process.env.REACT_APP_APPWRITE_DATABASE_ID;
const COL = {
  companies:     process.env.REACT_APP_APPWRITE_COMPANIES_COLLECTION_ID,
  products:      process.env.REACT_APP_APPWRITE_PRODUCTS_COLLECTION_ID,
  folders:       process.env.REACT_APP_APPWRITE_FOLDERS_COLLECTION_ID,
  files:         process.env.REACT_APP_APPWRITE_FILES_COLLECTION_ID,
  pressReleases: process.env.REACT_APP_APPWRITE_PR_COLLECTION_ID,
};

const _client = new Client()
  .setEndpoint(process.env.REACT_APP_APPWRITE_ENDPOINT)
  .setProject(process.env.REACT_APP_APPWRITE_PROJECT_ID);

const _databases = new Databases(_client);
const _account   = new Account(_client);
const _storage   = new Storage(_client);
const BUCKET     = process.env.REACT_APP_APPWRITE_BUCKET_ID;

export const auth = {
  login: (email, password) =>
    _account.createEmailPasswordSession(email, password),

  logout: () =>
    _account.deleteSession('current').catch(() => {}),

  getUser: () => _account.get(),
};

// ── Field mapping: Appwrite ↔ App ─────────────────────────────────────────
// Appwrite uses camelCase field names (referenceId, folderName, productId…).
// The app uses en/jp/companyEn/companyJp/productEn/productJp internally.
// These functions translate between the two so no component needs to change.

function folderFromAppwrite(doc) {
  return {
    _awid:     doc.$id,
    id:        doc.referenceId || '',
    en:        doc.folderName  || '',
    jp:        doc.folderName  || '',
    productId: doc.productId   || '',   // kept for client-side join
    // companyEn/companyJp/productEn/productJp enriched in App.js via productId
  };
}

function folderToAppwrite(data) {
  return {
    referenceId: data.id        || '',
    folderName:  data.en || data.jp || '',
    ...(data.productId ? { productId: data.productId } : {}),
  };
}

function companyFromAppwrite(doc) {
  return {
    _awid:  doc.$id,
    id:     doc.referenceId  || '',
    en:     doc.companyName  || doc.en  || '',
    jp:     doc.companyName  || doc.jp  || '',
  };
}

function companyToAppwrite(data) {
  const payload = {
    referenceId: data.id || '',
    companyName: data.en || data.jp || data.companyName || '',
  };
  // Optional fields that exist in the Appwrite companies schema
  // Map form keys → Appwrite field names
  if (data.companyWebsite)       payload.websiteUrl             = data.companyWebsite;
  if (data.industry)             payload.industry               = data.industry;
  if (data.employees)            payload.employees              = data.employees;
  if (data.revenueScale)         payload.revenueScale           = data.revenueScale;
  if (data.brandConcept)         payload.brandConcept           = data.brandConcept;
  if (data.companyCategories)    payload.companyCategories      = data.companyCategories;
  if (data.headquartersLocation) payload.headquartersLocation   = data.headquartersLocation;
  return payload;
}

function productFromAppwrite(doc) {
  return {
    _awid:     doc.$id,
    id:        doc.referenceId || '',
    en:        doc.productName || '',
    jp:        doc.productName || '',
    companyId: doc.companyId   || '',
    // companyEn/companyJp resolved in App.js via companyId join
  };
}

function productToAppwrite(data) {
  return {
    referenceId: data.id             || '',
    productName: data.en || data.jp  || '',
    companyId:   data.companyId      || '',
  };
}

function pressFromAppwrite(doc) {
  return {
    _awid: doc.$id,
    id:    doc.$id,
    refId: doc.referenceId  || '',
    date:  doc.releaseDate  || '',
    en:    doc.title        || '',
    jp:    doc.title        || '',
    body:  doc.body         || '',
  };
}

function pressToAppwrite(data) {
  return {
    referenceId: data.refId || '',
    title:       data.en || data.jp || '',
    ...(data.body        ? { body: data.body }               : {}),
    ...(data.date        ? { releaseDate: data.date }        : {}),
  };
}

function fileFromAppwrite(doc) {
  return {
    _awid:    doc.$id,
    id:       doc.$id,
    refId:    doc.referenceId || '',
    type:     doc.status      || 'File',
    en:       doc.title       || '',
    jp:       doc.title       || '',
    folderId: doc.folderId    || '',
    fileId:   doc.fileId      || '',
    prompt:   doc.prompt      || '',
    result:   doc.result      || '',
    chat:     doc.chat        || '',
  };
}

function fileToAppwrite(data) {
  const payload = {
    referenceId: data.refId || '',
    title:       data.en || data.jp || '',
    status:      data.type || 'File',
  };
  if (data.folderId) payload.folderId = data.folderId;
  if (data.fileId)   payload.fileId   = data.fileId;
  if (data.prompt)   payload.prompt   = data.prompt;
  if (data.result)   payload.result   = data.result;
  if (data.chat)     payload.chat     = data.chat;
  return payload;
}

// Pick the right mapper per collection
function fromAppwrite(col, doc) {
  if (col === 'folders')        return folderFromAppwrite(doc);
  if (col === 'companies')      return companyFromAppwrite(doc);
  if (col === 'products')       return productFromAppwrite(doc);
  if (col === 'pressReleases')  return pressFromAppwrite(doc);
  if (col === 'files')          return fileFromAppwrite(doc);
  // fallback: strip Appwrite metadata
  const { $id, $collectionId, $databaseId, $createdAt, $updatedAt, $permissions, ...rest } = doc;
  return { ...rest, _awid: $id };
}

function toAppwrite(col, data) {
  if (col === 'folders')        return folderToAppwrite(data);
  if (col === 'companies')      return companyToAppwrite(data);
  if (col === 'products')       return productToAppwrite(data);
  if (col === 'pressReleases')  return pressToAppwrite(data);
  if (col === 'files')          return fileToAppwrite(data);
  const { _awid, ...rest } = data;
  return rest;
}

// ── Storage service ───────────────────────────────────────────────────────

export const storage = {
  upload: async (file) => {
    if (!BUCKET) throw new Error('No storage bucket configured');
    const result = await _storage.createFile(BUCKET, ID.unique(), file);
    return result.$id;
  },

  previewUrl: (fileId) => {
    if (!fileId || !BUCKET) return null;
    return `${process.env.REACT_APP_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET}/files/${fileId}/preview?project=${process.env.REACT_APP_APPWRITE_PROJECT_ID}&width=80&height=80`;
  },

  deleteFile: (fileId) => {
    if (!fileId || !BUCKET) return Promise.resolve();
    return _storage.deleteFile(BUCKET, fileId);
  },
};

// ── DB service ────────────────────────────────────────────────────────────

export const db = {
  list: async (col) => {
    const res = await _databases.listDocuments(DB, COL[col], [Query.limit(100)]);
    return res.documents.map(doc => fromAppwrite(col, doc));
  },

  create: async (col, data) => {
    const payload = toAppwrite(col, data);
    const doc = await _databases.createDocument(DB, COL[col], ID.unique(), payload);
    return fromAppwrite(col, doc);
  },

  update: async (col, awid, data) => {
    const payload = toAppwrite(col, data);
    const doc = await _databases.updateDocument(DB, COL[col], awid, payload);
    return fromAppwrite(col, doc);
  },

  delete: async (col, awid) => {
    await _databases.deleteDocument(DB, COL[col], awid);
  },
};
