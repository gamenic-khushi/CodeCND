const { Client, Databases, Query, ID } = require('node-appwrite');

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DB  = process.env.APPWRITE_DATABASE_ID;
const COL = process.env.APPWRITE_ISSUES_COLLECTION_ID;

async function findExisting(issueNumber) {
  const res = await databases.listDocuments(DB, COL, [
    Query.equal('issueNumber', issueNumber),
    Query.limit(1),
  ]);
  return res.documents[0] || null;
}

async function main() {
  const action      = process.env.ISSUE_ACTION;
  const issueNumber = Number(process.env.ISSUE_NUMBER);

  const payload = {
    issueNumber,
    title:     (process.env.ISSUE_TITLE     || '').slice(0, 255),
    body:      (process.env.ISSUE_BODY      || '').slice(0, 5000),
    state:     (process.env.ISSUE_STATE     || 'open').slice(0, 20),
    url:       (process.env.ISSUE_URL       || '').slice(0, 500),
    author:    (process.env.ISSUE_AUTHOR    || '').slice(0, 100),
    labels:    (process.env.ISSUE_LABELS    || '[]').slice(0, 1000),
    createdAt: (process.env.ISSUE_CREATED_AT || '').slice(0, 50),
    updatedAt: (process.env.ISSUE_UPDATED_AT || '').slice(0, 50),
  };

  console.log(`Action: ${action} | Issue #${issueNumber} — "${payload.title}"`);

  const existing = await findExisting(issueNumber);

  if (action === 'deleted') {
    if (existing) {
      await databases.deleteDocument(DB, COL, existing.$id);
      console.log(`Deleted issue #${issueNumber} from Appwrite.`);
    } else {
      console.log(`Issue #${issueNumber} not found in Appwrite — nothing to delete.`);
    }
    return;
  }

  if (existing) {
    await databases.updateDocument(DB, COL, existing.$id, payload);
    console.log(`Updated issue #${issueNumber} in Appwrite.`);
  } else {
    await databases.createDocument(DB, COL, ID.unique(), payload);
    console.log(`Created issue #${issueNumber} in Appwrite.`);
  }
}

main().catch(err => {
  console.error('Sync failed:', err.message || err);
  process.exit(1);
});
