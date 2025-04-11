document.addEventListener('DOMContentLoaded', () => {
    const profilesContainer = document.querySelector('main');

    // Fetch and display all profiles
    const fetchProfiles = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/profiles');
            const profilesData = await response.json();
            profilesContainer.innerHTML = ''; 

            profilesData.forEach(profile => {
                const profileElement = document.createElement('div');
                profileElement.className = 'profile';
                profileElement.dataset.id = profile.id; 
                profileElement.innerHTML = `
                    <div class="photo-container">
                        <img src="./images/Female_Avatar.png" class="profile-photo">
                        <div class="edit-photo-overlay">
                            <button class="edit-photo">Edit Photo</button>
                        </div>
                    </div>
                    <div class="description">
                        <h2>${profile.name}</h2>
                        <p contenteditable="true">${profile.description}</p>
                        <div class="links">
                    <a href="https://linkedin.com" class="link-icon" data-type="linkedin" target="_blank">
                        <i class="fa fa-linkedin-square" style="font-size:20px"></i> 
                    </a>
                    <a href="https://github.com" class="link-icon" data-type="github" target="_blank">
                        <i style="font-size:24px" class="fa">&#xf09b;</i> 
                    </a>
                    <a href="https://instagram.com" class="link-icon" data-type="instagram" target="_blank">
                        <i class="fa fa-instagram" style="font-size:20px"></i> 
                    </a>
                </div>
                        <button class="add-section-button">Add Section</button>
                        <div class="sections-container">
                            <!-- Sections will be dynamically added here -->
                        </div>
                    </div>
                `;
                profilesContainer.appendChild(profileElement);

                const editPhotoButton = profileElement.querySelector('.edit-photo');
                const profilePhoto = profileElement.querySelector('.profile-photo');

                editPhotoButton.addEventListener('click', async () => {
                    const newPhotoUrl = prompt('Enter the new photo URL:');
                    if (newPhotoUrl) {
                        try {
                            const response = await fetch(`http://localhost:3000/api/profiles/${profile.id}/photo`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ photoUrl: newPhotoUrl }),
                            });
                            const data = await response.json();
                            profilePhoto.src = data.photo_url; 
                        } catch (err) {
                            console.error('Error updating photo:', err);
                        }
                    }
                });

                const addSectionButton = profileElement.querySelector('.add-section-button');
                const sectionsContainer = profileElement.querySelector('.sections-container');

                addSectionButton.addEventListener('click', async () => {
                    const type = prompt('Enter the section type (e.g., Experience, Education):');
                    const title = prompt('Enter the section title:');
                    const description = prompt('Enter the section description:');

                    if (type && title && description) {
                        try {
                            const response = await fetch(`http://localhost:3000/api/profiles/${profile.id}/sections`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ type, title, description }),
                            });
                            const newSection = await response.json();
                            const sectionElement = document.createElement('div');
                            sectionElement.className = 'section';
                            sectionElement.innerHTML = `
                                <h3>${newSection.title}</h3>
                                <p><strong>${newSection.type}</strong>: ${newSection.description}</p>
                            `;
                            sectionsContainer.appendChild(sectionElement);
                        } catch (err) {
                            console.error('Error adding section:', err);
                        }
                    }
                });
            });
        } catch (err) {
            console.error('Error fetching profiles:', err);
        }
    };

    fetchProfiles();
});