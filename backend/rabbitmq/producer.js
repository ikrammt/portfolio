const amqp = require('amqplib');

let channel;

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    channel = await connection.createChannel();
    await channel.assertQueue('task_queue', { durable: true });
    console.log('[✅] Connected to RabbitMQ');
  } catch (error) {
    console.error('[❌] Failed to connect to RabbitMQ:', error);
  }
}

async function sendToQueue(data) {
  if (!channel) {
    console.warn('[⚠️] RabbitMQ channel not initialized. Attempting reconnect...');
    await connectRabbitMQ();
  }

  try {
    const buffer = Buffer.from(JSON.stringify(data));
    channel.sendToQueue('task_queue', buffer, { persistent: true });
    console.log('[📨] Sent to queue:', data);
  } catch (error) {
    console.error('[❌] Failed to send message:', error);
  }
}

module.exports = {
  connectRabbitMQ,
  sendToQueue
};
