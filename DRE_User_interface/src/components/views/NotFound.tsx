export function NotFound() {
  return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl">404!</h1>
        <h3>
          We didn't find this page. Go back to{" "}
          <a href="/" className="text-blue-500">
            home page
          </a>
        </h3>
      </div>
    </div>
  );
}
