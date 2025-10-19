import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ClientsList } from '../Clients/ClientsList';
import { CampaignsList } from '../Campaigns/CampaignsList';
import { Listings } from "../Adverts/Listings";
import { StaffList } from '../Staff/StaffList';
import { GradesList } from '../Grades/GradesList';
import { useAuth } from '../../contexts/AuthContext';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('clients');
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onSignOut={handleSignOut} />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {activeTab === 'clients' && <ClientsList />}
          {activeTab === 'campaigns' && <CampaignsList />}
          {activeTab === 'adverts' && <Listings />}
          {activeTab === 'staff' && <StaffList />}
          {activeTab === 'grades' && <GradesList />}
        </div>
      </main>
    </div>
  );
}
