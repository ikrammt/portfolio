## Project Description
This project is a **three-tier web application** designed to demonstrate proper layer separation and container networking using Docker. The application consists of three distinct layers:
1. **Frontend**: A static website built with HTML, CSS, and JavaScript, served by Nginx.
2. **Backend**: A Node.js/Express server that handles API requests and communicates with the database.
3. **Database**: A PostgreSQL database that stores profile data, including names, descriptions, and social media links.

The application allows users to:
- View profiles with photos, descriptions, and social media links.
- Add new sections (e.g., Experience, Education) to profiles.
- Update profile photos dynamically.

The project is containerized using Docker, with each layer running in its own container. The containers communicate via a custom Docker network, ensuring seamless data flow between the frontend, backend, and database.

---
## Setup Instructions

### 1. Build Docker Images
Navigate to the root of the project and build the Docker images:

```bash
docker build -t pf_db .
docker build -t pf-backend .
docker build -t pf-frontend .
```

### 2. Create a Custom Docker Network
Create a custom Docker network for the containers to communicate:

```bash
docker network create pf-network
```

### 3. Run the Containers
Run the containers and attach them to the custom network:

```bash
docker run -d --name pf-db --network pf-network -p 5432:5432 pf_db
docker run -d --name pf-backend --network pf-network -p 3000:3000 pf-backend
docker run -d --name pf-frontend --network pf-network -p 80:80 pf-frontend
```

---
## Demo 
