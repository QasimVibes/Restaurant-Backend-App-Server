# Restaurant Backend App Server

## Project Description

This project outlines the development and implementation of a comprehensive food delivery application designed to streamline the ordering process for users. The application includes secure user authentication, restaurant management, menu item listings, and order tracking functionalities. Additionally, it incorporates delivery management to ensure timely and efficient service.

## Functional Requirements

### User Authentication & Management

- **Role-based Login**: A secure login mechanism that allows users to log in using either their email/username and password.
- **Signup**: Allows users to create new accounts by providing a name and a valid email address.
- **Reset Password**: Enables users to change their password.
- **Forgot Password**: Provides users with the ability to request a password reset via email.
- **User Management**: Stores user details such as name, email, password, phone number, and address.

### Restaurant Management

- **Restaurants**: Stores restaurant details such as name, location, menu, and operating hours.
- **Menu Items**: Stores details of menu items including name, description, price, and category.

### Order Management

- **Orders**: Tracks orders including user details, restaurant, ordered items, total price, and status (e.g., pending, in-progress, delivered).
- **Delivery Management**: Manages delivery information such as the assigned delivery person, status, and delivery time.

### Cart Management

- **Cart**: Provides CRUD operations for managing cart items.

## Tech Stack

- **TypeScript (TS)**
- **PostgreSQL (with Neon)**
- **TypeGraphQL Prisma**
- **GraphQL Yoga**

## API Authentication

For making API calls, you need to set the correct token in the request headers. Each role and API requires a separate token, which is checked in the code. If the token is invalid, the API request will fail.

### Example Header

```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtMWhjcGZmZTAwMDBzbHloazlnb2g3cjgiLCJyb2xlIjoiQ1VTVE9NRVIiLCJpYXQiOjE3MjcyMzc3MDQsImV4cCI6MTcyNzg0MjUwNH0._LTQyZ1aQWgS23-7v-ZvPqJIErScMJflkZSrfdAe9i4"
}
```

- **Note**: Ensure you replace the Bearer token with the appropriate token for each role and API call. Different API endpoints will require specific roles (e.g., Customer, Admin) for access.

## Setup and Installation

#### To set up the project locally, follow these steps:

### 1. Clone the repository:

```bash
git clone https://github.com/techlosetbootcamp/Restaurant-Backend-App-Server-Muhammad-Qasim.git

cd Restaurant-Backend-App-Server-Muhammad-Qasim-master
```

### 2. Install dependencies:

```bash
npm install
```

### 3. Set up environment variables:

```bash
DATABASE_URL=*
JWT_SECRET=*
SMTP_USER=*
SMTP_PASS=*
```

### 4. Database setup:

#### Run the migrations to set up the database schema:

```bash
npx prisma migrate dev
```

### 5. Start the development server:

```bash
npm start
```

### 6. GraphQL Playground:

- You can access the GraphQL playground at `http://localhost:4000/graphql` to interact with the API and test queries and mutations.

## Contribution Guidelines

We welcome contributions to this project! Here's how you can help:

- Fork the repository.
- Create a feature branch (`git checkout -b feature-branch-name`).
- Commit your changes (`git commit -m 'Add some feature'`).
- Push to the branch (`git push origin feature-branch-name`).
- Open a Pull Request.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.
