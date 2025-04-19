const amqp = require('amqplib');

async function startWorker() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    const channel = await connection.createChannel();

    const queue = 'task_queue';
    await channel.assertQueue(queue, { durable: true });
    channel.prefetch(1);

    console.log('[👷‍♂️] Waiting for messages in %s...', queue);

    channel.consume(queue, async (msg) => {
      const task = JSON.parse(msg.content.toString());
      console.log('[📥] Received task:', task);

      // Simulate background processing
      setTimeout(() => {
        console.log('[✅] Done processing task:', task);
        channel.ack(msg);
      }, 2000);

    }, { noAck: false });
  } catch (err) {
    console.error('[❌] Worker error:', err);
  }
}

startWorker();