# 🍌 Real-Time Banana Clicker Dashboard

A real-time dashboard web application where **Admins** manage users and monitor activity, while **Players** engage by clicking a “Banana” button to increase their click count and compete for the top rank.

---

## 🚀 Tech Stack

- **Frontend:** React, React Router, Socket.IO Client, fetch, JWT Authentication
- **Backend:** Node.js, Express.js, MongoDB, Socket.IO, Bcrypt
- **Authentication:** JWT (JSON Web Token)
- **Database:** MongoDB (Mongoose)

---

## 👥 User Roles

### 🧑‍💻 Admin
- Manage all players (Create, Edit, Delete)
- Block/Unblock players from logging in
- View real-time list of active players with their banana click counts

### 🎮 Player
- Click the **“Banana”** button to increase their banana count
- View their own real-time banana count
- Access **Rank Page** to see live rankings of all players sorted by banana count

---

## 🧩 Features

### 🔐 Authentication
- Secure login and registration using **JWT**
- Role-based access for **Admin** and **Player**

### 📊 Admin Dashboard
- Manage users via REST API
- Real-time updates of user activity and banana counts
- Block/Unblock users

### 🍌 Player Dashboard
- Click “Banana” to increase count (tracked in real-time)
- View personal banana count live
- View **live leaderboard** on Rank Page (auto-sorted by highest clicks)

### 🌐 Real-Time Integration
- Powered by **Socket.IO**
- Real-time synchronization of:
  - Player clicks
  - Rank changes
  - Active status

---

## 🔧 Installation & Setup

### 🖥 Backend (Node.js + Express)

```bash
git clone https://github.com/your-username/banana-dashboard
cd banana-clicker/server
npm install
npm run dev
```

- Create a `.env` file in the `server` directory with:
  ```
  MONGO_URI=your_mongodb_connection_string
  JWT_SECRET=your_jwt_secret
  ```

### 🌐 Frontend (React)

```bash
cd banana-clicker/client
npm install
npm run dev
```

- Create a `.env` file in the `client` directory with:
  ```
  VITE_API_URL=http://localhost:5000
  ```

---

## 📁 Folder Structure

```
banana-dashboard/
├── client/           # React frontend
│   ├── pages/
│   ├── components/
│   └── ...
├── server/           # Express backend
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   └── ...
```

---

## 📡 Socket.IO Events

### Player Events:
- `player:join` → When a player logs in
- `banana:click` → Emitted on banana click
- `update:ranking` → Broadcasts updated rankings

### Admin Events:
- `admin:onlineUsers` → Sends list of online players
- `admin:receiveCounts` → Live banana counts for all users

---

## 📌 Requirements

- Node.js ≥ 14.x
- MongoDB Atlas or Local Instance
- Modern Browser

---

## 📬 Contact

For queries or revisions, feel free to reach out!  
**Email:** divansupandat@gmail.com  
**LinkedIn:** [Your LinkedIn Profile](https://www.linkedin.com/in/divansu-attri-580538304/)

