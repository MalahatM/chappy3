Chappy3 – Fullstack Chat Application

Description:
Chappy3 is a fullstack chat application built with React, TypeScript, and Express.
It allows users to register, log in, join public or private channels, and send both public and direct messages.
Guest users can view public channels but cannot send private messages or join private channels.


Features:
1.User registration and login with JWT authentication

2.Public and private chat channels

3.Direct messaging between registered users

4.Guest mode (read-only access)

5.Input validation using Zod

6.Data stored in AWS DynamoDB

7.Global state management with Zustand

8.Written entirely in TypeScript


Environment Variables:
I have a .env file in the project root and it filled with:

AWS_ACCESS_KEY_ID= My_access_key
AWS_SECRET_ACCESS_KEY=My_secret_key
AWS_REGION=eu-north-1
PORT=10000
JWT_SECRET=My_random_secret_key

Technologies Used:

Frontend(React,TypeScript,Vite,Zustand,React Router DOM,React Toastify)

Backend(Node.js / Express,AWS SDK (DynamoDB),JWT,Bcrypt,Zod)

Notes:

1.Guest users can only view public channels.

2.Registered users can access private channels and send direct messages.

3.Input validation is handled by Zod before saving data.

4.JWT tokens are verified for each protected route using middleware.


Author

Malahat Mortezavi
Frontend Developer