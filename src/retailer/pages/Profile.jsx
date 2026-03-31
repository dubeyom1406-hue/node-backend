import React from 'react';
import ProfileDetails from '../components/ProfileDetails';
import { useLocation } from 'react-router-dom';

const ProfilePage = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get('tab') || 'personal';

    return <ProfileDetails activeTab={tab} />;
};

export default ProfilePage;
