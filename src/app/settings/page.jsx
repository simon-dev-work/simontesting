"use client";

import { useState, useEffect } from 'react';
import Navbar from '../pages/Navbar';
import { useSiteSettings } from '../context/SiteSettingsContext';

const SettingsPage = () => {
  const { siteSettings, updateSettings } = useSiteSettings();
  const [localSettings, setLocalSettings] = useState(siteSettings);

  useEffect(() => {
    setLocalSettings(siteSettings);
  }, [siteSettings]);

  // Handle Counter Updates
  const handleCounterUpdate = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      counterSettings: {
        ...prev.counterSettings,
        [key]: parseInt(value) || 0
      }
    }));
  };

  // Handle Team Member Updates
  const handleTeamMemberUpdate = (id, field, value) => {
    setLocalSettings(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map(member =>
        member.id === id ? { ...member, [field]: value } : member
      )
    }));
  };

  // Add New Team Member
  const addTeamMember = () => {
    const newId = Math.max(...localSettings.teamMembers.map(m => m.id)) + 1;
    setLocalSettings(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, { id: newId, name: "New Member", role: "Role" }]
    }));
  };

  // Remove Team Member
  const removeTeamMember = (id) => {
    setLocalSettings(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(member => member.id !== id)
    }));
  };

  // Handle Service Updates
  const handleServiceUpdate = (id, field, value) => {
    setLocalSettings(prev => ({
      ...prev,
      services: prev.services.map(service =>
        service.id === id ? { ...service, [field]: value } : service
      )
    }));
  };

  // Add New Service
  const addService = () => {
    const newId = Math.max(...localSettings.services.map(s => s.id)) + 1;
    setLocalSettings(prev => ({
      ...prev,
      services: [...prev.services, { id: newId, title: "New Service", description: "Service Description" }]
    }));
  };

  // Remove Service
  const removeService = (id) => {
    setLocalSettings(prev => ({
      ...prev,
      services: prev.services.filter(service => service.id !== id)
    }));
  };

  // Save all changes
  const saveChanges = () => {
    updateSettings(localSettings);
    alert('Settings saved successfully!');
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-black">Site Settings</h1>

        {/* Counter Panel Settings */}
        <section className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4 text-black">Counter Panel Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black">Number of Brands</label>
              <input
                type="number"
                value={localSettings.counterSettings.brands}
                onChange={(e) => handleCounterUpdate('brands', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Frame Stock</label>
              <input
                type="number"
                value={localSettings.counterSettings.frames}
                onChange={(e) => handleCounterUpdate('frames', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Happy Customers</label>
              <input
                type="number"
                value={localSettings.counterSettings.customers}
                onChange={(e) => handleCounterUpdate('customers', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Years Experience</label>
              <input
                type="number"
                value={localSettings.counterSettings.experience}
                onChange={(e) => handleCounterUpdate('experience', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-black"
              />
            </div>
          </div>
        </section>

        {/* About Practice Settings */}
        <section className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4 text-black">About Our Practice</h2>
          <textarea
            value={localSettings.aboutText}
            onChange={(e) => setLocalSettings(prev => ({ ...prev, aboutText: e.target.value }))}
            rows="4"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-black"
          />
        </section>

        {/* Team Settings */}
        <section className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4 text-black">Team Section Settings</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-black">Team Section Title</label>
            <input
              type="text"
              value={localSettings.teamTitle}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, teamTitle: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-black"
            />
          </div>
          
          <div className="space-y-4">
            {localSettings.teamMembers.map(member => (
              <div key={member.id} className="flex items-center gap-4">
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => handleTeamMemberUpdate(member.id, 'name', e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-black"
                  placeholder="Member Name"
                />
                <input
                  type="text"
                  value={member.role}
                  onChange={(e) => handleTeamMemberUpdate(member.id, 'role', e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-black"
                  placeholder="Role"
                />
                <button
                  onClick={() => removeTeamMember(member.id)}
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addTeamMember}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add Team Member
          </button>
        </section>

        {/* Services Settings */}
        <section className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4 text-black">Services Settings</h2>
          <div className="space-y-4">
            {localSettings.services.map(service => (
              <div key={service.id} className="flex items-start gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={service.title}
                    onChange={(e) => handleServiceUpdate(service.id, 'title', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary mb-2 text-black"
                    placeholder="Service Title"
                  />
                  <textarea
                    value={service.description}
                    onChange={(e) => handleServiceUpdate(service.id, 'description', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-black"
                    placeholder="Service Description"
                    rows="2"
                  />
                </div>
                <button
                  onClick={() => removeService(service.id)}
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addService}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add Service
          </button>
        </section>

        {/* Save Button */}
        <div className="fixed bottom-8 right-8">
          <button
            onClick={saveChanges}
            className="px-6 py-3 bg-primary text-black rounded-lg shadow-lg hover:bg-primary-dark text-lg font-semibold"
          >
            Save All Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
