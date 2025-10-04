const uri = 'mongodb+srv://mutualFunds:mutualFunds161992@cluster0.xfx6oyr.mongodb.net/';
const options = {};

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