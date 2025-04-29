-- Create replication user
CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD '1234';

-- Configure replication parameters
ALTER SYSTEM SET wal_level = replica;
ALTER SYSTEM SET max_wal_senders = 3;
ALTER SYSTEM SET hot_standby = on;


CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    photo_url TEXT NOT NULL,
    description TEXT NOT NULL,
    linkedin TEXT,
    github TEXT,
    instagram TEXT
);

INSERT INTO profiles (name, photo_url, description, linkedin, github, instagram)
VALUES 
('Ons Kharrat', 'file:///Users/ikram/Downloads/Female%20Avatar%20Icon.png', 'Ons Kharrat is a senior Software Engineering student pursuing her five-year undergraduate studies at the Mediterranean Institute of Technology (MedTech) in Tunis, Tunisia. She is a recipient of the prestigious "Full Excellence Scholarship," awarded to outstanding students demonstrating excellence in both academics and extracurricular activities.', 'https://linkedin.com', 'https://github.com', 'https://instagram.com'),
('Fatma Alzahra Mohamed', 'file:///Users/ikram/Downloads/Female%20Avatar%20Icon.png', 'I am a Senior Software Engineering student at South Mediterranean University and a scholarship awardee, passionate about leveraging technology to create meaningful impact. As a researcher, I’ve published a paper focused on compacting hate speech in the Tunisian dialect, contributing to advancements in AI and natural language processing in regional contexts.', 'https://linkedin.com', 'https://github.com', 'https://instagram.com'),
('Ikram Mtimet', 'file:///Users/ikram/Downloads/Female%20Avatar%20Icon.png', 'As a software engineering student at MedTech SMU, I am passionate about leveraging technology to solve real-world challenges. My academic journey has equipped me with expertise in web full-stack development, machine learning, and open-source contributions.', 'https://linkedin.com', 'https://github.com', 'https://instagram.com');

CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    profile_id INT REFERENCES profiles(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL
);