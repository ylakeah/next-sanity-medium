import Link from "next/link";
import React from "react";

function Header() {
  return (
    <header className="flex justify-between max-w-7xl mx-auto">
      <div className="flex items-center space-x-5">
        <Link href="/">
          <img
            className="w-44 object-contain cursor-pointer"
            src="https://links.papareact.com/yvf"
            alt=""
          />
        </Link>
        <div className="hidden md:inline-flex items-center space-x-5">
          <h3>About</h3>
          <h3>Contact</h3>
          <h3 className="text-white bg-green-600 rounded-full py-1 px-4">
            Follow
          </h3>
        </div>
      </div>
      <div className="flex items-center space-x-5 text-green-600">
        <h3>Sign In</h3>
        <h3 className="border py-1 px-4 rounded-full border-green-600">
          Get Started
        </h3>
      </div>
    </header>
  );
}

export default Header;
