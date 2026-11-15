# TaskFlow – Task Management Web Application

TaskFlow is a responsive task management web application developed using **HTML5, CSS3 and Vanilla JavaScript**. It allows users to create, manage, search, sort, filter and track their daily tasks through an intuitive dashboard.

The application uses **Browser Local Storage** to retain task data even after refreshing the browser.

This project is developed as the Minor Project for the **InternsElite September 2026 Batch – Full Stack Web Development / MERN Stack Training Program**.

## 1. Features

### Task Management
- Create, view, edit and delete tasks.
- Confirm before permanently deleting a task.
- Store task title, description, priority, creation date, due date and completion status.
- Mark tasks as completed or pending.

### Dashboard and Task Organization
- Display total, pending, completed and overdue tasks.
- Display task completion progress.
- Search tasks by title or description.
- Filter tasks by completion status and priority.
- Sort tasks by creation date, due date, priority or title.
- Display visual indicators for task priorities and overdue deadlines.

### Validation and Data Storage
- Validate required fields and invalid inputs.
- Display appropriate error messages.
- Provide empty states and status notifications.
- Store tasks using browser Local Storage.
- Validate and sanitize stored task records when loading.
- Handle corrupted stored data where possible.

### User Interface
- Clean and consistent dashboard design.
- Responsive layout for desktop, tablet and mobile devices.
- Interactive task management interface.
- User-friendly forms and navigation.
- Visual indicators for task status and priority.

## 2. Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Styling and responsive design |
| JavaScript (ES6+) | Application functionality |
| Local Storage | Persistent browser data storage |
| Git & GitHub | Version control and source code hosting |
| GitHub Pages | Application deployment |

No backend, database, paid API or build process is required for the current version.

## 3. Project Structure

```text
TaskFlow_Minor_Project/
├── source_code/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── assets/
│       └── favicon.svg
├── screenshots/
│   ├── dashboard.png
│   ├── task_form.png
│   ├── task_creation_mobile.png
│   ├── task_list.png
│   ├── filters.png
│   └── mobile_view.png
├── Project_Report.pdf
├── README.md
├── TESTING.md
└── GitHub_Repository_Link.txt
```

- **index.html:** Main application structure and interface.
- **style.css:** Styling, layouts and responsive design.
- **script.js:** Task CRUD, Local Storage, validation, search, filtering and sorting.
- **TESTING.md:** Test cases with expected and actual results.

## 4. Installation and Setup

Follow these steps to run TaskFlow locally.

1. Download or clone the project repository.
2. Extract the project files if downloaded as a ZIP.
3. Open the TaskFlow project folder.
4. Locate `index.html`.
5. Open `index.html` in a modern web browser.

The application will start directly in the browser.

**No additional installation is required.**

There is no need for:
- Node.js installation.
- npm installation.
- Database configuration.
- Backend server setup.

The application uses browser-based technologies for its core functionality.

## 5. Data Storage – Local Storage

TaskFlow uses the browser's Local Storage API to retain task information.

The application stores task data under the following key:

`taskflow.tasks.v1`

### How it works

1. When a user creates a task, its information is saved in Local Storage.
2. When a task is edited, the stored information is updated.
3. When a task is deleted, it is removed from Local Storage.
4. When a task is marked completed or pending, its status is updated.
5. When the application is reopened or refreshed, previously stored tasks are loaded.

The application also includes stored-data validation and recovery handling.

**Note:** Local Storage data belongs to the current browser and device profile. It is not automatically synchronized across different devices or browsers. Clearing browser site data may remove saved tasks.

## 6. Application Testing

Testing is important to verify that all application features work correctly.

The project includes a separate `TESTING.md` file containing test scenarios.

The following functionalities should be tested:

- Task creation.
- Task editing.
- Task deletion.
- Delete confirmation.
- Task completion and pending status.
- Search functionality.
- Filtering by status.
- Filtering by priority.
- Sorting functionality.
- Overdue task detection.
- Dashboard statistics.
- Local Storage persistence.
- Input validation.
- Empty states.
- Responsive interface.
- Error handling and storage recovery.

Actual results and Pass/Fail statuses should be recorded after executing each test case.

## 7. Deployment

TaskFlow is a static web application deployed on Vercel.

### Vercel Deployment

1. Push the project to a public GitHub repository.
2. Sign in to Vercel and choose **Add New → Project**, then import the repository.
3. Set **Root Directory** to `source_code` and **Framework Preset** to `Other`.
4. Leave the build settings empty and click **Deploy**.
5. Open the generated URL and test the deployed application.

### Live Application

**Live Demo URL:** https://taskflow-task-manager-sourcecode.vercel.app/


## 8. GitHub Repository

The complete source code is available in a public GitHub repository.

**GitHub Repository URL:** https://github.com/surajxpanwar-rgb/taskflow-task-manager

The repository contains the complete source code and project documentation.


## 9. Known Limitations

- The application uses browser Local Storage instead of a remote database.
- Task information is stored locally in the current browser.
- There is no user authentication or cloud synchronization.
- Data is not automatically shared between devices.
- Clearing browser site data may remove saved tasks.

These limitations are consistent with the frontend-focused scope of this Minor Project.

## 10. Future Enhancements

Possible future improvements include:

- User authentication.
- Cloud-based task synchronization.
- Team collaboration.
- Task reminders and notifications.
- Calendar integration.
- Advanced productivity analytics.
- Export and import functionality.

These are potential enhancements and are not claimed as implemented features.

## 11. Project Objective

The primary objective of TaskFlow is to demonstrate practical frontend development skills through the implementation of a functional task management application.

The project demonstrates:

- HTML5 and CSS3 development.
- JavaScript programming.
- CRUD operations.
- DOM manipulation.
- Form validation.
- Search, filtering and sorting.
- Browser Local Storage.
- Responsive web design.
- Git and GitHub.
- Application testing and documentation.

---

**Project Title:** TaskFlow – Task Management Web Application

**Program:** Full Stack Web Development / MERN Stack Training Program

**Batch:** September 2026

**Organization:** InternsElite