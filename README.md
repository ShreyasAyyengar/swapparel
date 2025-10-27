# Swapparel Repository

This is the monorepo for Swapparel. A monorepo is a single repository that contains multiple projects and packages.
This allows for easier collaboration and sharing of code between projects, with only one directory to navigate.

## Getting Started:

To ensure the entire setup works properly, please follow these steps:

1. Clone this repository by running `git clone https://github.com/shreyasayyengar/swapparel.git`.
2. Open the `swapparel` directory in your preferred code editor.
3. Navigate to the root directory of the repository, and create a `.env` file.
4. Copy the [posted credentials](https://discord.com/channels/1429645080716775457/1431808580847407207/1431809307045003417) into the `.env` file.
5. If correct, the project structure should look like this:

```aiignore
swapparel/
├── apps/
│   ├── api/
│   └── web/
├── packages/
│   └── contracts/
│   └── ...
│...
├── .env (<- the newly created .env file with the posted credentials)
├── .gitignore
├── README.md
└── turbo.json
```

5. If you do not already have [`Bun`](https://bun.sh/) and [`Node.js`](https://nodejs.org/), please install them. (Click on links)
6. Run the following commands to install dependencies. **Ensure you are in the `swapparel` directory**:
7. ```sh
   bun install
   cd apps/api && bun install
   cd ../web && bun install
   cd ../packages/contracts && bun install
   cd ../packages/ui && bun install
   ```

If you receive errors like `the term 'bun' was not recognized`. Restart your editor app and/or your machine and try again.

8. To start the development servers, run the following command, in the base, `swapparel` directory:
9. ```sh
   bun dev
   ```
10. This will start the development servers for both the `web` and `api` applications. You can access them
    at [http://localhost:3000](http://localhost:3000) and
    [http://localhost:3001](http://localhost:3001) respectively (but don't expect to see anything at `3001`).

## What's inside?

The monorepo mainly concerns 3 directories/distinct parts:

- `web`: The frontend application built with [Next.js](https://nextjs.org/).
- `api`: The backend application built with [Elysia](https://elysiajs.com/).
- `packages`: Contains shared packages and utilities used by both `web` and `api`.

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Web (frontend)

The `web` directory is a [Next.js](https://nextjs.org/)-built application. This component is responsible for rendering the user interface,
web pages, layouts, navigation, and handling client-side logic. It uses [React](https://reactjs.org/) for building UI components
and [Tailwind CSS](https://tailwindcss.com/) for styling them. The `web` application communicates with the `api` application
via [RESTful APIs](https://restfulapi.net/) (this is **not** a library, it's a technique for designing APIs).

Additionally, some libraries and utilities used by the `web` application include:

- [TanStack (React) Query](https://tanstack.com/query/latest): For managing data fetching and caching.
- [TanStack Form](https://tanstack.com/form/latest): For handling form validation and submission.
- [TanStack Table](https://tanstack.com/table/latest): For displaying and interacting with tabular data.
- [ShadCN UI](https://ui.shadcn.com/): For building UI components and layouts.

### API (backend)

The `api` directory contains the backend application built with [Elysia](https://elysiajs.com/). Think of the API as the 'brain' of the
application,
responsible for handling server-side logic and API endpoints. The API itself is just an HTTP server that responds to requests from the `web`
application,
but there are many steps for that response to happen, such as authentication, validation, and business logic. See the Excalidraw diagram to make
more sense of the flow for this.

When a user navigates to a page:

1. the `web` acknowledges the navigation, and understands it needs more data from the backend to deliver the content of the website (like maybe,
   clothing listings)
2. the `web` sends a request to the `api` for the required data (via REST)
4. the `api`, through Elysia, receives the request, and processes it, checking for authentication, validation, etc.
5. goes through multiple steps to find where the data needs to be obtained from (like maybe, a database)
6. returns the requested data to the `web` application

### Packages

The `packages` directory contains shared packages and utilities used by both `web` and `api`. These packages help to keep code DRY (Don't Repeat
Yourself) and promote code reuse.

- [Zod](https://zod.dev/): For data validation and type safety.
- [oRPC](https://orpc.unnoq.com/): I'm too lazy to describe this cuz it's a bit complicated, but it's basically a library for building the
  business logic and API contracts for the `api` application. It provides a way to define and enforce exactly what an API endpoint will input,
  output,
  and the errors that may occur which helps with consistency and makes it easier to understand and use the API.

### Code Formatting & Linting

To keep code quality and formatting consistent, we use [Biome](https://biomejs.dev) for code linting and formatting.
This generally means that if you see yellow or red underlines in your code editor, you are likely violating
a linting rule or formatting guideline. Please fix these issues before committing your code.

If you're using VSCode, install the [Biome extension](https://biomejs.dev/reference/vscode) so you can see these errors and receive automatic
fixes.
