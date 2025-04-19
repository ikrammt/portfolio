## Project Description
This project extends a **three-tier web application** by integrating RabbitMQ to enable asynchronous messaging between services. It demonstrates clean layer separation, container networking, and message queuing in Dockerized environments.

### Original Architecture
1. **Frontend**: Static website served by Nginx.
2. **Backend**: Node.js/Express API that handles API requests and database interaction.
3. **Database**: PostgreSQL that stores profile data.

Users can:
- View profile information
- Add new profile sections (e.g., Experience, Education)
- Update profile photos

### New Architecture Enhancements
In addition to the original stack, the following services were added:

4. **RabbitMQ**: Acts as a message broker.
5. **Worker**: A Node.js consumer that processes background tasks (e.g., generating reports).

The **Producer/Consumer pattern** is used where the backend sends messages to RabbitMQ and the worker consumes them asynchronously.



## System Architecture Diagram
_A diagram showing the flow between frontend → backend → RabbitMQ → worker → DB should be placed here._

(Refer to `docs/architecture-diagram.png`)



## Setup Instructions

### Option A: Using Docker Compose (Recommended)

**1. Start the Application**
```bash
docker-compose up --build -d
```
**2. Stop the Application**
```bash
docker-compose down
```
**3. View Logs**
```bash
docker-compose logs -f backend
docker-compose logs -f worker
```
**4. Access Services**
- Frontend: http://localhost
- Backend API: http://localhost:3000
- RabbitMQ Dashboard: http://localhost:15672 (guest/guest)

**5. Trigger a Background Task**
```bash
curl -X POST http://localhost:3000/api/tasks \\
  -H "Content-Type: application/json" \\
  -d '{"userId": "123", "action": "generate_report"}'
```

## Messaging Pattern Used

### Producer/Consumer Pattern
- Backend acts as the producer, sending tasks to a durable task_queue.

- Worker acts as the consumer, processing tasks in the background.

- Messages are durable and acknowledged after successful processing.

## Demo 
View running application and logs:

- Screenshots/logs included in /docs folder

- RabbitMQ UI displays message queues, consumers, and throughput

- Video: https://github.com/user-attachments/assets/aaaea6d9-df7b-4bda-9c1c-3250d0dada34

## Contributors

Fatma Alzahra Mohamed

Ikram Mtimet 

Ons Kharrat
