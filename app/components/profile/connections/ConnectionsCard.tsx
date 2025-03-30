"use client";

import { useState } from "react";
import { FaUsers, FaInbox, FaPaperPlane } from "react-icons/fa";
import Image from "next/image";
import {
  AiOutlineUserAdd,
  AiOutlineCheck,
  AiOutlineClockCircle,
} from "react-icons/ai";
import { IoIosContacts } from "react-icons/io";
import defaultPfp from "../../../../public/images/icons/default_pfp.jpeg";
import { toast } from "react-toastify";

interface User {
  id: string;
  name: string | null; 
  email: string | null; 
  role?: string;
  userRole?: string | null;
  image?: string | null;
  headline?: string | null;
  connectionStatus?: "PENDING" | "ACCEPTED" | "NONE" | "REJECTED";
}

interface Connection {
  id: string;
  requesterId: string;
  receiverId: string;
  status: "PENDING" | "ACCEPTED" | "NONE" | "REJECTED";
  createdAt: Date | string;
  updatedAt: Date | string;
  requester: User;
  receiver: User;
}

interface ConnectionsCardProps {
  users: User[];
  connections: User[]; 
  connectionsReceived: Connection[];
  connectionsSent: Connection[];
  sendConnectionRequest: (userId: string) => Promise<boolean>;
  acceptConnectionRequest: (connectionId: string) => Promise<boolean>;
  rejectConnectionRequest: (connectionId: string) => Promise<boolean>;
}

