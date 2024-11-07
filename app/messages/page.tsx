import { FaTools } from "react-icons/fa";

function Messages() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen">
      <FaTools className="text-6xl text-yellow-500 mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">
        We&rsquo;re Building Something Great!
      </h2>
      <p className="text-center text-gray-500">
        This page is currently in development. We can&rsquo;t wait to share it
        with you! Please check back soon for updates.
      </p>
    </section>
  );
}

export default Messages;
