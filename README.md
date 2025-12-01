## Phase IV READ ME

### 1\. Application Setup Instructions

The application is a full-stack app which needs configuration for the database, backend API, and frontend client.

#### 1.1. Database Configuration (MySQL)

1.  Modify the `db.py` file in the root directory to contain the correct connection parameters (host, user, password, and database name) for your MySQL server instance.
2.  sure that the entire database structure, including all **tables, views (1-5)**, and **stored procedures (6-17, plus `remove_staff`)** outlined in the project specification have been loaded into the MySQL database prior to running the application.

#### 1.2. Backend Setup (Python/Flask)

1.  Install all Python Dependencies
    ```bash
    pip install -r requirements.txt
    ```

#### 1.3. Frontend Setup (React/Node.js)

1.  Go to the frontend folder
    ```bash
    cd frontend
    ```
2.  Install node.js packages
    ```bash
    npm install
    ```

-----

### 2\. Application Run Instructions

Open a new terminal concurrently with the old one.

#### 2.1. Run Backend API

From the project root directory:

```bash
python app.py
```

The API server will be available at `http://localhost:5001`.

#### 2.2. Run Frontend Client

From the `frontend` directory:

```bash
npm run dev
```

Click the link in the terminal to launch the application.

-----

### 3\. Technology Overview

This project implements a three-tier architecture using industry-standard technologies.

  * **MySQL** is used as the relational database management system that we created in the Phase 3 with the stored procedures and views.


* **Python** with the **Flask** framework provides the REST API. This layer handles user requests, validates input, calls the appropriate stored procedures in MySQL, and manages data type conversions We use mysql connector to connect to our locally running database.

  * We use React for the frontend for the page GUI. It manages application state, renders views, and communicates with the Flask API requests to perform the DB operations.


-----

### 4\. Team Contribution Distribution

The project was divided based on core architectural components:

| Team Member | Task |
| :--- | :--- |
| Henry Tang | Backend API Setup and DB Connection |
| Ava Sun| Frontend Client Setup |
| Tanishk Deo | Testing and API constraints |