const ConnectionsCard = ({
  connections,
  users,
  connectionsSent,
  connectionsReceived,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
}: ConnectionsCardProps) => {
  const [activeTab, setActiveTab] = useState("users");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSendConnectionRequest = async (userId: string) => {
    try {
      await sendConnectionRequest(userId);
      toast.success("Connection request sent successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error sending connection request"
      );
    }
  };

  const handleAcceptConnection = async (connectionId: string) => {
    try {
      await acceptConnectionRequest(connectionId);
      toast.success("Connection accepted successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error accepting connection"
      );
    }
  };

  const handleRejectConnection = async (connectionId: string) => {
    try {
      await rejectConnectionRequest(connectionId);
      toast.success("Connection rejected successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error rejecting connection"
      );
    }
  };

  const formatUserRole = (role: string | null | undefined) => {
    if (role) {
      return role.split(" ").map((word, index) => (
        <span key={index} className="block text-sm text-zinc-300">
          {word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()}
        </span>
      ));
    }
    return null;
  };

  return (
    <div className="mt-4 md:flex bg-zinc-900 rounded-lg overflow-hidden">
      <div className="md:w-1/4 w-full border-gray-700">
        <ul className="flex flex-col space-y-4 p-4">
          <li>
            <button
              onClick={() => handleTabChange("users")}
              className={`inline-flex items-center px-4 py-3 text-white rounded-lg w-full ${
                activeTab === "users"
                  ? "bg-zinc-700 shadow-lg"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
              } transition-colors duration-200 ease-in-out`}
            >
              <FaUsers className="w-4 h-4 me-2" />
              Users
            </button>
          </li>
          <li>
            <button
              onClick={() => handleTabChange("connections")}
              className={`inline-flex items-center px-4 py-3 text-white rounded-lg w-full ${
                activeTab === "connections"
                  ? "bg-zinc-700 shadow-lg"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
              } transition-colors duration-200 ease-in-out`}
            >
              <IoIosContacts className="w-4 h-4 me-2" />
              Connections
            </button>
          </li>
          <li>
            <button
              onClick={() => handleTabChange("received")}
              className={`inline-flex items-center px-4 py-3 text-white rounded-lg w-full ${
                activeTab === "received"
                  ? "bg-zinc-700 shadow-lg"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
              } transition-colors duration-200 ease-in-out`}
            >
              <FaInbox className="w-4 h-4 me-2" />
              Received
            </button>
          </li>
          <li>
            <button
              onClick={() => handleTabChange("sent")}
              className={`inline-flex items-center px-4 py-3 text-white rounded-lg w-full ${
                activeTab === "sent"
                  ? "bg-zinc-700 shadow-lg"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
              } transition-colors duration-200 ease-in-out`}
            >
              <FaPaperPlane className="w-4 h-4 me-2" />
              Sent
            </button>
          </li>
        </ul>
      </div>
      <div className="md:w-3/4 w-full p-4 text-white flex-grow">
        {activeTab === "users" && (
          <div className="rounded-lg h-full">
            {users && users.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="bg-zinc-800 p-4 rounded-lg relative"
                  >
                    <Image
                      src={user.image || defaultPfp}
                      alt={user.name || "User"}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full mb-2"
                    />
                    <h4 className="text-xl font-bold">
                      {user.name || "Unknown"}
                    </h4>
                    <p>{user.email || "No email"}</p>
                    {user.role && <p>{user.role}</p>}
                    {user.userRole && (
                      <div className="mt-2">
                        {formatUserRole(user.userRole)}
                      </div>
                    )}
                    {user.headline &&
                      user.userRole &&
                      user.userRole.includes("CANDIDATE") && (
                        <p className="mt-2 text-sm text-zinc-400">
                          {user.headline}
                        </p>
                      )}
                    <div className="absolute top-4 right-4 p-2 rounded-lg">
                      <button
                        onClick={() => handleSendConnectionRequest(user.id)}
                        className={`p-2 rounded-lg text-white ${
                          user.connectionStatus === "PENDING"
                            ? "bg-yellow-600 hover:bg-yellow-500"
                            : user.connectionStatus === "ACCEPTED"
                            ? "bg-green-600 hover:bg-green-500"
                            : user.connectionStatus === "NONE"
                            ? "bg-zinc-600 hover:bg-zinc-500"
                            : ""
                        }`}
                        disabled={
                          user.connectionStatus === "ACCEPTED" ||
                          user.connectionStatus === "PENDING"
                        }
                      >
                        {user.connectionStatus === "PENDING" ? (
                          <AiOutlineClockCircle
                            size={20}
                            className="animate-spin"
                          />
                        ) : user.connectionStatus === "ACCEPTED" ? (
                          <IoIosContacts size={20} />
                        ) : user.connectionStatus === "NONE" ? (
                          <AiOutlineUserAdd size={20} />
                        ) : null}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-zinc-400">No users found</p>
            )}
          </div>
        )}
        {activeTab === "connections" && (
          <div className="rounded-lg h-full">
            {connections && connections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {connections.map((connection) => (
                  <div
                    key={connection.id}
                    className="bg-zinc-800 p-4 rounded-lg relative"
                  >
                    <Image
                      src={connection.image || defaultPfp}
                      alt={connection.name || "User"}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full mb-2"
                    />
                    <h4 className="text-xl font-bold">
                      {connection.name || "Unknown"}
                    </h4>
                    <p>{connection.email || "No email"}</p>
                    {connection.role && <p>{connection.role}</p>}
                    {connection.userRole && (
                      <div className="mt-2">
                        {formatUserRole(connection.userRole)}
                      </div>
                    )}
                    {connection.headline &&
                      connection.userRole &&
                      connection.userRole.includes("CANDIDATE") && (
                        <p className="mt-2 text-sm text-zinc-400">
                          {connection.headline}
                        </p>
                      )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-zinc-400">No connections found</p>
            )}
          </div>
        )}
        {activeTab === "sent" && (
          <div className="rounded-lg h-full">
            {connectionsSent && connectionsSent.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {connectionsSent.map((connection) => (
                  <div
                    key={connection.id}
                    className="bg-zinc-800 p-4 rounded-lg relative"
                  >
                    <Image
                      src={connection.receiver.image || defaultPfp}
                      alt={connection.receiver.name || "User"}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full mb-2"
                    />
                    <h4 className="text-xl font-bold">
                      {connection.receiver.name || "Unknown"}
                    </h4>
                    <p>{connection.receiver.email || "No email"}</p>
                    {connection.receiver.userRole && (
                      <div className="mt-2">
                        {formatUserRole(connection.receiver.userRole)}
                      </div>
                    )}
                    <div className="absolute top-4 right-4 p-2 rounded-lg">
                      <button
                        className={`p-2 rounded-lg text-white ${
                          connection.status === "PENDING"
                            ? "bg-yellow-600 hover:bg-yellow-500"
                            : connection.status === "ACCEPTED"
                            ? "bg-green-600 hover:bg-green-500"
                            : "bg-red-600 hover:bg-red-500"
                        }`}
                        disabled
                      >
                        {connection.status === "PENDING" && (
                          <AiOutlineClockCircle
                            size={20}
                            className="animate-spin"
                          />
                        )}
                        {connection.status === "ACCEPTED" && (
                          <AiOutlineCheck size={20} />
                        )}
                        {connection.status === "NONE" && (
                          <AiOutlineUserAdd size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-zinc-400">
                No sent requests found
              </p>
            )}
          </div>
        )}
        {activeTab === "received" && (
          <div className="rounded-lg h-full">
            {connectionsReceived && connectionsReceived.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {connectionsReceived.map((connection) => (
                  <div
                    key={connection.id}
                    className="bg-zinc-800 p-6 rounded-lg relative transition-all duration-300 ease-in-out transform hover:scale-105"
                  >
                    <Image
                      src={connection.requester.image || defaultPfp}
                      alt={connection.requester.name || "User"}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full mb-4 mx-auto"
                    />
                    <h4 className="text-xl font-bold text-center">
                      {connection.requester.name || "Unknown"}
                    </h4>
                    <p className="text-center text-zinc-400">
                      {connection.requester.headline}
                    </p>
                    <p className="text-center">
                      {connection.requester.email || "No email"}
                    </p>
                    {connection.requester.userRole && (
                      <div className="mt-3 text-center text-zinc-300">
                        {formatUserRole(connection.requester.userRole)}
                      </div>
                    )}
                    {connection.status === "PENDING" && (
                      <div className="flex justify-center gap-4 mt-6">
                        <button
                          onClick={() => handleAcceptConnection(connection.id)}
                          className="p-3 px-6 rounded-lg text-white bg-zinc-700 hover:bg-zinc-600 border-gray-700 border-2 transition-all duration-200"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectConnection(connection.id)}
                          className="p-3 px-6 rounded-lg text-white bg-zinc-700 hover:bg-zinc-600 border-gray-700 border-2 transition-all duration-200"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-zinc-400">
                No received requests found
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionsCard;
