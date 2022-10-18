import type { NextPage } from 'next';
import Router from 'next/router';
import { useEffect } from 'react';

const Home: NextPage = () => {
  // redirect to /display
  useEffect(() => {
    Router.push('/display');
  }, []);
  return <div>Redirecting...</div>;
};

export default Home;
