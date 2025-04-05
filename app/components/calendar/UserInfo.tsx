import Image from "next/image";

interface User {
  name: string;
  image: string;
  email: string;
}

interface UserInfoProps {
  user: User;
  eventTitle: string;
}

export default function UserInfo({ user, eventTitle }: UserInfoProps) {
  return (
    <div className="flex flex-col md:flex-row items-start justify-between p-6 border-b">
      <div className="flex items-center mb-4 md:mb-0">
        <Image
          src={user.image}
          alt={user.name}
          width={48}
          height={48}
          className="rounded-full mr-4"
        />
        <div>
          <h2 className="text-xl text-gray-900 font-bold">{user.name}</h2>
          <p className="text-sm text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-600">{eventTitle}</p>
        </div>
      </div>
    </div>
  );
}
