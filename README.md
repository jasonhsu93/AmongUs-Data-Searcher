# Among Us Database Design

Summary: 

This project involves developing a database for an online multiplayer game based on Among Us, focusing on player roles, game events, and interactions such as tasks, kills, voting, and emergency meetings. The database models critical aspects like game sessions, player behavior, and event tracking, enabling users to analyze gameplay data and balance game mechanics.

Timeline: 

Week 1 (Oct 31 - Nov 6): Initial Setup and Milestone 4 Preparation
SQL Script Development:

Begin setting up the database schema, relations, and constraints based on the ER diagram.
Implement basic CRUD operations to verify the database structure.
Test initial insertions and updates for Milestone 4.

GUI Skeleton:

Build a simple UI layout in.
Set up core navigation and placeholders for different query categories (e.g., Insert, Update, Delete, Selection).
Integrate an SQL input field for each query type to connect the GUI with database operations.
Week 2 (Nov 7 - Nov 13): Implementing Core Query Operations
CRUD Queries (Insert, Update, Delete):

Finalize and test the Insert, Update, and Delete functionalities in the database with user input.
Build error handling and ensure appropriate notifications for users (e.g., for invalid input or successful completion).
Ensure database integrity, including cascade-on-delete functionality and foreign key checks for Insert.
Selection and Projection Queries:

Implement selection and projection queries, allowing user-defined inputs for more flexible query structures.
Set up validation to prevent SQL injection by parsing user input.
Week 3 (Nov 14 - Nov 20): Advanced Queries and Testing
Join, Aggregation, and Nested Aggregation Queries:

Implement the Join, Aggregation with GROUP BY, Aggregation with HAVING, and Nested Aggregation queries.
Include user input controls to select variables for each query, testing them thoroughly to ensure they work with GUI.
Division Query Implementation:

Implement and test the Division query with dynamic user input.
Build error handling and user feedback for each query type, ensuring clear notifications for query failures.
Week 4 (Nov 21 - Nov 30): Finalization, Testing, and Demo Preparation
Comprehensive Testing and GUI Polish:

Perform thorough testing across all queries to verify proper data handling, UI responsiveness, and error reporting.
Refine the GUI for user-friendliness, adding clear labels, dropdowns, and help text as needed.
Complete sanitization for all user inputs to prevent injection vulnerabilities.
Milestone 5 Demo Preparation:

Milestone 6 Preparation:

Tasks:

GUI Interface:
- Come up with plan for GUI/skeleton
  - Decide what languages and frameworks we would like to use: All (11/11)
  - Figure out how to connect the database to the front end: Jason (11/15)
  - Create functional components for database querying / interaction: Jason (11/20)
  - Figure out how to make buttons to select each entity and relationship: Christopher(11/23)
  - Make it look pretty and test it thoroughly All (11/25)

Database:
- Combine some relationship tables with entities, see if anything needs to be denormalized: Christopher (10/30)   
- Design and implement queries: Troy (11/15)                                                                
- Write part of SQL script to make tables: Christopher (11/20)
- Write part of SQL script to insert data: Troy (11/25)

Presentation (test before milestone 4 hand in):
- Presentation demo, make sure files work (all 3 of us)


./remote-start.sh to start server
sqlplus ora_cwl@stu for server
password is a**sid here**