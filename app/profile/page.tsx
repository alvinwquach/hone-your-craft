"use client";

import ProfileCard from "../components/profile/ProfileCard";
import UserSkillsCard from "../components/profile/UserSkillsCard";

function Profile() {
  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      <div className="flex flex-col md:flex-row justify-center items-start gap-5 mt-5">
        <ProfileCard />
        <UserSkillsCard />
      </div>
    </section>
  );
}

export default Profile;
