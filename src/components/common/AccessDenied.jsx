const AccessDenied = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-full bg-gray-100 p-8 text-center min-h-screen">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-16 w-16 text-red-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
    <h2 className="mt-4 text-2xl font-bold text-gray-800">Access Denied</h2>
    <p className="mt-2 text-gray-600">{message}</p>
  </div>
);

export default AccessDenied;