const uri =
  process.env.MONGODB_URI ||
  'mongodb+srv://mutualFunds:mutualFunds161992@cluster0.xfx6oyr.mongodb.net/mutual_funds?retryWrites=true&w=majority';

const options =
  process.env.NODE_ENV === 'development'
    ? {
        // Dev-only: relax TLS to unblock local development behind proxies/AV.
        tlsAllowInvalidCertificates: true,
        serverSelectionTimeoutMS: 5000,
      }
    : {};

async function getClientPromise() {
  const { MongoClient } = await import('mongodb');
  
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  } else {
    const client = new MongoClient(uri, options);
    return client.connect();
  }
}

export default getClientPromise();