# MERN Stack - Website Movie Theater Ticket System 2023

## Run Locally

### 1. Clone repo

```
$ git clone https://github.com/manquang/booking-ticket.git
$ cd mern-booking-movie
```

### 2. Create .env File

- create params into .env file

### 3. Setup MongoDB and Stripe

- OR Atlas Cloud MongoDB
  - Create database at [https://cloud.mongodb.com](https://cloud.mongodb.com)
  - In .env file update DB_URI=mongodb+srv://your-db-connection
  - In .env file update CLIENT_ID, CLIENT_SECRET
  - In .env file update EMAIL=your-token-nodemail
  - In .env file update EMAILPASS=your-pass-email-application

### 4. Run Back End

```
$ cd back-end
$ npm install
$ npm start
```

### 5. Run Front End

```
$ cd front-end
$ npm install
$ npm run start
```

### 6. Access browser

- Run this on browser: [http:localhost:3000](http://localhost:3000)
