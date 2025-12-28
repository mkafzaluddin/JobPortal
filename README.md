Job-Portal Application:-

Role-based Job Portal application built with React (frontend) and Node.js (backend) using SQL Server. Supports Admin, Employer, and Employee roles. Deployed on Azure using Docker with separate Ubuntu VMs for frontend and backend, a Windows 11 admin VM, and a centralized log server for monitoring and security.



 Job Portal Application – Cloud Deployed (Azure)

 Project Overview:-

This project is a role-based Job Portal web application designed to connect employers and job seekers through a secure and scalable platform. The system supports three roles: Admin, Employer, and Employee, each with specific permissions and dashboards.

The application is fully deployed on Microsoft Azure using multiple virtual machines, Docker containers, and secure networking, following real-world cloud deployment practices.



 Project Objectives:-

 Build a real-world job portal with role-based access control
 Deploy frontend and backend on separate virtual machines
 Use Docker for containerized deployment
 Implement centralized log management
 Demonstrate cloud networking, security, and VM management



 User Roles & Features:-

 1) Admin

 Manage users (Employers & Employees)
 Monitor platform activity
 Maintain system integrity and security

 2) Employer

 Register and log in securely
 Create, update, and delete job postings
 View applications from employees

 3) Employee (Job Seeker)

 Register and log in securely
 Browse available job listings
 Apply for jobs and manage profile



 Technology Stack:-

 Frontend

 React (Vite)
 Nginx (for serving frontend)
 Docker

 Backend

 Node.js (Express)
 RESTful APIs
 JWT Authentication
 Docker

 Database

 SQL Server (Azure-hosted)

 Cloud & DevOps

 Microsoft Azure
 Azure Virtual Machines
 Docker & Docker Compose
 GitHub (Private Repository)
 SSH-based access



 Cloud Architecture (4 VM Setup):-

 VM 1 – Frontend Server (Ubuntu)

 Hosts React frontend using Nginx
 Runs inside Docker container
 Publicly accessible via HTTP (Port 80)

 VM 2 – Backend Server (Ubuntu)

 Hosts Node.js backend APIs
 Runs inside Docker container
 Communicates with SQL Server securely

 VM 3 – Windows 11 Admin VM

 Used for environment management
 Tools installed:

   Azure CLI (manage Azure resources)
   MobaXterm (SSH into Linux VMs)
 Used to start/stop VMs, monitor services, and manage deployments

 VM 4 – Centralized Log Server (Ubuntu)

 Acts as a log aggregation server
 Collects logs from frontend and backend using `rsyslog`
 Demonstrates centralized monitoring and security logging



 Security & Networking:-

 SSH key-based authentication
 Azure Network Security Groups (NSG)
 Separate VNets with VNet Peering
 Backend APIs protected and isolated
 Centralized logging for audit and monitoring



 Containerization:-

 Both frontend and backend are containerized using Docker
 Docker Compose used for multi-service deployment
 Enables easy scaling and portability



 Deployment Workflow:-

1. Code pushed to private GitHub repository
2. GitHub accessed securely via SSH keys
3. Docker images built on respective VMs
4. Containers deployed using Docker / Docker Compose
5. Services exposed via Azure public IPs



 Project Outcome:-

This project demonstrates:

 Full-stack web development
 Role-based access control
 Real-world cloud deployment
 Secure networking and VM management
 DevOps concepts like Docker and centralized logging

It closely simulates an industry-level cloud application deployment.



 Conclusion:-

The Job Portal Application successfully integrates frontend, backend, database, cloud infrastructure, and security into a single scalable system. By deploying the project across four Azure virtual machines, this project showcases practical knowledge of cloud computing, DevOps, and system administration, making it suitable for academic evaluation and real-world scenarios.
