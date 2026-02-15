import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { Tooltip } from 'react-tooltip';
import Avatar from './Avatar';

export default function SignIn() {
  const { data: session } = useSession();
  const [showProviders, setShowProviders] = useState(false);

  if (session) {
    return (
      <div className="flex space-x-4 items-center">
        <div
          data-tooltip-id="user-initials"
          data-tooltip-place="bottom-end"
          className="w-8 h-8 text-center items-center content-center font-medium 
                        bg-orange-500 text-white rounded-full cursor-default"
        >
          <Avatar imageUrl={session?.user?.image} />
        </div>
        <Tooltip id="user-initials">
          <div>
            <p>{session.user?.name}</p>
          </div>
        </Tooltip>

        <div className="mx-3 flex items-center text-gray-500">
          <ArrowRightStartOnRectangleIcon
            data-tooltip-id="log-out"
            data-tooltip-place="bottom-end"
            className="header-icon rounded-md"
            onClick={() => signOut()}
          />

          <Tooltip id="log-out">Log Out</Tooltip>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        className="flex items-center bg-orange-600 px-5 py-2 rounded-3xl text-white hover:bg-orange-700"
        onClick={() => setShowProviders(!showProviders)}
      >
        Log In
      </button>

      {showProviders && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <button
            className="w-full px-4 py-3 text-left hover:bg-gray-100 rounded-t-lg flex items-center space-x-2"
            onClick={() => {
              setShowProviders(false);
              signIn('reddit');
            }}
          >
            <span>🔴</span>
            <span>Sign in with Reddit</span>
          </button>
          <button
            className="w-full px-4 py-3 text-left hover:bg-gray-100 rounded-b-lg flex items-center space-x-2"
            onClick={() => {
              setShowProviders(false);
              signIn('google');
            }}
          >
            <span>🔵</span>
            <span>Sign in with Google</span>
          </button>
        </div>
      )}
    </div>
  );
}
