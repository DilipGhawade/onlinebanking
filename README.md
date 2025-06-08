# Online Banking Application

A modern, responsive web application for online banking services. This application provides a comprehensive banking experience, allowing users to manage accounts, view transactions, track investments, and access various banking services through an intuitive interface.

## Key Features

- **User Authentication**: Secure login system with role-based access control
- **Dashboard Overview**: Quick view of account balances, recent transactions, and financial status
- **Account Management**: View and manage multiple bank accounts and credit cards
- **Transaction History**: Detailed view of all transactions with filtering capabilities
- **Investment Portfolio**: Track and manage investment accounts and performance
- **Credit Card Management**: View credit card details, statements, and payment options
- **Loan Services**: Access loan information, payment schedules, and new loan applications
- **Responsive Design**: Fully responsive interface that works on desktop, tablet, and mobile devices

## Technologies Used

- **Frontend**: React.js, React Router, Redux
- **UI Framework**: Bootstrap 5 with custom styling
- **State Management**: Redux with Redux Toolkit
- **Authentication**: JWT-based authentication
- **Icons**: React Bootstrap Icons
- **Date Handling**: Chrono.js
- **Build Tools**: Create React App

## Project Structure

```
src/
├── app/            # App configuration and store setup
├── components/     # React components
│   ├── Dashboard.js      # Main dashboard layout
│   ├── DashboardPage.js  # Homepage content
│   ├── Login.js          # Authentication page
│   ├── AccountsPage.js   # Account management
│   ├── TransactionsPage.js # Transaction history
│   └── ...               # Other component pages
├── features/       # Redux features and slices
│   └── auth/       # Authentication state management
├── routes/         # Application routing
├── styles/         # CSS and styling files
├── App.js          # Main application component
└── index.js        # Application entry point
```

---

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
