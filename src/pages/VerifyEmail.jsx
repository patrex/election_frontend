import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import backendurl from '@/utils/backendurl';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Verifying...');

  useEffect(() => {
    const token = searchParams.get('token');
    axios.get(`${backendurl}/user/auth/verify-email?token=${token}`)
      .then(() => setStatus('Success! You can access your full profile'))
      .catch(() => setStatus('Verification failed or link expired.'));
  }, [searchParams]);

  return <div>{status}</div>;
};

export default VerifyEmail;