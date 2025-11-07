MomSchedulerWebsite 

This is a **scheduling website** I developed for my mom — but it can be used by anyone.
The project is hosted on Vercel:
👉 [Access here](https://mom-scheduler-website.vercel.app/) *(in Portuguese)*

---

## Technologies Used
- **Node.js (CommonJS)**
- **HTML5**
- **CSS3**
- **PostgreSQL** (database hosted with [Neon](https://neon.tech))

---

## Features
✔️ User registration and login
✔️ Password recovery (via email with [Resend](https://resend.com))
✔️ Task management (add, view, and organize)
✔️ Secure logout
✔️ Session for loged accounts

---

##  Objective
Create a simple, A practical and accessible way to organize tasks, allowing anyone to schedule their appointments intuitively.

---


##  How to run the project locally
```bash
# Clone the repository
git clone https://github.com/Lucca2013/mom-scheduler-website.git

# Enter the folder
cd mom-scheduler-website

# Install the dependencies
npm install

# Configure the environment variables (.env) to connect to PostgreSQL and Resend

# Run the project
npm run dev
