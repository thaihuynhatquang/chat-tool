import bluebird from 'bluebird';
import redis from 'redis';
const debug = require('debug')('app:redis');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const client = redis.createClient({
  host: 'redis',
});

client.on('connect', () => {
  debug('Redis connection has been established successfully');
});

client.on('error', (err) => {
  debug('Error when connect to Redis server', err);
});

export default client;
